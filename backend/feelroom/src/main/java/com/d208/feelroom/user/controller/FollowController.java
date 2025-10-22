package com.d208.feelroom.user.controller;

import java.util.Map;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.user.service.FollowService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@Tag(name = "2.2 Follow", description = "유저 간 팔로우/팔로잉 관련 API")
@RestController
@RequestMapping("/api/v1/users")
public class FollowController {

	private final FollowService followService;

	public FollowController(FollowService followService) {
		this.followService = followService;
	}

	@Operation(summary = "사용자 팔로우", description = "다른 사용자를 팔로우합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@PostMapping("/{followeeId}/follow")
	public ResponseEntity<?> followUser(@AuthenticationPrincipal UserDetailsImpl userDetails,
			@PathVariable("followeeId") Long followeeId) {

		Long followerId = userDetails.getUser().getUserId();

		followService.followUser(followerId, followeeId);
		return ResponseEntity.ok(Map.of("message", "팔로우 성공"));
	}

	@Operation(summary = "사용자 언팔로우", description = "팔로우한 사용자를 언팔로우합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@DeleteMapping("/{followeeId}/unfollow")
	public ResponseEntity<?> unfollowUser(@AuthenticationPrincipal UserDetailsImpl userDetails,
			@PathVariable("followeeId") Long followeeId) {

		Long followerId = userDetails.getUser().getUserId();

		followService.unfollowUser(followerId, followeeId);
		return ResponseEntity.ok(Map.of("message", "언팔로우 성공"));
	}

}
