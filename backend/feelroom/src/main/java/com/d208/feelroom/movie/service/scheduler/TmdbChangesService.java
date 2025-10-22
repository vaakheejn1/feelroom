package com.d208.feelroom.movie.service.scheduler;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.movie.dto.TmdbChangesResponseDto;
import com.d208.feelroom.movie.dto.TmdbMovieDetailDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TmdbChangesService {

    private final RestTemplate restTemplate;
    private final MovieRepository movieRepository;

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${tmdb.api.base-url}")
    private String tmdbBaseUrl;

    @Value("${tmdb.api.call-delay-ms:100}")
    private long callDelayMs;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 1000;

    /**
     * 매일 오전 2시에 TMDB Changes API를 통해 평점 정보 업데이트
     */
    @Scheduled(cron = "0 0 2 * * *") // 매일 오전 2시
    public void updateMovieRatingsScheduled() {
        log.info("Starting scheduled movie ratings update via TMDB Changes API");
        try {
            UpdateResult result = updateMovieRatings();
            log.info("Scheduled movie ratings update completed - Checked: {}, Updated: {}, Errors: {}",
                    result.totalChecked, result.updated, result.errors);
        } catch (Exception e) {
            log.error("Error during scheduled movie ratings update", e);
        }
    }

    /**
     * 수동으로 영화 평점 업데이트 (컨트롤러에서 호출)
     */
    @Transactional
    public UpdateResult updateMovieRatings() {
        return updateMovieRatings(LocalDate.now().minusDays(1));
    }

    /**
     * 특정 날짜의 영화 평점 업데이트
     */
    @Transactional
    public UpdateResult updateMovieRatings(LocalDate targetDate) {
        log.info("Starting movie ratings update for date: {}", targetDate);

        UpdateResult result = new UpdateResult();
        result.targetDate = targetDate;

        try {
            // 1. Changes API에서 변경된 영화 ID 목록 가져오기 (모든 페이지)
            List<Integer> changedTmdbIds = fetchChangedMovieIds(targetDate);
            result.totalChangesFromTmdb = changedTmdbIds.size();

            if (changedTmdbIds.isEmpty()) {
                log.info("No movie changes found for {}", targetDate);
                return result;
            }

            log.info("Found {} changed movies from TMDB Changes API for {}", changedTmdbIds.size(), targetDate);

            // 2. 우리 DB에 존재하는 영화들만 필터링 (배치 처리로 최적화)
            // Set<Integer> existingTmdbIds = movieRepository.findExistingTmdbIds(changedTmdbIds);
            Set<Integer> existingTmdbIds = findExistingTmdbIdsBatch(changedTmdbIds);
            result.totalChecked = existingTmdbIds.size();

            log.info("Filtered to {} movies that exist in our database", existingTmdbIds.size());

            // 3. 필터링된 영화들의 평점 정보 업데이트
            int processedCount = 0;
            for (Integer tmdbId : existingTmdbIds) {
                try {
                    processedCount++;

                    // API 호출 간 지연
                    if (processedCount > 1) {
                        Thread.sleep(callDelayMs);
                    }

                    // TMDB에서 영화 상세 정보 가져오기
                    TmdbMovieDetailDto movieDetail = fetchMovieDetailWithRetry(tmdbId);
                    if (movieDetail != null) {
                        // DB 업데이트
                        boolean updated = updateMovieRatings(tmdbId, movieDetail.getVoteAverage(), movieDetail.getVoteCount());
                        if (updated) {
                            result.updated++;
                            log.debug("Updated ratings for TMDB ID {}: Rating={}, Count={}",
                                    tmdbId, movieDetail.getVoteAverage(), movieDetail.getVoteCount());
                        }
                    } else {
                        result.errors++;
                        log.warn("Failed to fetch movie detail for TMDB ID: {}", tmdbId);
                    }

                    // 진행상황 로그 (100개마다)
                    if (processedCount % 100 == 0) {
                        log.info("Progress: {}/{} movies processed ({} updated, {} errors)",
                                processedCount, existingTmdbIds.size(), result.updated, result.errors);
                    }

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.error("Thread interrupted while updating movie ratings");
                    break;
                } catch (Exception e) {
                    result.errors++;
                    log.error("Error updating ratings for TMDB ID: {}", tmdbId, e);
                }
            }

        } catch (Exception e) {
            log.error("Error during movie ratings update", e);
            result.errors++;
        }

        log.info("Movie ratings update completed for {} - Total: {}, Updated: {}, Errors: {}",
                targetDate, result.totalChecked, result.updated, result.errors);

        return result;
    }

    /**
     * TMDB Changes API에서 변경된 영화 ID 목록 가져오기 (모든 페이지)
     */
    private List<Integer> fetchChangedMovieIds(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        List<Integer> allChangedIds = new ArrayList<>();

        int currentPage = 1;
        int totalPages = 1;

        do {
            String url = String.format("%s/movie/changes?api_key=%s&start_date=%s&end_date=%s&page=%d",
                    tmdbBaseUrl, tmdbApiKey, dateStr, dateStr, currentPage);

            try {
                log.debug("Calling TMDB Changes API page {}: {}", currentPage, url.replace(tmdbApiKey, "***"));

                TmdbChangesResponseDto response = restTemplate.getForObject(url, TmdbChangesResponseDto.class);
                if (response != null && response.getResults() != null) {
                    List<Integer> pageIds = response.getResults().stream()
                            .map(TmdbChangesResponseDto.ChangedMovie::getId)
                            .collect(Collectors.toList());

                    allChangedIds.addAll(pageIds);
                    totalPages = response.getTotalPages() != null ? response.getTotalPages() : 1;

                    log.debug("Page {}/{}: Found {} changed movies", currentPage, totalPages, pageIds.size());

                    // API 호출 간 지연
                    if (currentPage < totalPages) {
                        try {
                            Thread.sleep(200);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                } else {
                    log.warn("No response or empty results for page {} on date {}", currentPage, date);
                    break;
                }

            } catch (RestClientException e) {
                log.error("Failed to fetch changed movie IDs for date: {} page: {}", date, currentPage, e);
                break;
            }

            currentPage++;

        } while (currentPage <= totalPages);

        log.info("Fetched {} total changed movie IDs from {} pages for date {}",
                allChangedIds.size(), totalPages, date);

        return allChangedIds;
    }

    /**
     * 재시도 로직이 포함된 영화 상세정보 가져오기 (평점 정보만)
     */
    private TmdbMovieDetailDto fetchMovieDetailWithRetry(Integer tmdbId) {
        String url = String.format("%s/movie/%d?api_key=%s&language=ko-KR",
                tmdbBaseUrl, tmdbId, tmdbApiKey);

        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                TmdbMovieDetailDto response = restTemplate.getForObject(url, TmdbMovieDetailDto.class);
                if (response != null) {
                    return response;
                }
            } catch (RestClientException e) {
                log.warn("Attempt {}/{} failed to fetch movie detail for TMDB ID {}: {}",
                        attempt, MAX_RETRY_ATTEMPTS, tmdbId, e.getMessage());

                if (attempt < MAX_RETRY_ATTEMPTS) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        log.error("Failed to fetch movie detail for TMDB ID {} after {} attempts", tmdbId, MAX_RETRY_ATTEMPTS);
        return null;
    }

    /**
     * 영화의 평점 정보 업데이트
     */
    @Transactional
    public boolean updateMovieRatings(Integer tmdbId, Double voteAverage, Integer voteCount) {
        try {
            Movie movie = movieRepository.findByTmdbId(tmdbId).orElse(null);
            if (movie != null) {
                // 실제 변경이 있을 때만 업데이트
                boolean hasChanges = false;

                if (!java.util.Objects.equals(movie.getVoteAverage(), voteAverage)) {
                    movie.setVoteAverage(voteAverage);
                    hasChanges = true;
                }

                if (!java.util.Objects.equals(movie.getVoteCount(), voteCount)) {
                    movie.setVoteCount(voteCount);
                    hasChanges = true;
                }

                if (hasChanges) {
                    movieRepository.save(movie);
                    return true;
                }
            } else {
                log.warn("Movie not found in DB for TMDB ID: {}", tmdbId);
            }
        } catch (Exception e) {
            log.error("Error updating movie ratings for TMDB ID: {}", tmdbId, e);
        }

        return false;
    }

    /**
     * 배치 처리로 기존 TMDB ID들을 조회 (IN 절 크기 제한 해결)
     */
    private Set<Integer> findExistingTmdbIdsBatch(List<Integer> allTmdbIds) {
        if (allTmdbIds.isEmpty()) return Set.of();

        Set<Integer> result = new HashSet<>();
        int batchSize = 500; // MySQL IN 절 권장 크기

        for (int i = 0; i < allTmdbIds.size(); i += batchSize) {
            int end = Math.min(i + batchSize, allTmdbIds.size());
            List<Integer> batch = allTmdbIds.subList(i, end);

            Set<Integer> batchResult = movieRepository.findExistingTmdbIds(batch);
            result.addAll(batchResult);

            log.debug("Batch {}/{}: Found {} existing movies",
                    (i/batchSize) + 1, (allTmdbIds.size() + batchSize - 1) / batchSize, batchResult.size());
        }

        log.info("Batch processing completed: {} total existing movies found", result.size());
        return result;
    }

    /**
     * 업데이트 결과를 담는 내부 클래스
     */
    public static class UpdateResult {
        public LocalDate targetDate;
        public int totalChangesFromTmdb = 0;
        public int totalChecked = 0;
        public int updated = 0;
        public int errors = 0;

        @Override
        public String toString() {
            return String.format("UpdateResult{date=%s, totalChanges=%d, checked=%d, updated=%d, errors=%d}",
                    targetDate, totalChangesFromTmdb, totalChecked, updated, errors);
        }
    }
}