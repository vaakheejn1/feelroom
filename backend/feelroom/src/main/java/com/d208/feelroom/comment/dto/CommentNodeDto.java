package com.d208.feelroom.comment.dto;

import com.d208.feelroom.comment.domain.entity.Comment;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE) // 정적 팩토리 메서드 사용을 강제
@Schema(description = "계층형 댓글 노드 정보 DTO")
public class CommentNodeDto {

    @Schema(description = "댓글 ID")
    private UUID commentId;

    @Schema(description = "부모 댓글 ID (대댓글일 경우에만 존재)")
    private UUID parentCommentId; // [추가] 서비스 로직에서 매핑을 위해 필수

    @Schema(description = "댓글 내용")
    private String content;

    @Schema(description = "작성자 정보 (삭제 시 null)")
    private CommentWriterDto writer;

    @Schema(description = "멘션된 사용자 정보 (삭제 시 null)")
    private CommentWriterDto mentionedUser;

    @Schema(description = "삭제 여부 플래그")
    private boolean isDeleted;

    @Schema(description = "생성 시각")
    private LocalDateTime createdAt;

    @Schema(description = "댓글 총 좋아요 수")
    @Setter
    private int likeCount;

    @Schema(description = "현재 사용자의 좋아요 여부")
    @Setter
    private boolean isLiked;

    @Schema(description = "자식 댓글(대댓글) 리스트")
    @Setter
    private List<CommentNodeDto> replies = new ArrayList<>();

    // 정적 팩토리 메서드 (엔티티 -> DTO 변환)
    public static CommentNodeDto from(Comment comment) {
        CommentNodeDto dto = new CommentNodeDto();
        dto.commentId = comment.getCommentId();
        dto.content = comment.getContent();
        dto.isDeleted = comment.isDeleted();
        dto.createdAt = comment.getCreatedAt();

        // 부모 댓글 ID 설정
        if (comment.getParentComment() != null) {
            dto.parentCommentId = comment.getParentComment().getCommentId();
        }

        // 삭제된 댓글과 아닌 댓글을 분기 처리하여 NPE 방지
        if (!comment.isDeleted()) {
            dto.writer = CommentWriterDto.from(comment.getUser());
            dto.mentionedUser = CommentWriterDto.from(comment.getReplyToUser());
        }

        return dto;
    }
}