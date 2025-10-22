package com.d208.feelroom.movie.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "영화 좋아요 토글 응답 DTO")
public class MovieMyStatusResponseDto {
    @Schema(description = "토글 후의 최종 좋아요 상태 (true: 좋아요, false: 좋아요 아님)")
    private boolean isLiked;
}