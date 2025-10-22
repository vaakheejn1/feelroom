package com.d208.feelroom.review.domain.entity;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.review.domain.entity.tag.Tag;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.review.domain.entity.tag.ReviewTag;
import com.d208.feelroom.review.domain.entity.summary.ReviewSummary;


import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted_at IS NULL") // 엔티티의 deleted_at이 null 이면 조회X
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "review_id", columnDefinition = "BINARY(16)")
    private UUID reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) 
    private User user;                               // user_id user pk Mapping

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false) // movie_id는 movie pk Mapping
    private Movie movie;

    @Column(length = 500, nullable = false)
    private String title;                            // 리뷰 제목

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;                          // 리뷰 내용

    @Min(0)
    @Max(10)
    private Integer rating;                          // 사용자가 매긴 영화 별점 (0~10)점

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;                 // 생성 시점

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;                 // 수정 시점

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;                 // 삭제 시점 - soft 삭제 방식

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;                         // 이 리뷰를 삭제한 사용자

    // reviews ---< review_tag (OneToMany) 리뷰에 달린 리뷰 태그들
    // review_tag 테이블이 자체 PK를 가지므로, 조인 테이블 엔티티 필요
    @Builder.Default
    @OneToMany(mappedBy = "review", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE}, orphanRemoval = true)
    private List<ReviewTag> reviewTags = new ArrayList<>();

    public void addTag(Tag tag) {
        ReviewTag reviewTag = ReviewTag.builder()
                .review(this)
                .tag(tag)
                .build();
        this.reviewTags.add(reviewTag);
    }
    // 편의 메서드: ReviewTag 제거
    public void removeReviewTag(ReviewTag reviewTag) {
        //  reviewTags 리스트에서 해당 ReviewTag 객체를 제거합니다.
        this.reviewTags.remove(reviewTag);
    }
    // reviews --- review_summary (OneToOne)
    // review_summary는 review_id를 PK이자 FK로 사용
    @OneToOne(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ReviewSummary reviewSummary;

    // 수정 편의 메서드
    public void update(String title, String content, Integer rating) {
        if (title != null) {
            this.title = title;
        }
        if (content != null) {
            this.content = content;
        }
        if (rating != null) {
            this.rating = rating;
        }
    }


    // Soft Delete 편의 메서드
    public void softDelete(User deleter) {
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deleter;
    }
}