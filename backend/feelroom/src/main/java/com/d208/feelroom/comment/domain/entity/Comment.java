package com.d208.feelroom.comment.domain.entity;

import com.d208.feelroom.comment.domain.entity.summary.CommentSummary;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Comment {

    private static final String DELETED_CONTENT = "삭제된 댓글입니다.";

    @Id
    @GeneratedValue
    @Column(name = "comment_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_user_id")
    private User replyToUser;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    @OneToOne(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private CommentSummary commentSummary;

    // 편의 메서드 : 댓글 내용 변경
    public void updateContent(String newContent) {
        this.content = newContent;
    }

    /**
     * 댓글을 삭제 상태로 변경합니다.
     * 내용, 작성자, 멘션 대상자를 모두 익명화 처리합니다.
     *
     * @param deletedByUser 삭제를 수행하는 사용자
     */
    public void delete(User deletedByUser) {
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedByUser;
        this.content = DELETED_CONTENT; // 내용을 대체
        this.user = null; // 작성자 정보 익명화
        this.replyToUser = null; // 멘션 대상자 정보 익명화
    }

    /**
     * 이 댓글이 삭제되었는지 확인하는 헬퍼 메서드
     *
     * @return 삭제되었으면 true, 아니면 false
     */
    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    public void setCommentSummary(CommentSummary commentSummary) {
        this.commentSummary = commentSummary; // Comment -> CommentSummary 참조 설정
        if (commentSummary != null) {
            commentSummary.setComment(this); // CommentSummary -> Comment 참조도 설정
        }
    }
}