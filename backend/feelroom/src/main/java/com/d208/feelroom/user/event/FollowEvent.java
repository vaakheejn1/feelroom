package com.d208.feelroom.user.event;

import com.d208.feelroom.user.domain.entity.User;

public record FollowEvent(User follower, User followee) {}