package com.d208.feelroom.user.service;

import com.d208.feelroom.badge.event.EventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.d208.feelroom.user.domain.entity.Follow;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.FollowRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

	private final UserRepository userRepository;
	private final FollowRepository followRepository;
	private final EventPublisher eventPublisher;

//	public FollowService(UserRepository userRepository, FollowRepository followRepository) {
//		this.userRepository = userRepository;
//		this.followRepository = followRepository;
//	}

	@Transactional
	public void followUser(Long followerId, Long followeeId) {
		if (followerId.equals(followeeId)) {
			throw new IllegalArgumentException("자신을 팔로우할 수 없습니다.");
		}

		if (!userRepository.existsById(followerId)) {
			throw new IllegalArgumentException("팔로워를 찾을 수 없습니다.");
		}

		if (!userRepository.existsById(followeeId)) {
			throw new IllegalArgumentException("팔로우할 대상을 찾을 수 없습니다.");
		}

		if (followRepository.existsByFollower_UserIdAndFollowee_UserId(followerId, followeeId)) {
			throw new IllegalArgumentException("이미 해당 사용자를 팔로우하고 있습니다.");
		}

		User follower = userRepository.getReferenceById(followerId);
		User followee = userRepository.getReferenceById(followeeId);

		Follow follow = new Follow();
		follow.setFollower(follower);
		follow.setFollowee(followee);
		followRepository.save(follow);

		// == 이벤트 생성 ==
		eventPublisher.publishFollow(follower, followee);
	}

	@Transactional
	public void unfollowUser(Long followerId, Long followeeId) {
		// Optional: check if follow relationship exists
		if (!followRepository.existsByFollower_UserIdAndFollowee_UserId(followerId, followeeId)) {
			throw new IllegalArgumentException("해당 사용자를 팔로우하고 있지 않습니다.");
		}

		followRepository.deleteByFollower_UserIdAndFollowee_UserId(followerId, followeeId);
	}

}
