package com.d208.feelroom.user.domain;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class UserOnboardingMovieId implements Serializable {

	private Long userId;
	private Integer movieId;

	public UserOnboardingMovieId() {
	}

	public UserOnboardingMovieId(Long userId, Integer movieId) {
		this.userId = userId;
		this.movieId = movieId;
	}

	public Long getUserId() {
		return userId;
	}

	public Integer getMovieId() {
		return movieId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public void setMovieId(Integer movieId) {
		this.movieId = movieId;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (!(o instanceof UserOnboardingMovieId))
			return false;
		UserOnboardingMovieId that = (UserOnboardingMovieId) o;
		return Objects.equals(userId, that.userId) && Objects.equals(movieId, that.movieId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(userId, movieId);
	}
}