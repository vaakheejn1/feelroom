package com.d208.feelroom.review.controller;

import com.d208.feelroom.comment.dto.CommentCreateRequestDto;
import com.d208.feelroom.comment.dto.CommentCreateResponseDto;
import com.d208.feelroom.comment.dto.CommentNodeDto;
import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.review.dto.*;
import com.d208.feelroom.comment.service.CommentService;
import com.d208.feelroom.review.service.ReviewService;
import com.d208.feelroom.review.service.ReviewTagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@Tag(name = "4. Review Management", description = "리뷰 관리 API")
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CommentService commentService;
    private final ReviewTagService reviewTagService;

    @Operation(summary = "리뷰 상세 조회", description = "특정 리뷰의 상세 정보를 조회합니다. 누구나 접근 가능합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(schema = @Schema(implementation = ReviewDetailResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDetailResponseDto> getReviewById(
            @Parameter(description = "조회할 리뷰의 ID") @PathVariable UUID reviewId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails){
        // userId를 null로 초기화하여, 인증되지 않은 경우 null이 되도록 합니다.
        Long userId = null;

        // userDetails가 null이 아닌 경우에만 userId를 추출합니다.
        if (userDetails != null) {
            if (userDetails.getUser() != null) {
                userId = userDetails.getUser().getUserId();
            }
        }
        ReviewDetailResponseDto responseDto = reviewService.findReviewById(reviewId, userId);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(
            summary = "리뷰 생성",
            description = "새로운 영화 리뷰를 작성합니다. 인증된 사용자만 호출할 수 있습니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "리뷰 생성 성공", content = @Content(schema = @Schema(implementation = ReviewCreateResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "입력값 유효성 검사 실패"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰이 없거나 유효하지 않음)"),
            @ApiResponse(responseCode = "404", description = "관련 리소스 찾기 실패 (영화/태그 등)")
    })
    @PostMapping
    public ResponseEntity<ReviewCreateResponseDto> createReview(
            // 1. @AuthenticationPrincipal을 사용하여 SecurityContext에 저장된 인증된 사용자 정보를 주입받습니다.
            @Parameter(hidden = true) // Swagger 문서에서는 이 파라미터를 숨깁니다. (헤더로 인증하므로)
            @AuthenticationPrincipal UserDetailsImpl userDetails,

            // 2. @Valid와 @RequestBody는 그대로 사용합니다.
            @Valid @RequestBody ReviewCreateRequestDto requestDto) {

        // 3. UserDetailsImpl 객체에서 User 엔티티를 꺼내고, 거기서 userId를 얻습니다.
        Long userId = null;

        // userDetails가 null이 아닌 경우에만 userId를 추출합니다.
        if (userDetails != null) {
            if (userDetails.getUser() != null) {
                userId = userDetails.getUser().getUserId();
            }
        }

        // 4. 서비스 로직 호출
        ReviewCreateResponseDto responseDto = reviewService.createReview(userId, requestDto);

        // 5. 생성된 리소스의 URI와 함께 201 Created 응답 반환
        URI location = URI.create(String.format("/api/v1/reviews/%s", responseDto.getReviewId()));
        return ResponseEntity.created(location).body(responseDto);
    }

    @Operation(
            summary = "리뷰 수정",
            description = "특정 리뷰를 수정합니다. 본인이 작성한 리뷰만 수정할 수 있습니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "리뷰 수정 성공"),
            @ApiResponse(responseCode = "400", description = "입력값 유효성 검사 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (Forbidden)"),
            @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    @PatchMapping("/{reviewId}")
    public ResponseEntity<ReviewUpdateResponseDto> updateReview(
            @Parameter(description = "수정할 리뷰의 ID") @PathVariable UUID reviewId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ReviewUpdateRequestDto requestDto) {

        Long userId = userDetails.getUser().getUserId();
        reviewService.updateReview(reviewId, userId, requestDto);

        ReviewUpdateResponseDto responseDto = new ReviewUpdateResponseDto(reviewId, "리뷰가 성공적으로 수정되었습니다.");
        return ResponseEntity.ok(responseDto);
    }

    @Operation(
            summary = "리뷰 삭제",
            description = "특정 리뷰를 삭제합니다. 본인이 작성한 리뷰만 삭제할 수 있습니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "리뷰 삭제 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (Forbidden)"),
            @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @Parameter(description = "삭제할 리뷰의 ID") @PathVariable UUID reviewId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getUser().getUserId();
        reviewService.deleteReview(reviewId, userId);

        return ResponseEntity.noContent().build(); // 성공 시 204 No Content 응답
    }

//    @Operation(
//            summary = "리뷰에 대한 나의 상태 조회",
//            description = "특정 리뷰에 대해 현재 로그인한 사용자가 '좋아요'를 눌렀는지 등의 상태를 조회합니다. 인증이 필요합니다.",
//            security = @SecurityRequirement(name = "bearerAuth")
//    )
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "200", description = "상태 조회 성공", content = @Content(schema = @Schema(implementation = ReviewMyStatusResponseDto.class))),
//            @ApiResponse(responseCode = "401", description = "인증 실패"),
//            @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
//    })
//    @GetMapping("/{reviewId}/my-status")
//    public ResponseEntity<ReviewMyStatusResponseDto> getMyStatusForReview(
//            @Parameter(description = "상태를 조회할 리뷰의 ID") @PathVariable UUID reviewId,
//            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {
//
//        Long currentUserId = userDetails.getUser().getUserId();
//
//        ReviewMyStatusResponseDto responseDto = reviewService.getMyStatusForReview(reviewId, currentUserId);
//        return ResponseEntity.ok(responseDto);
//    }

    /**
     * 댓글 생성 api
     */

    @Operation(summary = "리뷰에 댓글/대댓글 생성", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{reviewId}/comments")
    public ResponseEntity<CommentCreateResponseDto> createComment(
            @Parameter(description = "댓글을 작성할 리뷰 ID") @PathVariable UUID reviewId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CommentCreateRequestDto requestDto) {

        Long userId = userDetails.getUser().getUserId();
        CommentCreateResponseDto responseDto = commentService.createComment(userId, reviewId, requestDto);

        // 생성된 리소스의 URI를 Location 헤더에 담아 201 Created 응답
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{commentId}")
                .buildAndExpand(responseDto.getCommentId())
                .toUri();

        return ResponseEntity.created(location).body(responseDto);
    }

    @Operation(summary = "리뷰의 댓글/대댓글 목록 조회 (2계층)")
    // Swagger에서 페이징 파라미터를 명시적으로 문서화하기 위한 어노테이션
    @Parameters({
            @Parameter(name = "page", description = "페이지 번호 (0부터 시작)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0")),
            @Parameter(name = "size", description = "페이지 당 댓글 수", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "10")),
            @Parameter(name = "sort", description = "정렬 기준 (사용 불가, 생성 시간 순으로 고정)", in = ParameterIn.QUERY, schema = @Schema(type = "string"), hidden = true)
    })
    @GetMapping("/{reviewId}/comments")
    public ResponseEntity<Page<CommentNodeDto>> getCommentsByReview(
            @Parameter(description = "댓글 목록을 조회할 리뷰 ID", required = true) @PathVariable UUID reviewId,
            @Parameter(hidden = true) Pageable pageable,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) { // Spring이 page, size 파라미터를 자동으로 바인딩

        // 서비스 로직에서 정렬을 처리하므로, 컨트롤러에서는 정렬 조건을 강제하지 않음
        // PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()) 형태로 사용해도 무방
        Long userId = userDetails.getUser().getUserId();
        Page<CommentNodeDto> commentPage = commentService.findCommentsByReview(reviewId, pageable, userId);
        return ResponseEntity.ok(commentPage);
    }

    @Operation(summary = "리뷰 좋아요 토글", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/reviews/{reviewId}/like") // 예시 경로
    public ResponseEntity<ReviewMyStatusResponseDto> toggleReviewLike( // 반환 타입을 DTO로 변경
                                                                       @PathVariable UUID reviewId,
                                                                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getUser().getUserId();

        // 서비스가 DTO를 직접 반환
        ReviewMyStatusResponseDto responseDto = reviewService.toggleReviewLike(reviewId, userId);

        // DTO를 본문에 담아 200 OK 응답
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "리뷰 정보 기반 태그 추천 (임시 구현)",
            description = "리뷰 내용, 영화 ID, 평점을 받아 분석 후 추천 태그 목록을 반환합니다. (현재는 하드코딩된 임시 데이터 반환)")
    @PostMapping("/tags/recommend")
    public ResponseEntity<ReviewTagRecommendResponseDto> recommendTags(
            @Valid @RequestBody ReviewTagRecommendRequestDto requestDto) { // @Valid 추가

        ReviewTagRecommendResponseDto responseDto = reviewTagService.recommendTagsFromContent(requestDto);

        return ResponseEntity.ok(responseDto);
    }

    /**
     * SNS 피드처럼 나와 내가 팔로우하는 사용자들의 리뷰를 최신순으로 조회합니다.
     * 무한 스크롤 방식을 지원합니다.
     */
    @Operation(summary = "리뷰 피드 조회 (무한 스크롤)",
            description = "나와 내가 팔로우하는 사용자들의 리뷰를 최신순으로 조회합니다. 인증이 필요합니다.")
    @GetMapping("/feed/following")
    public ResponseEntity<ReviewFeedResponseDto> getReviewFeed(
            @PageableDefault(size = 10, page = 0)
            @Parameter(description = "페이지 정보 (size, page). 최초 호출시 ?size=10&page=0")
            Pageable pageable,

            @Parameter(hidden = true) // Swagger 문서에서는 숨김 처리
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        // Spring Security 설정에 의해 인증된 사용자만 이 API에 접근할 수 있어야 합니다.
        // 따라서 userDetails는 null이 아니라고 가정합니다.
        Long currentUserId = userDetails.getUser().getUserId();

        // 서비스 로직을 호출하여 피드 데이터를 가져옵니다.
        ReviewFeedResponseDto response = reviewService.getReviewFeed(currentUserId, pageable);

        return ResponseEntity.ok(response);
    }

    /**
     * 전체 리뷰 중 인기 리뷰를 조회합니다. (Top N개)
     * 이 피드는 Redis Sorted Set을 기반으로 합니다.
     */
    @Operation(summary = "인기 리뷰 피드 조회",
            description = "전체 리뷰 중 인기 리뷰를 점수 순으로 조회합니다. (시간 감쇠 알고리즘 적용)")
    @GetMapping("/feed/popular")
    public ResponseEntity<ReviewFeedResponseDto> getPopularReviewFeed(
            @PageableDefault(size = 10, page = 0) // size: 가져올 개수 (예: Top 10)
            @Parameter(description = "페이지 정보 (size, page). 일반적으로 page는 0으로 고정하고 size만 조절합니다.")
            Pageable pageable,

            @Parameter(hidden = true) // Swagger 문서에서는 숨김 처리 (로그인 상태를 가져와 좋아요 여부 판단)
            @AuthenticationPrincipal(expression = "user") UserDetailsImpl userDetails) { // null 허용, 로그인하지 않아도 조회 가능

        Long currentUserId = (userDetails != null) ? userDetails.getUser().getUserId() : null; // 로그인 안했으면 null

        // 서비스 로직 호출
        ReviewFeedResponseDto response = reviewService.getPopularReviewFeed(pageable, currentUserId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "AI 추천 리뷰 피드 조회",
            description = "사용자 맞춤형 AI 추천 리뷰를 조회합니다.")
    @GetMapping("/feed/ai-recommended")
    public ResponseEntity<ReviewFeedResponseDto> getAiRecommendedReviewFeed(
            @PageableDefault(size = 10, page = 0)
            @Parameter(description = "페이지 정보 (size, page)")
            Pageable pageable,

            @Parameter(hidden = true)
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        // 로그인 필수 (AI 추천은 개인화가 필요)
        if (userDetails == null) {
            throw new IllegalArgumentException("AI 추천 피드는 로그인이 필요합니다.");
        }

        Long currentUserId = userDetails.getUser().getUserId();

        // 서비스 로직 호출
        ReviewFeedResponseDto response = reviewService.getAiRecommendedReviewFeed(pageable, currentUserId);

        return ResponseEntity.ok(response);
    }
}