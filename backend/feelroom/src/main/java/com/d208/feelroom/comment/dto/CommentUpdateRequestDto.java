package com.d208.feelroom.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "댓글/대댓글 수정 요청 DTO")
public class CommentUpdateRequestDto {

    @Schema(description = "수정할 댓글 내용", example = "아, 다시 보니 이 부분은 좀 다른 것 같네요.")
    @NotBlank(message = "댓글 내용은 비워둘 수 없습니다.")
    private String content;
}