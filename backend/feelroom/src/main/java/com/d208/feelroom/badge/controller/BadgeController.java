package com.d208.feelroom.badge.controller;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.badge.dto.UserBadgeResponseDto;
import com.d208.feelroom.badge.service.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@Tag(name = "2.3. Badge System", description = "뱃지 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class BadgeController {

    private final BadgeService badgeService;

    @Operation(summary = "내 뱃지 목록 조회", description = "사용자가 획득한 뱃지 목록을 조회합니다.")
    @GetMapping("/me/badges")
    public ResponseEntity<List<UserBadgeResponseDto>> getMyBadges(
            @AuthenticationPrincipal UserDetailsImpl userDetails // Spring Security를 통해 인증된 사용자 정보 가져오기
    ) {
        // 현재 로그인한 사용자의 ID를 가져옵니다.
        Long currentUserId = userDetails.getUser().getUserId();

        List<UserBadgeResponseDto> myBadges = badgeService.findMyBadges(currentUserId);
        return ResponseEntity.ok(myBadges);
    }

    @Operation(summary = "뱃지 목록 조회", description = "다른 사용자의 뱃지 목록을 조회합니다.")
    @GetMapping("/{userId}/badges")
    public ResponseEntity<List<UserBadgeResponseDto>> getUserBadges(
            @Parameter(description = "조회할 사용자의 ID", required = true)
            @PathVariable("userId") Long targetUserId
    ) {
        // 현재 로그인한 사용자의 ID를 가져옵니다.
        List<UserBadgeResponseDto> userBadges = badgeService.findUserBadges(targetUserId);
        return ResponseEntity.ok(userBadges);
    }
}