package com.d208.feelroom.badge.event;

import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.user.domain.entity.User;

public record BadgeAchievedEvent(User user, Badge badge) {
}
