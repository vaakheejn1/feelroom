package com.d208.feelroom.review.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

/**
 * ReviewLike 엔티티의 복합키를 위한 ID 클래스입니다. (@EmbeddedId 방식)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ReviewLikeId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "review_id", columnDefinition = "BINARY(16)")
    private UUID reviewId;
}