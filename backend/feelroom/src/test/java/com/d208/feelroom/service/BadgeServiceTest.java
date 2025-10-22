package com.d208.feelroom.service;

import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.badge.domain.repository.BadgeRepository;
import com.d208.feelroom.badge.domain.repository.UserBadgeRepository;
import com.d208.feelroom.badge.service.BadgeService;
import com.d208.feelroom.comment.domain.repository.CommentRepository;
import com.d208.feelroom.movie.domain.repository.MovieLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.FollowRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.badge.event.EventPublisher;
import com.d208.feelroom.user.event.UserActivityEvent;
import com.d208.feelroom.user.event.UserActivityEvent.ActivityType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

    @InjectMocks
    private BadgeService badgeService;

    @Mock
    private BadgeRepository badgeRepository;
    @Mock
    private UserBadgeRepository userBadgeRepository;
    @Mock
    private EventPublisher eventPublisher;

    // 뱃지 조건 확인에 필요한 모든 Repository를 Mock으로 선언
    @Mock private ReviewRepository reviewRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private MovieLikeRepository movieLikeRepository;
    @Mock private FollowRepository followRepository;
    @Mock private ReviewLikeRepository reviewLikeRepository;
    @Mock private UserRepository userRepository;


    @Test
    @DisplayName("첫 리뷰 작성 시 '첫 번째 감상평' 뱃지를 획득하고 이벤트가 발행되어야 한다")
    void handleUserActivity_FirstReview_ShouldAwardBadge() {
        // given (주어진 상황)
        Long userId = 1L;
        User user = User.builder().userId(userId).nickname("테스트유저").build();
        UserActivityEvent event = new UserActivityEvent(userId, ActivityType.REVIEW_WRITE);

        Badge firstReviewBadge = Badge.builder().badgeId(2).name("첫 번째 감상평").conditionCode("REVIEW_WRITE_COUNT_1").build();

        // [Mockito 설정]
        // 1. userRepository가 user를 반환하도록 설정
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // 2. badgeRepository가 conditionCode에 맞는 뱃지를 반환하도록 설정
        when(badgeRepository.findByConditionCode("REVIEW_WRITE_COUNT_1")).thenReturn(Optional.of(firstReviewBadge));
        // 3. userBadgeRepository가 "아직 이 뱃지를 가지고 있지 않다"고 응답하도록 설정
        when(userBadgeRepository.existsByUser_UserIdAndBadge_BadgeId(userId, 2)).thenReturn(false);
        // 4. reviewRepository가 "총 리뷰 개수가 1개다"라고 응답하도록 설정
        when(reviewRepository.countByUser_UserId(userId)).thenReturn(1L);


        // when (테스트할 행동 실행)
        badgeService.handleUserActivity(event);


        // then (결과 검증)
        // 1. userBadgeRepository.save가 1번 호출되었는지 검증
        verify(userBadgeRepository, times(1)).save(any());

        // 2. [ArgumentCaptor 사용] eventPublisher.publishBadgeAchieved가 호출될 때 전달된 '이벤트 객체'를 붙잡는다.
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        ArgumentCaptor<Badge> badgeCaptor = ArgumentCaptor.forClass(Badge.class);

        verify(eventPublisher, times(1)).publishBadgeAchieved(userCaptor.capture(), badgeCaptor.capture());

        // 3. 값 검증
        User capturedUser = userCaptor.getValue();
        Badge capturedBadge = badgeCaptor.getValue();
        assertThat(capturedUser.getUserId()).isEqualTo(1L);
        assertThat(capturedBadge.getBadgeId()).isEqualTo(2);
    }

    @Test
    @DisplayName("리뷰 10개 작성 시 '성실한 기록가' 뱃지를 획득해야 한다")
    void handleUserActivity_TenthReview_ShouldAwardBadge() {
        // given
        Long userId = 1L;
        User user = User.builder().userId(userId).build();
        UserActivityEvent event = new UserActivityEvent(userId, ActivityType.REVIEW_WRITE);

        Badge tenthReviewBadge = Badge.builder().badgeId(4).name("성실한 기록가").conditionCode("REVIEW_WRITE_COUNT_10").build();

        // 10개 뱃지를 체크하기 전에 1개 뱃지는 이미 가지고 있다고 가정
        when(badgeRepository.findByConditionCode("REVIEW_WRITE_COUNT_1")).thenReturn(Optional.empty()); // 간단하게 empty로 처리
        when(badgeRepository.findByConditionCode("REVIEW_WRITE_COUNT_10")).thenReturn(Optional.of(tenthReviewBadge));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userBadgeRepository.existsByUser_UserIdAndBadge_BadgeId(userId, 4)).thenReturn(false);
        when(reviewRepository.countByUser_UserId(userId)).thenReturn(10L);

        // when
        badgeService.handleUserActivity(event);

        // then
        // 10개 뱃지가 저장되었는지 확인
        verify(userBadgeRepository, times(1)).save(any());
        // 이벤트가 발행되었는지 확인
        verify(eventPublisher, times(1)).publishBadgeAchieved(user, tenthReviewBadge);
    }

    @Test
    @DisplayName("이미 획득한 뱃지는 다시 수여되지 않아야 한다")
    void handleUserActivity_AlreadyHasBadge_ShouldNotAward() {
        // given
        Long userId = 1L;
        UserActivityEvent event = new UserActivityEvent(userId, ActivityType.REVIEW_WRITE);

        Badge firstReviewBadge = Badge.builder().badgeId(2).conditionCode("REVIEW_WRITE_COUNT_1").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(User.builder().userId(userId).build()));
        when(badgeRepository.findByConditionCode("REVIEW_WRITE_COUNT_1")).thenReturn(Optional.of(firstReviewBadge));
        // "이미 이 뱃지를 가지고 있다"고 응답하도록 설정
        when(userBadgeRepository.existsByUser_UserIdAndBadge_BadgeId(userId, 2)).thenReturn(true);

        // when
        badgeService.handleUserActivity(event);

        // then
        // save나 publish 메서드가 절대로 호출되지 않았음을 검증
        verify(userBadgeRepository, never()).save(any());
        verify(eventPublisher, never()).publishBadgeAchieved(any(), any());
    }
}