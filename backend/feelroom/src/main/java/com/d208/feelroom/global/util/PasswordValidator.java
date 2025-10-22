package com.d208.feelroom.global.util;

/**
 * 비밀번호 유효성 검사 메서드. 다음 규칙을 기반으로 비밀번호를 검증합니다: - 최소 8자 이상이어야 합니다 - 영문자, 숫자, 특수문자 중
 * 최소 2종류를 포함해야 합니다
 *
 * @param password 검증할 비밀번호 문자열 (평문)
 * @throws IllegalArgumentException 비밀번호가 요구 조건을 충족하지 않을 경우 발생합니다
 */

public class PasswordValidator {

	public static void validatePassword(String password) {
		if (password == null || password.length() < 8) {
			throw new IllegalArgumentException("비밀번호는 최소 8자 이상이어야 합니다.");
		}

		int count = 0;
		if (password.matches(".*[A-Za-z].*"))
			count++;
		if (password.matches(".*[0-9].*"))
			count++;
		if (password.matches(".*[!@#$%^&*(),.?\":{}|<>\\[\\]\\\\/~`\\-_+=;'].*"))
			count++;

		if (count < 2) {
			throw new IllegalArgumentException("비밀번호는 영문/숫자/특수문자 중 2종류 이상을 포함해야 합니다.");
		}
	}
}
