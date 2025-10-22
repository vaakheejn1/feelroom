package com.d208.feelroom.review.domain.entity;

import com.d208.feelroom.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_likes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ReviewLike {

    @EmbeddedId
    private ReviewLikeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") // ReviewLikeId 클래스의 'userId' 필드에 매핑
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("reviewId") // ReviewLikeId 클래스의 'reviewId' 필드에 매핑
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 서비스 레이어에서 객체를 쉽게 생성하기 위한 Builder
     * id 객체도 함께 생성하여 할당합니다.
     */
    @Builder
    public ReviewLike(User user, Review review) {
        this.user = user;
        this.review = review;
        this.id = new ReviewLikeId(user.getUserId(), review.getReviewId());
    }
}