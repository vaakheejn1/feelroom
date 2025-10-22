package com.d208.feelroom.search.service;

import com.d208.feelroom.search.document.MovieDocument;
import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.entity.summary.MovieSummary;
import com.d208.feelroom.movie.domain.repository.MovieGenreRepository;
import com.d208.feelroom.movie.domain.repository.MovieKeywordRepository;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.movie.domain.repository.MovieSummaryRepository;
import com.d208.feelroom.search.repository.MovieSearchRepository;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.search.dto.MovieSearchDto;
import com.d208.feelroom.search.dto.MovieSearchResponseDto;
import com.d208.feelroom.search.dto.UserSearchDto;
import com.d208.feelroom.search.dto.UserSearchResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SearchService {

    private final MovieSearchRepository movieSearchRepository;
    private final MovieRepository movieRepository;
    private final MovieSummaryRepository movieSummaryRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final UserRepository userRepository;
    private final MovieKeywordRepository movieKeywordRepository;

    // RestTemplate을 직접 생성
    private final RestTemplate restTemplate = createRestTemplate();

    @Value("${fastapi.url:http://movie-fastapi:8000}")
    private String fastapiUrl;

    /**
     * RestTemplate 생성 및 설정
     */
    private RestTemplate createRestTemplate() {
        RestTemplate template = new RestTemplate();

        // 타임아웃 설정이 필요하면 여기서 설정
        // SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        // factory.setConnectTimeout(5000);
        // factory.setReadTimeout(10000);
        // template.setRequestFactory(factory);

        return template;
    }

    // FastAPI 응답 DTO 클래스들
    public static class KeywordSearchResult {
        private Integer keywordId;  // keywordId로 변경
        private Double score;
        private Integer rank;

        // getters and setters
        public Integer getKeywordId() { return keywordId; }
        public void setKeywordId(Integer keywordId) { this.keywordId = keywordId; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Integer getRank() { return rank; }
        public void setRank(Integer rank) { this.rank = rank; }
    }

    public static class KeywordSearchResponse {
        private Boolean success;
        private String query;
        private List<KeywordSearchResult> results;
        private Integer count;
        private String message;

        // getters and setters
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        public List<KeywordSearchResult> getResults() { return results; }
        public void setResults(List<KeywordSearchResult> results) { this.results = results; }
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class KeywordSearchRequest {
        private String query;
        private Integer top_k;

        public KeywordSearchRequest(String query, Integer topK) {
            this.query = query;
            this.top_k = topK;
        }

        // getters and setters
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        public Integer getTop_k() { return top_k; }
        public void setTop_k(Integer top_k) { this.top_k = top_k; }
    }

    /**
     * 영화 제목으로 검색
     */
    public MovieSearchResponseDto searchMovies(String title, Pageable pageable) {
        try {
            log.info("영화 제목 검색 시작: title={}, page={}, size={}",
                    title, pageable.getPageNumber(), pageable.getPageSize());

            // 1단계: MySQL DB 스캔 검색
            List<Movie> mysqlMovies = movieRepository.findByTitleContainingIgnoreCase(title);

            if (!mysqlMovies.isEmpty()) {
                // MySQL 검색 결과가 있으면 바로 반환
                log.info("MySQL 검색 결과 있음: title={}, 결과수={}", title, mysqlMovies.size());
                return convertMySQLResultToResponse(mysqlMovies, title, pageable);
            }

            // 2단계: Elasticsearch nori 분석기 검색
            Page<MovieDocument> movieDocumentPage = movieSearchRepository
                    .findByTitleContaining(title, pageable);

            // 3단계: 결과 없으면 wildcard 검색
            if (!movieDocumentPage.hasContent()) {
                log.info("nori 검색 결과 없음, wildcard 검색 시도: title={}", title);
                movieDocumentPage = movieSearchRepository
                        .findByTitleWildcard(title, pageable);
            }

            // 검색 결과가 없으면 빈 응답 반환
            if (!movieDocumentPage.hasContent()) {
                log.info("영화 검색 결과 없음: title={}", title);
                return MovieSearchResponseDto.empty(title, pageable.getPageNumber(), pageable.getPageSize());
            }

            // Page를 Slice처럼 처리하여 응답 DTO 생성
            Slice<MovieSearchDto> movieSearchSlice = movieDocumentPage.map(this::convertToMovieSearchDto);

            log.info("영화 검색 완료: title={}, 결과수={}, hasNext={}",
                    title, movieSearchSlice.getContent().size(), movieDocumentPage.hasNext());

            return MovieSearchResponseDto.fromSlice(movieSearchSlice, title);

        } catch (Exception e) {
            log.error("영화 검색 중 오류 발생: title={}", title, e);
            return MovieSearchResponseDto.empty(title, pageable.getPageNumber(), pageable.getPageSize());
        }
    }

    /**
     * 검색 쿼리로 영화 검색 (FastAPI 키워드 검색 연동)
     */
    public MovieSearchResponseDto searchMoviesByKeywords(String query, Pageable pageable) {
        try {
            log.info("키워드 기반 영화 검색 시작: query={}, page={}, size={}",
                    query, pageable.getPageNumber(), pageable.getPageSize());

            // 1. FastAPI에서 키워드 ID 목록 가져오기
            List<Integer> keywordIds = getKeywordIdsFromFastAPI(query, 10); // 최대 10개 키워드

            if (keywordIds.isEmpty()) {
                log.info("FastAPI 키워드 검색 결과 없음: query={}", query);
                return MovieSearchResponseDto.empty(query, pageable.getPageNumber(), pageable.getPageSize());
            }

            log.info("FastAPI에서 받은 키워드 ID: query={}, keywordIds={}", query, keywordIds);

            // 2. 키워드 ID로 영화 수집 (기존 Repository 메소드 사용)
            Set<Integer> uniqueMovieIds = new HashSet<>();

            for (Integer keywordId : keywordIds) {
                List<Movie> movies = movieKeywordRepository.findMoviesByKeywordId(keywordId);
                movies.forEach(movie -> uniqueMovieIds.add(movie.getMovieId()));
            }

            if (uniqueMovieIds.isEmpty()) {
                log.info("키워드로 영화 검색 결과 없음: query={}, keywordIds={}", query, keywordIds);
                return MovieSearchResponseDto.empty(query, pageable.getPageNumber(), pageable.getPageSize());
            }

            // 3. 영화 정보 조회 및 vote_average 기준 정렬
            List<Movie> allMovies = new ArrayList<>();
            for (Integer movieId : uniqueMovieIds) {
                Optional<Movie> movieOpt = movieRepository.findById(movieId);
                if (movieOpt.isPresent()) {
                    allMovies.add(movieOpt.get());
                }
            }

            // vote_average 기준 내림차순 정렬 (높은 평점이 먼저)
            allMovies.sort((m1, m2) -> Double.compare(
                    m2.getVoteAverage() != null ? m2.getVoteAverage() : 0.0,
                    m1.getVoteAverage() != null ? m1.getVoteAverage() : 0.0
            ));

            // 4. 페이징 처리
            int start = pageable.getPageNumber() * pageable.getPageSize();
            int end = Math.min(start + pageable.getPageSize(), allMovies.size());

            if (start >= allMovies.size()) {
                return MovieSearchResponseDto.empty(query, pageable.getPageNumber(), pageable.getPageSize());
            }

            List<Movie> pageMovies = allMovies.subList(start, end);
            boolean hasNext = end < allMovies.size();

            // 5. DTO 변환
            List<MovieSearchDto> movieSearchDtos = pageMovies.stream()
                    .map(this::convertMovieToSearchDto)
                    .collect(Collectors.toList());

            log.info("키워드 검색 완료: query={}, keywordIds={}, 결과수={}, hasNext={}",
                    query, keywordIds, movieSearchDtos.size(), hasNext);

            return MovieSearchResponseDto.builder()
                    .movies(movieSearchDtos)
                    .hasNext(hasNext)
                    .currentPage(pageable.getPageNumber())
                    .pageSize(pageable.getPageSize())
                    .totalElements(allMovies.size())
                    .searchQuery("keywords for: " + query)
                    .build();

        } catch (Exception e) {
            log.error("키워드 검색 중 오류 발생: query={}", query, e);
            return MovieSearchResponseDto.empty(query, pageable.getPageNumber(), pageable.getPageSize());
        }
    }

    /**
     * FastAPI에서 키워드 ID 목록 가져오기
     */
    private List<Integer> getKeywordIdsFromFastAPI(String query, int topK) {
        try {
            // 요청 URL 구성
            String url = fastapiUrl + "/api/v1/keywordSearch";

            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 요청 바디 구성
            KeywordSearchRequest request = new KeywordSearchRequest(query, topK);
            HttpEntity<KeywordSearchRequest> entity = new HttpEntity<>(request, headers);

            log.info("FastAPI 키워드 검색 요청: url={}, query={}, topK={}", url, query, topK);

            // FastAPI 호출
            ResponseEntity<KeywordSearchResponse> response = restTemplate.postForEntity(
                    url, entity, KeywordSearchResponse.class);

            if (response.getBody() != null && response.getBody().getSuccess()) {
                List<Integer> keywordIds = response.getBody().getResults().stream()
                        .map(KeywordSearchResult::getKeywordId)
                        .collect(Collectors.toList());

                log.info("FastAPI 키워드 검색 성공: query={}, 결과수={}", query, keywordIds.size());
                return keywordIds;
            } else {
                log.warn("FastAPI 키워드 검색 실패: query={}, response={}", query, response.getBody());
                return Collections.emptyList();
            }

        } catch (Exception e) {
            log.error("FastAPI 키워드 검색 중 오류 발생: query={}", query, e);
            // FastAPI 호출 실패 시 빈 목록 반환 (서비스 계속 동작)
            return Collections.emptyList();
        }
    }

    /**
     * username 또는 nickname으로 통합 검색
     */
    public UserSearchResponseDto searchUsers(String query, Pageable pageable) {
        try {
            log.info("사용자 통합 검색 시작: query={}, page={}, size={}",
                    query, pageable.getPageNumber(), pageable.getPageSize());

            // 통합 검색 (username + nickname)
            Page<User> userPage = userRepository.searchUsers(query, pageable);

            if (!userPage.hasContent()) {
                log.info("사용자 통합 검색 결과 없음: query={}", query);
                return UserSearchResponseDto.empty(query, pageable.getPageNumber(), pageable.getPageSize());
            }

            // User -> UserSearchDto 변환
            Page<UserSearchDto> userSearchPage = userPage.map(UserSearchDto::fromUser);

            log.info("사용자 통합 검색 완료: query={}, 결과수={}, 전체={}건",
                    query, userSearchPage.getContent().size(), userSearchPage.getTotalElements());

            return UserSearchResponseDto.fromPage(userSearchPage, query);

        } catch (Exception e) {
            log.error("사용자 통합 검색 중 오류 발생: query={}", query, e);
            return UserSearchResponseDto.empty(query, pageable.getPageNumber(), pageable.getPageSize());
        }
    }

    /**
     * MySQL 검색 결과를 응답 DTO로 변환 (페이징 처리 포함)
     */
    private MovieSearchResponseDto convertMySQLResultToResponse(List<Movie> allMovies, String title, Pageable pageable) {
        try {
            // 수동 페이징 처리
            int start = pageable.getPageNumber() * pageable.getPageSize();
            int end = Math.min(start + pageable.getPageSize(), allMovies.size());

            if (start >= allMovies.size()) {
                return MovieSearchResponseDto.empty(title,
                        pageable.getPageNumber(), pageable.getPageSize());
            }

            List<Movie> pageMovies = allMovies.subList(start, end);
            boolean hasNext = end < allMovies.size();

            // Movie -> MovieSearchDto 변환
            List<MovieSearchDto> movieSearchDtos = pageMovies.stream()
                    .map(this::convertMovieToSearchDto)
                    .collect(Collectors.toList());

            return MovieSearchResponseDto.builder()
                    .movies(movieSearchDtos)
                    .hasNext(hasNext)
                    .currentPage(pageable.getPageNumber())
                    .pageSize(pageable.getPageSize())
                    .totalElements(allMovies.size())
                    .searchQuery(title)
                    .build();

        } catch (Exception e) {
            log.error("MySQL 검색 결과 변환 중 오류 발생: title='{}'", title, e);
            return MovieSearchResponseDto.empty(title,
                    pageable.getPageNumber(), pageable.getPageSize());
        }
    }

    /**
     * MovieDocument를 MovieSearchDto로 변환
     */
    private MovieSearchDto convertToMovieSearchDto(MovieDocument document) {
        try {
            Integer movieId = document.getMovieId();

            // 1. 기본 MovieSearchDto 생성 (MovieDocument 기반)
            MovieSearchDto baseDto = MovieSearchDto.fromMovieDocument(document);

            // 2. MySQL에서 추가 정보 조회
            // 2-1. 장르 정보 조회
            List<String> genres = movieGenreRepository.findGenreNamesByMovieId(movieId);
            MovieSearchDto dtoWithGenres = baseDto.withGenres(genres);

            // 2-2. 런타임 정보 조회 (MovieDocument에 runtime이 없을 수 있음)
            MovieSearchDto dtoWithRuntime = dtoWithGenres;
            if (dtoWithGenres.getRuntime() == null) {
                Optional<Movie> movieOpt = movieRepository.findById(movieId);
                if (movieOpt.isPresent() && movieOpt.get().getRuntime() != null) {
                    dtoWithRuntime = dtoWithGenres.withRuntime(movieOpt.get().getRuntime());
                }
            }

            // 2-3. 우리 서비스 평점 조회
            MovieSummary summary = movieSummaryRepository.findById(movieId).orElse(null);
            MovieSearchDto finalDto = dtoWithRuntime;
            if (summary != null) {
                finalDto = dtoWithRuntime.withUserRatingAverage(summary.getUserRatingAverage());
            }

            return finalDto;

        } catch (Exception e) {
            log.error("MovieDocument 변환 중 오류 발생: movieId={}", document.getMovieId(), e);
            // 에러 발생 시 기본 정보만으로 DTO 생성
            return MovieSearchDto.fromMovieDocument(document);
        }
    }

    /**
     * Movie 엔티티를 MovieSearchDto로 변환 (MySQL 기반)
     */
    private MovieSearchDto convertMovieToSearchDto(Movie movie) {
        try {
            // 장르 정보 조회
            List<String> genres = movieGenreRepository.findGenreNamesByMovieId(movie.getMovieId());

            // 우리 서비스 평점 조회
            Double userRatingAverage = 0.0;
            MovieSummary summary = movieSummaryRepository.findById(movie.getMovieId()).orElse(null);
            if (summary != null) {
                userRatingAverage = summary.getUserRatingAverage();
            }

            // 개봉년도 추출
            String releaseYear = extractYearFromDate(movie.getReleaseDate());

            return MovieSearchDto.builder()
                    .movieId(movie.getMovieId())
                    .title(movie.getTitle())
                    .posterUrl(movie.getPosterUrl())
                    .releaseYear(releaseYear)
                    .genres(genres)
                    .runtime(movie.getRuntime())
                    .voteAverage(movie.getVoteAverage())
                    .userRatingAverage(userRatingAverage)
                    .build();

        } catch (Exception e) {
            log.error("Movie 변환 중 오류 발생: movieId={}", movie.getMovieId(), e);
            // 에러 발생 시 기본 정보만으로 DTO 생성
            return MovieSearchDto.builder()
                    .movieId(movie.getMovieId())
                    .title(movie.getTitle())
                    .posterUrl(movie.getPosterUrl())
                    .releaseYear(extractYearFromDate(movie.getReleaseDate()))
                    .voteAverage(movie.getVoteAverage())
                    .userRatingAverage(0.0)
                    .build();
        }
    }

    /**
     * 날짜 문자열에서 년도 추출 (Date 타입 처리)
     */
    private String extractYearFromDate(java.sql.Date releaseDate) {
        if (releaseDate == null) {
            return "미정";
        }

        // Date를 String으로 변환 후 년도 추출
        String dateStr = releaseDate.toString();
        return extractYearFromDate(dateStr);
    }

    /**
     * 날짜 문자열에서 년도 추출
     */
    private String extractYearFromDate(String releaseDate) {
        if (releaseDate == null || releaseDate.trim().isEmpty()) {
            return "미정";
        }

        // 이미 년도 형태라면 그대로 반환
        if (releaseDate.length() == 4 && releaseDate.matches("\\d{4}")) {
            return releaseDate;
        }

        // "YYYY-MM-DD" 형태에서 년도 추출
        if (releaseDate.length() >= 4) {
            String year = releaseDate.substring(0, 4);
            if (year.matches("\\d{4}")) {
                return year;
            }
        }

        return "미정";
    }
}