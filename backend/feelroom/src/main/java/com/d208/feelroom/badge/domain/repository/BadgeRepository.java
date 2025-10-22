package com.d208.feelroom.badge.domain.repository;

import com.d208.feelroom.badge.domain.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BadgeRepository extends JpaRepository<Badge, Integer> {

    /**
     * 뱃지 획득 조건 코드로 뱃지를 조회합니다.
     * 이벤트 리스너에서 특정 조건에 맞는 뱃지를 찾을 때 사용되는 핵심 메소드입니다.
     *
     * @param conditionCode 뱃지의 고유 조건 코드 (예: "REVIEW_WRITE_COUNT_1")
     * @return Optional<Badge>
     */
    Optional<Badge> findByConditionCode(String conditionCode);
}