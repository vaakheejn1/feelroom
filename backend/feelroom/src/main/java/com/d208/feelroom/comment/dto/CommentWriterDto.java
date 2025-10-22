package com.d208.feelroom.comment.dto;

import com.d208.feelroom.user.domain.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE) // 정적 팩토리 메서드 사용 강제
@Schema(description = "댓글 작성자/멘션된 사용자 정보")
public class CommentWriterDto {

    @Schema(description = "사용자 ID")
    private Long userId;

    @Schema(description = "사용자 닉네임")
    private String nickname;

    @Schema(description = "사용자 프로필 이미지 URL")
    private String profileImageUrl;

    /**
     * User 엔티티를 CommentWriterDto로 변환합니다.
     * user가 null일 경우 null을 반환하여 안전하게 처리합니다.
     *
     * @param user 변환할 User 엔티티
     * @return 변환된 DTO 또는 null
     */
    public static CommentWriterDto from(User user) {
        if (user == null) {
            return null;
        }
        CommentWriterDto dto = new CommentWriterDto();
        dto.userId = user.getUserId();
        dto.nickname = user.getNickname();
        dto.profileImageUrl = user.getProfileImageUrl();
        return dto;
    }
}