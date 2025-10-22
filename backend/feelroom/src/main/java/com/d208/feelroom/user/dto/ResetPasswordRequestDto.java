package com.d208.feelroom.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequestDto {

	@Email
	@NotBlank
	private String email;

	@NotBlank
	private String newPassword;
}
