package com.d208.feelroom.search.dto;

import com.d208.feelroom.user.domain.entity.User;
import lombok.*;

/**
 * 사용자 검색 결과 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchDto {

    private Long userId;              // 사용자 ID
    private String username;          // 사용자명
    private String nickname;          // 닉네임
    private String displayName;       // 화면 표시용 이름 (nickname 우선, 없으면 username)
    private String profileImageUrl;   // 프로필 이미지 URL

    /**
     * User 엔티티로부터 UserSearchDto 생성
     */
    public static UserSearchDto fromUser(User user) {
        String displayName = (user.getNickname() != null && !user.getNickname().trim().isEmpty())
                ? user.getNickname() : user.getUsername();

        return UserSearchDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .displayName(displayName)
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    /**
     * 프로필 이미지 존재 여부
     */
    public boolean hasProfileImage() {
        return profileImageUrl != null && !profileImageUrl.trim().isEmpty();
    }
}