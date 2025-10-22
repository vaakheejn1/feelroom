package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ReviewTagRecommendResponseDto {

    @Schema(description = "추천된 태그 목록")
    private List<String> tags;
}