package com.d208.feelroom.movie.dto;

import lombok.Getter;

@Getter
public class MovieResponseDto { // 클래스 이름을 좀 더 명확하게 MoviePersonalizedResponseDto 등으로 바꿔도 좋습니다.

  // 1. 공통 상세 정보 (정적 + 동적)
  private final MovieDetailResponseDto details;

  // 2. 개인화 정보
  private final boolean isLiked;

  // 생성자
  public MovieResponseDto(MovieDetailResponseDto details, boolean isLiked) {
    this.details = details;
    this.isLiked = isLiked;
  }
}