package com.d208.feelroom.review.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class ReviewPopularityUpdateEvent extends ApplicationEvent {
    private final UUID reviewId;
    private final EventType type;

    public enum EventType {
        LIKED,       // 좋아요 추가/취소
        DELETED      // 리뷰 삭제
    }

    public ReviewPopularityUpdateEvent(Object source, UUID reviewId, EventType type) {
        super(source);
        this.reviewId = reviewId;
        this.type = type;
    }
}