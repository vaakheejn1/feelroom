package com.d208.feelroom.user.dto;
import lombok.Getter;
import java.util.List;

@Getter
public class FollowListResponseDto {
    private final List<FollowUserDto> users;
    private final boolean hasNext;

    public FollowListResponseDto(List<FollowUserDto> users, boolean hasNext) {
        this.users = users;
        this.hasNext = hasNext;
    }
}