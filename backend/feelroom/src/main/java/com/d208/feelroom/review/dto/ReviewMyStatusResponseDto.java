package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "리뷰에 대한 현재 사용자의 상태 응답 DTO")
public class ReviewMyStatusResponseDto {

    @Schema(description = "현재 사용자가 이 리뷰에 '좋아요'를 눌렀는지 여부")
    private final boolean isLiked;

    @Schema(description = "이 리뷰에 총 좋아요 개수")
    private final int likesCount;

    public ReviewMyStatusResponseDto(boolean isLiked, int likeCount) {
        this.isLiked = isLiked;
        this.likesCount = likeCount;
    }
}