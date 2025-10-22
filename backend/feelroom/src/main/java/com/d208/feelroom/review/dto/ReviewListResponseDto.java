package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewListResponseDto {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewInfo {
        private UUID reviewId;
        private String userNickname;
        private Integer rating;
        private Integer likesCount;
        private Integer commentsCount;
        private LocalDateTime createdAt;
        @Schema(description = "현재 사용자의 좋아요 여부")
        private boolean isLiked;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewStats {
        private Integer totalReviews;
        private Double averageRating;
    }
    
    private List<ReviewInfo> reviews;
    private ReviewStats reviewStats;
}