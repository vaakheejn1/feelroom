package com.d208.feelroom.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginRequestDto {
    @Schema(description = "사용자 이름 (로그인 ID)", example = "testuser")
    @NotBlank(message = "사용자 이름은 필수입니다.")
    private String username;

    @Schema(description = "비밀번호", example = "password")
    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;
}
