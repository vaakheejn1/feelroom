package com.d208.feelroom.review.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
@ToString
public class ReviewInteractionEvent extends ApplicationEvent {

    private final UUID reviewId;
    private final int likeChange;    // 좋아요 수 변경량 (+1 또는 -1)
    private final int commentChange; // 댓글 수 변경량 (+1 또는 -1)

    // private 생성자: 외부에서 직접 생성하는 것을 막고 팩토리 메서드를 통해 생성하도록 유도
    private ReviewInteractionEvent(Object source, UUID reviewId, int likeChange, int commentChange) {
        super(source);
        this.reviewId = reviewId;
        this.likeChange = likeChange;
        this.commentChange = commentChange;
    }

    // 팩토리 메서드 1: 좋아요 수 변경 시
    public static ReviewInteractionEvent forLikeChange(Object source, UUID reviewId, int likeChange) {
        return new ReviewInteractionEvent(source, reviewId, likeChange, 0);
    }

    // 팩토리 메서드 2: 댓글 수 변경 시
    public static ReviewInteractionEvent forCommentChange(Object source, UUID reviewId, int commentChange) {
        return new ReviewInteractionEvent(source, reviewId, 0, commentChange);
    }
}