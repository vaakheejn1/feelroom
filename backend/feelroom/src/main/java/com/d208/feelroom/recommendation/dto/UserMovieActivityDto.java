package com.d208.feelroom.recommendation.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserMovieActivityDto {
	private Long userId;
	private List<Integer> reviewedMovieIds;
	private List<Double> ratings;
	private LocalDateTime timestamp;
}