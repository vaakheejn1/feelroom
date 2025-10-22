package com.d208.feelroom.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponseDto {
	private Long userId;
	private String email;
	private String username;
	private String nickname;
	private String description;
	private String profileImageUrl;
	private String birthDate; // Format: YYYYMMDD
	private Integer genderId;
	private long followerCount;
	private long followingCount;
}
