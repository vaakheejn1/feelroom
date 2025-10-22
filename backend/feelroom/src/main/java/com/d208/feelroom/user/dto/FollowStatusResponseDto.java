package com.d208.feelroom.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "팔로우 상태 응답 DTO")
public class FollowStatusResponseDto {

    @Schema(description = "팔로우 여부", example = "true")
    private final boolean isFollowing;

    public FollowStatusResponseDto(boolean isFollowing) {
        this.isFollowing = isFollowing;
    }
}