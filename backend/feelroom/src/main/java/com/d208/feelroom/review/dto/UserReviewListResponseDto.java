package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import com.d208.feelroom.review.dto.ReviewCommonDto.MovieInfo;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReviewListResponseDto {

    @Schema(description = "리뷰를 작성한 사용자의 닉네임")
    private String userNickname;

    @Schema(description = "리뷰를 작성한 사용자의 프로필 이미지 URL")
    private String userProfileImageUrl;

    @Schema(description = "사용자가 작성한 리뷰 목록")
    private List<UserReviewInfo> reviews;

    /**
     * 유저가 작성한 개별 리뷰 정보를 담는 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserReviewInfo {
        private UUID reviewId;
        private String title;
        private String content; // 리뷰 목록에서는 내용도 보여주는 것이 일반적입니다.
        private Integer rating;
        private Integer likesCount;
        private Integer commentsCount;
        private LocalDateTime createdAt;

        @Schema(description = "현재 API를 호출한 사용자의 해당 리뷰 좋아요 여부")
        private boolean isLiked;

        @Schema(description = "리뷰가 작성된 영화 정보")
        private MovieInfo movie;
    }
}