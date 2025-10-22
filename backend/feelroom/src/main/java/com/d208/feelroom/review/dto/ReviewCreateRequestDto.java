package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "리뷰 생성 요청 DTO")
public class ReviewCreateRequestDto {
    @Schema(description = "리뷰 대상 영화 ID", example = "1001")
    @NotNull(message = "영화 ID는 필수입니다.")
    private Integer movieId;

    @Schema(description = "리뷰 제목", example = "정말 감동적인 영화였어요!")
    @NotBlank(message = "리뷰 제목은 필수입니다.")
    @Size(max = 500, message = "리뷰 제목은 500자를 초과할 수 없습니다.")
    private String title;

    @Schema(description = "리뷰 내용", example = "이 영화는 저의 인생 영화가 될 것 같습니다...")
    @NotBlank(message = "리뷰 내용은 필수입니다.")
    private String content;

    @Schema(description = "사용자가 매긴 영화 별점 (0~10점)", example = "9")
    @NotNull(message = "별점은 필수입니다.")
    @Min(value = 0, message = "별점은 0점 이상이어야 합니다.")
    @Max(value = 10, message = "별점은 10점 이하여야 합니다.")
    private Integer rating;

    @Schema(description = "리뷰에 추가할 태그 ID 목록", example = "[1, 5, 12]")
    private Set<Integer> tagIds; // 추천 tag 전달 시 id & name을 전달
}
