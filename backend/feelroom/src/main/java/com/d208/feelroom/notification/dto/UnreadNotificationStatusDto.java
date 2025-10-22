package com.d208.feelroom.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "안 읽은 알림 존재 여부 응답 DTO")
public record UnreadNotificationStatusDto(
        @JsonProperty("exists")
        @Schema(description = "안 읽은 알림 존재 여부", example = "true")
        boolean exists
) {}