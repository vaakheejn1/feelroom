package com.d208.feelroom.movie.service.init;

import com.d208.feelroom.movie.domain.repository.*;
import com.d208.feelroom.movie.dto.MovieDetailDto;
import com.d208.feelroom.movie.domain.entity.Movie;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JsonMovieImportService {

    private final MovieRepository movieRepository;
    private final ActorRepository actorRepository;
    private final DirectorRepository directorRepository;
    private final GenreRepository genreRepository;
    private final KeywordRepository keywordRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    private static final String RESOURCE_PATH = "data/international_movies_2025-08-04_04-16.jsonl";

    /**
     * 영화 기본 정보만 import (원본 메서드)
     */
    @Transactional
    public void importMoviesFromResources() {
        String resourcePath = "data/international_movies_2025-08-04_04-16.jsonl";
        log.info("=== 리소스에서 JSON 파일 import 시작: {} ===", resourcePath);

        int totalCount = 0;
        int successCount = 0;
        int skipCount = 0;
        int errorCount = 0;

        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);

            if (!resource.exists()) {
                log.error("리소스 파일을 찾을 수 없습니다: {}", resourcePath);
                return;
            }

            try (InputStream inputStream = resource.getInputStream();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    totalCount++;

                    if (line.trim().isEmpty()) {
                        continue;
                    }

                    try {
                        MovieDetailDto jsonData = objectMapper.readValue(line, MovieDetailDto.class);

                        if (totalCount <= 5) {
                            log.info("라인 {}: tmdbId={}, title={}, releaseDate={}",
                                    totalCount, jsonData.getTmdbId(), jsonData.getTitle(), jsonData.getReleaseDate());
                        }

                        if (!isValidMovieData(jsonData)) {
                            log.warn("유효하지 않은 데이터 - 라인 {}: tmdbId={}, title={}",
                                    totalCount, jsonData.getTmdbId(), jsonData.getTitle());
                            errorCount++;
                            continue;
                        }

                        if (movieRepository.existsByTmdbId(jsonData.getTmdbId())) {
                            skipCount++;
                            if (skipCount % 1000 == 0) {
                                log.debug("스킵: {}개", skipCount);
                            }
                            continue;
                        }

                        try {
                            Movie movie = createSafeMovieFromJson(jsonData);
                            movieRepository.save(movie);
                            successCount++;

                            if (successCount % 100 == 0) {
                                log.info("진행 상황: {}개 저장 완료 (전체 처리: {}개)", successCount, totalCount);
                            }

                        } catch (Exception saveException) {
                            errorCount++;
                            log.error("영화 저장 실패 - 라인 {}, tmdbId: {}, 오류: {}",
                                    totalCount, jsonData.getTmdbId(), saveException.getMessage());
                        }

                    } catch (Exception parseException) {
                        errorCount++;
                        log.error("JSON 파싱 실패 - 라인 {}: {}", totalCount, parseException.getMessage());
                    }
                }
            }

        } catch (IOException e) {
            log.error("파일 읽기 실패", e);
        }

        log.info("=== JSON import 완료 ===");
        log.info("총 처리: {}개", totalCount);
        log.info("성공: {}개", successCount);
        log.info("스킵: {}개 (중복)", skipCount);
        log.info("오류: {}개", errorCount);
    }


    /**
     * 2단계: 기본 엔티티들(배우, 감독, 장르, 키워드) 추출 및 저장
     */
    @Transactional
    public void importEntitiesFromResources() {
        log.info("=== 2단계: 기본 엔티티 추출 및 저장 시작 ===");

        Set<String> actorNames = new HashSet<>();
        Set<String> directorNames = new HashSet<>();
        Set<String> genreNames = new HashSet<>();
        Set<String> keywordNames = new HashSet<>();

        int totalCount = 0;

        try {
            ClassPathResource resource = new ClassPathResource(RESOURCE_PATH);
            if (!resource.exists()) {
                throw new RuntimeException("리소스 파일을 찾을 수 없습니다: " + RESOURCE_PATH);
            }

            // 1단계: JSON에서 모든 엔티티 이름들 추출
            try (InputStream inputStream = resource.getInputStream();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    totalCount++;

                    if (line.trim().isEmpty()) {
                        continue;
                    }

                    try {
                        MovieDetailDto jsonData = objectMapper.readValue(line, MovieDetailDto.class);

                        // 배우 이름들 수집
                        if (jsonData.getActors() != null) {
                            for (String actorName : jsonData.getActors()) {
                                if (actorName != null && !actorName.trim().isEmpty()) {
                                    actorNames.add(actorName.trim());
                                }
                            }
                        }

                        // 감독 이름들 수집
                        if (jsonData.getDirectors() != null) {
                            for (String directorName : jsonData.getDirectors()) {
                                if (directorName != null && !directorName.trim().isEmpty()) {
                                    directorNames.add(directorName.trim());
                                }
                            }
                        }

                        // 장르 이름들 수집
                        if (jsonData.getGenres() != null) {
                            for (String genreName : jsonData.getGenres()) {
                                if (genreName != null && !genreName.trim().isEmpty()) {
                                    genreNames.add(genreName.trim());
                                }
                            }
                        }

                        // 키워드 이름들 수집
                        if (jsonData.getKeywords() != null) {
                            for (String keywordName : jsonData.getKeywords()) {
                                if (keywordName != null && !keywordName.trim().isEmpty()) {
                                    keywordNames.add(keywordName.trim());
                                }
                            }
                        }

                    } catch (Exception e) {
                        log.error("엔티티 추출 실패 - 라인 {}: {}", totalCount, e.getMessage());
                    }
                }
            }

            // 2단계: 추출된 엔티티들을 DB에 저장
            log.info("추출 완료 - 배우: {}개, 감독: {}개, 장르: {}개, 키워드: {}개",
                    actorNames.size(), directorNames.size(), genreNames.size(), keywordNames.size());

            saveActors(actorNames);
            saveDirectors(directorNames);
            saveGenres(genreNames);
            saveKeywords(keywordNames);

        } catch (IOException e) {
            log.error("파일 읽기 실패", e);
            throw new RuntimeException("엔티티 import 실패", e);
        }

        log.info("=== 기본 엔티티 저장 완료 ===");
    }

    /**
     * 3단계: 관계 데이터 저장 (배치 처리)
     */
    @Transactional
    public void importRelationsFromResources() {
        log.info("=== 3단계: 관계 데이터 저장 시작 ===");

        // 캐시 맵 로드
        Map<String, Integer> actorCache = loadActorCache();
        Map<String, Integer> directorCache = loadDirectorCache();
        Map<String, Integer> genreCache = loadGenreCache();
        Map<String, Integer> keywordCache = loadKeywordCache();

        log.info("캐시 로딩 완료 - 배우: {}개, 감독: {}개, 장르: {}개, 키워드: {}개",
                actorCache.size(), directorCache.size(), genreCache.size(), keywordCache.size());

        // 배치 처리용 리스트들
        List<Object[]> actorBatch = new ArrayList<>();
        List<Object[]> directorBatch = new ArrayList<>();
        List<Object[]> genreBatch = new ArrayList<>();
        List<Object[]> keywordBatch = new ArrayList<>();

        int totalCount = 0;
        int processedCount = 0;
        int batchSize = 1000;

        try {
            ClassPathResource resource = new ClassPathResource(RESOURCE_PATH);
            if (!resource.exists()) {
                throw new RuntimeException("리소스 파일을 찾을 수 없습니다: " + RESOURCE_PATH);
            }

            try (InputStream inputStream = resource.getInputStream();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    totalCount++;

                    if (line.trim().isEmpty()) {
                        continue;
                    }

                    try {
                        MovieDetailDto jsonData = objectMapper.readValue(line, MovieDetailDto.class);

                        if (jsonData.getTmdbId() == null) {
                            continue;
                        }

                        Optional<Movie> movieOpt = movieRepository.findByTmdbId(jsonData.getTmdbId());
                        if (movieOpt.isEmpty()) {
                            continue;
                        }

                        Movie movie = movieOpt.get();
                        processedCount++;

                        // 관계 데이터를 배치에 추가
                        addRelationsToBatch(movie, jsonData, actorBatch, directorBatch, genreBatch, keywordBatch,
                                actorCache, directorCache, genreCache, keywordCache);

                        // 배치 크기에 도달하면 실행
                        if (processedCount % batchSize == 0) {
                            executeBatches(actorBatch, directorBatch, genreBatch, keywordBatch);
                            log.info("관계 데이터 배치 처리: {}개 영화 완료", processedCount);
                        }

                    } catch (Exception e) {
                        log.error("관계 처리 실패 - 라인 {}: {}", totalCount, e.getMessage());
                    }
                }

                // 마지막 배치 실행
                if (!actorBatch.isEmpty() || !directorBatch.isEmpty() || !genreBatch.isEmpty() || !keywordBatch.isEmpty()) {
                    executeBatches(actorBatch, directorBatch, genreBatch, keywordBatch);
                }

            }

        } catch (IOException e) {
            log.error("파일 읽기 실패", e);
            throw new RuntimeException("관계 데이터 import 실패", e);
        }

        log.info("=== 관계 데이터 저장 완료 ===");
        log.info("총 처리: {}개, 영화 처리: {}개", totalCount, processedCount);
        logFinalCounts();
    }

    // ================ Private Helper Methods ================

    private boolean isValidMovieData(MovieDetailDto data) {
        return data.getTmdbId() != null &&
                data.getTitle() != null && !data.getTitle().trim().isEmpty() &&
                data.getReleaseDate() != null && !data.getReleaseDate().trim().isEmpty();
    }

    private Movie createMovieFromJson(MovieDetailDto jsonData) {
        return Movie.builder()
                .tmdbId(jsonData.getTmdbId())
                .title(safeTrim(jsonData.getTitle(), "Unknown Title"))
                .releaseDate(safeTrim(jsonData.getReleaseDate(), "1900-01-01"))
                .overview(safeTrim(jsonData.getOverview(), ""))
                .voteAverage(safeDouble(jsonData.getVoteAverage(), 0.0))
                .voteCount(safeInteger(jsonData.getVoteCount(), 0))
                .runtime(safeInteger(jsonData.getRuntime(), 0))
                .posterUrl(safeTrim(jsonData.getPosterUrl(), ""))
                .build();
    }

    private void saveActors(Set<String> actorNames) {
        log.info("배우 저장 시작: {}개", actorNames.size());

        // 기존 배우들 조회해서 중복 제거
        Set<String> existingActors = new HashSet<>();
        jdbcTemplate.query("SELECT name FROM actors", (rs, rowNum) -> {
            existingActors.add(rs.getString("name"));
            return null;
        });

        // 새로운 배우들만 필터링
        List<Object[]> newActors = new ArrayList<>();
        for (String name : actorNames) {
            if (!existingActors.contains(name)) {
                newActors.add(new Object[]{name});
            }
        }

        log.info("새로운 배우: {}개 (전체 {}개 중 {}개 기존)",
                newActors.size(), actorNames.size(), actorNames.size() - newActors.size());

        // 1000개씩 배치 저장
        int batchSize = 1000;
        for (int i = 0; i < newActors.size(); i += batchSize) {
            int end = Math.min(i + batchSize, newActors.size());
            List<Object[]> batch = newActors.subList(i, end);

            jdbcTemplate.batchUpdate("INSERT INTO actors (name) VALUES (?)", batch);
            log.info("배우 배치 저장: {}/{} 완료", end, newActors.size());
        }

        log.info("배우 저장 완료: {}개 배치 저장됨", newActors.size());
    }

    private void saveDirectors(Set<String> directorNames) {
        log.info("감독 저장 시작: {}개", directorNames.size());

        Set<String> existingDirectors = new HashSet<>();
        jdbcTemplate.query("SELECT name FROM directors", (rs, rowNum) -> {
            existingDirectors.add(rs.getString("name"));
            return null;
        });

        List<Object[]> newDirectors = new ArrayList<>();
        for (String name : directorNames) {
            if (!existingDirectors.contains(name)) {
                newDirectors.add(new Object[]{name});
            }
        }

        log.info("새로운 감독: {}개", newDirectors.size());

        int batchSize = 1000;
        for (int i = 0; i < newDirectors.size(); i += batchSize) {
            int end = Math.min(i + batchSize, newDirectors.size());
            List<Object[]> batch = newDirectors.subList(i, end);

            jdbcTemplate.batchUpdate("INSERT INTO directors (name) VALUES (?)", batch);
            log.info("감독 배치 저장: {}/{} 완료", end, newDirectors.size());
        }

        log.info("감독 저장 완료: {}개 배치 저장됨", newDirectors.size());
    }

    private void saveGenres(Set<String> genreNames) {
        log.info("장르 저장 시작: {}개", genreNames.size());

        Set<String> existingGenres = new HashSet<>();
        jdbcTemplate.query("SELECT name FROM genres", (rs, rowNum) -> {
            existingGenres.add(rs.getString("name"));
            return null;
        });

        List<Object[]> newGenres = new ArrayList<>();
        for (String name : genreNames) {
            if (!existingGenres.contains(name)) {
                newGenres.add(new Object[]{name});
            }
        }

        log.info("새로운 장르: {}개", newGenres.size());

        if (!newGenres.isEmpty()) {
            jdbcTemplate.batchUpdate("INSERT INTO genres (name) VALUES (?)", newGenres);
        }

        log.info("장르 저장 완료: {}개 배치 저장됨", newGenres.size());
    }

    private void saveKeywords(Set<String> keywordNames) {
        log.info("키워드 저장 시작: {}개", keywordNames.size());

        Set<String> existingKeywords = new HashSet<>();
        jdbcTemplate.query("SELECT name FROM keywords", (rs, rowNum) -> {
            existingKeywords.add(rs.getString("name"));
            return null;
        });

        List<Object[]> newKeywords = new ArrayList<>();
        for (String name : keywordNames) {
            if (!existingKeywords.contains(name)) {
                newKeywords.add(new Object[]{name});
            }
        }

        log.info("새로운 키워드: {}개", newKeywords.size());

        int batchSize = 1000;
        for (int i = 0; i < newKeywords.size(); i += batchSize) {
            int end = Math.min(i + batchSize, newKeywords.size());
            List<Object[]> batch = newKeywords.subList(i, end);

            jdbcTemplate.batchUpdate("INSERT INTO keywords (name) VALUES (?)", batch);
            log.info("키워드 배치 저장: {}/{} 완료", end, newKeywords.size());
        }

        log.info("키워드 저장 완료: {}개 배치 저장됨", newKeywords.size());
    }

    private Map<String, Integer> loadActorCache() {
        Map<String, Integer> cache = new HashMap<>();
        jdbcTemplate.query("SELECT actor_id, name FROM actors", (rs, rowNum) -> {
            cache.put(rs.getString("name"), rs.getInt("actor_id"));
            return null;
        });
        return cache;
    }

    private Map<String, Integer> loadDirectorCache() {
        Map<String, Integer> cache = new HashMap<>();
        jdbcTemplate.query("SELECT director_id, name FROM directors", (rs, rowNum) -> {
            cache.put(rs.getString("name"), rs.getInt("director_id"));
            return null;
        });
        return cache;
    }

    private Map<String, Integer> loadGenreCache() {
        Map<String, Integer> cache = new HashMap<>();
        jdbcTemplate.query("SELECT genre_id, name FROM genres", (rs, rowNum) -> {
            cache.put(rs.getString("name"), rs.getInt("genre_id"));
            return null;
        });
        return cache;
    }

    private Map<String, Integer> loadKeywordCache() {
        Map<String, Integer> cache = new HashMap<>();
        jdbcTemplate.query("SELECT keyword_id, name FROM keywords", (rs, rowNum) -> {
            cache.put(rs.getString("name"), rs.getInt("keyword_id"));
            return null;
        });
        return cache;
    }

    private void addRelationsToBatch(Movie movie, MovieDetailDto jsonData,
                                     List<Object[]> actorBatch, List<Object[]> directorBatch,
                                     List<Object[]> genreBatch, List<Object[]> keywordBatch,
                                     Map<String, Integer> actorCache, Map<String, Integer> directorCache,
                                     Map<String, Integer> genreCache, Map<String, Integer> keywordCache) {

        Integer movieId = movie.getMovieId();

        // 배우 관계 추가
        if (jsonData.getActors() != null) {
            for (String actorName : jsonData.getActors()) {
                if (actorName != null && !actorName.trim().isEmpty()) {
                    Integer actorId = actorCache.get(actorName.trim());
                    if (actorId != null) {
                        actorBatch.add(new Object[]{movieId, actorId});
                    }
                }
            }
        }

        // 감독 관계 추가
        if (jsonData.getDirectors() != null) {
            for (String directorName : jsonData.getDirectors()) {
                if (directorName != null && !directorName.trim().isEmpty()) {
                    Integer directorId = directorCache.get(directorName.trim());
                    if (directorId != null) {
                        directorBatch.add(new Object[]{movieId, directorId});
                    }
                }
            }
        }

        // 장르 관계 추가
        if (jsonData.getGenres() != null) {
            for (String genreName : jsonData.getGenres()) {
                if (genreName != null && !genreName.trim().isEmpty()) {
                    Integer genreId = genreCache.get(genreName.trim());
                    if (genreId != null) {
                        genreBatch.add(new Object[]{movieId, genreId});
                    }
                }
            }
        }

        // 키워드 관계 추가
        if (jsonData.getKeywords() != null) {
            for (String keywordName : jsonData.getKeywords()) {
                if (keywordName != null && !keywordName.trim().isEmpty()) {
                    Integer keywordId = keywordCache.get(keywordName.trim());
                    if (keywordId != null) {
                        keywordBatch.add(new Object[]{movieId, keywordId});
                    }
                }
            }
        }
    }

    private void executeBatches(List<Object[]> actorBatch, List<Object[]> directorBatch,
                                List<Object[]> genreBatch, List<Object[]> keywordBatch) {

        if (!actorBatch.isEmpty()) {
            jdbcTemplate.batchUpdate("INSERT IGNORE INTO movie_actor (movie_id, actor_id) VALUES (?, ?)", actorBatch);
            actorBatch.clear();
        }

        if (!directorBatch.isEmpty()) {
            jdbcTemplate.batchUpdate("INSERT IGNORE INTO movie_director (movie_id, director_id) VALUES (?, ?)", directorBatch);
            directorBatch.clear();
        }

        if (!genreBatch.isEmpty()) {
            jdbcTemplate.batchUpdate("INSERT IGNORE INTO movie_genre (movie_id, genre_id) VALUES (?, ?)", genreBatch);
            genreBatch.clear();
        }

        if (!keywordBatch.isEmpty()) {
            jdbcTemplate.batchUpdate("INSERT IGNORE INTO movie_keyword (movie_id, keyword_id) VALUES (?, ?)", keywordBatch);
            keywordBatch.clear();
        }
    }

    private void logFinalCounts() {
        try {
            int actors = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM movie_actor", Integer.class);
            int directors = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM movie_director", Integer.class);
            int genres = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM movie_genre", Integer.class);
            int keywords = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM movie_keyword", Integer.class);

            log.info("=== 최종 관계 테이블 현황 ===");
            log.info("movie_actor: {}개", actors);
            log.info("movie_director: {}개", directors);
            log.info("movie_genre: {}개", genres);
            log.info("movie_keyword: {}개", keywords);
            log.info("총 관계: {}개", actors + directors + genres + keywords);
        } catch (Exception e) {
            log.error("최종 카운트 조회 실패", e);
        }
    }

    /**
     * Null-Safe Movie 엔티티 생성
     */
    private Movie createSafeMovieFromJson(MovieDetailDto jsonData) {
        return Movie.builder()
                .tmdbId(jsonData.getTmdbId())
                .title(safeTrim(jsonData.getTitle(), "Unknown Title"))
                .releaseDate(safeTrim(jsonData.getReleaseDate(), "1900-01-01"))
                .overview(safeTrim(jsonData.getOverview(), ""))
                .voteAverage(safeDouble(jsonData.getVoteAverage(), 0.0))
                .voteCount(safeInteger(jsonData.getVoteCount(), 0))
                .runtime(safeInteger(jsonData.getRuntime(), 0))
                .posterUrl(safeTrim(jsonData.getPosterUrl(), ""))
                .build();
    }


    private String safeTrim(String value, String defaultValue) {
        return (value == null || value.trim().isEmpty()) ? defaultValue : value.trim();
    }

    private Double safeDouble(Double value, Double defaultValue) {
        return value != null ? value : defaultValue;
    }

    private Integer safeInteger(Integer value, Integer defaultValue) {
        return value != null ? value : defaultValue;
    }


}