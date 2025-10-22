package com.d208.feelroom.movie.service.scheduler;

import com.d208.feelroom.movie.domain.entity.*;
import com.d208.feelroom.movie.domain.repository.MovieNowRepository;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.movie.domain.repository.TempMovieNowRepository;
import com.d208.feelroom.movie.dto.CurrentMovieResponseDto;
import com.d208.feelroom.movie.dto.KobisApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import com.d208.feelroom.search.document.MovieDocument;
import com.d208.feelroom.movie.dto.MovieMatchingDto;
import com.d208.feelroom.movie.domain.repository.MovieElasticsearchRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieNowService {

    @Value("${kobis.api.key}")
    private String kobisApiKey;

    @Value("${kobis.api.base-url}")
    private String kobisApiBaseUrl;

    private final MovieRepository movieRepository;
    private final TempMovieNowRepository tempMovieNowRepository;
    private final MovieNowRepository movieNowRepository;
    private final MovieElasticsearchRepository movieElasticsearchRepository;
    private final RestTemplate restTemplate;

    @Value("${elasticsearch.matching.similarity-threshold:0.1}")
    private double similarityThreshold;

    @Value("${elasticsearch.matching.date-diff-days:365}")
    private int dateDiffDays;

    /**
     * KOBIS API에서 일별 박스오피스 데이터를 가져옵니다.
     */
    public KobisApiResponse getDailyBoxOffice(LocalDate targetDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateString = targetDate.format(formatter);
        String url = String.format("%s?key=%s&targetDt=%s", kobisApiBaseUrl, kobisApiKey, dateString);

        try {
            log.info("KOBIS API 호출: {}", url);
            return restTemplate.getForObject(url, KobisApiResponse.class);
        } catch (Exception e) {
            log.error("KOBIS API 호출 중 오류 발생: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * KOBIS API 응답 데이터를 temp_movie_now 테이블에 저장합니다.
     */
    @Transactional
    public void saveDailyBoxOfficeToTemp(KobisApiResponse apiResponse) {
        if (apiResponse == null || apiResponse.getBoxOfficeResult() == null) {
            log.warn("API 응답이 null이거나 boxOfficeResult가 없습니다.");
            return;
        }

        List<KobisApiResponse.DailyBoxOffice> dailyBoxOfficeList =
                apiResponse.getBoxOfficeResult().getDailyBoxOfficeList();

        if (dailyBoxOfficeList == null || dailyBoxOfficeList.isEmpty()) {
            log.warn("박스오피스 데이터가 없습니다.");
            return;
        }

        // showRange에서 날짜 파싱
        String showRange = apiResponse.getBoxOfficeResult().getShowRange();
        LocalDate rankingDate;

        try {
            String dateStr = showRange.split("~")[0];
            rankingDate = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyyMMdd"));
        } catch (Exception e) {
            log.error("날짜 파싱 오류: {}", showRange, e);
            return;
        }

        log.info("KOBIS 박스오피스 데이터 임시 저장 시작: {} (총 {}건)", rankingDate, dailyBoxOfficeList.size());

        int savedCount = 0;
        for (KobisApiResponse.DailyBoxOffice boxOffice : dailyBoxOfficeList) {
            try {
                // 복합키 생성
                TempMovieNowId tempId = new TempMovieNowId(boxOffice.getMovieCd(), rankingDate);

                // 중복 체크: 같은 KOBIS movieCd와 날짜의 데이터가 이미 존재하는지 확인
                if (!tempMovieNowRepository.existsById(tempId)) {

                    // 개봉일 파싱
                    LocalDate releaseDate = null;
                    if (boxOffice.getOpenDt() != null && !boxOffice.getOpenDt().isEmpty()) {
                        try {
                            releaseDate = LocalDate.parse(boxOffice.getOpenDt(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                        } catch (Exception e) {
                            log.warn("개봉일 파싱 실패: {}", boxOffice.getOpenDt());
                        }
                    }

                    TempMovieNow tempData = TempMovieNow.builder()
                            .id(tempId)
                            .movieName(boxOffice.getMovieNm())
                            .releaseDate(releaseDate)
                            .ranking(Integer.parseInt(boxOffice.getRank()))
                            .audience(parseInteger(boxOffice.getAudiAcc()))
                            .isMatched(false)
                            .build();

                    tempMovieNowRepository.save(tempData);
                    savedCount++;

                    log.info("KOBIS 데이터 임시 저장: {}위 '{}' ({}, 개봉일: {})",
                            boxOffice.getRank(), boxOffice.getMovieNm(), boxOffice.getMovieCd(), releaseDate);
                } else {
                    log.debug("이미 존재하는 데이터: {} - {}",
                            boxOffice.getMovieCd(), rankingDate);
                }
            } catch (Exception e) {
                log.error("임시 데이터 저장 중 오류: movieCd={}, movieNm={}",
                        boxOffice.getMovieCd(), boxOffice.getMovieNm(), e);
            }
        }

        log.info("KOBIS 박스오피스 데이터 임시 저장 완료: {} (새로 저장: {}건)", rankingDate, savedCount);
    }
    /**
     * 강화된 매칭 로직
     */
    @Transactional
    public MovieMatchingDto.MatchingResult matchKobisWithTmdbByDate(LocalDate date) {
        log.info("KOBIS-TMDB 매칭 시작: {}", date);

        List<TempMovieNow> tempMovies = tempMovieNowRepository.findByRankingDateOrderByRanking(date);
        if (tempMovies.isEmpty()) {
            log.warn("매칭할 KOBIS 데이터가 없습니다: {}", date);
            return MovieMatchingDto.MatchingResult.builder()
                    .processedDate(date)
                    .build();
        }

        int successfulMatches = 0;
        int savedToMovieNow = 0;

        for (TempMovieNow tempMovie : tempMovies) {
            try {
                log.info("처리 중: {}위 '{}'", tempMovie.getRanking(), tempMovie.getMovieName());

                MovieMatchingDto matchingResult = matchSingleMovie(tempMovie);

                if (matchingResult.isMatched()) {
                    successfulMatches++;

                    // matched_movie_id 설정
                    tempMovie.setMatchedMovieId(matchingResult.getMatchedMovieId());
                    tempMovie.setIsMatched(true);

                    log.info("temp 데이터 업데이트: movieName='{}', matchedMovieId={}",
                            tempMovie.getMovieName(), matchingResult.getMatchedMovieId());

                    // temp 데이터 저장
                    tempMovieNowRepository.save(tempMovie);

                    // movie_now 테이블에 저장 (9999999는 저장하지 않음)
                    if (matchingResult.getMatchedMovieId() != 9999999 && saveToMovieNow(matchingResult)) {
                        savedToMovieNow++;
                    }
                } else {
                    // 매칭 실패한 경우 명시적으로 설정
                    tempMovie.setIsMatched(false);
                    tempMovie.setMatchedMovieId(null);
                    tempMovieNowRepository.save(tempMovie);
                }

                log.info("매칭 결과: {} -> {} (유사도: {}, 방법: {}, movieId: {})",
                        tempMovie.getMovieName(),
                        matchingResult.isMatched() ? matchingResult.getMatchedMovieTitle() : "매칭 실패",
                        matchingResult.getSimilarityScore(),
                        matchingResult.getMatchingMethod(),
                        matchingResult.getMatchedMovieId());

            } catch (Exception e) {
                log.error("영화 매칭 중 오류: movieName={}, error={}",
                        tempMovie.getMovieName(), e.getMessage(), e);
            }
        }

        MovieMatchingDto.MatchingResult result = MovieMatchingDto.MatchingResult.builder()
                .totalProcessed(tempMovies.size())
                .successfulMatches(successfulMatches)
                .failedMatches(tempMovies.size() - successfulMatches)
                .savedToMovieNow(savedToMovieNow)
                .processedDate(date)
                .build();

        log.info("KOBIS-TMDB 매칭 완료: {}", result.getSummary());
        return result;
    }

    /**
     * DB 우선 매칭 로직
     */
    private MovieMatchingDto matchSingleMovie(TempMovieNow tempMovie) {
        String kobisMovieName = tempMovie.getMovieName();
        LocalDate rankingDate = tempMovie.getId().getRankingDate();
        LocalDate releaseDate = tempMovie.getReleaseDate();

        log.info("=== 매칭 시작: {} (개봉일: {}) ===", kobisMovieName, releaseDate);

        try {
            // 🎯 1차: DB 직접 매칭 (제목만) - 최우선
            Optional<Movie> dbTitleMatch = findDatabaseTitleMatch(kobisMovieName);
            if (dbTitleMatch.isPresent()) {
                return createMatchingResultFromMovie(tempMovie, dbTitleMatch.get(), 0.9, "DB_TITLE");
            }

            // 🎯 2차: DB 제목 + 개봉일 매칭
            if (releaseDate != null) {
                Optional<Movie> dbTitleDateMatch = findDatabaseTitleAndDateMatch(kobisMovieName, releaseDate);
                if (dbTitleDateMatch.isPresent()) {
                    return createMatchingResultFromMovie(tempMovie, dbTitleDateMatch.get(), 0.8, "DB_TITLE_DATE");
                }
            }

            // 🎯 3차: Elasticsearch 매칭 (DB 실패 후)
            Optional<MovieDocument> elasticsearchMatch = findElasticsearchMatch(kobisMovieName, rankingDate);
            if (elasticsearchMatch.isPresent()) {
                return createMatchingResult(tempMovie, elasticsearchMatch.get(), 1.0, "ELASTICSEARCH");
            }

            // 🎯 4차: 매칭 실패 시 9999999로 설정
            log.warn("=== 모든 매칭 실패, 9999999로 설정: {} ===", kobisMovieName);
            return createUnmatchedResult(tempMovie);

        } catch (Exception e) {
            log.error("영화 매칭 중 예외 발생: movieName={}, error={}", kobisMovieName, e.getMessage(), e);
            return createUnmatchedResult(tempMovie);
        }
    }

    /**
     * Elasticsearch 매칭 시도
     */
    private Optional<MovieDocument> findElasticsearchMatch(String movieName, LocalDate rankingDate) {
        try {
            // 정확한 제목 매칭
            List<MovieDocument> exactResults = movieElasticsearchRepository.findByExactTitle(movieName);
            if (!exactResults.isEmpty()) {
                log.info("ES 정확 매칭 성공");
                return Optional.of(exactResults.get(0));
            }

            // 포함 검색
            List<MovieDocument> containingResults = movieElasticsearchRepository.findByTitleContaining(movieName);
            if (!containingResults.isEmpty()) {
                log.info("ES 포함 매칭 성공");
                return Optional.of(containingResults.get(0));
            }

            // 퍼지 검색
            List<MovieDocument> fuzzyResults = movieElasticsearchRepository.findByFuzzyTitle(movieName);
            if (!fuzzyResults.isEmpty()) {
                log.info("ES 퍼지 매칭 성공");
                return Optional.of(fuzzyResults.get(0));
            }

            return Optional.empty();
        } catch (Exception e) {
            log.warn("Elasticsearch 매칭 중 오류: {}", movieName, e);
            return Optional.empty();
        }
    }

    /**
     * DB 제목 매칭
     */
    private Optional<Movie> findDatabaseTitleMatch(String movieName) {
        try {
            // 정확한 제목 매칭
            Optional<Movie> exactMatch = movieRepository.findByTitle(movieName);
            if (exactMatch.isPresent()) {
                log.info("DB 정확 제목 매칭 성공");
                return exactMatch;
            }

            // 포함 검색
            List<Movie> containingMatches = movieRepository.findByTitleContaining(movieName);
            if (!containingMatches.isEmpty()) {
                log.info("DB 포함 제목 매칭 성공");
                return Optional.of(containingMatches.get(0));
            }

            return Optional.empty();
        } catch (Exception e) {
            log.warn("DB 제목 매칭 중 오류: {}", movieName, e);
            return Optional.empty();
        }
    }

    /**
     * DB 제목 + 개봉일 매칭
     */
    /**
     * 🔧 수정된 DB 제목 + 개봉일 매칭
     */
    private Optional<Movie> findDatabaseTitleAndDateMatch(String movieName, LocalDate releaseDate) {
        try {
            String releaseYear = String.valueOf(releaseDate.getYear());

            // 제목 + 개봉년도로 검색 (LIKE 패턴 사용)
            List<Movie> yearMatches = movieRepository.findByTitleContainingAndReleaseYear(movieName, releaseYear);
            if (!yearMatches.isEmpty()) {
                log.info("DB 제목+년도 매칭 성공");
                return Optional.of(yearMatches.get(0));
            }

            // 제목 + 개봉일 범위로 검색 (±1년)
            String startYear = String.valueOf(releaseDate.getYear() - 1);
            String endYear = String.valueOf(releaseDate.getYear() + 1);

            List<Movie> dateRangeMatches = movieRepository.findByTitleContainingAndReleaseDateBetween(
                    movieName, startYear, endYear);
            if (!dateRangeMatches.isEmpty()) {
                log.info("DB 제목+날짜범위 매칭 성공");
                return Optional.of(dateRangeMatches.get(0));
            }

            return Optional.empty();
        } catch (Exception e) {
            log.warn("DB 제목+날짜 매칭 중 오류: {}", movieName, e);
            return Optional.empty();
        }
    }

    /**
     * 매칭되지 않은 영화 결과 생성 (9999999)
     */
    private MovieMatchingDto createUnmatchedResult(TempMovieNow tempMovie) {
        return MovieMatchingDto.builder()
                .kobisMovieCd(tempMovie.getId().getKobisMovieCd())
                .kobisMovieName(tempMovie.getMovieName())
                .ranking(tempMovie.getRanking())
                .audience(tempMovie.getAudience())
                .rankingDate(tempMovie.getId().getRankingDate())
                .matchedMovieId(9999999) // 특별한 ID
                .matchedMovieTitle(tempMovie.getMovieName()) // 원본 제목 사용
                .matchedReleaseDate(tempMovie.getReleaseDate() != null ? tempMovie.getReleaseDate().toString() : null)
                .matchedTmdbId(null)
                .similarityScore(0.0)
                .matchingMethod("UNMATCHED")
                .isMatched(true) // true로 설정 (9999999로 "매칭"되었다고 간주)
                .build();
    }

    /**
     * 현재 상영작 조회 (매칭되지 않은 영화 포함)
     */
    @Transactional(readOnly = true)
    public List<CurrentMovieResponseDto> getCurrentMovies() {
        LocalDate latestDate = findLatestBoxOfficeDate();

        if (latestDate == null) {
            // movie_now에 데이터가 없으면 temp에서 가져오기
            return getCurrentMoviesFromTemp();
        }

        return getCurrentMoviesByDate(latestDate);
    }

    /**
     * temp 테이블에서 현재 상영작 조회
     */
    @Transactional(readOnly = true)
    public List<CurrentMovieResponseDto> getCurrentMoviesFromTemp() {
        try {
            // temp 테이블에서 가장 최근 데이터 찾기
            List<TempMovieNow> tempMovies = tempMovieNowRepository.findAll();
            if (tempMovies.isEmpty()) {
                return List.of();
            }

            // 가장 최근 날짜 찾기
            LocalDate latestTempDate = tempMovies.stream()
                    .map(TempMovieNow::getRankingDate)
                    .max(LocalDate::compareTo)
                    .orElse(null);

            if (latestTempDate == null) {
                return List.of();
            }

            return getCurrentMoviesFromTempByDate(latestTempDate);
        } catch (Exception e) {
            log.error("temp에서 현재 상영작 조회 중 오류", e);
            return List.of();
        }
    }
    /**
     * 특정 날짜의 temp 데이터로 현재 상영작 조회
     */
    @Transactional(readOnly = true)
    public List<CurrentMovieResponseDto> getCurrentMoviesFromTempByDate(LocalDate date) {
        List<TempMovieNow> tempMovies = tempMovieNowRepository.findByRankingDateOrderByRanking(date);

        return tempMovies.stream().map(temp -> {
            if (temp.getMatchedMovieId() != null && temp.getMatchedMovieId().equals(9999999)) {
                // 매칭되지 않은 영화 (9999999)
                return CurrentMovieResponseDto.createUnmatchedMovie(
                        temp.getMovieName(),
                        temp.getRanking(),
                        temp.getAudience(),
                        temp.getRankingDate(),
                        temp.getReleaseDate() != null ? temp.getReleaseDate().toString() : null
                );
            } else if (temp.getMatchedMovieId() != null && temp.getIsMatched()) {
                // 매칭된 영화
                Optional<Movie> movie = movieRepository.findById(temp.getMatchedMovieId());
                if (movie.isPresent()) {
                    return CurrentMovieResponseDto.builder()
                            .movieId(movie.get().getMovieId())
                            .title(movie.get().getTitle())
                            .posterUrl(movie.get().getPosterUrl())
                            .ranking(temp.getRanking())
                            .audience(temp.getAudience())
                            .rankingDate(temp.getRankingDate())
                            .voteAverage(movie.get().getVoteAverage())
                            .releaseDate(movie.get().getReleaseDate())
                            .isUnmatched(false)
                            .build();
                }
            }

            // 매칭되지 않은 경우 기본 처리
            return CurrentMovieResponseDto.createUnmatchedMovie(
                    temp.getMovieName(),
                    temp.getRanking(),
                    temp.getAudience(),
                    temp.getRankingDate(),
                    temp.getReleaseDate() != null ? temp.getReleaseDate().toString() : null
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CurrentMovieResponseDto> getCurrentMoviesByDate(LocalDate date) {
        List<MovieNow> movieNowList = movieNowRepository.findByIdRankingDateOrderByRankingAscWithMovie(date);

        // movie_now에 데이터가 없으면 temp에서 가져오기
        if (movieNowList.isEmpty()) {
            return getCurrentMoviesFromTempByDate(date);
        }

        return movieNowList.stream()
                .map(CurrentMovieResponseDto::fromMovieNow)
                .collect(Collectors.toList());
    }

    private MovieMatchingDto createMatchingResult(TempMovieNow tempMovie, MovieDocument matchedMovie,
                                                  double similarity, String method) {
        return MovieMatchingDto.builder()
                .kobisMovieCd(tempMovie.getId().getKobisMovieCd())
                .kobisMovieName(tempMovie.getMovieName())
                .ranking(tempMovie.getRanking())
                .audience(tempMovie.getAudience())
                .rankingDate(tempMovie.getId().getRankingDate())
                .matchedMovieId(matchedMovie.getMovieId().intValue())
                .matchedMovieTitle(matchedMovie.getTitle())
                .matchedReleaseDate(matchedMovie.getReleaseDate())
                .matchedTmdbId(matchedMovie.getTmdbId() != null ? matchedMovie.getTmdbId().intValue() : null)
                .similarityScore(similarity)
                .matchingMethod(method)
                .isMatched(true)
                .build();
    }

    private MovieMatchingDto createMatchingResultFromMovie(TempMovieNow tempMovie, Movie movie,
                                                           double similarity, String method) {
        return MovieMatchingDto.builder()
                .kobisMovieCd(tempMovie.getId().getKobisMovieCd())
                .kobisMovieName(tempMovie.getMovieName())
                .ranking(tempMovie.getRanking())
                .audience(tempMovie.getAudience())
                .rankingDate(tempMovie.getId().getRankingDate())
                .matchedMovieId(movie.getMovieId())
                .matchedMovieTitle(movie.getTitle())
                .matchedReleaseDate(movie.getReleaseDate())
                .matchedTmdbId(movie.getTmdbId())
                .similarityScore(similarity)
                .matchingMethod(method)
                .isMatched(true)
                .build();
    }

    private MovieMatchingDto createFailedMatchingResult(TempMovieNow tempMovie, String reason) {
        return MovieMatchingDto.builder()
                .kobisMovieCd(tempMovie.getId().getKobisMovieCd())
                .kobisMovieName(tempMovie.getMovieName())
                .ranking(tempMovie.getRanking())
                .audience(tempMovie.getAudience())
                .rankingDate(tempMovie.getId().getRankingDate())
                .similarityScore(0.0)
                .matchingMethod("NONE")
                .isMatched(false)
                .failureReason(reason)
                .build();
    }

    private boolean saveToMovieNow(MovieMatchingDto matchingResult) {
        try {
            MovieNowId movieNowId = new MovieNowId(
                    matchingResult.getMatchedMovieId(),
                    matchingResult.getRankingDate()
            );

            if (movieNowRepository.existsById(movieNowId)) {
                log.debug("이미 존재하는 movie_now 데이터: {}", movieNowId);
                return false;
            }

            MovieNow movieNow = MovieNow.builder()
                    .id(movieNowId)
                    .ranking(matchingResult.getRanking())
                    .audience(matchingResult.getAudience())
                    .build();

            movieNowRepository.save(movieNow);
            log.info("movie_now 테이블에 저장 완료: {}위 '{}' (movie_id: {})",
                    matchingResult.getRanking(),
                    matchingResult.getMatchedMovieTitle(),
                    matchingResult.getMatchedMovieId());

            return true;
        } catch (Exception e) {
            log.error("movie_now 테이블 저장 중 오류: {}", matchingResult.getKobisMovieName(), e);
            return false;
        }
    }

    // 기존 메서드들...
    @Scheduled(cron = "0 0 0 * * ?")
    public void fetchDailyBoxOfficeScheduled() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("스케줄된 작업 실행: 전날 박스오피스 데이터 가져오기 - {}", yesterday);

        try {
            KobisApiResponse apiResponse = getDailyBoxOffice(yesterday);
            saveDailyBoxOfficeToTemp(apiResponse);
            log.info("스케줄된 박스오피스 데이터 임시 저장 완료: {}", yesterday);
        } catch (Exception e) {
            log.error("스케줄된 박스오피스 데이터 저장 중 오류 발생: {}", yesterday, e);
        }
    }

    @Transactional(readOnly = true)
    public List<TempMovieNow> getTempDataByDate(LocalDate date) {
        return tempMovieNowRepository.findByRankingDateOrderByRanking(date);
    }

    @Transactional
    public void fetchAndSaveBoxOfficeData(LocalDate date) {
        log.info("수동 박스오피스 데이터 가져오기 시작: {}", date);

        KobisApiResponse apiResponse = getDailyBoxOffice(date);
        saveDailyBoxOfficeToTemp(apiResponse);

        log.info("수동 박스오피스 데이터 임시 저장 완료: {}", date);
    }

    @Transactional(readOnly = true)
    public List<String> getUnmatchedMovieNames() {
        return tempMovieNowRepository.findDistinctUnmatchedMovieNames();
    }

    @Transactional(readOnly = true)
    public void printTempDataStatistics() {
        long totalCount = tempMovieNowRepository.count();
        List<String> unmatchedMovies = tempMovieNowRepository.findDistinctUnmatchedMovieNames();

        log.info("=== temp_movie_now 데이터 통계 ===");
        log.info("총 데이터 수: {}건", totalCount);
        log.info("매칭되지 않은 고유 영화 수: {}개", unmatchedMovies.size());

        if (!unmatchedMovies.isEmpty()) {
            log.info("매칭되지 않은 영화들:");
            unmatchedMovies.forEach(movieName -> log.info("- {}", movieName));
        }
    }

    @Transactional(readOnly = true)
    public LocalDate findLatestBoxOfficeDate() {
        try {
            return movieNowRepository.findLatestRankingDate();
        } catch (Exception e) {
            log.error("최근 박스오피스 날짜 조회 중 오류", e);
            return null;
        }
    }

    @Transactional(readOnly = true)
    public CurrentMoviesStatsDto getCurrentMoviesStats() {
        LocalDate latestDate = findLatestBoxOfficeDate();

        if (latestDate == null) {
            return CurrentMoviesStatsDto.builder()
                    .latestDate(null)
                    .totalMovies(0)
                    .totalAudience(0L)
                    .build();
        }

        List<MovieNow> currentMovies = movieNowRepository.findByIdRankingDateOrderByRankingAscWithMovie(latestDate);

        long totalAudience = currentMovies.stream()
                .mapToLong(MovieNow::getAudience)
                .sum();

        return CurrentMoviesStatsDto.builder()
                .latestDate(latestDate)
                .totalMovies(currentMovies.size())
                .totalAudience(totalAudience)
                .averageRating(currentMovies.stream()
                        .filter(m -> m.getMovie().getVoteAverage() != null)
                        .mapToDouble(m -> m.getMovie().getVoteAverage())
                        .average()
                        .orElse(0.0))
                .build();
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getRecentBoxOfficeDates(Pageable pageable) {
        return movieNowRepository.findRecentRankingDates(pageable);
    }

    @Transactional
    public MovieMatchingDto.MatchingResult matchRecentBoxOffice() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        return matchKobisWithTmdbByDate(yesterday);
    }

    @Transactional(readOnly = true)
    public void indexAllMoviesToElasticsearch() {
        log.info("모든 TMDB 영화 데이터 Elasticsearch 인덱싱 시작");

        try {
            List<Movie> allMovies = movieRepository.findAll();
            log.info("인덱싱할 영화 수: {}개", allMovies.size());

            List<MovieDocument> movieDocuments = allMovies.stream()
                    .map(MovieDocument::fromMovie)
                    .toList();

            movieElasticsearchRepository.saveAll(movieDocuments);

            log.info("Elasticsearch 인덱싱 완료: {}개 영화", movieDocuments.size());
        } catch (Exception e) {
            log.error("Elasticsearch 인덱싱 중 오류 발생", e);
            throw new RuntimeException("영화 데이터 인덱싱 실패", e);
        }
    }

    private Integer parseInteger(String value) {
        try {
            return value != null && !value.isEmpty() ? Integer.parseInt(value.replace(",", "")) : 0;
        } catch (NumberFormatException e) {
            log.warn("숫자 변환 실패: {}", value);
            return 0;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CurrentMoviesStatsDto {
        private LocalDate latestDate;
        private Integer totalMovies;
        private Long totalAudience;
        private Double averageRating;
    }

    // MovieNowService.java 맨 아래에 이 5개 메서드 추가

    /**
     * 🤖 매일 새벽 4시에 Full Process 자동 실행 (DB 우선 매칭)
     */
    @Scheduled(cron = "0 0 4 * * ?")
    public void scheduledFullBoxOfficeProcess() {
        log.info("📅 [자동] Full Process 시작 (새벽 4시) - DB 우선 매칭");
        executeFullBoxOfficeProcess();
    }

    /**
     * 🤖 매일 새벽 4시 30분에 Elasticsearch 재인덱싱 자동 실행 (후순위)
     */
    @Scheduled(cron = "0 30 4 * * ?")
    public void scheduledElasticsearchReindexing() {
        log.info("📅 [자동] Elasticsearch 재인덱싱 시작 (새벽 4시 30분) - Full Process 완료 후");
        executeElasticsearchReindexing();
    }

    /**
     * 🔧 Full Process 실행 - 어제 날짜 (DB 우선 매칭)
     */
    public MovieMatchingDto.MatchingResult executeFullBoxOfficeProcess() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        return executeFullBoxOfficeProcess(yesterday);
    }

    /**
     * 🔧 Full Process 실행 - 특정 날짜 (DB 우선 매칭)
     */
    public MovieMatchingDto.MatchingResult executeFullBoxOfficeProcess(LocalDate date) {
        try {
            long startTime = System.currentTimeMillis();

            log.info("🎬 1단계: KOBIS 데이터 수집 - {}", date);
            fetchAndSaveBoxOfficeData(date);

            log.info("🔄 2단계: DB 우선 매칭 실행 - {}", date);
            MovieMatchingDto.MatchingResult result = matchKobisWithTmdbByDate(date);

            long duration = (System.currentTimeMillis() - startTime) / 1000;
            log.info("✅ Full Process 완료 ({}초) - DB 우선 매칭", duration);
            log.info("📊 매칭 결과: {}", result.getSummary());

            return result;
        } catch (Exception e) {
            log.error("❌ Full Process 실패: date={}", date, e);
            throw e;
        }
    }

    /**
     * 🔧 Elasticsearch 재인덱싱 실행 (Full Process 완료 후)
     */
    public void executeElasticsearchReindexing() {
        try {
            long startTime = System.currentTimeMillis();
            indexAllMoviesToElasticsearch();
            long duration = (System.currentTimeMillis() - startTime) / 1000;
            log.info("✅ Elasticsearch 재인덱싱 완료 ({}초)", duration);
        } catch (Exception e) {
            log.error("❌ Elasticsearch 재인덱싱 실패", e);
            throw e;
        }
    }
}