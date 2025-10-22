package com.d208.feelroom.user.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.user.dto.LoginRequestDto;
import com.d208.feelroom.user.dto.LoginResponseDto;
import com.d208.feelroom.user.dto.ResetPasswordRequestDto;
import com.d208.feelroom.user.dto.SignupRequestDto;
import com.d208.feelroom.user.dto.SignupResponseDto;
import com.d208.feelroom.user.service.AuthService;
import com.d208.feelroom.user.service.VerificationCodeService;
import com.d208.feelroom.global.security.util.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "1. Authentication", description = "인증 관련 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

	private final JwtUtil jwtUtil;

	private final AuthService authService;
	private final VerificationCodeService verificationCodeService;

	private final UserRepository userRepository;

	@Operation(summary = "로컬 계정 로그인", description = "사용자 이름과 비밀번호로 로그인하여 JWT를 발급받습니다.")
	@PostMapping("/login")
	public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto requestDto) {
		LoginResponseDto responseDto = authService.login(requestDto);
		return ResponseEntity.ok(responseDto);
	}

	@Operation(summary = "로그아웃", description = "JWT 토큰을 블랙리스트에 추가하여 무효화합니다.", security = @SecurityRequirement(name = "bearerAuth"))
	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletRequest request) {
		String token = jwtUtil.getJwtFromHeader(request);
		authService.logout(token);
		return ResponseEntity.ok(Map.of("message", "로그아웃 완료"));
//		return ResponseEntity.ok(Map.of("status", HttpServletResponse.SC_OK, "message", "로그아웃 완료"));
	}

	@Operation(summary = "이메일 회원가입 (최종)", description = "이메일과 인증된 정보를 기반으로 회원가입을 최종 완료합니다.")
	@PostMapping("/signup/email")
	public ResponseEntity<SignupResponseDto> signup(@Valid @RequestBody SignupRequestDto requestDto) {
		Long userId = authService.signup(requestDto); // signup returns the newly created user_id
		return ResponseEntity.ok(new SignupResponseDto(userId, "회원가입 성공"));
	}

	@Operation(summary = "이메일로 아이디(Username) 찾기", description = "이메일 인증이 완료된 경우, 해당 이메일에 연결된 사용자 아이디를 반환합니다.")
	@PostMapping("/find-username")
	public ResponseEntity<?> findUsernameByEmail(@RequestParam("email") String email) {
		boolean isVerified = verificationCodeService.isVerified(email);
		if (!isVerified) {
			return ResponseEntity.status(401).body(Map.of("success", false, "message", "이메일 인증이 완료되지 않았습니다."));
		}

		// 이메일로 사용자 조회 (UserService 또는 UserRepository에서 구현)
		Optional<User> userOpt = userRepository.findByEmail(email);

		if (userOpt.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "해당 이메일로 등록된 사용자가 없습니다."));
		}

		String username = userOpt.get().getUsername();

		return ResponseEntity.ok(Map.of("username", username));
	}

	@Operation(summary = "비로그인 비밀번호 재설정", description = "이메일 인증이 완료된 사용자의 비밀번호를 재설정합니다.")
	@PostMapping("/password/reset")
	public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDto requestDto) {
		authService.resetPasswordForVerifiedEmail(requestDto);
		return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 성공적으로 재설정되었습니다."));
	}
}
