package com.d208.feelroom.user.domain.repository;

import java.util.Set;

import com.d208.feelroom.user.domain.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.d208.feelroom.user.domain.FollowId;
import com.d208.feelroom.user.domain.entity.Follow;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {
	boolean existsByFollower_UserIdAndFollowee_UserId(Long followerId, Long followeeId);

	void deleteByFollower_UserIdAndFollowee_UserId(Long followerId, Long followeeId);

	/**
	 * 특정 사용자가 팔로우하는 모든 사용자의 ID를 조회합니다.
	 * 피드 기능을 위해 필요합니다.
	 * @param followerId 현재 사용자의 ID
	 * @return 팔로우하는 사용자들의 ID 집합(Set)
	 */
	@Query("SELECT f.followee.userId FROM Follow f WHERE f.follower.userId = :followerId")
	Set<Long> findFolloweeIdsByFollowerId(@Param("followerId") Long followerId);

	// [수정] 팔로잉 목록 조회 (Slice 반환, Pageable 파라미터 추가)
	@Query("SELECT f.followee FROM Follow f WHERE f.follower.userId = :followerId ORDER BY f.followedAt DESC")
	Slice<User> findFolloweesByFollowerId(@Param("followerId") Long followerId, Pageable pageable);

	// [수정] 팔로워 목록 조회 (Slice 반환, Pageable 파라미터 추가)
	@Query("SELECT f.follower FROM Follow f WHERE f.followee.userId = :followeeId ORDER BY f.followedAt DESC")
	Slice<User> findFollowersByFolloweeId(@Param("followeeId") Long followeeId, Pageable pageable);
	/**
	 * User Activity Badge System
	 */
	long countByFollower_UserId(Long followerId); // 사용자가 팔로우하는 수
	long countByFollowee_UserId(Long followeeId); // 사용자를 팔로우하는 수 (팔로워 수)
}
