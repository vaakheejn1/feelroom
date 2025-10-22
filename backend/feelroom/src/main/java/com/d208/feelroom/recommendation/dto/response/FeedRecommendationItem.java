package com.d208.feelroom.recommendation.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class FeedRecommendationItem {
    @JsonProperty("review_id")
    private UUID reviewId;
    private Integer tmdbId;
    private Double finalScore;
}
