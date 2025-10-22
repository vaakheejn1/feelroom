package com.d208.feelroom.recommendation.dto;

import java.util.List;

import lombok.Getter;

@Getter
public class MovieRecommendationResultDto {
	private Long userId;
	private List<Integer> recommendedMovieIds;
}
