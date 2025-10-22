package com.d208.feelroom.movie.service.scheduler;

import com.d208.feelroom.movie.domain.entity.*;
import com.d208.feelroom.movie.domain.repository.*;
import com.d208.feelroom.movie.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TmdbMovieImportService {

    private final RestTemplate restTemplate;
    private final MovieRepository movieRepository;
    private final ActorRepository actorRepository;
    private final DirectorRepository directorRepository;
    private final GenreRepository genreRepository;
    private final KeywordRepository keywordRepository;
    private final MovieActorRepository movieActorRepository;
    private final MovieDirectorRepository movieDirectorRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final MovieKeywordRepository movieKeywordRepository;

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${tmdb.api.base-url}")
    private String tmdbBaseUrl;

    @Value("${tmdb.image.base-url}")
    private String tmdbImageBaseUrl;

    @Value("${tmdb.api.call-delay-ms:200}")
    private long callDelayMs;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 1000;

    /**
     * 12시간마다 TMDB upcoming movies 동기화
     */
    @Scheduled(fixedRate = 12 * 60 * 60 * 1000) // 12시간 = 12 * 60 * 60 * 1000ms
    public void syncUpcomingMoviesScheduled() {
        log.info("Starting scheduled TMDB upcoming movies synchronization");
        try {
            SyncResult result = syncUpcomingMovies();
            log.info("Scheduled TMDB upcoming movies synchronization completed - Total: {}, New: {}, Skipped: {}, Errors: {}",
                    result.totalProcessed, result.newMovies, result.skippedMovies, result.errors);
        } catch (Exception e) {
            log.error("Error during scheduled TMDB upcoming movies synchronization", e);
        }
    }

    /**
     * 수동으로 upcoming movies 동기화 (컨트롤러에서 호출)
     */
    @Transactional
    public SyncResult syncUpcomingMovies() {
        log.info("Starting TMDB upcoming movies synchronization");

        SyncResult result = new SyncResult();

        try {
            // 첫 번째 페이지 가져오기
            TmdbPagedResponseDto firstPage = fetchUpcomingMoviesWithRetry(1);
            if (firstPage == null || firstPage.getResults() == null) {
                log.warn("No upcoming movies data received from TMDB API");
                return result;
            }

            List<TmdbPagedResponseDto.MovieResult> allMovies = new ArrayList<>(firstPage.getResults());
            int totalPages = firstPage.getTotalPages();

            log.info("Total pages to fetch: {}", totalPages);

            // 나머지 페이지들 가져오기
            for (int page = 2; page <= totalPages; page++) {
                try {
                    Thread.sleep(callDelayMs); // API 호출 간 지연
                    TmdbPagedResponseDto pageData = fetchUpcomingMoviesWithRetry(page);
                    if (pageData != null && pageData.getResults() != null) {
                        allMovies.addAll(pageData.getResults());
                        log.debug("Fetched page {}/{} with {} movies", page, totalPages, pageData.getResults().size());
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.error("Thread interrupted while fetching page {}", page);
                    break;
                } catch (Exception e) {
                    log.error("Error fetching page {}: {}", page, e.getMessage());
                    result.errors++;
                }
            }

            log.info("Total movies fetched from TMDB: {}", allMovies.size());

            // 각 영화에 대해 상세 정보 처리
            for (TmdbPagedResponseDto.MovieResult movieResult : allMovies) {
                try {
                    result.totalProcessed++;

                    // DB에 이미 존재하는 영화인지 확인
                    boolean movieExists = movieRepository.existsByTmdbId(movieResult.getId());

                    if (movieExists) {
                        log.debug("Movie already exists, updating metadata: {} (TMDB ID: {})", movieResult.getTitle(), movieResult.getId());

                        // 기존 영화의 메타데이터만 업데이트
                        Thread.sleep(callDelayMs);
                        TmdbMovieDetailDto movieDetail = fetchMovieDetailWithRetry(movieResult.getId());

                        if (movieDetail != null) {
                            // 기존 영화 ID 조회
                            Movie existingMovie = movieRepository.findByTmdbId(movieResult.getId()).orElse(null);
                            if (existingMovie != null) {
                                processMovieMetadata(movieDetail, existingMovie.getMovieId());
                                log.info("Successfully updated metadata for existing movie: {} (TMDB ID: {})", movieDetail.getTitle(), movieDetail.getId());
                            }
                        }

                        result.skippedMovies++;
                        continue;
                    }

                    // 영화 상세 정보 가져오기
                    Thread.sleep(callDelayMs);
                    TmdbMovieDetailDto movieDetail = fetchMovieDetailWithRetry(movieResult.getId());

                    if (movieDetail != null) {
                        processMovieDetail(movieDetail);
                        result.newMovies++;
                        log.info("Successfully processed new movie: {} (TMDB ID: {})", movieDetail.getTitle(), movieDetail.getId());
                    } else {
                        log.warn("Failed to fetch movie detail for TMDB ID: {}", movieResult.getId());
                        result.errors++;
                    }

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.error("Thread interrupted while processing movie: {}", movieResult.getTitle());
                    break;
                } catch (Exception e) {
                    log.error("Error processing movie: {} (TMDB ID: {})", movieResult.getTitle(), movieResult.getId(), e);
                    result.errors++;
                }
            }

        } catch (Exception e) {
            log.error("Error during TMDB upcoming movies synchronization", e);
            result.errors++;
        }

        log.info("TMDB upcoming movies synchronization completed - Total: {}, New: {}, Skipped: {}, Errors: {}",
                result.totalProcessed, result.newMovies, result.skippedMovies, result.errors);

        return result;
    }

    /**
     * 재시도 로직이 포함된 upcoming movies 페이지 가져오기
     */
    private TmdbPagedResponseDto fetchUpcomingMoviesWithRetry(int page) {
        String url = String.format("%s/movie/upcoming?api_key=%s&page=%d&language=ko-KR&region=KR",
                tmdbBaseUrl, tmdbApiKey, page);

        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                TmdbPagedResponseDto response = restTemplate.getForObject(url, TmdbPagedResponseDto.class);
                if (response != null) {
                    return response;
                }
            } catch (RestClientException e) {
                log.warn("Attempt {}/{} failed to fetch upcoming movies page {}: {}",
                        attempt, MAX_RETRY_ATTEMPTS, page, e.getMessage());

                if (attempt < MAX_RETRY_ATTEMPTS) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt); // 점진적 지연
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        log.error("Failed to fetch upcoming movies page {} after {} attempts", page, MAX_RETRY_ATTEMPTS);
        return null;
    }

    /**
     * 재시도 로직이 포함된 영화 상세정보 가져오기
     */
    private TmdbMovieDetailDto fetchMovieDetailWithRetry(Integer tmdbId) {
        String url = String.format("%s/movie/%d?api_key=%s&append_to_response=credits,keywords&language=ko-KR",
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
     * 영화 상세정보를 DB에 저장
     */
    @Transactional
    public void processMovieDetail(TmdbMovieDetailDto movieDetail) {
        // 1. Movie 엔티티 생성 및 저장
        Movie movie = Movie.builder()
                .title(movieDetail.getTitle())
                .releaseDate(movieDetail.getReleaseDate())
                .overview(movieDetail.getOverview())
                .voteAverage(movieDetail.getVoteAverage())
                .voteCount(movieDetail.getVoteCount())
                .runtime(movieDetail.getRuntime())
                .posterUrl(movieDetail.getPosterPath() != null ? tmdbImageBaseUrl + movieDetail.getPosterPath() : null)
                .tmdbId(movieDetail.getId())
                .build();

        movie = movieRepository.save(movie);
        log.debug("Saved movie: {} with ID: {}", movie.getTitle(), movie.getMovieId());

        // 2. 장르 처리
        if (movieDetail.getGenres() != null && !movieDetail.getGenres().isEmpty()) {
            for (TmdbGenreDto genreDto : movieDetail.getGenres()) {
                if (genreDto != null && genreDto.getName() != null) {
                    Genre genre = findOrCreateGenre(genreDto.getName());
                    saveMovieGenreRelation(movie.getMovieId(), genre.getGenreId());
                }
            }
        }

        // 3. 배우 처리
        if (movieDetail.getCredits() != null && movieDetail.getCredits().getCast() != null) {
            for (TmdbCastDto castDto : movieDetail.getCredits().getCast()) {
                if (castDto != null && castDto.getName() != null) {
                    Actor actor = findOrCreateActor(castDto.getName());
                    saveMovieActorRelation(movie.getMovieId(), actor.getActorId());
                }
            }
        }

        // 4. 감독 처리
        if (movieDetail.getCredits() != null && movieDetail.getCredits().getCrew() != null) {
            for (TmdbCrewDto crewDto : movieDetail.getCredits().getCrew()) {
                if (crewDto != null && "Director".equals(crewDto.getJob()) && crewDto.getName() != null) {
                    Director director = findOrCreateDirector(crewDto.getName());
                    saveMovieDirectorRelation(movie.getMovieId(), director.getDirectorId());
                }
            }
        }

        // 5. 키워드 처리
        if (movieDetail.getKeywords() != null && movieDetail.getKeywords().getKeywords() != null) {
            for (TmdbKeywordDto keywordDto : movieDetail.getKeywords().getKeywords()) {
                if (keywordDto != null && keywordDto.getName() != null) {
                    Keyword keyword = findOrCreateKeyword(keywordDto.getName());
                    saveMovieKeywordRelation(movie.getMovieId(), keyword.getKeywordId());
                }
            }
        }

        log.info("Successfully processed movie with all relations: {} (TMDB ID: {})", movie.getTitle(), movie.getTmdbId());
    }

    private Genre findOrCreateGenre(String name) {
        try {
            return genreRepository.findByName(name)
                    .orElseGet(() -> genreRepository.save(Genre.builder().name(name).build()));
        } catch (Exception e) {
            log.warn("Error finding genre by name '{}', creating new one: {}", name, e.getMessage());
            return genreRepository.save(Genre.builder().name(name).build());
        }
    }

    private Actor findOrCreateActor(String name) {
        try {
            return actorRepository.findByName(name)
                    .orElseGet(() -> actorRepository.save(Actor.builder().name(name).build()));
        } catch (Exception e) {
            log.warn("Error finding actor by name '{}', creating new one: {}", name, e.getMessage());
            return actorRepository.save(Actor.builder().name(name).build());
        }
    }

    private Director findOrCreateDirector(String name) {
        try {
            return directorRepository.findByName(name)
                    .orElseGet(() -> directorRepository.save(Director.builder().name(name).build()));
        } catch (Exception e) {
            log.warn("Error finding director by name '{}', creating new one: {}", name, e.getMessage());
            return directorRepository.save(Director.builder().name(name).build());
        }
    }

    private Keyword findOrCreateKeyword(String name) {
        try {
            return keywordRepository.findByName(name)
                    .orElseGet(() -> keywordRepository.save(Keyword.builder().name(name).build()));
        } catch (Exception e) {
            log.warn("Error finding keyword by name '{}', creating new one: {}", name, e.getMessage());
            return keywordRepository.save(Keyword.builder().name(name).build());
        }
    }

    private void saveMovieGenreRelation(Integer movieId, Integer genreId) {
        try {
            // exists 체크 없이 바로 INSERT IGNORE 사용 (중복 시 자동으로 무시됨)
            movieGenreRepository.insertMovieGenre(movieId, genreId);
            log.debug("Created movie-genre relation: movieId={}, genreId={}", movieId, genreId);
        } catch (Exception e) {
            log.error("Failed to create movie-genre relation: movieId={}, genreId={}", movieId, genreId, e);
        }
    }

    private void saveMovieActorRelation(Integer movieId, Integer actorId) {
        try {
            movieActorRepository.insertMovieActor(movieId, actorId);
            log.debug("Created movie-actor relation: movieId={}, actorId={}", movieId, actorId);
        } catch (Exception e) {
            log.error("Failed to create movie-actor relation: movieId={}, actorId={}", movieId, actorId, e);
        }
    }

    private void saveMovieDirectorRelation(Integer movieId, Integer directorId) {
        try {
            movieDirectorRepository.insertMovieDirector(movieId, directorId);
            log.debug("Created movie-director relation: movieId={}, directorId={}", movieId, directorId);
        } catch (Exception e) {
            log.error("Failed to create movie-director relation: movieId={}, directorId={}", movieId, directorId, e);
        }
    }

    private void saveMovieKeywordRelation(Integer movieId, Integer keywordId) {
        try {
            movieKeywordRepository.insertMovieKeyword(movieId, keywordId);
            log.debug("Created movie-keyword relation: movieId={}, keywordId={}", movieId, keywordId);
        } catch (Exception e) {
            log.error("Failed to create movie-keyword relation: movieId={}, keywordId={}", movieId, keywordId, e);
        }
    }

    /**
     * 기존 영화의 메타데이터만 처리 (영화 정보는 업데이트하지 않음)
     */
    @Transactional
    public void processMovieMetadata(TmdbMovieDetailDto movieDetail, Integer movieId) {
        // 장르 처리
        if (movieDetail.getGenres() != null && !movieDetail.getGenres().isEmpty()) {
            for (TmdbGenreDto genreDto : movieDetail.getGenres()) {
                if (genreDto != null && genreDto.getName() != null) {
                    Genre genre = findOrCreateGenre(genreDto.getName());
                    saveMovieGenreRelation(movieId, genre.getGenreId());
                }
            }
        }

        // 배우 처리
        if (movieDetail.getCredits() != null && movieDetail.getCredits().getCast() != null) {
            for (TmdbCastDto castDto : movieDetail.getCredits().getCast()) {
                if (castDto != null && castDto.getName() != null) {
                    Actor actor = findOrCreateActor(castDto.getName());
                    saveMovieActorRelation(movieId, actor.getActorId());
                }
            }
        }

        // 감독 처리
        if (movieDetail.getCredits() != null && movieDetail.getCredits().getCrew() != null) {
            for (TmdbCrewDto crewDto : movieDetail.getCredits().getCrew()) {
                if (crewDto != null && "Director".equals(crewDto.getJob()) && crewDto.getName() != null) {
                    Director director = findOrCreateDirector(crewDto.getName());
                    saveMovieDirectorRelation(movieId, director.getDirectorId());
                }
            }
        }

        // 키워드 처리
        if (movieDetail.getKeywords() != null && movieDetail.getKeywords().getKeywords() != null) {
            for (TmdbKeywordDto keywordDto : movieDetail.getKeywords().getKeywords()) {
                if (keywordDto != null && keywordDto.getName() != null) {
                    Keyword keyword = findOrCreateKeyword(keywordDto.getName());
                    saveMovieKeywordRelation(movieId, keyword.getKeywordId());
                }
            }
        }
    }

    /**
     * 단일 영화 정보 가져오기 (컨트롤러에서 호출)
     */
    @Transactional
    public void importSingleMovie(Integer tmdbId) {
        log.info("Starting import for single movie: TMDB ID {}", tmdbId);

        try {
            // 이미 존재하는지 확인
            if (movieRepository.existsByTmdbId(tmdbId)) {
                log.info("Movie already exists in DB: TMDB ID {}", tmdbId);
                return;
            }

            // 영화 상세 정보 가져오기
            TmdbMovieDetailDto movieDetail = fetchMovieDetailWithRetry(tmdbId);

            if (movieDetail != null) {
                processMovieDetail(movieDetail);
                log.info("Successfully imported movie: {} (TMDB ID: {})", movieDetail.getTitle(), movieDetail.getId());
            } else {
                throw new RuntimeException("Failed to fetch movie detail from TMDB API");
            }

        } catch (Exception e) {
            log.error("Error importing single movie: TMDB ID {}", tmdbId, e);
            throw e;
        }
    }

    /**
     * 동기화 결과를 담는 내부 클래스
     */
    public static class SyncResult {
        public int totalProcessed = 0;
        public int newMovies = 0;
        public int skippedMovies = 0;
        public int errors = 0;

        @Override
        public String toString() {
            return String.format("SyncResult{totalProcessed=%d, newMovies=%d, skippedMovies=%d, errors=%d}",
                    totalProcessed, newMovies, skippedMovies, errors);
        }
    }
}