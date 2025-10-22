package com.d208.feelroom.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Setter;

@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
@AllArgsConstructor
public class CommentMyStatusResponseDto {
    @Schema(description = "댓글 총 좋아요 수")
    @Setter
    private int likeCount;

    @Schema(description = "현재 사용자의 좋아요 여부")
    @Setter
    private boolean isLiked;
}
