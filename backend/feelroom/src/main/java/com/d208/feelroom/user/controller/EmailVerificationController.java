package com.d208.feelroom.user.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.d208.feelroom.user.service.EmailService;
import com.d208.feelroom.user.service.VerificationCodeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "2.1 User-Email", description = "사용자 관련 API")
@RestController
@RequestMapping("/api/v1/auth/verify/email")
@RequiredArgsConstructor
public class EmailVerificationController {

	private static final Logger log = LoggerFactory.getLogger(UserController.class);

	private final EmailService emailService;
	private final VerificationCodeService verificationCodeService;

	@Operation(summary = "이메일 인증 코드 발송", description = "회원가입 및 인증을 위한 이메일 인증 코드를 발송합니다.")
	@PostMapping("/send")
	public ResponseEntity<?> sendVerificationCode(@RequestParam("email") String email) {

		// 인증 코드
		String verificationCode = generateRandomCode();

		try {
			emailService.sendVerificationEmail(email, verificationCode);

			verificationCodeService.storeCode(email, verificationCode);

			return ResponseEntity.ok(Map.of("success", true, "message", "인증 코드가 이메일로 발송되었습니다. 5분 내에 입력해주세요."));
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
					.body(Map.of("success", false, "message", "이메일 발송에 실패했습니다: " + e.getMessage()));
		}
	}

	@Operation(summary = "이메일 인증 코드 확인", description = "사용자가 입력한 인증 코드가 올바른지 확인합니다.")
	@PostMapping("/confirm")
	public ResponseEntity<?> verifyCode(@RequestParam("email") String email, @RequestParam("code") String code) {

		try {
			verificationCodeService.verify(email, code);
			return ResponseEntity.ok(Map.of("success", true, "message", "이메일 인증이 완료되었습니다."));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
		}
	}

	// 6자리 랜덤 숫자 생성
	private String generateRandomCode() {
		return String.valueOf((int) (Math.random() * 900000) + 100000); // 6-digit code
	}

}
