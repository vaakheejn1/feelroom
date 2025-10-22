package com.d208.feelroom.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequestDto {

	@NotBlank
	private String currentPassword;

	@NotBlank
	private String newPassword;
}
