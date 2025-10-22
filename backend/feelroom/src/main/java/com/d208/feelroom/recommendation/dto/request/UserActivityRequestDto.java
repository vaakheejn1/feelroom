package com.d208.feelroom.recommendation.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserActivityRequestDto {
    private Long userId;
    private List<Integer> reviewedMovieIds;
    private List<Double> ratings;
    private List<UUID> likedReviewIds;
    private List<Integer> likedMovieIds;
}
