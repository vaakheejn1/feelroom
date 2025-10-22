package com.d208.feelroom.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeUsernameRequestDto {

	@NotBlank(message = "새 사용자 이름은 필수입니다.")
	private String newUsername;
}
