package com.d208.feelroom.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "리뷰 생성 응답 DTO")
public class ReviewCreateResponseDto {

    @Schema(description = "생성된 리뷰 ID", example = "a1b2c3d4-e5f6-7890-1234-567890abcdef")
    private UUID reviewId;

    @Schema(description = "응답 메시지", example = "리뷰 작성 완료")
    private String message;
}
