package com.d208.feelroom.notification.service;

import com.d208.feelroom.notification.dto.NotificationResponseDto;
import com.d208.feelroom.notification.dto.NotificationSliceResponseDto;
import com.d208.feelroom.notification.dto.UnreadNotificationStatusDto;
import com.d208.feelroom.notification.domain.repository.NotificationRepository;
import com.d208.feelroom.global.util.UuidUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * [API 1] 안 읽은 알림 존재 여부 확인
     */
    @Transactional(readOnly = true)
    public UnreadNotificationStatusDto checkForUnreadNotifications(Long userId) {
        boolean exists = notificationRepository.existsByReceiver_UserIdAndIsRead(userId, 'N');
        return new UnreadNotificationStatusDto(exists);
    }

    /**
     * [API 2] 알림 목록 조회
     */
    @Transactional(readOnly = true)
    public NotificationSliceResponseDto getNotifications(Long userId, Pageable pageable) {
        Slice<Object[]> notificationSlice = notificationRepository.findNotificationsByReceiverId(userId, pageable);
        List<Object[]> results = notificationSlice.getContent();

        if (results.isEmpty()) {
            return new NotificationSliceResponseDto(Collections.emptyList(), false);
        }

        List<NotificationResponseDto> notificationDtos = results.stream()
                .map(this::mapRowToNotificationDto)
                .collect(Collectors.toList());

        return new NotificationSliceResponseDto(notificationDtos, notificationSlice.hasNext());
    }

    /**
     * [API 3] 알림 읽음 처리
     */
    @Transactional
    public void markNotificationsAsRead(Long userId, List<Long> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            return; // 처리할 ID가 없으면 아무 작업도 하지 않음
        }
        notificationRepository.markAsReadByIds(userId, notificationIds);
    }

    // == private 헬퍼 메서드 ==

    private NotificationResponseDto mapRowToNotificationDto(Object[] row) {
        // Repository의 SELECT 절 순서에 맞춰 인덱싱
        String type = (String) row[1];
        String senderNickname = (String) row[8];

        NotificationResponseDto.SenderInfo sender = (row[7] != null) ?
                NotificationResponseDto.SenderInfo.builder()
                        .userId(((Number) row[7]).longValue())
                        .nickname(senderNickname)
                        .build() : null;

        String reviewIdStr = (row[4] != null) ? UuidUtils.bytesToUUID((byte[]) row[4]).toString() : null;
        String commentIdStr = (row[5] != null) ? UuidUtils.bytesToUUID((byte[]) row[5]).toString() : null;

        NotificationResponseDto.TargetInfo target = NotificationResponseDto.TargetInfo.builder()
                .reviewId(reviewIdStr)
                .commentId(commentIdStr)
                .badgeId(row[6] != null ? (Integer) row[6] : null)
                .build();

        return NotificationResponseDto.builder()
                .notificationId(((Number) row[0]).longValue())
                .type(type)
                .content(generateContent(type, senderNickname)) // 동적으로 내용 생성
                .isRead("Y".equals(String.valueOf(row[2])))
                .createdAt(((Timestamp) row[3]).toLocalDateTime())
                .sender(sender)
                .target(target)
                .build();
    }

    private String generateContent(String type, String senderNickname) {
        // API 명세에 따라 알림 타입별로 다른 내용을 반환
        return switch (type) {
            case "FOLLOW" -> senderNickname + "님이 회원님을 팔로우하기 시작했습니다.";
            case "COMMENT" -> senderNickname + "님이 회원님의 리뷰에 댓글을 남겼습니다.";
            case "REPLY" -> senderNickname + "님이 회원님의 댓글에 답글을 남겼습니다.";
            case "BADGE" -> "새로운 뱃지를 획득했습니다! 마이페이지에서 확인해보세요.";
            default -> "새로운 알림이 도착했습니다.";
        };
    }
}