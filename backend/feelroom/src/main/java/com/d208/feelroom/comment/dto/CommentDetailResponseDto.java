package com.d208.feelroom.comment.dto;

import com.d208.feelroom.comment.domain.entity.Comment;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Schema(description = "단일 댓글 상세 정보 응답 DTO")
public class CommentDetailResponseDto {

    @Schema(description = "댓글 ID")
    private UUID commentId;

    @Schema(description = "댓글 내용 (삭제 시 '삭제된 댓글입니다.'로 대체됨)")
    private String content;

    @Schema(description = "작성자 정보 (삭제 시 null)")
    private CommentWriterDto writer;

    @Schema(description = "멘션된 사용자 정보 (대댓글일 경우, 삭제 시 null)")
    private CommentWriterDto mentionedUser;

    @Schema(description = "부모 댓글 ID (대댓글일 경우)")
    private UUID parentCommentId;

    @Schema(description = "리뷰 ID (이 댓글이 속한)")
    private UUID reviewId;

    @Schema(description = "생성 시각")
    private LocalDateTime createdAt;

    @Schema(description = "마지막 수정 시각")
    private LocalDateTime updatedAt;

    @Schema(description = "삭제 여부 플래그")
    private boolean isDeleted;

    // Comment 엔티티를 DTO로 변환하는 생성자
    public CommentDetailResponseDto(Comment comment) {
        this.commentId = comment.getCommentId();
        this.content = comment.getContent();
        this.reviewId = comment.getReview().getReviewId();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        this.isDeleted = comment.isDeleted();

        if (comment.isDeleted()) {
            this.writer = null;
            this.mentionedUser = null;
            this.parentCommentId = null;
        } else {
            // [수정] new 생성자 호출을 정적 팩토리 메서드 호출로 변경
            this.writer = CommentWriterDto.from(comment.getUser());
            this.mentionedUser = CommentWriterDto.from(comment.getReplyToUser());

            if (comment.getParentComment() != null) {
                this.parentCommentId = comment.getParentComment().getCommentId();
            } else {
                this.parentCommentId = null;
            }
        }
    }
}