package com.d208.feelroom.movie.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.user.domain.UserOnboardingMovieId;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.entity.UserOnboardingMovie;
import com.d208.feelroom.user.domain.repository.UserOnboardingMovieRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.movie.exception.MovieNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "OnboardingService")
@Service
@RequiredArgsConstructor
public class OnboardingService {

	private final UserOnboardingMovieRepository userOnboardingMovieRepository;
	private final MovieRepository movieRepository;
	private final UserRepository userRepository;

	public void savePreferences(Long userId, List<Integer> movieIds) {
		// 영화 ID 리스트가 null이거나 비어있으면 예외 발생 (최소 1개 이상 선택 필요)
		if (movieIds == null || movieIds.isEmpty()) {
			throw new IllegalArgumentException("적어도 하나의 영화를 선택해야 합니다.");
		}

		// 이미 온보딩 선호도를 제출한 사용자인지 체크, 맞으면 예외 발생
		if (userOnboardingMovieRepository.existsByIdUserId(userId)) {
			throw new IllegalStateException("이미 온보딩 선호도를 제출한 사용자입니다.");
		}

		// 중복된 영화 ID가 있는지 체크, 중복이 있으면 예외 발생
		Set<Integer> distinctMovieIds = new HashSet<>(movieIds);
		if (distinctMovieIds.size() < movieIds.size()) {
			throw new IllegalArgumentException("중복된 영화는 선택할 수 없습니다.");
		}

		// userId로 사용자 엔티티 조회, 없으면 예외 발생
		User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

		// 영화 ID 리스트를 순회하며 UserOnboardingMovie 엔티티 생성
		List<UserOnboardingMovie> preferences = movieIds.stream().map(movieId -> {
			// 영화 ID로 영화 엔티티 조회, 없으면 MovieNotFoundException 예외 발생
			Movie movie = movieRepository.findById(movieId).orElseThrow(() -> {
				return new MovieNotFoundException(movieId);
			});

			UserOnboardingMovie pref = new UserOnboardingMovie();

			// 복합키 생성 (userId, movieId)
			UserOnboardingMovieId id = new UserOnboardingMovieId(userId, movieId);
			pref.setId(id);
			pref.setUser(user); // 사용자 엔티티 세팅 (중요!)
			pref.setMovie(movie); // 영화 엔티티 세팅 (중요!)
			return pref;
		}).toList();

		// 생성한 엔티티 리스트를 한 번에 저장
		userOnboardingMovieRepository.saveAll(preferences);
	}
}
