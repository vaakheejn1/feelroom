package com.d208.feelroom.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.d208.feelroom.global.infra.S3Service;
import com.d208.feelroom.user.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.d208.feelroom.user.domain.entity.LocalAccount;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.FollowRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.global.util.PasswordValidator;

import lombok.RequiredArgsConstructor;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
	private final S3Service s3Service;
	private final UserRepository userRepository;
	private final FollowRepository followRepository;

	private final PasswordEncoder passwordEncoder;

	private static final int MIN_USERNAME_LENGTH = 3;
	private static final int MAX_USERNAME_LENGTH = 50;

	public boolean isUsernameAvailable(String username) {

		// 빈 값이면 false 리턴
		if (username == null) {
			return false;
		}

		String trimmed = username.trim();

		// 여백으로만 이루어진 값이면 false 리턴
		if (trimmed.isEmpty()) {
			return false;
		}

		// 아이디가 50자 초과, 3자 미만 시 false 리턴
		if (trimmed.length() < MIN_USERNAME_LENGTH || trimmed.length() > MAX_USERNAME_LENGTH) {
			return false;
		}

		// return !userRepository.existsByUsername(username);
		return !userRepository.existsByUsername(trimmed);
		// If someone enters "abc " (with a space), it may incorrectly pass or fail,
		// depending on the DB. It's safer to trim and check the clean value.
	}

	public boolean isEmailAvailable(String email) {
		if (email == null || email.isBlank()) {
			return false;
		}

		email = email.trim();

		if (!email.matches("^[\\w.-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
			return false;
		}

		return !userRepository.existsByEmail(email);
	}

	@Transactional
	public void changeUsername(Long userId, String newUsername) {
		// 사용자 조회
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		// 현재와 같은 이름이면 변경 불가
		if (user.getUsername().equals(newUsername)) {
			throw new IllegalArgumentException("새 사용자 이름이 현재 사용자 이름과 동일합니다.");
		}

		// 중복 확인
		if (userRepository.existsByUsername(newUsername)) {
			throw new IllegalArgumentException("이미 사용 중인 사용자 이름입니다.");
		}

		// 유효성 검사 (예: 길이, 형식 등) — 필요 시 Validator 추가
		// UsernameValidator.validateUsername(newUsername); // optional

		// 변경
		user.setUsername(newUsername);
	}

	// 로그인한 사용자의 비밀번호 변경 처리
	@Transactional
	public void changePassword(Long userId, String currentPassword, String newPassword) {
		// 사용자 ID로 User 엔티티 조회, 없으면 예외 발생
		User user = userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		// User에 연결된 LocalAccount(로컬 계정) 조회
		LocalAccount localAccount = user.getLocalAccount();
		if (localAccount == null) {
			throw new IllegalStateException("로컬 계정이 존재하지 않습니다.");
		}

		// 현재 비밀번호가 DB에 저장된 해시된 비밀번호와 일치하는지 확인
		if (!passwordEncoder.matches(currentPassword, localAccount.getPasswordHash())) {
			throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
		}

		// 새 비밀번호가 현재 비밀번호와 같은지 확인 (같으면 예외 발생)
		if (passwordEncoder.matches(newPassword, localAccount.getPasswordHash())) {
			throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 같을 수 없습니다.");
		}

		// 새 비밀번호 유효성 검사 (길이, 문자 종류 등)
		PasswordValidator.validatePassword(newPassword);

		// 새 비밀번호를 암호화하여 LocalAccount에 저장
		localAccount.setPasswordHash(passwordEncoder.encode(newPassword));
	}

	@Transactional(readOnly = true)
    public UserProfileResponseDto getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        long followerCount = followRepository.countByFollowee_UserId(userId);
        long followingCount = followRepository.countByFollower_UserId(userId);

        return UserProfileResponseDto.builder()
            .userId(user.getUserId())
				.email(user.getEmail())
            .username(user.getUsername())
            .nickname(user.getNickname())
            .description(user.getDescription())
            .profileImageUrl(user.getProfileImageUrl())
            .birthDate(user.getBirthDate()) // format YYYYMMDD // .toString()
            .genderId(user.getGender() != null ? user.getGender().getGenderId() : null)
            .followerCount(followerCount)
            .followingCount(followingCount)
            .build();
	}
			
	@Transactional(readOnly = true)
	public OtherUserProfileResponseDto getOtherUserProfile(Long viewerId, Long targetUserId) {
		if (viewerId.equals(targetUserId)) {
			throw new IllegalArgumentException("자기 자신의 프로필은 이 API가 아닌 /me/profile을 사용하세요.");
		}

		User targetUser = userRepository.findById(targetUserId)
				.orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다."));

		long followerCount = followRepository.countByFollowee_UserId(targetUserId);
		long followingCount = followRepository.countByFollower_UserId(targetUserId);
		boolean isFollowedByMe = followRepository.existsByFollower_UserIdAndFollowee_UserId(viewerId, targetUserId);

		return OtherUserProfileResponseDto.builder()
			.userId(targetUser.getUserId())
			.username(targetUser.getUsername())
			.nickname(targetUser.getNickname())
			.description(targetUser.getDescription())
			.profileImageUrl(targetUser.getProfileImageUrl())
			.followerCount(followerCount)
			.followingCount(followingCount)
			.isFollowedByMe(isFollowedByMe)
			.build();
	}

	// [수정] 팔로잉 목록 조회 (Slice 처리)
	public FollowListResponseDto getFollowingList(Long userId, Pageable pageable) {
		// 1. Repository 호출 (Slice<User> 반환)
		Slice<User> followeeSlice = followRepository.findFolloweesByFollowerId(userId, pageable);

		// 2. Slice<User>를 List<FollowUserDto>로 변환
		List<FollowUserDto> dtoList = followeeSlice.getContent().stream()
				.map(followee -> FollowUserDto.builder()
						.userId(followee.getUserId())
						.username(followee.getUsername())
						.nickname(followee.getNickname())
						.profileImageUrl(followee.getProfileImageUrl())
						.build())
				.collect(Collectors.toList());

		// 3. 최종 응답 DTO 생성
		return new FollowListResponseDto(dtoList, followeeSlice.hasNext());
	}

	// [수정] 팔로워 목록 조회 (Slice 처리)
	public FollowListResponseDto getFollowerList(Long userId, Pageable pageable) {
		// 1. Repository 호출 (Slice<User> 반환)
		Slice<User> followerSlice = followRepository.findFollowersByFolloweeId(userId, pageable);

		// 2. Slice<User>를 List<FollowUserDto>로 변환
		List<FollowUserDto> dtoList = followerSlice.getContent().stream()
				.map(follower -> FollowUserDto.builder()
						.userId(follower.getUserId())
						.username(follower.getUsername())
						.nickname(follower.getNickname())
						.profileImageUrl(follower.getProfileImageUrl())
						.build())
				.collect(Collectors.toList());

		// 3. 최종 응답 DTO 생성
		return new FollowListResponseDto(dtoList, followerSlice.hasNext());
	}

	public void updateUserProfileImageUrl(Long userId, String objectKey) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

		String oldProfileImageUrl = user.getProfileImageUrl(); // 현재 DB에 저장된 이미지 URL

		String publicImageUrl = s3Service.getPublicUrl(objectKey); // 새로운 S3 공개 URL 생성

		user.updateProfileImageUrl(publicImageUrl); // User 엔티티의 메서드 호출

		userRepository.save(user); // 변경된 사용자 엔티티를 DB에 저장

		// 이전 이미지가 있고, 새로운 이미지와 다르며, 기본 이미지가 아닌 경우에만 삭제
		if (oldProfileImageUrl != null && !oldProfileImageUrl.isEmpty() &&
				!oldProfileImageUrl.equals(publicImageUrl) &&
				!oldProfileImageUrl.contains("default_profile_image_path")) { // 기본 이미지 경로 제외
			try {
				// S3 URL에서 objectKey를 추출하는 헬퍼 메서드가 필요합니다.
				// S3Service에 추가하거나, 여기에 직접 구현하거나, 유틸리티 클래스 사용.
				String oldObjectKey = s3Service.extractObjectKeyFromS3Url(oldProfileImageUrl);
				if (oldObjectKey != null) {
					s3Service.deleteObject(oldObjectKey); // S3Service에 deleteObject 메서드 추가 필요
				}
			} catch (Exception e) {
				// 삭제 실패 로그 기록 (오류가 전체 트랜잭션에 영향을 주지 않도록)
				log.info("Failed to delete old S3 object: " + oldProfileImageUrl + " Error: " + e.getMessage());
			}
		}
	}

	// UserService.java에 추가할 메서드들

// 기존 메서드들은 그대로 두고 아래 메서드들만 추가하세요

	/**
	 * 회원 탈퇴를 위한 비밀번호 확인
	 */
	@Transactional(readOnly = true)
	public boolean verifyPasswordForDeactivation(Long userId, String password) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		LocalAccount localAccount = user.getLocalAccount();
		if (localAccount == null) {
			throw new IllegalStateException("로컬 계정이 존재하지 않습니다.");
		}

		return passwordEncoder.matches(password, localAccount.getPasswordHash());
	}

	/**
	 * 사용자 계정을 논리적으로 삭제(탈퇴) 처리합니다.
	 */
	@Transactional
	public void deactivateUser(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		// JPA dirty checking으로 논리적 삭제 및 닉네임 익명화
		user.setDeletedAt(LocalDateTime.now());
		user.setNickname("탈퇴한 사용자");

		log.info("User deactivated and anonymized: userId={}", userId);
	}

	/**
	 * 프로필 수정 (닉네임, 소개)
	 */
	@Transactional
	public void updateProfile(Long userId, String nickname, String description) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		// 부분 업데이트 지원: null이 아닌 필드만 업데이트
		if (nickname != null) {
			user.setNickname(nickname);
		}
		if (description != null) {
			user.setDescription(description);
		}

		log.info("Profile updated for user: userId={}, nickname={}, description={}",
				userId, nickname, description);
	}

	/**
	 * 팔로우 상태를 조회하는 메서드
	 * @param currentUserId 현재 로그인한 사용자 ID
	 * @param targetUserId 조회 대상 사용자 ID
	 * @return 팔로우 상태 DTO
	 */
	@Transactional(readOnly = true)
	public FollowStatusResponseDto checkFollowStatus(Long currentUserId, Long targetUserId) {
		// 1. 자기 자신을 조회하는 경우, 항상 false 반환 (또는 예외 처리)
		if (currentUserId.equals(targetUserId)) {
			return new FollowStatusResponseDto(false);
		}

		// 2. 대상 유저가 존재하는지 확인 (선택적이지만 좋은 습관)
		userRepository.findById(targetUserId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다.")); // 예외는 프로젝트에 맞게 변경

		// 3. 팔로우 여부 확인
		boolean isFollowing = followRepository.existsByFollower_UserIdAndFollowee_UserId(currentUserId, targetUserId);

		// 4. DTO로 감싸서 반환
		return new FollowStatusResponseDto(isFollowing);
	}

	/**
	 * 사용자 활동 통계 조회
	 */
	@Transactional(readOnly = true)
	public UserStatsResponseDto getUserStats(Long userId) {
		// 사용자 존재 여부 확인
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

		// 작성한 리뷰 수 조회
		int totalReviews = userRepository.countReviewsByUserId(userId);

		// 좋아요한 영화 수 조회
		int totalLikesGiven = userRepository.countMovieLikesByUserId(userId);

		return UserStatsResponseDto.builder()
				.totalReviews(totalReviews)
				.totalLikesGiven(totalLikesGiven)
				.build();
	}

}