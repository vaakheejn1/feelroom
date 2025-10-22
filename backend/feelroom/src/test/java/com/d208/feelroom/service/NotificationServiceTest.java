package com.d208.feelroom.service;

import com.d208.feelroom.notification.domain.repository.NotificationRepository;
import com.d208.feelroom.notification.dto.NotificationResponseDto;
import com.d208.feelroom.notification.dto.NotificationSliceResponseDto;
import com.d208.feelroom.notification.dto.UnreadNotificationStatusDto;
import com.d208.feelroom.notification.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    @InjectMocks // 테스트 대상 클래스. @Mock으로 생성된 가짜 객체들이 자동으로 주입됩니다.
    private NotificationService notificationService;

    @Mock // 가짜 객체(Mock)로 만들 의존성
    private NotificationRepository notificationRepository;

    @Test
    @DisplayName("안 읽은 알림 존재 여부 확인 -존재할 경우")
    void checkForUnreadNotifications_Exists() {
        // given (주어진 상황)
        Long userId = 1L;
        // notificationRepository.existsByReceiver_IdAndIsRead(...)가 호출되면 true를 반환하도록 설정
        when(notificationRepository.existsByReceiver_UserIdAndIsRead(userId, 'N')).thenReturn(true);

        // when (테스트할 행동 실행)
        UnreadNotificationStatusDto result = notificationService.checkForUnreadNotifications(userId);

        // then (결과 검증)
        assertThat(result.exists()).isTrue();
    }

    @Test
    @DisplayName("안 읽은 알림 존재 여부 확인 - 존재하지 않을 경우")
    void checkForUnreadNotifications_NotExists() {
        // given
        Long userId = 1L;
        when(notificationRepository.existsByReceiver_UserIdAndIsRead(userId, 'N')).thenReturn(false);

        // when
        UnreadNotificationStatusDto result = notificationService.checkForUnreadNotifications(userId);

        // then
        assertThat(result.exists()).isFalse();
    }

    @Test
    @DisplayName("알림 목록 조회 - 성공")
    void getNotifications_Success() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 10);
        UUID reviewId = UUID.randomUUID();

        // Repository가 반환할 가짜 데이터(Object[])를 생성
        Object[] rawNotification = new Object[]{
                101L,                           // n.notification_id
                "FOLLOW",                       // n.type
                "N",                            // n.is_read
                Timestamp.valueOf(LocalDateTime.now()), // n.created_at
                null,                           // n.target_review_id
                null,                           // n.target_comment_id
                null,                           // n.target_badge_id
                2L,                             // n.sender_id
                "테스트유저"                      // u.nickname
        };
        List<Object[]> contentList = Collections.singletonList(rawNotification);
        Slice<Object[]> mockSlice = new SliceImpl<>(contentList, pageable, true); // 다음 페이지가 있다고 가정

        when(notificationRepository.findNotificationsByReceiverId(userId, pageable)).thenReturn(mockSlice);

        // when
        NotificationSliceResponseDto result = notificationService.getNotifications(userId, pageable);

        // then
        assertThat(result.hasNext()).isTrue();
        assertThat(result.notifications()).hasSize(1);

        NotificationResponseDto notificationDto = result.notifications().get(0);
        assertThat(notificationDto.notificationId()).isEqualTo(101L);
        assertThat(notificationDto.type()).isEqualTo("FOLLOW");
        assertThat(notificationDto.isRead()).isFalse();
        assertThat(notificationDto.content()).isEqualTo("테스트유저님이 회원님을 팔로우하기 시작했습니다.");
        assertThat(notificationDto.sender().userId()).isEqualTo(2L);
        assertThat(notificationDto.sender().nickname()).isEqualTo("테스트유저");
    }

    @Test
    @DisplayName("알림 목록 조회 - 결과가 없을 경우")
    void getNotifications_Empty() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 10);
        Slice<Object[]> emptySlice = new SliceImpl<>(Collections.emptyList(), pageable, false);

        when(notificationRepository.findNotificationsByReceiverId(userId, pageable)).thenReturn(emptySlice);

        // when
        NotificationSliceResponseDto result = notificationService.getNotifications(userId, pageable);

        // then
        assertThat(result.hasNext()).isFalse();
        assertThat(result.notifications()).isEmpty();
    }

    @Test
    @DisplayName("알림 읽음 처리 - 성공")
    void markNotificationsAsRead_Success() {
        // given
        Long userId = 1L;
        List<Long> notificationIds = List.of(101L, 102L);
        // void 메서드는 특별한 설정이 필요 없음. 호출 여부만 검증하면 됨.
        // doNothing().when(notificationRepository).markAsReadByIds(anyLong(), anyList()); -> 이렇게 명시적으로 선언도 가능

        // when
        notificationService.markNotificationsAsRead(userId, notificationIds);

        // then
        // notificationRepository의 markAsReadByIds 메서드가
        // 정확히 1번, 그리고 올바른 파라미터(userId, notificationIds)로 호출되었는지 검증
        verify(notificationRepository, times(1)).markAsReadByIds(userId, notificationIds);
    }

    @Test
    @DisplayName("알림 읽음 처리 - ID 목록이 비어있을 경우")
    void markNotificationsAsRead_EmptyList() {
        // given
        Long userId = 1L;
        List<Long> emptyList = Collections.emptyList();

        // when
        notificationService.markNotificationsAsRead(userId, emptyList);

        // then
        // ID 목록이 비어있으면 Repository 메서드가 절대로 호출되지 않아야 함을 검증
        verify(notificationRepository, never()).markAsReadByIds(anyLong(), any());
    }
}