package com.d208.feelroom.user.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.d208.feelroom.user.domain.UserOnboardingMovieId;
import com.d208.feelroom.user.domain.entity.UserOnboardingMovie;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserOnboardingMovieRepository extends JpaRepository<UserOnboardingMovie, UserOnboardingMovieId> {
	boolean existsByIdUserId(Long userId);

	/**
	 * ✨ 추가된 메서드
	 * 특정 사용자가 온보딩 과정에서 선택한 모든 영화의 ID 목록을 조회합니다.
	 * AI 추천 모델에 신규 사용자 선호도 데이터를 전달하기 위해 사용됩니다.
	 * @param userId 사용자의 ID
	 * @return 해당 사용자가 선택한 영화 ID(movieId) 리스트
	 */
	@Query("SELECT uom.movie.tmdbId FROM UserOnboardingMovie uom WHERE uom.id.userId = :userId")
	List<Integer> findMovieIdsByUserId(@Param("userId") Long userId);
}
