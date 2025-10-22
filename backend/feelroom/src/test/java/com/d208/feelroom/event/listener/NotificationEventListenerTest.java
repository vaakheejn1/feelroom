package com.d208.feelroom.event.listener;

import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.notification.domain.entity.Notification;
import com.d208.feelroom.notification.domain.repository.NotificationRepository;
import com.d208.feelroom.comment.domain.entity.Comment;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.notification.event.listener.NotificationEventListener;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.badge.event.BadgeAchievedEvent;
import com.d208.feelroom.comment.event.CommentEvent;
import com.d208.feelroom.user.event.FollowEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationEventListenerTest {

    @InjectMocks
    private NotificationEventListener notificationEventListener;

    @Mock
    private NotificationRepository notificationRepository;

    // 테스트에 사용할 공용 객체들
    private User sender;
    private User receiver;

    @BeforeEach // 각 테스트 실행 전에 공용 객체를 초기화
    void setUp() {
        sender = User.builder().userId(1L).nickname("보내는사람").build();
        receiver = User.builder().userId(2L).nickname("받는사람").build();
    }


    @Test
    @DisplayName("FollowEvent 발생 시 FOLLOW 타입의 알림이 생성되어야 한다")
    void handleFollowEvent_ShouldCreateFollowNotification() {
        // given
        FollowEvent event = new FollowEvent(sender, receiver);
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // when
        notificationEventListener.handleFollowEvent(event);

        // then
        // 1. save 메서드가 1번 호출되었는지 검증
        verify(notificationRepository, times(1)).save(notificationCaptor.capture());

        // 2. 저장된 Notification 객체의 내용 검증
        Notification savedNotification = notificationCaptor.getValue();
        assertThat(savedNotification.getType()).isEqualTo("FOLLOW");
        assertThat(savedNotification.getReceiver()).isEqualTo(receiver);
        assertThat(savedNotification.getSender()).isEqualTo(sender);
        assertThat(savedNotification.getTargetReview()).isNull();
    }


    @Test
    @DisplayName("리뷰에 대한 댓글 이벤트 발생 시 COMMENT 타입의 알림이 생성되어야 한다")
    void handleCommentEvent_OnReview_ShouldCreateCommentNotification() {
        // given
        Review review = Review.builder().user(receiver).build(); // 리뷰 작성자는 '받는사람'
        Comment comment = Comment.builder().review(review).user(sender).parentComment(null).build();
        CommentEvent event = new CommentEvent(comment);
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // when
        notificationEventListener.handleCommentEvent(event);

        // then
        verify(notificationRepository, times(1)).save(notificationCaptor.capture());

        Notification savedNotification = notificationCaptor.getValue();
        assertThat(savedNotification.getType()).isEqualTo("COMMENT");
        assertThat(savedNotification.getReceiver()).isEqualTo(receiver);
        assertThat(savedNotification.getSender()).isEqualTo(sender);
        assertThat(savedNotification.getTargetReview()).isEqualTo(review);
        assertThat(savedNotification.getTargetComment()).isEqualTo(comment);
    }


    @Test
    @DisplayName("댓글에 대한 답글 이벤트 발생 시 REPLY 타입의 알림이 생성되어야 한다")
    void handleCommentEvent_OnComment_ShouldCreateReplyNotification() {
        // given
        Review review = Review.builder().user(User.builder().userId(99L).build()).build(); // 제 3의 리뷰 작성자
        Comment parentComment = Comment.builder().review(review).user(receiver).build(); // 원댓글 작성자는 '받는사람'
        Comment replyComment = Comment.builder().review(review).user(sender).parentComment(parentComment).build();
        CommentEvent event = new CommentEvent(replyComment);
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // when
        notificationEventListener.handleCommentEvent(event);

        // then
        verify(notificationRepository, times(1)).save(notificationCaptor.capture());

        Notification savedNotification = notificationCaptor.getValue();
        assertThat(savedNotification.getType()).isEqualTo("REPLY");
        assertThat(savedNotification.getReceiver()).isEqualTo(receiver); // 원댓글 작성자가 알림을 받음
        assertThat(savedNotification.getSender()).isEqualTo(sender);
        assertThat(savedNotification.getTargetReview()).isEqualTo(review);
        assertThat(savedNotification.getTargetComment()).isEqualTo(replyComment);
    }


    @Test
    @DisplayName("자기 자신의 리뷰/댓글에 남긴 댓글/답글은 알림을 생성하지 않아야 한다")
    void handleCommentEvent_SelfComment_ShouldNotCreateNotification() {
        // given: 리뷰 작성자와 댓글 작성자가 동일 (sender)
        Review review = Review.builder().user(sender).build();
        Comment comment = Comment.builder().review(review).user(sender).build();
        CommentEvent event = new CommentEvent(comment);

        // when
        notificationEventListener.handleCommentEvent(event);

        // then
        // save 메서드가 절대로 호출되지 않았음을 검증
        verify(notificationRepository, never()).save(any());
    }


    @Test
    @DisplayName("BadgeAchievedEvent 발생 시 BADGE 타입의 알림이 생성되어야 한다")
    void handleBadgeAchievedEvent_ShouldCreateBadgeNotification() {
        // given
        Badge badge = Badge.builder().badgeId(1).name("새로운 여정의 시작").build();
        // 뱃지 획득자는 '받는사람'
        BadgeAchievedEvent event = new BadgeAchievedEvent(receiver, badge);
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // when
        notificationEventListener.handleBadgeAchievedEvent(event);

        // then
        verify(notificationRepository, times(1)).save(notificationCaptor.capture());

        Notification savedNotification = notificationCaptor.getValue();
        assertThat(savedNotification.getType()).isEqualTo("BADGE");
        assertThat(savedNotification.getReceiver()).isEqualTo(receiver);
        assertThat(savedNotification.getSender()).isNull(); // 시스템 알림이므로 sender는 null
        assertThat(savedNotification.getTargetBadge()).isEqualTo(badge);
    }
}