package com.d208.feelroom.user.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Date;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.user.domain.UserRole;
import com.d208.feelroom.user.domain.entity.Gender;
import com.d208.feelroom.user.domain.entity.LocalAccount;
import com.d208.feelroom.user.domain.entity.SignupType;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.GenderRepository;
import com.d208.feelroom.user.domain.repository.SignupTypeRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.user.dto.LoginRequestDto;
import com.d208.feelroom.user.dto.LoginResponseDto;
import com.d208.feelroom.user.dto.ResetPasswordRequestDto;
import com.d208.feelroom.user.dto.SignupRequestDto;
import com.d208.feelroom.badge.event.EventPublisher;
import com.d208.feelroom.user.event.UserActivityEvent.ActivityType;
import com.d208.feelroom.global.security.util.JwtUtil;
import com.d208.feelroom.global.util.PasswordValidator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "AuthService")
@Service
@RequiredArgsConstructor
public class AuthService {
	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final EventPublisher eventPublisher;
	private final GenderRepository genderRepository;
	private final SignupTypeRepository signupTypeRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final UserService userService;
	private final TokenBlacklistService tokenBlacklistService;
	private final VerificationCodeService verificationCodeService;

	public LoginResponseDto login(LoginRequestDto requestDto) {
		// 1. DTO에서 받은 username과 password로 인증 토큰 생성
		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
				requestDto.getUsername(), requestDto.getPassword());
		System.out.println("## login service 진입");
		// 2. AuthenticationManager에 인증 토큰 전달해서 인증
		// -> 내부적으로 UserDetailsServiceImpl.loadUserByUsername 실행
		// -> 내부적으로 PasswordEncoder.matches 실행해서 비교
		// -> 인증 실패 시 AuthenticationException 발생
		Authentication authentication = authenticationManager.authenticate(authenticationToken);

		// 3. 인증 성공하면 인증된 사용자 정보 가져오기
		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

		// 4. JWT 생성
		String accessToken = jwtUtil.createAccessToken(userDetails.getUsername(), userDetails.getUser().getUserRole());

		// 5. DTO 담아 전송
		return new LoginResponseDto(accessToken, userDetails.getUser().getUserId());
	}

	// 로그아웃 처리: JWT 토큰을 블랙리스트에 등록해 무효화
//	@Transactional
	public void logout(String token) {
		String pureToken = token.replace(JwtUtil.BEARER_PREFIX, "");
		// 토큰 유효성 검사
		if (!jwtUtil.validateToken(pureToken)) {
			throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
		}

		// 토큰 만료시간과 현재 시간으로 TTL 계산
		Date expiration = jwtUtil.getExpiration(pureToken);
		long now = System.currentTimeMillis();
		long ttl = expiration.getTime() - now; // ttl: time to live

		// 토큰을 블랙리스트에 등록하여 로그아웃 처리
		tokenBlacklistService.blacklistToken(pureToken, ttl);
	}

	// 회원가입 처리
	@Transactional
	public Long signup(SignupRequestDto dto) {
		// 성별 값 유효성 확인 ('male', 'female', 'other')
		Gender gender = genderRepository.findByValue(dto.getGender_value())
				.orElseThrow(() -> new IllegalArgumentException("올바르지 않은 성별 형식입니다"));

		// 가입 타입(email) 조회
		SignupType signupType = signupTypeRepository.findByValue("email")
				.orElseThrow(() -> new IllegalStateException("Signup type 'email' not found"));

		// 이메일 유효성 및 중복 확인
		if (!userService.isEmailAvailable(dto.getEmail())) {
			throw new IllegalArgumentException("이미 사용 중이거나 올바르지 않은 이메일입니다.");
		}
		// 사용자 이름 유효성 및 중복 확인
		if (!userService.isUsernameAvailable(dto.getUsername())) {
			throw new IllegalArgumentException("이미 사용 중이거나 올바르지 않은 사용자 이름입니다.");
		}

		// 생년월일 형식(YYYYMMDD) 검사
		if (!dto.getBirth_date().matches("\\d{8}")) {
			throw new IllegalArgumentException("birth_date는 YYYYMMDD 형식이어야 합니다.");
		}

		// 생년월일 존재 여부 검사 (엄격한 날짜 검증)
		try {
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("uuuuMMdd")
					.withResolverStyle(ResolverStyle.STRICT);
			LocalDate.parse(dto.getBirth_date(), formatter);
		} catch (DateTimeParseException e) {
			throw new IllegalArgumentException("존재하지 않는 생년월일입니다.");
		}

		// 비밀번호 유효성 검사 (8자 이상, 영문/숫자/특수문자 2종류 이상 포함)
		String password = dto.getPassword();
		PasswordValidator.validatePassword(password);

		// 사용자 엔티티 생성 (가입 정보 설정)
		User user = User.builder().email(dto.getEmail()).username(dto.getUsername()).nickname(dto.getNickname())
				.birthDate(dto.getBirth_date()) // Already in YYYYMMDD format
				.gender(gender).signupType(signupType).userRole(UserRole.USER).build();

		// 사용자 저장 (ID 생성 목적)
		userRepository.save(user);

		// 감사(audit) 정보를 위해 createdBy, updatedBy 필드 설정
		user.setCreatedBy(user.getUserId());
		user.setUpdatedBy(user.getUserId());

		// 감사 정보 반영을 위한 재저장
		userRepository.save(user);

		// 로컬 계정 생성 및 비밀번호 암호화 후 연결
		LocalAccount account = LocalAccount.builder().user(user).passwordHash(passwordEncoder.encode(password)).build();

		// 사용자 엔티티에 로컬 계정 설정 (양방향 연관관계 일관성 유지)
		user.setLocalAccount(account);

		// === 이벤트 발행 ===
		eventPublisher.publishUserActivity(user.getUserId(), ActivityType.USER_SIGNUP);

		// 사용자 ID 반환
		return user.getUserId();
	}

	// 이메일 인증된 사용자 대상 비밀번호 재설정 처리
	@Transactional
	public void resetPasswordForVerifiedEmail(ResetPasswordRequestDto requestDto) {
		String email = requestDto.getEmail();
		String newPassword = requestDto.getNewPassword();

		// 1. 이메일 인증 상태 확인
		if (!verificationCodeService.isVerified(email)) {
			throw new IllegalArgumentException("이메일 인증이 완료되지 않았습니다.");
		}

		// 2. 인증 상태 초기화 (비밀번호 재설정 완료 후)
		verificationCodeService.markUnverified(email);

		// 3. 이메일로 사용자 조회
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("해당 이메일로 등록된 로컬 계정 사용자가 없습니다."));

		// 4. 로컬 계정 존재 여부 확인
		if (user.getLocalAccount() == null) {
			throw new IllegalArgumentException("로컬 계정이 존재하지 않습니다.");
		}

		// 5. 새 비밀번호 유효성 검사
		PasswordValidator.validatePassword(newPassword);

		// 6. 비밀번호 암호화 후 변경사항 저장
		user.getLocalAccount().setPasswordHash(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}
}
