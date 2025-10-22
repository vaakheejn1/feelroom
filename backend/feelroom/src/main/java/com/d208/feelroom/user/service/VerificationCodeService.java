package com.d208.feelroom.user.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class VerificationCodeService {

	// 인메모리 저장소 - 실제 운영환경에서는 Redis나 DB 사용 권장
	private final Map<String, VerificationCode> codeStore = new ConcurrentHashMap<>();

	public void storeCode(String email, String code) {
		codeStore.put(email, new VerificationCode(code));
	}

	public boolean isVerified(String email) {
		VerificationCode code = codeStore.get(email);
		return code != null && code.verified;
	}
//	public boolean isVerified(String email) {
//	    return verificationCodeRepository.findByEmail(email)
//	            .map(VerificationCode::isVerified)
//	            .orElse(false);
//	}

	public void verify(String email, String inputCode) {
		VerificationCode code = codeStore.get(email);

		// if (email == null || email.trim().isEmpty() || code == null ||
		// code.trim().isEmpty()) {
		// return ResponseEntity.badRequest().body(Map.of(
		// "success", false,
		// "message", "이메일과 인증 코드를 입력해주세요."));
		// }

		if (code == null) {
			throw new IllegalArgumentException("인증 코드를 먼저 발송해주세요.");
		}

		if (code.isExpired()) {
			codeStore.remove(email);
			throw new IllegalArgumentException("인증 코드가 만료되었습니다. 다시 발송해주세요.");
		}

		if (!code.code.equals(inputCode)) {
			throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
		}

		// 인증 성공
		code.setVerified(true);
	}

	public void clear(String email) {
		codeStore.remove(email);
	}

	public void markUnverified(String email) {
		VerificationCode code = codeStore.get(email);
		if (code != null) {
			code.setVerified(false);
		}
	}

	// === Nested class ===
	private static class VerificationCode {
		private final String code;
		private final LocalDateTime createdAt;
		private boolean verified;

		VerificationCode(String code) {
			this.code = code;
			this.createdAt = LocalDateTime.now();
			this.verified = false;
		}

		boolean isExpired() {
			return ChronoUnit.MINUTES.between(createdAt, LocalDateTime.now()) > 5; // 5분 유효
		}

		public String getCode() {
			return code;
		}

		void setVerified(boolean verified) {
			this.verified = verified;
		}
	}
}
