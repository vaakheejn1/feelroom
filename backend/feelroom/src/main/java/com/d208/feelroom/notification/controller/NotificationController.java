package com.d208.feelroom.notification.controller;

import com.d208.feelroom.notification.dto.NotificationReadRequestDto;
import com.d208.feelroom.notification.dto.NotificationSliceResponseDto;
import com.d208.feelroom.notification.dto.UnreadNotificationStatusDto;
import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "6. Notification Management", description = "알림 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users/me/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * [API 1] 안 읽은 알림 존재 여부 확인
     */
    @Operation(summary = "안 읽은 알림 존재 여부 확인",
            description = "안 읽은 알림이 있는지 빠르게 확인하여 아이콘 등에 표시할 때 사용합니다.")
    @GetMapping("/exists-unread")
    public ResponseEntity<UnreadNotificationStatusDto> getUnreadNotificationStatus(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getUser().getUserId();
        UnreadNotificationStatusDto response = notificationService.checkForUnreadNotifications(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * [API 2] 알림 목록 조회
     */
    @Operation(summary = "알림 목록 조회 (무한 스크롤)",
            description = "내 알림 목록을 최신순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<NotificationSliceResponseDto> getMyNotifications(
            @PageableDefault(size = 20) Pageable pageable,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getUser().getUserId();
        NotificationSliceResponseDto response = notificationService.getNotifications(userId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * [API 3] 알림 읽음 처리
     */
    @Operation(summary = "알림 읽음 처리",
            description = "화면에 표시된 여러 안읽은 알림들을 한 번에 읽음 상태로 변경합니다.")
    @PostMapping("/read")
    public ResponseEntity<Void> markNotificationsAsRead(
            @RequestBody NotificationReadRequestDto requestDto,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getUser().getUserId();
        notificationService.markNotificationsAsRead(userId, requestDto.getNotificationIds());

        // 성공적으로 처리되었고, 별도의 응답 본문이 없음을 의미하는 204 No Content 반환
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}