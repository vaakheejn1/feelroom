package com.d208.feelroom.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "댓글 생성 응답 DTO")
public class CommentCreateResponseDto {

        @Schema(description = "새로 생성된 댓글의 UUID", example = "a8b7c6d5-e4f3-2109-8765-a4b3c2d1e0f9")
        private UUID commentId;
}