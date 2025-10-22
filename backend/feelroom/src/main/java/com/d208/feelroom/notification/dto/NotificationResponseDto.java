package com.d208.feelroom.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

@Schema(description = "개별 알림 정보 응답 DTO")
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // null인 필드는 JSON 응답에서 제외
public record NotificationResponseDto(
        @JsonProperty("notification_id")
        Long notificationId,

        @Schema(description = "알림 타입 (FOLLOW, COMMENT, REPLY, BADGE)")
        String type,

        @Schema(description = "알림을 보낸 사용자 정보 (시스템 알림의 경우 null)")
        SenderInfo sender,

        @Schema(description = "서버에서 조합된 알림 내용")
        String content,

        @Schema(description = "알림과 관련된 대상 정보")
        TargetInfo target,

        @JsonProperty("is_read")
        boolean isRead,

        @JsonProperty("created_at")
        LocalDateTime createdAt
) {
    @Schema(description = "알림 발신자 정보")
    @Builder
    public record SenderInfo(
            @JsonProperty("user_id") Long userId,
            String nickname
    ) {}

    @Schema(description = "알림 대상 정보 (리뷰, 댓글, 뱃지 등)")
    @Builder
    public record TargetInfo(
            // DB의 BINARY(16)을 String(UUID)으로 변환하여 전달
            @JsonProperty("review_id") String reviewId,
            @JsonProperty("comment_id") String commentId,
            @JsonProperty("badge_id") Integer badgeId
    ) {}
}