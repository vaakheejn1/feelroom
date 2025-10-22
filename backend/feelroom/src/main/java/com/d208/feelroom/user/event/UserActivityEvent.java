package com.d208.feelroom.user.event;

import lombok.Getter;

@Getter
public class UserActivityEvent {
    private final Long userId; // 활동을 한 사용자의 ID
    private final ActivityType type;

    public UserActivityEvent(Long userId, ActivityType type) {
        this.userId = userId;
        this.type = type;
    }

    // 어떤 종류의 활동인지 구분하기 위한 enum -- 같은 활동이라도 다른 뱃지 조건에 영향을 주므로 행동 자체를 이벤트로 만들기
    public enum ActivityType {
        USER_SIGNUP,
        REVIEW_WRITE,
        COMMENT_WRITE,
        MOVIE_LIKE,
        REVIEW_LIKE_RECEIVED
    }
}