package com.d208.feelroom.badge.dto;

import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.badge.domain.entity.UserBadge;
import java.time.LocalDateTime;

public record UserBadgeResponseDto(
        String name,
        String description,
        String iconUrl,
        LocalDateTime acquiredAt
) {
    /**
     * UserBadge 엔티티를 DTO로 변환하는 정적 팩토리 메소드
     */
    public static UserBadgeResponseDto from(UserBadge userBadge) {
        Badge badge = userBadge.getBadge();
        return new UserBadgeResponseDto(
                badge.getName(),
                badge.getDescription(),
                badge.getIconUrl(),
                userBadge.getAcquiredAt()
        );
    }
}