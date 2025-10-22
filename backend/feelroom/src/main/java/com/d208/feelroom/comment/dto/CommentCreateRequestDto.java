package com.d208.feelroom.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor // JSON 역직렬화를 위해 기본 생성자 필요
@Schema(description = "댓글/대댓글 생성 요청 DTO")
public class CommentCreateRequestDto {

    @Schema(description = "댓글 내용", example = "리뷰 잘 봤습니다!")
    @NotBlank(message = "댓글 내용은 비워둘 수 없습니다.")
    private String content;

    @Schema(description = "부모 댓글 ID (대댓글의 경우 원 댓글의 ID, 최상위 댓글은 null)",
            example = "a8b7c6d5-e4f3-2109-8765-a4b3c2d1e0f9")
    private UUID parentCommentId;

    @Schema(description = "멘션할 사용자 ID (대댓글의 경우 @태그 대상 사용자의 ID, 최상위 댓글은 null)",
            example = "123")
    private Long mentionUserId; // [추가] 멘션 대상 사용자 ID
}