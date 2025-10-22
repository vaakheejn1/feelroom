package com.d208.feelroom.review.dto;

import java.util.UUID;

// record를 사용하면 간결하게 불변 DTO를 만들 수 있습니다.
public record ReviewUpdateResponseDto(
        UUID reviewId,
        String message
) {}