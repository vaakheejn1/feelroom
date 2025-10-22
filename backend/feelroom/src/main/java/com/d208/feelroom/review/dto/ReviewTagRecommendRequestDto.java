package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewTagRecommendRequestDto {

    @Schema(description = "영화의 고유 ID", example = "27205")
    @NotNull(message = "영화 ID는 필수입니다.")
    private Integer movieId;

    @Schema(description = "사용자가 매긴 평점 (0~10)", example = "9")
    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 0, message = "평점은 0 이상이어야 합니다.")
    @Max(value = 10, message = "평점은 10 이하여야 합니다.")
    private Integer rating;

    @Schema(description = "태그 추천을 위한 원본 리뷰 내용", example = "이 영화는 정말 감동적이었고, 가족들과 함께 보기에 너무 좋았어요. 배우들의 연기도 최고였습니다.")
    @NotBlank(message = "리뷰 내용은 비어 있을 수 없습니다.")
    private String reviewContent;
}