package com.d208.feelroom.review.dto;

import com.d208.feelroom.review.dto.ReviewCommonDto.MovieInfo;
import com.d208.feelroom.review.dto.ReviewCommonDto.UserInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedReviewInfo {

    private UUID reviewId;
    private String title;
    private String content;
    private Integer rating;
    private Integer likesCount;
    private Integer commentsCount;
    private LocalDateTime createdAt;
    private List<String> tags;

    @Schema(description = "리뷰 작성자 정보")
    private UserInfo author;

    @Schema(description = "리뷰가 작성된 영화 정보")
    private MovieInfo movie;

    @Schema(description = "현재 API를 호출한 사용자의 해당 리뷰 좋아요 여부")
    private boolean isLiked;
}