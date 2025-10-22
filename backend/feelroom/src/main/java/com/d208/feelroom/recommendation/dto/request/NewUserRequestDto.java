package com.d208.feelroom.recommendation.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class NewUserRequestDto {
    @JsonProperty("liked_tmdb_ids")
    private List<Integer> likedTmdbIds;
}