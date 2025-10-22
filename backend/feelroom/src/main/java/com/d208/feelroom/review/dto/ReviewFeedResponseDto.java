package com.d208.feelroom.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ReviewFeedResponseDto {
    private List<FeedReviewInfo> reviews;
    private boolean hasNext; // 다음 페이지가 있는지 여부
}
