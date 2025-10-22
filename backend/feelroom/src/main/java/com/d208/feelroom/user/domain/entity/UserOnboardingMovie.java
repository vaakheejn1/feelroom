package com.d208.feelroom.user.domain.entity;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.user.domain.UserOnboardingMovieId;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_onboarding_movies", indexes = @Index(name = "idx_user_onboarding", columnList = "user_id"))
@Getter
@Setter
public class UserOnboardingMovie {

	@EmbeddedId
	private UserOnboardingMovieId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userId")
	@JoinColumn(name = "user_id")
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("movieId")
	@JoinColumn(name = "movie_id")
	private Movie movie;
}
