package com.d208.feelroom.notification.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record NotificationSliceResponseDto(
        List<NotificationResponseDto> notifications,
        boolean hasNext
) {}