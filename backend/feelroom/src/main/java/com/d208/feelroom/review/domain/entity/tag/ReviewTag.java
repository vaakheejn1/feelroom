package com.d208.feelroom.review.domain.entity.tag;

import com.d208.feelroom.review.domain.entity.Review;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "review_tag")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReviewTag {

    @EmbeddedId
    private ReviewTagId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("reviewId") // ReviewTagId 클래스의 'reviewId' 필드에 매핑
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId") // ReviewTagId 클래스의 'tagId' 필드에 매핑
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    /**
     * 서비스 레이어에서 객체를 쉽게 생성하기 위한 Builder
     * id 객체도 함께 생성하여 할당합니다.
     */
    @Builder
    public ReviewTag(Review review, Tag tag) {
        this.review = review;
        this.tag = tag;
        this.id = new ReviewTagId(review.getReviewId(), tag.getTagId());
    }
}