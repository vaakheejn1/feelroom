package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Schema(description = "리뷰 수정 요청 DTO")
public class ReviewUpdateRequestDto {

    @Schema(description = "수정할 리뷰 제목", example = "다시 보니 더 감동적이네요!")
    @Size(max = 500, message = "리뷰 제목은 500자를 초과할 수 없습니다.")
    private String title; // 선택적으로 수정할 수 있도록 @NotBlank 제외

    @Schema(description = "수정할 리뷰 내용", example = "처음 봤을 때 놓쳤던 디테일들이 보입니다.")
    private String content; // 선택적으로 수정할 수 있도록 @NotBlank 제외

    @Schema(description = "수정할 영화 별점 (0~10점)", example = "10")
    @Min(value = 0, message = "별점은 0점 이상이어야 합니다.")
    @Max(value = 10, message = "별점은 10점 이하여야 합니다.")
    private Integer rating;

    @Schema(description = "수정할 태그 ID 목록 (선택 사항)", example = "[1, 5, 20]")
    private Set<Integer> tagIds;
}