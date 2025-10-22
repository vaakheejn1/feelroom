package com.d208.feelroom.recommendation.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MovieRecommendationItem {
    private Integer tmdbId;
    private String titleTmdb;
    private Double finalScore;
}
