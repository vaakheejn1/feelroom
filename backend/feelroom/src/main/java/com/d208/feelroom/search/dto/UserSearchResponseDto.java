package com.d208.feelroom.search.dto;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 사용자 검색 응답 DTO
 * Page 기반 페이징을 지원하는 사용자 검색 결과 래퍼
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchResponseDto {

    private List<UserSearchDto> users;      // 검색된 사용자 목록
    private boolean hasNext;                // 다음 페이지 존재 여부
    private int currentPage;                // 현재 페이지 번호
    private int pageSize;                   // 페이지 크기
    private long totalElements;             // 전체 검색 결과 수
    private int totalPages;                 // 전체 페이지 수
    private String searchQuery;             // 검색어 (디버깅/로깅용)

    /**
     * Page<UserSearchDto>로부터 응답 DTO 생성
     */
    public static UserSearchResponseDto fromPage(Page<UserSearchDto> userPage, String searchQuery) {
        return UserSearchResponseDto.builder()
                .users(userPage.getContent())
                .hasNext(userPage.hasNext())
                .currentPage(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .searchQuery(searchQuery)
                .build();
    }

    /**
     * 빈 검색 결과 생성
     */
    public static UserSearchResponseDto empty(String searchQuery, int page, int size) {
        return UserSearchResponseDto.builder()
                .users(List.of())
                .hasNext(false)
                .currentPage(page)
                .pageSize(size)
                .totalElements(0L)
                .totalPages(0)
                .searchQuery(searchQuery)
                .build();
    }

    /**
     * 검색 결과 존재 여부
     */
    public boolean hasUsers() {
        return users != null && !users.isEmpty();
    }

    /**
     * 검색 결과 개수
     */
    public int getUserCount() {
        return users != null ? users.size() : 0;
    }
}
