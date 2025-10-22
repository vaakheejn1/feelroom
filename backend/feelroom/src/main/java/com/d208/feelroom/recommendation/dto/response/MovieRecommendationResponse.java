package com.d208.feelroom.recommendation.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class MovieRecommendationResponse {
    private String userId;
    private String recommendationType;
    private List<MovieRecommendationItem> recommendations;
}
