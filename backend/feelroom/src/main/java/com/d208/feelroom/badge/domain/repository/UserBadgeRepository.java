package com.d208.feelroom.badge.domain.repository;

import com.d208.feelroom.badge.domain.entity.UserBadge;
import com.d208.feelroom.badge.domain.entity.UserBadgeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Set;

public interface UserBadgeRepository extends JpaRepository<UserBadge, UserBadgeId> {

    /**
     * 특정 사용자가 획득한 모든 뱃지 목록을 조회합니다.
     * fetch join을 사용하여 N+1 문제를 방지하고 성능을 최적화합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 해당 사용자의 UserBadge 목록
     */
    @Query("SELECT ub FROM UserBadge ub JOIN FETCH ub.badge WHERE ub.user.id = :userId ORDER BY ub.acquiredAt DESC")
    List<UserBadge> findByUserIdWithBadge(@Param("userId") Long userId);

    /**
     * 사용자가 특정 조건의 뱃지를 이미 가지고 있는지 확인합니다. (뱃지 부여 로직에서 사용)
     * @param userId 사용자 ID
     * @param badgeId 뱃지 ID
     * @return 존재 여부 (true/false)
     */
    boolean existsByUser_UserIdAndBadge_BadgeId(Long userId, Integer badgeId);
    @Query("SELECT ub.badge.badgeId FROM UserBadge ub WHERE ub.user.userId = :userId")
    Set<Integer> findBadgeIdsByUserId(@Param("userId") Long userId);
}