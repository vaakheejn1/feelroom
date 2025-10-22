package com.d208.feelroom.movie.controller;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
//import com.d208.feelroom.movie.domain.entity.MovieNow;
import com.d208.feelroom.movie.domain.entity.TempMovieNow;
// ===============================================
import com.d208.feelroom.review.dto.ReviewListResponseDto;
//import com.d208.feelroom.movie.service.scheduler.MovieNowService;
import com.d208.feelroom.movie.dto.*;
import com.d208.feelroom.movie.service.scheduler.MovieNowService;
import com.d208.feelroom.movie.service.MovieService;
import com.d208.feelroom.movie.service.scheduler.TmdbChangesService;
import com.d208.feelroom.movie.service.scheduler.TmdbMovieImportService;
import io.swagger.v3.oas.annotations.Operation;
// ========== 🆕 새로 추가할 import ==========
import io.swagger.v3.oas.annotations.Parameter;
// ===============================================
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
// ========== 🆕 새로 추가할 import ==========
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
// ===============================================

@Tag(name = "3. Movie Information", description = "영화 정보 API")
@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
@Slf4j
public class MovieController {

    private final MovieService movieService;
    private final MovieNowService movieNowService;
    private final TmdbMovieImportService tmdbMovieImportService;
    private final TmdbChangesService tmdbChangesService; // 의존성 추가

    // ========== 기존 메서드 (수정 없음) ==========
    @Operation(
            summary = "영화 상세정보 조회",
            description = "해당 movieId에 해당하는 영화의 상세 정보를 볼 수 있습니다",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "영화 상세정보 조회 성공"),
            @ApiResponse(responseCode = "400", description = "입력값 유효성 검사 실패"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰이 없거나 유효하지 않음)"),
            @ApiResponse(responseCode = "404", description = "관련 리소스 찾기 실패 (영화/태그 등)")
    })
    @GetMapping("/{movieId}")
    public ResponseEntity<?> searchMovieById(
            @PathVariable int movieId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // 비로그인 사용자도 조회 가능하도록 처리
        Long userId = (userDetails != null) ? userDetails.getUser().getUserId() : null;

        MovieResponseDto movieDetail = movieService.getMovieDetail(movieId, userId);
        return ResponseEntity.ok(movieDetail);
    }
    // ===============================================

    // ========== 새로 추가할 메서드 ==========
    @Operation(
            summary = "특정 영화 리뷰 목록 조회",
            description = "특정 영화의 리뷰 목록을 페이지별로 조회합니다. 정렬 기준: likes(좋아요순), comments(댓글순), latest(최신순)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "리뷰 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = ReviewListResponseDto.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터"),
            @ApiResponse(responseCode = "404", description = "영화를 찾을 수 없음")
    })
    @GetMapping("/{movieId}/reviews")
    public ResponseEntity<ReviewListResponseDto> getMovieReviews(
            @Parameter(description = "영화 ID", required = true)
            @PathVariable Integer movieId,

            @Parameter(description = "정렬 기준 (likes/comments/latest)", example = "latest")
            @RequestParam(defaultValue = "latest") String sortBy,

            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        // userId를 null로 초기화하여, 인증되지 않은 경우 null이 되도록 합니다.
        Long userId = null;

        // userDetails가 null이 아닌 경우에만 userId를 추출합니다.
        if (userDetails != null) {
            if (userDetails.getUser() != null) {
                userId = userDetails.getUser().getUserId();
            }
        }
        ReviewListResponseDto response = movieService.getMovieReviews(movieId, sortBy, page, size, userId);
        return ResponseEntity.ok(response);
    }
    // ===============================================

    /**
     * 영화 좋아요 토글
     */
    @Operation(
            summary = "영화 좋아요 토글",
            description = "특정 영화의 좋아요를 토글합니다. 좋아요가 있으면 취소하고, 없으면 추가합니다. 인증이 필요합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좋아요 토글 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "영화를 찾을 수 없음")
    })
    @PutMapping("/{movieId}/like")
    public ResponseEntity<MovieMyStatusResponseDto> toggleMovieLike(
            @Parameter(description = "토글할 영화 ID") @PathVariable Integer movieId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long currentUserId = userDetails.getUser().getUserId();

        boolean isLiked = movieService.toggleMovieLike(movieId, currentUserId);

        if (isLiked) {
            return ResponseEntity.ok(new MovieMyStatusResponseDto(true));
        } else {
            return ResponseEntity.ok(new MovieMyStatusResponseDto(false));
        }
    }

    // ========== KOBIS API 관련 엔드포인트 (완전 자동화) ==========


    /**
     * 수동으로 일별 박스오피스 데이터 가져와서 임시 테이블에 저장
     */
    @Operation(
            summary = "일별 박스오피스 데이터 가져오기",
            description = "KOBIS API에서 특정 날짜의 박스오피스 데이터를 가져와서 temp_movie_now 테이블에 저장합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "박스오피스 데이터 저장 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 날짜 형식"),
            @ApiResponse(responseCode = "500", description = "API 호출 또는 데이터 저장 중 오류")
    })
    @PostMapping("/fetch-boxoffice")
    public ResponseEntity<String> fetchBoxOffice(
            @Parameter(description = "가져올 날짜 (YYYY-MM-DD 형식)", example = "2024-01-15")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            movieNowService.fetchAndSaveBoxOfficeData(date);
            return ResponseEntity.ok("Successfully fetched and saved daily box office data to temp table for " + date);
        } catch (Exception e) {
            log.error("박스오피스 데이터 가져오기 실패: date={}", date, e);
            return ResponseEntity.internalServerError()
                    .body("Error fetching or saving data: " + e.getMessage());
        }
    }

    /**
     * 임시 테이블의 박스오피스 데이터 조회
     */
    @Operation(
            summary = "임시 테이블 박스오피스 데이터 조회",
            description = "temp_movie_now 테이블에서 특정 날짜의 박스오피스 데이터를 조회합니다."
    )
    @GetMapping("/temp-daily-ranking")
    public ResponseEntity<List<TempMovieNow>> getTempDailyRanking(
            @Parameter(description = "조회할 날짜 (YYYY-MM-DD 형식)", example = "2024-01-15")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<TempMovieNow> tempData = movieNowService.getTempDataByDate(date);

        if (tempData.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(tempData);
    }

    /**
     * 매칭되지 않은 영화명 목록 조회
     */
    @Operation(
            summary = "매칭되지 않은 영화명 목록 조회",
            description = "temp_movie_now 테이블에서 아직 매칭되지 않은 영화명들의 목록을 조회합니다."
    )
    @GetMapping("/unmatched-movies")
    public ResponseEntity<List<String>> getUnmatchedMovies() {
        List<String> unmatchedMovies = movieNowService.getUnmatchedMovieNames();

        if (unmatchedMovies.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(unmatchedMovies);
    }

    /**
     * TMDB upcoming movies 수동 동기화
     */
    @Operation(
            summary = "TMDB upcoming movies 동기화",
            description = "TMDB API에서 upcoming movies 데이터를 가져와서 DB에 저장합니다. 이미 존재하는 영화는 스킵됩니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "동기화 성공"),
            @ApiResponse(responseCode = "500", description = "동기화 중 오류 발생")
    })
    @PostMapping("/sync-upcoming")
    public ResponseEntity<String> syncUpcomingMovies() {
        try {
            TmdbMovieImportService.SyncResult result = tmdbMovieImportService.syncUpcomingMovies();

            String message = String.format(
                    "TMDB upcoming movies 동기화 완료 - 처리된 영화: %d, 새로 추가된 영화: %d, 스킵된 영화: %d, 오류: %d",
                    result.totalProcessed, result.newMovies, result.skippedMovies, result.errors
            );

            log.info(message);
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("TMDB upcoming movies 동기화 실패", e);
            return ResponseEntity.internalServerError()
                    .body("동기화 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * TMDB Changes API로 영화 평점 수동 업데이트 (어제)
     */
    @Operation(
            summary = "영화 평점 수동 업데이트 (어제)",
            description = "TMDB Changes API를 사용해 어제 변경된 영화들의 평점 정보를 업데이트합니다."
    )
    @PostMapping("/update-ratings-yesterday")
    public ResponseEntity<TmdbChangesService.UpdateResult> updateRatingsYesterday() {
        try {
            TmdbChangesService.UpdateResult result = tmdbChangesService.updateMovieRatings();

            String message = String.format(
                    "영화 평점 업데이트 완료 - 확인: %d개, 업데이트: %d개, 오류: %d개",
                    result.totalChecked, result.updated, result.errors
            );

            log.info(message);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("영화 평점 업데이트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== 현재 상영작 관련 엔드포인트 ==========

    /**
     * 현재 상영작 영화 목록 조회 (매칭되지 않은 영화 포함)
     */
    @Operation(
            summary = "현재 상영작 영화 목록 조회",
            description = "가장 최근 박스오피스 랭킹 기준으로 현재 상영작 영화 목록을 조회합니다. 매칭되지 않은 영화는 movieId가 9999999로 표시됩니다. 인증 불필요합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "현재 상영작 목록 조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(
                                    type = "array",
                                    implementation = CurrentMovieResponseDto.class
                            )
                    )
            ),
            @ApiResponse(responseCode = "204", description = "현재 상영작 데이터가 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/now")
    public ResponseEntity<List<CurrentMovieResponseDto>> getCurrentMovies() {
        try {
            List<CurrentMovieResponseDto> currentMovies = movieNowService.getCurrentMovies();

            if (currentMovies.isEmpty()) {
                log.info("현재 상영작 데이터가 없습니다.");
                return ResponseEntity.noContent().build();
            }

            log.info("현재 상영작 {} 개 영화 반환 (매칭 실패 포함)", currentMovies.size());
            return ResponseEntity.ok(currentMovies);

        } catch (Exception e) {
            log.error("현재 상영작 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 날짜 현재 상영작 조회 (매칭되지 않은 영화 포함)
     */
    @Operation(
            summary = "특정 날짜 현재 상영작 조회",
            description = "특정 날짜의 박스오피스 랭킹 기준으로 현재 상영작 영화 목록을 조회합니다. 매칭되지 않은 영화는 movieId가 9999999로 표시됩니다."
    )
    @GetMapping("/now/{date}")
    public ResponseEntity<List<CurrentMovieResponseDto>> getCurrentMoviesByDate(
            @Parameter(description = "조회할 날짜 (YYYY-MM-DD 형식)", example = "2024-01-15")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        try {
            List<CurrentMovieResponseDto> currentMovies = movieNowService.getCurrentMoviesByDate(date);

            if (currentMovies.isEmpty()) {
                log.info("해당 날짜의 상영작 데이터가 없습니다: {}", date);
                return ResponseEntity.noContent().build();
            }

            log.info("{} 날짜의 상영작 {} 개 영화 반환 (매칭 실패 포함)", date, currentMovies.size());
            return ResponseEntity.ok(currentMovies);

        } catch (Exception e) {
            log.error("특정 날짜 상영작 조회 중 오류 발생: date={}", date, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * temp 테이블에서 현재 상영작 조회 (디버깅용)
     */
    @Operation(
            summary = "temp 테이블에서 현재 상영작 조회",
            description = "temp_movie_now 테이블에서 특정 날짜의 데이터를 조회합니다. 매칭 상태와 관계없이 모든 데이터를 반환합니다."
    )
    @GetMapping("/now/temp/{date}")
    public ResponseEntity<List<CurrentMovieResponseDto>> getCurrentMoviesFromTemp(
            @Parameter(description = "조회할 날짜 (YYYY-MM-DD 형식)", example = "2024-01-15")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        try {
            List<CurrentMovieResponseDto> currentMovies = movieNowService.getCurrentMoviesFromTempByDate(date);

            if (currentMovies.isEmpty()) {
                log.info("해당 날짜의 temp 상영작 데이터가 없습니다: {}", date);
                return ResponseEntity.noContent().build();
            }

            log.info("{} 날짜의 temp 상영작 {} 개 영화 반환", date, currentMovies.size());
            return ResponseEntity.ok(currentMovies);

        } catch (Exception e) {
            log.error("temp 상영작 조회 중 오류 발생: date={}", date, e);
            return ResponseEntity.internalServerError().build();
        }
    }


    // ========== 관리자용 매칭 및 동기화 엔드포인트 ==========

//    @Operation(
//            summary = "TMDB 영화 데이터 Elasticsearch 인덱싱",
//            description = "모든 TMDB 영화 데이터를 Elasticsearch에 인덱싱합니다. 매칭 작업 전에 한 번 실행해야 합니다."
//    )
//    @PostMapping("/index-movies")
//    public ResponseEntity<String> indexMoviesToElasticsearch() {
//        try {
//            movieNowService.indexAllMoviesToElasticsearch();
//            return ResponseEntity.ok("영화 데이터 Elasticsearch 인덱싱이 완료되었습니다.");
//        } catch (Exception e) {
//            log.error("영화 데이터 인덱싱 실패", e);
//            return ResponseEntity.internalServerError()
//                    .body("인덱싱 중 오류가 발생했습니다: " + e.getMessage());
//        }
//    }

//    @Operation(
//            summary = "KOBIS-TMDB 영화 매칭 (특정 날짜)",
//            description = "특정 날짜의 KOBIS 박스오피스 데이터를 TMDB 영화와 매칭하여 movie_now 테이블에 저장합니다."
//    )
//    @PostMapping("/match-movies")
//    public ResponseEntity<MovieMatchingDto.MatchingResult> matchKobisWithTmdb(
//            @Parameter(description = "매칭할 날짜 (YYYY-MM-DD 형식)", example = "2024-01-15")
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//
//        try {
//            MovieMatchingDto.MatchingResult result = movieNowService.matchKobisWithTmdbByDate(date);
//            log.info("매칭 완료: {}", result.getSummary());
//            return ResponseEntity.ok(result);
//        } catch (Exception e) {
//            log.error("KOBIS-TMDB 매칭 중 오류 발생: date={}", date, e);
//            return ResponseEntity.internalServerError().build();
//        }
//    }

//    @Operation(
//            summary = "최근 박스오피스 자동 매칭",
//            description = "어제의 KOBIS 박스오피스 데이터를 TMDB 영화와 자동으로 매칭합니다."
//    )
//    @PostMapping("/match-recent")
//    public ResponseEntity<MovieMatchingDto.MatchingResult> matchRecentBoxOffice() {
//        try {
//            MovieMatchingDto.MatchingResult result = movieNowService.matchRecentBoxOffice();
//            log.info("최근 박스오피스 매칭 완료: {}", result.getSummary());
//            return ResponseEntity.ok(result);
//        } catch (Exception e) {
//            log.error("최근 박스오피스 매칭 중 오류 발생", e);
//            return ResponseEntity.internalServerError().build();
//        }
//    }

//    @Operation(
//            summary = "전체 박스오피스 매칭 프로세스",
//            description = "KOBIS API에서 데이터를 가져와서 TMDB와 매칭한 후 movie_now에 저장하는 전체 프로세스를 실행합니다."
//    )
//    @PostMapping("/full-process")
//    public ResponseEntity<String> runFullBoxOfficeProcess(
//            @Parameter(description = "처리할 날짜 (YYYY-MM-DD 형식)", example = "2024-01-15")
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//
//        LocalDate targetDate = (date != null) ? date : LocalDate.now().minusDays(1);
//
//        try {
//            // 1단계: KOBIS 데이터 가져오기
//            log.info("1단계: KOBIS 박스오피스 데이터 가져오기 - {}", targetDate);
//            movieNowService.fetchAndSaveBoxOfficeData(targetDate);
//
//            // 2단계: 매칭 실행
//            log.info("2단계: KOBIS-TMDB 매칭 실행 - {}", targetDate);
//            MovieMatchingDto.MatchingResult matchingResult = movieNowService.matchKobisWithTmdbByDate(targetDate);
//
//            String summary = String.format(
//                    "전체 프로세스 완료 - 날짜: %s, %s",
//                    targetDate,
//                    matchingResult.getSummary()
//            );
//
//            log.info(summary);
//            return ResponseEntity.ok(summary);
//
//        } catch (Exception e) {
//            log.error("전체 박스오피스 프로세스 실행 중 오류 발생: date={}", targetDate, e);
//            return ResponseEntity.internalServerError()
//                    .body("프로세스 실행 중 오류가 발생했습니다: " + e.getMessage());
//        }
//    }

//    /**
//     * 👤 Full Process 수동 실행 (DB 우선 매칭)
//     */
//    @Operation(
//            summary = "Full Process 수동 실행 (DB 우선)",
//            description = "관리자용: DB 우선 매칭으로 박스오피스 데이터 수집 및 매칭을 수동으로 실행합니다."
//    )
//    @PostMapping("/admin/manual-full-process")
//    public ResponseEntity<MovieMatchingDto.MatchingResult> manualFullProcess(
//            @Parameter(description = "처리할 날짜 (생략시 어제)", example = "2025-08-05")
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//        try {
//            log.info("👤 [수동] Full Process 시작 - DB 우선 매칭");
//
//            MovieMatchingDto.MatchingResult result;
//            if (date != null) {
//                result = movieNowService.executeFullBoxOfficeProcess(date);
//            } else {
//                result = movieNowService.executeFullBoxOfficeProcess(); // 어제 날짜
//            }
//
//            log.info("✅ [수동] Full Process 완료 - DB 우선 매칭");
//            return ResponseEntity.ok(result);
//
//        } catch (Exception e) {
//            log.error("❌ [수동] Full Process 실패", e);
//            return ResponseEntity.status(500).build();
//        }
//    }
//    /**
//     * 👤 Elasticsearch 수동 재인덱싱 (보완용)
//     */
//    @Operation(
//            summary = "Elasticsearch 수동 재인덱싱 (보완용)",
//            description = "관리자용: Elasticsearch 재인덱싱을 수동으로 실행합니다. DB 매칭이 우선이므로 선택적으로 사용하세요."
//    )
//    @PostMapping("/admin/manual-reindex-elasticsearch")
//    public ResponseEntity<String> manualReindexElasticsearch() {
//        try {
//            log.info("👤 [수동] Elasticsearch 재인덱싱 시작 - 매칭 품질 향상용");
//
//            movieNowService.executeElasticsearchReindexing();
//
//            return ResponseEntity.ok("✅ Elasticsearch 재인덱싱이 완료되었습니다. 향후 매칭 품질이 향상됩니다.");
//
//        } catch (Exception e) {
//            log.error("❌ [수동] Elasticsearch 재인덱싱 실패", e);
//            return ResponseEntity.status(500)
//                    .body("❌ 재인덱싱 실패: " + e.getMessage() +
//                            " (DB 매칭은 정상 동작합니다)");
//        }
//    }

//    @Operation(
//            summary = "전체 프로세스 수동 실행",
//            description = "관리자용: Full Process 실행 후 Elasticsearch 재인덱싱까지 순차적으로 실행합니다."
//    )
//    @PostMapping("/admin/manual-complete-process")
//    public ResponseEntity<Map<String, Object>> manualCompleteProcess(
//            @Parameter(description = "처리할 날짜 (생략시 어제)", example = "2025-08-05")
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//
//        Map<String, Object> result = new HashMap<>();
//
//        try {
//            log.info("👤 [수동] 전체 프로세스 시작 - DB 우선 매칭 + ES 재인덱싱");
//            long totalStartTime = System.currentTimeMillis();
//
//            // 1단계: Full Process (DB 우선 매칭)
//            log.info("🎬 1단계: Full Process 실행");
//            MovieMatchingDto.MatchingResult matchingResult;
//            if (date != null) {
//                matchingResult = movieNowService.executeFullBoxOfficeProcess(date);
//            } else {
//                matchingResult = movieNowService.executeFullBoxOfficeProcess();
//            }
//            result.put("fullProcessResult", matchingResult);
//
//            // 2단계: Elasticsearch 재인덱싱
//            log.info("🔍 2단계: Elasticsearch 재인덱싱");
//            try {
//                movieNowService.executeElasticsearchReindexing();
//                result.put("reindexingStatus", "success");
//            } catch (Exception e) {
//                log.warn("⚠️ Elasticsearch 재인덱싱 실패, DB 매칭은 정상 동작", e);
//                result.put("reindexingStatus", "failed");
//                result.put("reindexingError", e.getMessage());
//            }
//
//            long totalDuration = (System.currentTimeMillis() - totalStartTime) / 1000;
//            result.put("totalDuration", totalDuration + "초");
//            result.put("status", "completed");
//
//            log.info("✅ [수동] 전체 프로세스 완료 ({}초)", totalDuration);
//            return ResponseEntity.ok(result);
//
//        } catch (Exception e) {
//            log.error("❌ [수동] 전체 프로세스 실패", e);
//            result.put("status", "failed");
//            result.put("error", e.getMessage());
//            return ResponseEntity.status(500).body(result);
//        }
//    }

    @Operation(
            summary = "온보딩용 영화 목록 조회",
            description = "온보딩 화면에서 사용할 영화 목록을 조회합니다. 다양한 장르의 인기작들로 구성되어 있습니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "온보딩 영화 목록 조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(type = "array", implementation = OnboardingMovieResponseDto.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
    })
    @GetMapping("/onboarding")
    public ResponseEntity<List<OnboardingMovieResponseDto>> getOnboardingMovies(
            @Parameter(description = "조회할 영화 개수 (최대 100)", example = "60")
            @RequestParam(defaultValue = "60") int limit
    ) {
        try {
            // limit 유효성 검사
            if (limit <= 0) {
                limit = 60;
            } else if (limit > 100) {
                limit = 100;
            }

            List<OnboardingMovieResponseDto> onboardingMovies = movieService.getOnboardingMovies(limit);

            return ResponseEntity.ok(onboardingMovies);

        } catch (Exception e) {
            log.error("온보딩 영화 목록 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "인기 영화 목록 조회",
            description = "현재 인기 있는 영화 목록을 랭킹 순으로 30개 조회합니다. 랭킹은 스케줄러에 의해 주기적으로 업데이트됩니다.")
    @GetMapping("/popular")
    public ResponseEntity<List<PopularMovieResponseDto>> getPopularMovies() {
        // 서비스 레이어를 호출하여 상위 30개의 인기 영화 목록을 가져옵니다.
        List<PopularMovieResponseDto> popularMovies = movieService.getPopularMovies();
        return ResponseEntity.ok(popularMovies);
    }
}