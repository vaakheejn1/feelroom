//package com.d208.feelroom.recommendation.controller;
//
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.d208.feelroom.recommendation.service.RecommendationBatchJob;
//
//import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.RequiredArgsConstructor;
//
//@Tag(name = "0.01. Recommendation Batch", description = "Spring Batch + FastAPI 테스트용 API")
//@RestController
//@RequestMapping("/api/v1/batch/recommend")
//@RequiredArgsConstructor
//public class RecommendationBatchController {
//
//	private final RecommendationBatchJob batchJob;
//
//	// 영화 추천 배치 작업 수동 실행용 엔드포인트
//	@PostMapping("/movies/run")
//	public String runMovieRecommendationBatchManually() {
//		batchJob.runMovieRecommendationBatch();
//		return "영화 추천 배치 작업이 수동으로 실행되었습니다.";
//	}
//}
