package com.d208.feelroom.recommendation.service;
import com.d208.feelroom.recommendation.dto.request.NewUserRequestDto;
import com.d208.feelroom.recommendation.dto.request.UserActivityRequestDto;
import com.d208.feelroom.recommendation.dto.response.FeedRecommendationItem;
import com.d208.feelroom.recommendation.dto.response.FeedRecommendationResponse;
import com.d208.feelroom.recommendation.dto.response.MovieRecommendationItem;
import com.d208.feelroom.recommendation.dto.response.MovieRecommendationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

	// WebClientConfig에서 생성한 Bean 주입
	private final WebClient recommendationApiClient;

	/**
	 * 1-1. 신규 사용자를 위한 영화 추천 ID 목록 조회
	 * @param request 신규 사용자가 선택한 영화 ID 목록
	 * @return 추천 영화 movieId 리스트
	 */
	public List<Integer> getNewUserRecommendations(NewUserRequestDto request) {
		log.info("AI 서버에 신규 사용자 추천 요청 전송");

		return recommendationApiClient
				.post()
				.uri("/recommendations/new_user") // Endpoint 경로
				.bodyValue(request)
				.retrieve() // 요청 실행 및 응답 수신
				.bodyToMono(MovieRecommendationResponse.class) // 응답 본문을 DTO로 변환
				.map(response -> response.getRecommendations().stream()
						.map(MovieRecommendationItem::getTmdbId) // 각 추천 아이템에서 movieId만 추출
						.collect(Collectors.toList())) // List<Integer>로 수집
				.onErrorResume(e -> { // 통신 중 에러 발생 시
					log.error("AI 서버 통신 실패 (신규 사용자 추천): {}", e.getMessage());
					return Mono.just(Collections.emptyList()); // 빈 리스트 반환
				})
				.block(); // 비동기 작업이 완료될 때까지 대기하고 결과를 반환
	}

	/**
	 * 1-2. 기존 사용자를 위한 영화 추천 ID 목록 조회
	 * @param activity 사용자의 활동 내역
	 * @return 추천 영화 movieId 리스트
	 */
	public List<Integer> getUserRecommendations(UserActivityRequestDto activity) {
		log.info("AI 서버에 기존 사용자({}) 추천 요청 전송", activity.getUserId());

		return recommendationApiClient
				.post()
				.uri("/recommendations/user")
				.bodyValue(activity)
				.retrieve()
				.bodyToMono(MovieRecommendationResponse.class)
				.map(response -> response.getRecommendations().stream()
						.map(MovieRecommendationItem::getTmdbId)
						.collect(Collectors.toList()))
				.onErrorResume(e -> {
					log.error("AI 서버 통신 실패 (기존 사용자 추천): {}", e.getMessage());
					return Mono.just(Collections.emptyList());
				})
				.block();
	}

	/**
	 * 2. 리뷰 피드 추천 ID 목록 조회
	 * @param activity 사용자의 활동 내역
	 * @return 추천 리뷰 reviewId 리스트
	 */
	public List<UUID> getFeedRecommendations(UserActivityRequestDto activity) {
		log.info("AI 서버에 사용자({}) 리뷰 피드 추천 요청 전송", activity.getUserId());

		return recommendationApiClient
				.post()
				.uri("/recommendations/feed")
				.bodyValue(activity)
				.retrieve()
				.bodyToMono(FeedRecommendationResponse.class)
				.map(response -> response.getRecommendations().stream()
						.map(FeedRecommendationItem::getReviewId) // item에서 reviewId(UUID)를 바로 가져옴
						.collect(Collectors.toList()))
				.onErrorResume(e -> {
					log.error("AI 서버 통신 실패 (리뷰 피드 추천): {}", e.getMessage());
					return Mono.just(Collections.emptyList());
				})
				.block();
	}
}