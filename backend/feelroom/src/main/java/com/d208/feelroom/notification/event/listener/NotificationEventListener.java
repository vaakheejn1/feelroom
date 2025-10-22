package com.d208.feelroom.notification.event.listener;

import com.d208.feelroom.notification.domain.entity.Notification;
import com.d208.feelroom.notification.domain.repository.NotificationRepository;
import com.d208.feelroom.comment.domain.entity.Comment;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.badge.event.BadgeAchievedEvent;
import com.d208.feelroom.comment.event.CommentEvent;
import com.d208.feelroom.user.event.FollowEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;

    @Async // (선택사항) 알림 생성을 비동기적으로 처리하여, 사용자 응답 시간을 단축시킵니다.
    @EventListener
    @Transactional
    public void handleFollowEvent(FollowEvent event) {
        // 자기 자신을 팔로우하는 경우는 없으므로, 별도 체크는 생략
        Notification notification = Notification.builder()
                .type("FOLLOW")
                .receiver(event.followee()) // 알림 받는 사람
                .sender(event.follower())   // 알림 보낸 사람
                .build();
        notificationRepository.save(notification);
    }

    @Async
    @EventListener
    @Transactional
    public void handleCommentEvent(CommentEvent event) {
        Comment newComment = event.newComment();
        User sender = newComment.getUser();

        // 1. 대댓글(Reply)인 경우
        if (newComment.getParentComment() != null) {
            User receiver = newComment.getReplyToUser();

            // 자기 자신을 멘션 보낸 경우 알림 보내지 않음
            if (sender.equals(receiver)) return;

            Notification notification = Notification.builder()
                    .type("REPLY")
                    .receiver(receiver)
                    .sender(sender)
                    .targetReview(newComment.getReview())
                    .targetComment(newComment) // 새로 달린 답글을 타겟으로
                    .build();
            notificationRepository.save(notification);

            // 2. 일반 댓글(Comment)인 경우
        } else {
            User receiver = newComment.getReview().getUser();

            // 자기 자신의 리뷰에 댓글 다는 경우 알림 보내지 않음
            if (sender.equals(receiver)) return;

            Notification notification = Notification.builder()
                    .type("COMMENT")
                    .receiver(receiver)
                    .sender(sender)
                    .targetReview(newComment.getReview())
                    .targetComment(newComment)
                    .build();
            notificationRepository.save(notification);
        }
    }

    /**
     * 사용자가 새로운 뱃지를 획득했을 때의 이벤트를 수신하여
     * 'BADGE' 타입의 알림을 생성합니다.
     */
    @Async
    @EventListener
    @Transactional
    public void handleBadgeAchievedEvent(BadgeAchievedEvent event) {
        // 뱃지 획득 알림은 시스템 알림이므로 sender가 없습니다.
        Notification notification = Notification.builder()
                .type("BADGE")
                .receiver(event.user()) // 뱃지를 획득한 사용자가 알림 수신자
                .sender(null)           // 시스템 알림이므로 sender는 null
                .targetBadge(event.badge()) // 어떤 뱃지를 획득했는지 target으로 설정
                .build();

        notificationRepository.save(notification);
    }
}