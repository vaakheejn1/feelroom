package com.d208.feelroom.badge.event;

import com.d208.feelroom.comment.event.CommentEvent;
import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.comment.domain.entity.Comment;
import com.d208.feelroom.user.event.FollowEvent;
import com.d208.feelroom.user.event.UserActivityEvent;
import com.d208.feelroom.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import com.d208.feelroom.user.event.UserActivityEvent.ActivityType;

@Component
@RequiredArgsConstructor
public class EventPublisher {
    private final ApplicationEventPublisher publisher;

    // 사용자 활동 이벤트 발행
    public void publishUserActivity(Long userId, ActivityType type){
        publisher.publishEvent(new UserActivityEvent(userId, type));
    }

    // Notifications 생성 특화 이벤트 발행
    public void publishFollow(User follower, User followee){
        publisher.publishEvent(new FollowEvent(follower, followee));
    }

    public void publishComment(Comment newComment){
        publisher.publishEvent(new CommentEvent(newComment));
    }

    public void publishBadgeAchieved(User user, Badge badge){
        publisher.publishEvent(new BadgeAchievedEvent(user, badge));
    }
}