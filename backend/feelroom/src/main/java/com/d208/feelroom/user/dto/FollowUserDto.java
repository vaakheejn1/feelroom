package com.d208.feelroom.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FollowUserDto {
	private Long userId;
	private String username;
	private String nickname;
	private String profileImageUrl;
}