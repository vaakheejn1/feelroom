package com.d208.feelroom.search.controller;

import com.d208.feelroom.search.dto.MovieSearchResponseDto;
import com.d208.feelroom.search.dto.UserSearchResponseDto;
import com.d208.feelroom.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "7. Search", description = "영화/사용자 검색 API")
public class SearchController {

    private final SearchService searchService;

    // 검색 관련 상수
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    @GetMapping("/movies")
    @Operation(summary = "영화 제목 검색", description = "영화 제목으로 검색하여 유사도 순으로 정렬된 결과를 반환합니다.")
    public ResponseEntity<MovieSearchResponseDto> searchMovies(
            @Parameter(description = "검색할 영화 제목", required = true, example = "인셉션")
            @RequestParam String title,

            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기 (최대 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        log.info("영화 검색 요청: title={}, page={}, size={}", title, page, size);

        // 기본적인 검증만 수행
        if (title == null || title.trim().isEmpty()) {
            log.warn("빈 검색어로 요청됨");
            return ResponseEntity.badRequest().build();
        }

        if (page < 0) page = 0;
        if (size <= 0) size = DEFAULT_SIZE;
        if (size > MAX_SIZE) size = MAX_SIZE;

        Pageable pageable = PageRequest.of(page, size);
        MovieSearchResponseDto response = searchService.searchMovies(title.trim(), pageable);

        log.info("영화 검색 응답: title={}, 결과수={}, hasNext={}",
                title, response.getMovieCount(), response.isHasNext());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    @Operation(summary = "사용자 통합 검색", description = "username 또는 nickname으로 사용자를 검색합니다. 정확도 순으로 정렬됩니다.")
    public ResponseEntity<UserSearchResponseDto> searchUsers(
            @Parameter(description = "검색할 사용자명 또는 닉네임", required = true, example = "user123")
            @RequestParam String query,

            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기 (최대 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        log.info("사용자 통합 검색 요청: query={}, page={}, size={}", query, page, size);

        // 기본적인 검증
        if (query == null || query.trim().isEmpty()) {
            log.warn("빈 검색어로 요청됨");
            return ResponseEntity.badRequest().build();
        }

        // 검색어 길이 제한 (성능 최적화)
        if (query.trim().length() < 2) {
            log.warn("검색어가 너무 짧음: query={}", query);
            return ResponseEntity.badRequest().build();
        }

        if (page < 0) page = 0;
        if (size <= 0) size = DEFAULT_SIZE;
        if (size > MAX_SIZE) size = MAX_SIZE;

        Pageable pageable = PageRequest.of(page, size);
        UserSearchResponseDto response = searchService.searchUsers(query.trim(), pageable);

        log.info("사용자 통합 검색 응답: query={}, 결과수={}, 전체={}건",
                query, response.getUserCount(), response.getTotalElements());

        return ResponseEntity.ok(response);
    }

    // SearchController.java에 추가할 엔드포인트

    @GetMapping("/movies/keywords")
    @Operation(
            summary = "키워드 기반 영화 검색",
            description = "검색 쿼리를 받아서 해당 키워드들을 가진 영화 목록을 반환합니다. 중복된 영화는 제거되며, 페이징을 지원합니다."
    )
    public ResponseEntity<MovieSearchResponseDto> searchMoviesByKeywords(
            @Parameter(description = "검색 쿼리", required = true, example = "액션 모험")
            @RequestParam String query,

            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기 (최대 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        log.info("키워드 기반 영화 검색 요청: query={}, page={}, size={}", query, page, size);

        // 기본적인 검증
        if (query == null || query.trim().isEmpty()) {
            log.warn("빈 검색 쿼리로 요청됨");
            return ResponseEntity.badRequest().build();
        }

        if (page < 0) page = 0;
        if (size <= 0) size = DEFAULT_SIZE;
        if (size > MAX_SIZE) size = MAX_SIZE;

        Pageable pageable = PageRequest.of(page, size);
        MovieSearchResponseDto response = searchService.searchMoviesByKeywords(query.trim(), pageable);

        log.info("키워드 기반 영화 검색 응답: query={}, 결과수={}, hasNext={}",
                query, response.getMovieCount(), response.isHasNext());

        return ResponseEntity.ok(response);
    }

}