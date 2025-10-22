package com.d208.feelroom.badge.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * UserBadge 엔티티의 복합 기본 키를 정의하는 클래스 (Embeddable 타입).
 * 이 클래스는 다른 엔티티에 '포함(embedded)'될 수 있음을 나타냅니다.
 *
 * @Embeddable 클래스의 조건:
 * 1. @Embeddable 어노테이션을 가져야 합니다.
 * 2. 기본 생성자가 있어야 합니다.
 * 3. Serializable 인터페이스를 구현해야 합니다.
 * 4. equals()와 hashCode()를 구현해야 합니다.
 */
@Embeddable // 이 객체가 다른 엔티티에 삽입될 수 있음을 의미
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserBadgeId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "badge_id")
    private Integer badgeId;
}