package com.d208.feelroom.user.dto;

import java.util.List;

import lombok.Data;

@Data
public class OnboardingPreferenceRequestDto {
	private List<Integer> movieIds;
}
