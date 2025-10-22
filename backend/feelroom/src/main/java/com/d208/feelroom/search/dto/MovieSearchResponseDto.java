package com.d208.feelroom.search.dto;

import lombok.*;
import org.springframework.data.domain.Slice;

import java.util.*;

/**
 * 영화 검색 응답 DTO
 * Slice 기반 무한스크롤을 지원하는 검색 결과 래퍼
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieSearchResponseDto {

    private List<MovieSearchDto> movies;    // 검색된 영화 목록
    private boolean hasNext;                // 다음 페이지 존재 여부
    private int currentPage;                // 현재 페이지 번호
    private int pageSize;                   // 페이지 크기
    private long totalElements;             // 전체 검색 결과 수 (선택적)
    private String searchQuery;             // 검색어 (디버깅/로깅용)

    /**
     * Slice<MovieSearchDto>로부터 응답 DTO 생성
     */
    public static MovieSearchResponseDto fromSlice(Slice<MovieSearchDto> movieSlice, String searchQuery) {
        return MovieSearchResponseDto.builder()
                .movies(movieSlice.getContent())
                .hasNext(movieSlice.hasNext())
                .currentPage(movieSlice.getNumber())
                .pageSize(movieSlice.getSize())
                .searchQuery(searchQuery)
                .build();
    }

    /**
     * Slice와 전체 검색 결과 수를 포함한 응답 DTO 생성
     * 전체 결과 수가 필요한 경우 사용
     */
    public static MovieSearchResponseDto fromSliceWithTotal(
            Slice<MovieSearchDto> movieSlice,
            String searchQuery,
            long totalElements) {
        return MovieSearchResponseDto.builder()
                .movies(movieSlice.getContent())
                .hasNext(movieSlice.hasNext())
                .currentPage(movieSlice.getNumber())
                .pageSize(movieSlice.getSize())
                .totalElements(totalElements)
                .searchQuery(searchQuery)
                .build();
    }

    /**
     * 빈 검색 결과 생성
     */
    public static MovieSearchResponseDto empty(String searchQuery, int page, int size) {
        return MovieSearchResponseDto.builder()
                .movies(List.of())
                .hasNext(false)
                .currentPage(page)
                .pageSize(size)
                .totalElements(0L)
                .searchQuery(searchQuery)
                .build();
    }

    /**
     * 검색 결과 존재 여부
     */
    public boolean hasMovies() {
        return movies != null && !movies.isEmpty();
    }

    /**
     * 검색 결과 개수
     */
    public int getMovieCount() {
        return movies != null ? movies.size() : 0;
    }
}
