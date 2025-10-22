package com.d208.feelroom.recommendation.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class FeedRecommendationResponse {
    private String userId;
    private String recommendationType;
    private List<FeedRecommendationItem> recommendations;
}