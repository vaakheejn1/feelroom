package com.d208.feelroom.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * access Token은 불변(immutable)이므로 record 클래스 사용
 */
@Schema(description = "로그인 성공 응답 Dto")
public record LoginResponseDto(
        @JsonProperty("access_token") // JSON key를 access_token으로 설정
        @Schema(description = "JWT Access Token", example = "Bearer eysdfkls...")
        String accessToken,

        @JsonProperty("user_id") // JSON key를 user_id로 설정
        @Schema(description = "사용자 고유 ID", example = "1")
                Long userId
){}