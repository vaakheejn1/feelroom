//package com.d208.feelroom.recommendation.service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import com.d208.feelroom.recommendation.dto.MovieRecommendationResultDto;
//import com.d208.feelroom.recommendation.dto.UserMovieActivityDto;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
//@Slf4j(topic = "RecommendationBatchJob")
//@Component
//@RequiredArgsConstructor
//public class RecommendationBatchJob {
//
//	private final RecommendationService recommendationService;
//	private final UserActivityService activityCollector;
//	private final RecommendationSaver recommendationSaver;
//
//	// 매일 오전 5시에 실행되는 배치 스케줄
//	@Scheduled(cron = "0 0 5 * * *")
//	public void runMovieRecommendationBatch() {
//		log.info("영화 추천 배치 작업 시작...");
//
//		LocalDateTime since = LocalDateTime.now().minusDays(1);
//
//		// 최근 1일간의 사용자 활동 수집
//		List<UserMovieActivityDto> userMovieActivities = activityCollector.collectMovieActivitiesSince(since);
//		log.info("총 {}명의 영화 관련 사용자 활동 수집 완료", userMovieActivities.size());
//
//		// 영화 추천 결과 FastAPI에서 받아오기
//		List<MovieRecommendationResultDto> results = recommendationService.getMovieRecommendations(userMovieActivities);
//		log.info("{}명의 영화 추천 결과 수신 완료", results.size());
//
//		// 추천 결과 저장
//		recommendationSaver.saveMovieRecommendations(results);
//		log.info("영화 추천 결과 저장 완료");
//	}
//}