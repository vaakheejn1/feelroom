package com.d208.feelroom.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestDto {

//    @Email
//    @NotBlank
	@Email(message = "유효한 이메일을 입력하세요.")
	@NotBlank(message = "이메일은 필수 입력값입니다.")
	private String email;

	@NotBlank
	@Size(min = 4, max = 20, message = "비밀번호는 4자 이상 20자 이하입니다.")
	private String password;

//	@NotBlank
	@NotBlank(message = "사용자 이름은 필수 입력값입니다.")
	private String username;

//	@NotBlank
	@NotBlank(message = "닉네임은 필수 입력값입니다.")
	private String nickname;

//	@Pattern(regexp = "\\d{8}", message = "birth_date 는 YYYYMMDD 형태")
	@Pattern(regexp = "\\d{8}", message = "생년월일은 YYYYMMDD 형식이어야 합니다.")
	private String birth_date;

//	@NotBlank
	@NotBlank(message = "성별 값은 필수 입력값입니다.")
	private String gender_value; // "male", "female", "other"
}
