package com.d208.feelroom.badge.domain.entity;

import com.d208.feelroom.user.domain.entity.User; // User 엔티티 경로
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserBadge {

    /**
     * 복합 기본 키를 포함하는 필드
     * - @EmbeddedId는 이 필드가 식별자이며, 그 값은 Embeddable 클래스인 UserBadgePK에서 온다는 것을 의미합니다.
     */
    @EmbeddedId
    private UserBadgeId id;

    /**
     * 사용자 엔티티와의 관계 매핑
     * - @MapsId("userId"): UserBadgePK 내의 'userId' 필드를 이 User 엔티티의 외래 키와 매핑합니다.
     * - 즉, 이 User 필드가 복합 키의 user_id 부분을 담당하게 됩니다.
     * - insertable=false, updatable=false: 이 관계를 통해 직접 user_id를 수정/삽입하지 않도록 설정합니다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @MapsId("userId")
    private User user;

    /**
     * 뱃지 엔티티와의 관계 매핑
     * - @MapsId("badgeId"): UserBadgePK 내의 'badgeId' 필드를 이 Badge 엔티티의 외래 키와 매핑합니다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id")
    @MapsId("badgeId")
    private Badge badge;

    @Column(name = "acquired_at", nullable = false, updatable = false)
    private LocalDateTime acquiredAt;

    @PrePersist
    private void onPrePersist() {
        this.acquiredAt = LocalDateTime.now();
    }

    public UserBadge(User user, Badge badge) {
        this.user = user;
        this.badge = badge;
        // 복합 키 객체(id)도 함께 생성해줍니다.
        this.id = new UserBadgeId(user.getUserId(), badge.getBadgeId());
    }
}