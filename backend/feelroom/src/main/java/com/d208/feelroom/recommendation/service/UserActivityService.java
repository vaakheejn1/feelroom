package com.d208.feelroom.recommendation.service;

import com.d208.feelroom.movie.domain.repository.MovieLikeRepository;
import com.d208.feelroom.recommendation.dto.request.NewUserRequestDto;
import com.d208.feelroom.recommendation.dto.request.UserActivityRequestDto;
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository; // 추가
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.user.domain.repository.UserOnboardingMovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID; // 추가

@Slf4j(topic = "UserActivityService")
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserActivityService {

	private final ReviewRepository reviewRepository;
	private final MovieLikeRepository movieLikeRepository;
	private final UserOnboardingMovieRepository userOnboardingMovieRepository;
	private final ReviewLikeRepository reviewLikeRepository; // ReviewLikeRepository 주입

	/**
	 * 기존 사용자의 활동 내역(리뷰, 평점, 좋아요 영화, 좋아요 리뷰 등)을 조회하여 AI 추천 모델에 전달할 DTO를 생성합니다.
	 *
	 * @param userId 현재 사용자의 ID
	 * @return UserActivityRequestDto 사용자 활동 데이터
	 */
	@Transactional(readOnly = true)
	public UserActivityRequestDto getUserActivity(Long userId) {
		log.info("사용자 활동 내역 조회 시작. userId: {}", userId);

		// 1. [수정] 최적화된 쿼리 호출
		List<Object[]> userReviewsData = reviewRepository.findReviewedMovieTmdbIdsAndRatingsByUserId(userId);

		List<Integer> reviewedMovieTmdbIds = new ArrayList<>();
		List<Double> ratings = new ArrayList<>();

		for (Object[] row : userReviewsData) {
			Integer tmdbId = (Integer) row[0];
			Object ratingObj = row[1];

			reviewedMovieTmdbIds.add(tmdbId);
			if (ratingObj != null) {
				ratings.add(((Number) ratingObj).doubleValue());
			}
			// 평점이 null인 경우, AI 모델의 입력 형식에 따라 null을 넣거나 특정 값(예: 0.0)을 넣을 수 있습니다.
			// 여기서는 ratings 리스트에 null 값이 들어가는 것을 허용하지 않는다고 가정하고
			// 평점이 있는 리뷰의 tmdbId만 추가하는 것이 더 나을 수 있습니다.
		}

		// 2. [수정] 최적화된 쿼리 호출
		List<UUID> likedReviewIds = reviewLikeRepository.findReviewIdsByUserId(userId);

		// 3. [수정] 최적화된 쿼리 호출 (메서드 이름 변경됨)
		List<Integer> likedMovieTmdbIds = movieLikeRepository.findLikedMovieTmdbIdsByUserId(userId);

		log.info("사용자 활동 내역 조회 완료. userId: {}, reviewedMovies: {}, likedMovies: {}, likedReviews: {}",
				userId, reviewedMovieTmdbIds.size(), likedMovieTmdbIds.size(), likedReviewIds.size());

		return new UserActivityRequestDto(userId, reviewedMovieTmdbIds, ratings, likedReviewIds, likedMovieTmdbIds);
	}

	/**
	 * 신규 사용자 또는 활동이 없는 사용자의 초기 영화 선호도 데이터를 조회합니다.
	 *
	 * @param userId 현재 사용자의 ID
	 * @return NewUserRequestDto 초기 선호 영화 데이터
	 */
	public NewUserRequestDto getNewUserActivity(Long userId) {
		log.info("신규 사용자 초기 선호 영화 조회 시작. userId: {}", userId);
		// tmdb id로 요청
		List<Integer> likedMovieId = userOnboardingMovieRepository.findMovieIdsByUserId(userId);

		log.info("신규 사용자 초기 선호 영화 조회 완료. userId: {}, count: {}", userId, likedMovieId);

		return new NewUserRequestDto(likedMovieId);
	}
}