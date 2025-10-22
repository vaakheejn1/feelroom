package com.d208.feelroom.comment.domain.entity;

import com.d208.feelroom.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment_likes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class CommentLike {

    @EmbeddedId
    private CommentLikeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") // id 필드(CommentLikeId)의 'userId' 필드에 매핑
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("commentId") // id 필드(CommentLikeId)의 'commentId' 필드에 매핑
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 서비스 레이어에서 객체를 쉽게 생성하기 위한 Builder
     */
    @Builder
    public CommentLike(User user, Comment comment) {
        this.user = user;
        this.comment = comment;
        // 빌더를 통해 객체를 생성할 때, id 객체도 함께 생성하고 초기화해줍니다.
        this.id = new CommentLikeId(user.getUserId(), comment.getCommentId());
    }
}