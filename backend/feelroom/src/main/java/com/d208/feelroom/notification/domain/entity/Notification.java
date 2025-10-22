package com.d208.feelroom.notification.domain.entity;

import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.comment.domain.entity.Comment;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver; // 알림을 받는 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id") // 시스템 알림의 경우 null일 수 있음
    private User sender; // 알림을 보낸 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_review_id")
    private Review targetReview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_comment_id")
    private Comment targetComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_badge_id")
    private Badge targetBadge;

    @Column(name = "is_read", nullable = false, length = 1)
    private char isRead;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 생성 시점에 isRead와 createdAt을 초기화
    @PrePersist
    protected void onCreate() {
        this.isRead = 'N';
        this.createdAt = LocalDateTime.now();
    }

    // == 빌더 ==
    @Builder
    public Notification(String type, User receiver, User sender, Review targetReview, Comment targetComment, Badge targetBadge) {
        this.type = type;
        this.receiver = receiver;
        this.sender = sender;
        this.targetReview = targetReview;
        this.targetComment = targetComment;
        this.targetBadge = targetBadge;
    }

    // == 비즈니스 로직 (상태 변경) ==
    public void markAsRead() {
        this.isRead = 'Y';
    }
}