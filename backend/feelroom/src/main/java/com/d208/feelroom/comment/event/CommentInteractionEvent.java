package com.d208.feelroom.comment.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
@ToString
public class CommentInteractionEvent extends ApplicationEvent {

    private final UUID commentId;
    private final int likeChange; // 좋아요 수 변경량 (+1 또는 -1)

    // private 생성자: 외부에서 직접 생성하는 것을 막고 팩토리 메서드를 통해 생성하도록 유도
    private CommentInteractionEvent(Object source, UUID commentId, int likeChange) {
        super(source);
        this.commentId = commentId;
        this.likeChange = likeChange;
    }

    // 팩토리 메서드: 좋아요 수 변경 시
    public static CommentInteractionEvent forLikeChange(Object source, UUID commentId, int likeChange) {
        return new CommentInteractionEvent(source, commentId, likeChange);
    }
}