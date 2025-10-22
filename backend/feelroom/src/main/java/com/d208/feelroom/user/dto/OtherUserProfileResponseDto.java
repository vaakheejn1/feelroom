package com.d208.feelroom.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OtherUserProfileResponseDto {
	private Long userId;
	private String username;
	private String nickname;
	private String description;
	private String profileImageUrl;
	private long followerCount;
	private long followingCount;
	private boolean isFollowedByMe;
}
