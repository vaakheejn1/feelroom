package com.d208.feelroom.recommendation.controller;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.movie.dto.LikedMovieInfo;
import com.d208.feelroom.recommendation.dto.request.NewUserRequestDto;
import com.d208.feelroom.recommendation.dto.request.UserActivityRequestDto;
import com.d208.feelroom.recommendation.service.RecommendationService;
import com.d208.feelroom.recommendation.service.UserActivityService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@Tag(name = "AI 추천 알고리즘 API", description = "추천 영화, 리뷰 데이터 가져오는 API")
@RestController
@Slf4j
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;
    private final MovieRepository movieRepository;
    private final UserActivityService userActivityService;

    @GetMapping("/recommendation/movies")
    public ResponseEntity<List<LikedMovieInfo>> getRecommendedMovies(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        // 1. 현재 로그인한 사용자의 활동 내역을 DB에서 조회
        Long userId = userDetails.getUser().getUserId();
        UserActivityRequestDto userActivity = userActivityService.getUserActivity(userId);
        log.info("사용자 활동 데이터: {}", userActivity); // 추가
        List<Integer> recommendedtmdbIds = null;
        // 2. 서비스 호출하여 추천 영화 ID 목록 받기
        if(userActivity.getLikedMovieIds().isEmpty() && userActivity.getReviewedMovieIds().isEmpty()){
            NewUserRequestDto newUserRequestDto = userActivityService.getNewUserActivity(userId);
            log.info("신규 사용자 데이터: {}", newUserRequestDto); // 추가
            recommendedtmdbIds = recommendationService.getNewUserRecommendations(newUserRequestDto);
        }
       else recommendedtmdbIds = recommendationService.getUserRecommendations(userActivity);

        // 3. 추천된 영화 ID가 없는 경우, 빈 리스트를 반환
        if (recommendedtmdbIds == null || recommendedtmdbIds.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        log.info("AI 서버에서 받은 영화 tmdb ID들: {}", recommendedtmdbIds); // 추가

        // 4. 받은 ID 목록으로 우리 DB에서 LikedMovieInfo DTO 목록을 직접 조회
        List<LikedMovieInfo> recommendedMovies = movieRepository.findLikedMovieInfoByTmdbIds(recommendedtmdbIds);

        // 5. 조회된 DTO 리스트를 클라이언트에 반환 (HTTP 200 OK)
        return ResponseEntity.ok(recommendedMovies);
    }
}
