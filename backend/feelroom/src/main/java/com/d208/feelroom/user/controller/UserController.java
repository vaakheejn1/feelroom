
package com.d208.feelroom.user.controller;

import java.util.HashMap;
import java.util.Map;

import com.d208.feelroom.movie.dto.LikedMovieListResponseDto;
import com.d208.feelroom.movie.service.MovieService;
import com.d208.feelroom.movie.service.OnboardingService;
import com.d208.feelroom.review.service.ReviewService;
import com.d208.feelroom.user.dto.*;
import com.d208.feelroom.user.service.AuthService;
import com.d208.feelroom.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.review.dto.ReviewFeedResponseDto;
import com.d208.feelroom.review.dto.UserReviewListResponseDto;
import com.d208.feelroom.global.security.util.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "UserController")
@Tag(name = "2. User", description = "사용자 관련 API")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
// @RequestMapping("/users")
public class UserController {

	private final JwtUtil jwtUtil;

	private final UserService userService;
	private final ReviewService reviewService;
	private final OnboardingService onboardingService;
	private final MovieService movieService;
	private final AuthService authService;

	@Operation(summary = "아이디 중복 확인", description = "사용자가 입력한 아이디가 이미 존재하는지 확인합니다.")
	@GetMapping("/check-login-id")
	public ResponseEntity<Map<String, Object>> checkUsernameAvailability(
			@Parameter(name = "username", description = "사용 가능 여부를 확인할 로그인 ID", required = true) @RequestParam("username") String username) {

		// log.debug("UserController check-login-id username: {}", username);

		boolean isAvailable = userService.isUsernameAvailable(username);
		Map<String, Object> response = new HashMap<>();
		response.put("username", username);
		response.put("available", isAvailable);
		return ResponseEntity.ok(response);
	}

	@Operation(summary = "이메일 중복 확인", description = "사용자가 입력한 이메일이 이미 존재하는지 확인합니다.")
	@GetMapping("/check-email")
	public ResponseEntity<Map<String, Object>> checkEmailAvailability(
			@Parameter(name = "email", description = "사용 가능 여부를 확인할 이메일", required = true) @RequestParam("email") String email) {

		boolean isAvailable = userService.isEmailAvailable(email);
		Map<String, Object> response = new HashMap<>();
		response.put("email", email);
		response.put("available", isAvailable);
		return ResponseEntity.ok(response);
	}

	@Operation(summary = "온보딩 영화 선호도 제출", description = "사용자가 온보딩 중 선택한 영화 목록을 저장합니다. 최소 1개, 최대 5개까지 선택할 수 있습니다.")
	@PostMapping("/me/onboarding")
	public ResponseEntity<?> submitOnboardingPreferences(@AuthenticationPrincipal UserDetailsImpl userDetails,
			@RequestBody OnboardingPreferenceRequestDto dto) {

		onboardingService.savePreferences(userDetails.getUser().getUserId(), dto.getMovieIds());
		return ResponseEntity.ok(Map.of("message", "초기 설정 완료"));
	}

	// 사용자 이름(아이디) 변경 API
	@Operation(summary = "로그인 후 사용자 이름 변경", description = "로그인한 사용자가 사용자 이름(아이디)을 변경합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()") // 인증된 사용자만 접근 가능
	@PutMapping("/me/username")
	public ResponseEntity<?> changeUsername(HttpServletRequest request,
											@AuthenticationPrincipal UserDetailsImpl userDetails,
											@RequestBody @Valid ChangeUsernameRequestDto requestDto) {
		// 요청으로부터 새로운 사용자 이름을 가져옴
		String newUsername = requestDto.getNewUsername();

		// 현재 토큰 추출
		String currentToken = jwtUtil.getJwtFromHeader(request);

		// 사용자 이름 변경 로직 수행
		userService.changeUsername(userDetails.getUser().getUserId(), newUsername);

		// 변경된 사용자 이름으로 새로운 액세스 토큰 생성
		String newToken = jwtUtil.createAccessToken(newUsername, userDetails.getUser().getUserRole());

		// 기존 토큰을 블랙리스트에 추가
		authService.logout(currentToken);

		// 메시지와 새로운 토큰을 응답으로 반환
		return ResponseEntity.ok(Map.of(
			"message", "사용자 이름이 성공적으로 변경되었습니다.",
			"access_token", newToken
		));
	}

	@Operation(summary = "로그인 후 비밀번호 변경", description = "로그인한 사용자가 현재 비밀번호를 입력하여 새 비밀번호로 변경합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@PutMapping("/me/password")
	public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetailsImpl userDetails,
			@RequestBody ChangePasswordRequestDto requestDto) {
		userService.changePassword(userDetails.getUser().getUserId(), requestDto.getCurrentPassword(),
				requestDto.getNewPassword());
		return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
	}

	/**
	 * 특정 사용자(타인)가 작성한 리뷰 목록을 조회합니다.
	 */
	@Operation(summary = "타인 작성 리뷰 목록 조회", description = "특정 사용자가 작성한 리뷰 목록을 조회합니다. 비로그인 사용자도 조회 가능합니다.")
	@GetMapping("/{userId}/reviews")
	public ResponseEntity<UserReviewListResponseDto> getUserReviews(
		    @Parameter(description = "조회할 사용자의 ID", required = true)
            @PathVariable("userId") Long targetUserId,

			@Parameter(hidden = true) // Swagger 문서에서는 숨김 처리
			@AuthenticationPrincipal UserDetailsImpl userDetails) {

		// 현재 로그인한 사용자의 ID를 추출합니다. 비로그인 상태일 경우 null이 됩니다.
		// isLiked 여부를 판단하기 위해 필요합니다.
		Long currentUserId = (userDetails != null) ? userDetails.getUser().getUserId() : null;

		UserReviewListResponseDto responseDto = reviewService.getUserReviews(targetUserId, currentUserId);
		return ResponseEntity.ok(responseDto);
	}


	/**
	 * 현재 로그인한 사용자(본인)가 작성한 리뷰 목록을 조회합니다.
	 */
	@Operation(summary = "내 리뷰 목록 조회", description = "현재 로그인한 사용자가 작성한 리뷰 목록을 조회합니다. (인증 필요)")
	@GetMapping("/me/reviews")
	public ResponseEntity<UserReviewListResponseDto> getMyReviews(
		    @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

		// '/me' 엔드포인트는 Spring Security 설정에 의해 인증된 사용자만 접근 가능해야 합니다.
		// 따라서 userDetails는 null이 될 수 없습니다. (만약 null이면 401 Unauthorized가 반환됨)
		Long currentUserId = userDetails.getUser().getUserId();

		// '나'의 리뷰를 보는 것이므로, 조회 대상(target)과 현재 사용자(current)가 동일합니다.
		UserReviewListResponseDto responseDto = reviewService.getUserReviews(currentUserId, currentUserId);
		return ResponseEntity.ok(responseDto);
	}

    @Operation(summary = "내가 좋아요 한 리뷰 목록 조회 (무한 스크롤)",
            description = "현재 로그인한 사용자가 '좋아요'를 누른 리뷰 목록을 최신순(좋아요 누른 순)으로 조회합니다.")
    @GetMapping("/me/liked-reviews")
    public ResponseEntity<ReviewFeedResponseDto> getMyLikedReviews(
            @PageableDefault(size = 20, page = 0)
            @Parameter(description = "페이지 정보 (size, page). 예: ?size=10&page=0")
            Pageable pageable,

            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long currentUserId = userDetails.getUser().getUserId();

        // 새로 만든 서비스 메서드 호출
        ReviewFeedResponseDto response = reviewService.getLikedReviews(currentUserId, pageable);

        return ResponseEntity.ok(response);
    }

	@Operation(summary = "내가 좋아요 한 영화 목록 조회 (무한 스크롤)",
			description = "현재 로그인한 사용자가 '좋아요'를 누른 영화 목록을 최신순(좋아요 누른 순)으로 조회합니다.")
	@GetMapping("/me/liked-movies")
	public ResponseEntity<LikedMovieListResponseDto> getMyLikedMovies(
			@PageableDefault(size = 20, page = 0)
			@Parameter(description = "페이지 정보 (size, page). 예: ?size=10&page=0")
			Pageable pageable,

			@Parameter(hidden = true)
			@AuthenticationPrincipal UserDetailsImpl userDetails) {

		Long currentUserId = userDetails.getUser().getUserId();

		// 새로 만든 서비스 메서드 호출
		LikedMovieListResponseDto response = movieService.getLikedMovies(currentUserId, pageable);

		return ResponseEntity.ok(response);
	}

	@Operation(summary = "사용자 프로필 조회", description = "로그인한 사용자의 사용자명, 닉네임, 소개, 프로필 이미지, 생년월일, 성별, 팔로워/팔로잉 수 등의 정보를 조회합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/me/profile")
	public ResponseEntity<UserProfileResponseDto> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
		Long userId = userDetails.getUser().getUserId();

		UserProfileResponseDto profile = userService.getMyProfile(userId);
		return ResponseEntity.ok(profile);
	}

	@Operation(summary = "다른 사용자 프로필 조회", description = "지정한 사용자의 프로필 정보를 조회합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/{userId}/profile")
	public ResponseEntity<OtherUserProfileResponseDto> getOtherUserProfile(@PathVariable("userId") Long userId,
			@AuthenticationPrincipal UserDetailsImpl userDetails) {
		Long myUserId = userDetails.getUser().getUserId();

		OtherUserProfileResponseDto profile = userService.getOtherUserProfile(myUserId, userId);
		return ResponseEntity.ok(profile);
	}

	@Operation(summary = "팔로잉 목록 조회 (무한 스크롤)", description = "현재 로그인한 사용자가 팔로우하고 있는 사용자들의 목록을 조회합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/me/following")
	public ResponseEntity<FollowListResponseDto> getFollowingList(
			@Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails,
			@PageableDefault(size = 20) Pageable pageable) { // Pageable 파라미터 추가

		Long userId = userDetails.getUser().getUserId();
		FollowListResponseDto responseDto = userService.getFollowingList(userId, pageable);
		return ResponseEntity.ok(responseDto);
	}

	@Operation(summary = "팔로워 목록 조회 (무한 스크롤)", description = "현재 로그인한 사용자를 팔로우하는 사용자들의 목록을 조회합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/me/followers")
	public ResponseEntity<FollowListResponseDto> getFollowerList(
			@Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails,
			@PageableDefault(size = 20) Pageable pageable) { // Pageable 파라미터 추가

		Long userId = userDetails.getUser().getUserId();
		FollowListResponseDto responseDto = userService.getFollowerList(userId, pageable);
		return ResponseEntity.ok(responseDto);
	}

	@Operation(summary = "팔로잉 여부 조회",
			description = "현재 로그인한 사용자가 특정 사용자를 팔로우하고 있는지 여부를 조회합니다.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/{targetUserId}/follow")
	public ResponseEntity<FollowStatusResponseDto> checkFollowStatus(
			@Parameter(description = "조회할 대상 사용자의 ID", example = "2")
			@PathVariable Long targetUserId,

			@Parameter(hidden = true)
			@AuthenticationPrincipal UserDetailsImpl userDetails) {

		Long currentUserId = userDetails.getUser().getUserId();

		FollowStatusResponseDto response = userService.checkFollowStatus(currentUserId, targetUserId);

		return ResponseEntity.ok(response);
	}

	@Operation(summary = "회원 탈퇴 전 비밀번호 확인", description = "회원 탈퇴 전 현재 비밀번호를 확인합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@PostMapping("/me/verify-password-for-deactivation")
	public ResponseEntity<?> verifyPasswordForDeactivation(
			@AuthenticationPrincipal UserDetailsImpl userDetails,
			@RequestBody @Valid DeactivateAccountRequestDto requestDto) {

		Long userId = userDetails.getUser().getUserId();

		boolean isValid = userService.verifyPasswordForDeactivation(userId, requestDto.getPassword());

		if (isValid) {
			return ResponseEntity.ok(Map.of(
					"message", "비밀번호 확인이 완료되었습니다.",
					"verified", true
			));
		} else {
			return ResponseEntity.badRequest().body(Map.of(
					"message", "비밀번호가 일치하지 않습니다.",
					"verified", false
			));
		}
	}

	@Operation(summary = "회원 탈퇴", description = "현재 로그인한 사용자를 논리적으로 삭제(탈퇴) 처리하고 개인정보를 익명화합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@DeleteMapping("/me")
	public ResponseEntity<?> deactivateAccount(
			@AuthenticationPrincipal UserDetailsImpl userDetails,
			@RequestBody @Valid DeactivateAccountRequestDto requestDto) {

		Long userId = userDetails.getUser().getUserId();

		// 비밀번호 재확인
		if (!userService.verifyPasswordForDeactivation(userId, requestDto.getPassword())) {
			return ResponseEntity.badRequest().body(Map.of("message", "비밀번호가 일치하지 않습니다."));
		}

		userService.deactivateUser(userId);

		return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
	}

	@Operation(summary = "프로필 수정", description = "로그인한 사용자의 닉네임과 소개를 수정합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@PutMapping("/me/profile")
	public ResponseEntity<?> updateProfile(
			@AuthenticationPrincipal UserDetailsImpl userDetails,
			@RequestBody @Valid UpdateProfileRequestDto requestDto) {

		Long userId = userDetails.getUser().getUserId();

		userService.updateProfile(userId, requestDto.getNickname(), requestDto.getDescription());

		return ResponseEntity.ok(Map.of("message", "프로필 수정 완료"));
	}

	@Operation(summary = "활동 통계 조회", description = "현재 로그인한 사용자의 활동 통계(총 리뷰 수, 좋아요한 영화 수)를 조회합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PreAuthorize("isAuthenticated()")
	@GetMapping("/me/stats")
	public ResponseEntity<UserStatsResponseDto> getUserStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
		Long userId = userDetails.getUser().getUserId();

		UserStatsResponseDto stats = userService.getUserStats(userId);

		return ResponseEntity.ok(stats);
	}

}