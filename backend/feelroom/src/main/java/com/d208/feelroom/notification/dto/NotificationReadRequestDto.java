package com.d208.feelroom.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor // JSON 역직렬화를 위해 기본 생성자 필요
public class NotificationReadRequestDto {

    @JsonProperty("notification_ids")
    @Schema(description = "읽음 처리할 알림 ID 목록")
    private List<Long> notificationIds;
}