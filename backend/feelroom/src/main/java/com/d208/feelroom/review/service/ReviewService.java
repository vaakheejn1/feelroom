package com.d208.feelroom.review.service;

import com.d208.feelroom.badge.event.EventPublisher;
import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.recommendation.dto.request.UserActivityRequestDto;
import com.d208.feelroom.recommendation.service.RecommendationService;
import com.d208.feelroom.recommendation.service.UserActivityService;
import com.d208.feelroom.review.domain.entity.tag.ReviewTag;
import com.d208.feelroom.review.exception.TagNotFoundException;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.review.domain.entity.ReviewLike;
import com.d208.feelroom.review.domain.entity.tag.Tag;
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.review.domain.repository.TagRepository;
import com.d208.feelroom.movie.exception.MovieNotFoundException;
import com.d208.feelroom.movie.service.MovieService;
import com.d208.feelroom.review.dto.*;
import com.d208.feelroom.review.event.ReviewChangedEvent;
import com.d208.feelroom.review.event.ReviewInteractionEvent;
import com.d208.feelroom.review.event.ReviewPopularityUpdateEvent;
import com.d208.feelroom.review.exception.ReviewAccessDeniedException;
import com.d208.feelroom.review.exception.ReviewNotFoundException;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.FollowRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.user.event.UserActivityEvent.ActivityType;
import com.d208.feelroom.global.util.UuidUtils;
import com.d208.feelroom.user.exception.UserNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.redis.core.RedisTemplate;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.d208.feelroom.global.util.UuidUtils.bytesToUUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final TagRepository tagRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final FollowRepository followRepository;
    private final EventPublisher eventPublisher;
    private final MovieService movieService;
    private final ApplicationEventPublisher appEventPublisher;
    private final RecommendationService recommendationService;
    private final UserActivityService userActivityService;
    private final RedisTemplate<String, Object> redisTemplate; // RedisTemplate<String, Object>로 변경
    private static final String POPULAR_REVIEWS_ZSET_KEY = "popular_reviews";

    @Transactional
    public ReviewCreateResponseDto createReview(Long userId, ReviewCreateRequestDto requestDto) {
        // 1. User와 Movie 엔티티 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Movie movie = movieRepository.findById(requestDto.getMovieId())
                .orElseThrow(() -> new MovieNotFoundException(requestDto.getMovieId()));

        // 2. Review 엔티티 생성 (@GeneratedValue 사용 가정, reviewId 직접 할당 안함)
        Review review = Review.builder()
                .user(user)
                .movie(movie)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .rating(requestDto.getRating())
                .build();

        // 3. Tag 처리 (수정된 부분)
        if (requestDto.getTagIds() != null && !requestDto.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findAllById(requestDto.getTagIds());

            if (tags.size() != requestDto.getTagIds().size()) {
                throw new TagNotFoundException("존재하지 않는 태그 ID가 포함되어 있습니다.");
            }

            // 3-3. Review 엔티티의 편의 메서드를 사용하여 Tag를 연결합니다.
            //      이 편의 메서드 내부에서 ReviewTag가 생성되고 리스트에 추가됩니다.
            for (Tag tag : tags) {
                review.addTag(tag);
            }
        }

        // 5. Review 저장 (Cascade 설정으로 ReviewTag와 ReviewSummary가 함께 저장됨)
        Review savedReview = reviewRepository.save(review);

        // 이벤트 발행! -- movieSummary
        appEventPublisher.publishEvent(new ReviewChangedEvent(
                savedReview.getMovie().getMovieId(),
                savedReview.getRating(),
                1
        ));

        // == 이벤트 발행 ==
        eventPublisher.publishUserActivity(userId, ActivityType.REVIEW_WRITE);

        movieService.evictMovieDetailsCache(savedReview.getMovie().getMovieId());
        log.info("===== 리뷰 생성 완료. 영화 ID: {}의 캐시를 삭제합니다. =====", requestDto.getMovieId());

        // 6. 응답 DTO 변환 및 반환
        return new ReviewCreateResponseDto(savedReview.getReviewId(), "리뷰 작성 완료");
    }

    @Transactional
    public void updateReview(UUID reviewId, Long userId, @Valid ReviewUpdateRequestDto requestDto) {
        // 1. 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 2. 권한 확인 (매우 중요!)
        if (!review.getUser().getUserId().equals(userId)) {
            throw new ReviewAccessDeniedException();
        }

        // 3. 태그 업데이트 (가장 간단한 방법: 기존 태그 모두 지우고 새로 추가)
        if (requestDto.getTagIds() != null) {
            review.getReviewTags().clear(); // orphanRemoval=true에 의해 DB에서 삭제됨
            if (!requestDto.getTagIds().isEmpty()) {
                List<Tag> newTags = tagRepository.findAllById(requestDto.getTagIds());
                if (newTags.size() != requestDto.getTagIds().size()) {
                    throw new TagNotFoundException("존재하지 않는 태그 ID가 포함되어 있습니다.");
                }
                for (Tag tag : newTags) {
                    review.addTag(tag);
                }
            }
        }

        // 4. 리뷰 내용 업데이트 (엔티티 내부의 update 메서드 호출)
        review.update(
                requestDto.getTitle(),
                requestDto.getContent(),
                requestDto.getRating()
        );

        movieService.evictMovieDetailsCache(review.getMovie().getMovieId());
        log.info("===== 리뷰 수정 완료. 영화 ID: {}의 캐시를 삭제합니다. =====", review.getMovie().getMovieId());
    }

    @Transactional
    public void deleteReview(UUID reviewId, Long userId) {
        // 1. 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 2. 권한 확인 (파라미터로 받은 userId와 바로 비교)
        if (!review.getUser().getUserId().equals(userId)) {
            throw new ReviewAccessDeniedException();
        }

        int movieId = review.getMovie().getMovieId();
        int rating = review.getRating();

        // 3. Soft Delete에 사용할 User 객체 조회
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId)); // 이론적으로 발생할 수 없는 예외


        // [이벤트 발행!] -- movieSummary
        // 리뷰가 성공적으로 삭제된 후 이벤트를 발행합니다.
        appEventPublisher.publishEvent(new ReviewChangedEvent(
                movieId,
                -rating, // 삭제된 평점만큼 빼기
                -1       // 카운트 -1
        ));

        appEventPublisher.publishEvent(new ReviewPopularityUpdateEvent(this, reviewId, ReviewPopularityUpdateEvent.EventType.DELETED));

        // 4. Soft Delete 처리
        review.softDelete(currentUser);
    }

    @Transactional(readOnly = true)
    public ReviewDetailResponseDto findReviewById(UUID reviewId, Long userId) {
        // 1. 리뷰와 연관된 엔티티들을 fetch join으로 한 번에 조회
        // ReviewSummary도 함께 fetch join되므로 별도의 쿼리가 필요 없습니다.
        Review review = reviewRepository.findReviewWithDetailsById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 2. ReviewSummary에서 이미 집계된 좋아요 및 댓글 수를 가져옵니다.
        // ReviewSummary가 null일 가능성을 대비 (아직 생성되지 않은 경우, 극히 드뭄)
        int totalLikes = review.getReviewSummary() != null
                ? review.getReviewSummary().getReviewLikeCount()
                : 0; // ReviewSummary가 없으면 0으로 초기화

        int totalComments = review.getReviewSummary() != null
                ? review.getReviewSummary().getReviewCommentCount()
                : 0; // ReviewSummary가 없으면 0으로 초기화

        // 3. 현재 사용자가 이 리뷰를 '좋아요' 했는지 상태만 확인
        // 이 쿼리는 유저별로 특정 리뷰에 좋아요를 눌렀는지 여부를 확인하는 것이므로, Summary 테이블과는 무관하게 필요합니다.
        boolean isLiked = reviewLikeRepository.existsById_ReviewIdAndId_UserId(reviewId, userId);

        // 4. Entity를 DTO로 변환하여 반환
        return new ReviewDetailResponseDto(review, totalLikes, totalComments, isLiked);
    }

//    @Transactional(readOnly = true)
//    public ReviewMyStatusResponseDto getMyStatusForReview(UUID reviewId, Long currentUserId) {
//        Review review = reviewRepository.findReviewWithDetailsById(reviewId) // ReviewSummary가 FETCH JOIN되도록
//                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
//
//        boolean isLiked = reviewLikeRepository.existsById_ReviewIdAndId_UserId(reviewId, currentUserId);
//
//        // ReviewSummary에서 좋아요 수 가져오기
//        int totalLikes = review.getReviewSummary() != null ? review.getReviewSummary().getReviewLikeCount() : 0;
//
//        return new ReviewMyStatusResponseDto(isLiked, totalLikes);
//    }

    /**
     * 리뷰 좋아요 토글 (있으면 삭제, 없으면 추가)
     * @param reviewId 리뷰 ID
     * @param userId   사용자 ID
     * @return 좋아요 토글 후의 최종 상태와 총 좋아요 수를 담은 DTO (추정치)
     */
    @Transactional
    public ReviewMyStatusResponseDto toggleReviewLike(UUID reviewId, Long userId) {
        // 1. 사용자 및 리뷰 존재 여부 확인 (ReviewSummary를 함께 로드하여 나중에 활용)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        // findById 대신 findReviewWithDetailsById를 사용하여 ReviewSummary를 미리 가져옵니다.
        Review review = reviewRepository.findReviewWithDetailsById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 2. 현재 좋아요 상태 확인 및 처리
        Optional<ReviewLike> reviewLikeOptional = reviewLikeRepository.findByReview_ReviewIdAndUser_UserId(reviewId, userId);

        boolean isNowLiked; // 토글 후의 최종 상태
        int likeChange;     // 좋아요 수 변경량 (+1 또는 -1)

        if (reviewLikeOptional.isPresent()) {
            // 이미 좋아요를 눌렀다면 취소
            reviewLikeRepository.delete(reviewLikeOptional.get());
            likeChange = -1;
            isNowLiked = false; // 좋아요 취소됨
        } else {
            // 좋아요를 누르지 않았다면 추가
            ReviewLike newReviewLike = ReviewLike.builder()
                    .user(user)
                    .review(review)
                    .build();
            reviewLikeRepository.save(newReviewLike);
            likeChange = +1;
            isNowLiked = true; // 좋아요 추가됨

            // == 이벤트 발생 == (리뷰 작성자에게 좋아요가 발생했음을 알림)
            eventPublisher.publishUserActivity(review.getUser().getUserId(), ActivityType.REVIEW_LIKE_RECEIVED);
            // 좋아요 수 변동 발생 -> 인기 점수 업데이트 이벤트 발행
            appEventPublisher.publishEvent(new ReviewPopularityUpdateEvent(this, reviewId, ReviewPopularityUpdateEvent.EventType.LIKED));
        }

        // 3. ReviewSummary 업데이트 이벤트를 발행 (비동기 처리)
        appEventPublisher.publishEvent(ReviewInteractionEvent.forLikeChange(this, reviewId, likeChange));

        // 4. 사용자에게 즉각적인 피드백을 주기 위한 '예상' 좋아요 수 계산
        // ReviewSummary의 현재 값 (아직 비동기 업데이트가 반영되지 않았을 수 있음)에 변경량을 더합니다.
        int currentSummaryLikes = (review.getReviewSummary() != null ? review.getReviewSummary().getReviewLikeCount() : 0);
        int estimatedTotalLikes = currentSummaryLikes + likeChange;

        // 좋아요 수는 음수가 될 수 없으므로 최소 0으로 보정
        if (estimatedTotalLikes < 0) {
            estimatedTotalLikes = 0;
        }

        // 5. DTO를 생성하여 반환
        return new ReviewMyStatusResponseDto(isNowLiked, estimatedTotalLikes);
    }

    /**
     * 특정 사용자가 작성한 리뷰 목록을 조회합니다.
     *
     * @param targetUserId 조회 대상 사용자의 ID
     * @param currentUserId 현재 로그인한 사용자의 ID (비로그인 시 null)
     * @return 사용자의 리뷰 목록 정보 DTO
     */
    public UserReviewListResponseDto getUserReviews(Long targetUserId, Long currentUserId) {
        // 1. 조회 대상 사용자 정보 가져오기
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(UserNotFoundException::new);

        // 2. 대상 사용자가 작성한 모든 리뷰 목록 조회 (Native Query 호출)
        List<Object[]> results = reviewRepository.findUserReviewsWithMovieInfoByUserId(targetUserId);

        // 3. 'isLiked' 상태를 확인하기 위한 로직
        Set<UUID> likedReviewIds = Collections.emptySet();
        if (currentUserId != null && !results.isEmpty()) {
            // 3-1. 조회된 리뷰들의 ID만 추출
            List<UUID> reviewIds = results.stream()
                    .map(row -> UuidUtils.bytesToUUID((byte[]) row[0]))
                    .collect(Collectors.toList());

            // 3-2. '좋아요' 누른 리뷰 ID 목록을 한 번의 쿼리로 가져오기 (N+1 문제 방지)
            likedReviewIds = reviewLikeRepository.findLikedReviewIdsByUser(currentUserId, reviewIds);
        }

        // 4. 조회된 데이터를 DTO로 변환
        Set<UUID> finalLikedReviewIds = likedReviewIds; // 람다에서 사용하기 위해 final로 선언
        List<UserReviewListResponseDto.UserReviewInfo> reviewInfos = results.stream()
                .map(row -> mapRowToUserReviewInfo(row, finalLikedReviewIds))
                .collect(Collectors.toList());

        // 5. 최종 응답 DTO 조립 후 반환
        return UserReviewListResponseDto.builder()
                .userNickname(targetUser.getNickname())
                .userProfileImageUrl(targetUser.getProfileImageUrl()) // User 모델 필드명에 맞게 수정
                .reviews(reviewInfos)
                .build();
    }

    /**
     * Native Query 결과(Object[] row)를 UserReviewInfo DTO로 매핑하는 헬퍼 메서드
     */
    private UserReviewListResponseDto.UserReviewInfo mapRowToUserReviewInfo(Object[] row, Set<UUID> likedReviewIds) {
        UUID reviewId = bytesToUUID((byte[]) row[0]);
        boolean isLiked = likedReviewIds.contains(reviewId);

        ReviewCommonDto.MovieInfo movieInfo = ReviewCommonDto.MovieInfo.builder()
                .movieId((Integer) row[5])
                .title((String) row[6])
                .posterUrl((String) row[7])
                .build();

        return UserReviewListResponseDto.UserReviewInfo.builder()
                .reviewId(reviewId)
                .title((String)row[1])
                .content((String) row[2])
                .rating((Integer) row[3])
                .createdAt(((Timestamp) row[4]).toLocalDateTime())
                .likesCount(((Number) row[8]).intValue()) // Native Query 결과가 BigInteger 등일 수 있어 Number로 캐스팅
                .commentsCount(((Number) row[9]).intValue())
                .isLiked(isLiked)
                .movie(movieInfo)
                .build();
    }

    /**
     * SNS 피드처럼 나와 내가 팔로우하는 사용자들의 리뷰를 조회합니다. (무한 스크롤)
     *
     * @param currentUserId 현재 로그인한 사용자의 ID
     * @param pageable      페이징 정보 (size, page)
     * @return 피드 리뷰 목록과 다음 페이지 존재 여부를 담은 DTO
     */
    public ReviewFeedResponseDto getReviewFeed(Long currentUserId, Pageable pageable) {
        Set<Long> authorIds = followRepository.findFolloweeIdsByFollowerId(currentUserId);
        authorIds.add(currentUserId); // 내 리뷰도 피드에 포함

        Slice<Object[]> reviewSlice = reviewRepository.findFeedReviewsByAuthorIds(authorIds, pageable);

        // [리팩토링] 공통 로직 호출
        List<FeedReviewInfo> feedReviews = processReviewSlice(reviewSlice, currentUserId);

        return new ReviewFeedResponseDto(feedReviews, reviewSlice.hasNext());
    }


    /**
     * 특정 사용자가 '좋아요' 한 리뷰 목록을 조회합니다. (무한 스크롤)
     *
     * @param currentUserId 현재 로그인한 사용자의 ID
     * @param pageable      페이징 정보
     * @return '좋아요' 한 리뷰 목록과 다음 페이지 존재 여부를 담은 DTO
     */
    public ReviewFeedResponseDto getLikedReviews(Long currentUserId, Pageable pageable) {
        Slice<Object[]> reviewSlice = reviewRepository.findLikedReviewsByUserId(currentUserId, pageable);

        // [리팩토링] 공통 로직 호출
        List<FeedReviewInfo> likedReviews = processReviewSlice(reviewSlice, currentUserId);

        return new ReviewFeedResponseDto(likedReviews, reviewSlice.hasNext());
    }

    /**
     * Redis SortedSet(ZSet)에서 정해진 기준에 따라 인기 리뷰 목록을 조회합니다. (무한 스크롤)
     *
     * @param pageable 페이징 정보
     * @param currentUserId 현재 로그인 유저 Id
     * @return '인기 리뷰 목록'과 다음 페이지 존재 여부를 담은 DTO
     */

    public ReviewFeedResponseDto getPopularReviewFeed(Pageable pageable, Long currentUserId) {
        long start = pageable.getOffset();
        long end = start + pageable.getPageSize() - 1;

        Set<Object> reviewIdObjects = redisTemplate.opsForZSet().reverseRange(POPULAR_REVIEWS_ZSET_KEY, start, end);
        if (reviewIdObjects == null || reviewIdObjects.isEmpty()) {
            return new ReviewFeedResponseDto(Collections.emptyList(), false);
        }

        List<UUID> reviewIds = reviewIdObjects.stream()
                .map(obj -> UUID.fromString(obj.toString()))
                .toList();

        // [리팩토링] 이제 reviewIds로 상세 정보를 가져오는 공통 로직을 사용
        List<FeedReviewInfo> sortedReviews = fetchAndProcessReviewsByIds(reviewIds, currentUserId);

        long totalSize = redisTemplate.opsForZSet().size(POPULAR_REVIEWS_ZSET_KEY);
        boolean hasNext = (end + 1) < totalSize;

        return new ReviewFeedResponseDto(sortedReviews, hasNext);
    }

    // ========== 2. 무한 스크롤 피드 공통 로직 (Private Helper Methods) ==========
    /**
     * [수정] Slice<Object[]>를 받아 DTO 리스트로 변환하는 공통 로직
     */
    /**
     * Slice<Object[]>를 받아 DTO 리스트로 변환하는 공통 로직
     */
    private List<FeedReviewInfo> processReviewSlice(Slice<Object[]> reviewSlice, Long currentUserId) {
        List<Object[]> results = reviewSlice.getContent();
        if (results.isEmpty()) {
            return Collections.emptyList();
        }

        // 추가 정보(태그, 좋아요)를 일괄 조회
        List<UUID> reviewIds = results.stream().map(row -> UuidUtils.bytesToUUID((byte[]) row[0])).toList();
        ReviewAdditionalInfo additionalInfo = fetchAdditionalInfoForReviews(reviewIds, currentUserId);

        // Native Query 결과와 추가 정보를 조합하여 최종 DTO 리스트 생성
        return results.stream()
                .map(row -> mapRowToFeedReviewInfo(row, additionalInfo))
                .toList();
    }

    /**
     * List<UUID>를 받아 DTO 리스트로 변환하는 공통 로직 (인기 피드용)
     */
    private List<FeedReviewInfo> fetchAndProcessReviewsByIds(List<UUID> reviewIds, Long currentUserId) {
        List<Object[]> results = reviewRepository.findFeedReviewsByIds(reviewIds);
        ReviewAdditionalInfo additionalInfo = fetchAdditionalInfoForReviews(reviewIds, currentUserId);
        Map<UUID, Object[]> resultMap = results.stream()
                .collect(Collectors.toMap(row -> UuidUtils.bytesToUUID((byte[]) row[0]), Function.identity()));

        return reviewIds.stream()
                .map(resultMap::get)
                .filter(Objects::nonNull)
                .map(row -> mapRowToFeedReviewInfo(row, additionalInfo))
                .toList();
    }
    /**
     * 여러 리뷰에 필요한 추가 정보(태그, 좋아요)를 한번에 가져오는 헬퍼 메서드
     */
    private ReviewAdditionalInfo fetchAdditionalInfoForReviews(List<UUID> reviewIds, Long currentUserId) {
        Set<UUID> likedReviewIds = getLikedReviewIds(currentUserId, reviewIds);
        Map<UUID, List<String>> tagsMap = getTagsMapForReviews(reviewIds);

        return new ReviewAdditionalInfo(likedReviewIds, tagsMap);
    }

    /**
     * AI 추천 리뷰 피드 조회
     */
    public ReviewFeedResponseDto getAiRecommendedReviewFeed(Pageable pageable, Long currentUserId) {
        log.info("사용자({})의 AI 추천 리뷰 피드 조회 시작", currentUserId);

        try {
            // 1. 사용자 활동 내역 조회
            UserActivityRequestDto userActivity = userActivityService.getUserActivity(currentUserId);

            // 2. AI 서버에서 추천 리뷰 UUID 목록 받기
            List<UUID> recommendedReviewIDs = recommendationService.getFeedRecommendations(userActivity);

            if (recommendedReviewIDs.isEmpty()) {
                log.info("AI 추천 결과가 없어 인기 피드로 대체 제공");
                return getPopularReviewFeed(pageable, currentUserId);
            }

            // 4. 페이징 처리 (AI에서 받은 순서 유지)
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), recommendedReviewIDs.size());

            if (start >= recommendedReviewIDs.size()) {
                return new ReviewFeedResponseDto(Collections.emptyList(), false);
            }

            List<UUID> pageReviewUUIDs = recommendedReviewIDs.subList(start, end);

            // 5. 기존 공통 메서드 활용 (순서 유지)
            List<FeedReviewInfo> feedReviews = fetchAndProcessReviewsByIds(pageReviewUUIDs, currentUserId);
            boolean hasNext = (start + pageable.getPageSize()) < recommendedReviewIDs.size();

            log.info("AI 추천 리뷰 피드 조회 완료: {} 개 반환", feedReviews.size());
            return new ReviewFeedResponseDto(feedReviews, hasNext);

        } catch (Exception e) {
            log.error("AI 추천 리뷰 피드 조회 중 오류 발생", e);
            return getPopularReviewFeed(pageable, currentUserId);
        }
    }


    /**
     * [신규] 추가 정보를 담기 위한 내부 레코드(Record) 또는 클래스
     */
    /**
     * 추가 정보를 담기 위한 내부 데이터 클래스(Record).
     * 이제 카운트 정보는 Native Query에서 오므로, 여기서는 제외합니다.
     */
    private record ReviewAdditionalInfo(
            Set<UUID> likedReviewIds,
            Map<UUID, List<String>> tagsMap
    ) {}

    /**
     * Native Query 결과(Object[] row)를 FeedReviewInfo DTO로 매핑하는 헬퍼 메서드
     * - 카운트 정보를 Native Query 결과(row)에서 직접 가져옵니다.
     */
    private FeedReviewInfo mapRowToFeedReviewInfo(Object[] row, ReviewAdditionalInfo additionalInfo) {
        UUID reviewId = UuidUtils.bytesToUUID((byte[]) row[0]);

        ReviewCommonDto.UserInfo author = ReviewCommonDto.UserInfo.builder()
                .userId(((Number) row[8]).longValue())
                .nickname((String) row[9])
                .profileImageUrl((String) row[10])
                .build();

        ReviewCommonDto.MovieInfo movie = ReviewCommonDto.MovieInfo.builder()
                .movieId((Integer) row[5])
                .title((String) row[6])
                .posterUrl((String) row[7])
                .build();

        return FeedReviewInfo.builder()
                .reviewId(reviewId)
                .title((String) row[1])
                .content((String) row[2])
                .rating((Integer) row[3])
                .createdAt(((Timestamp) row[4]).toLocalDateTime())
                // [핵심 수정] Redis Map이 아닌, Object[] row에서 직접 카운트를 가져옵니다.
                .likesCount(((Number) row[11]).intValue())
                .commentsCount(((Number) row[12]).intValue())
                .tags(additionalInfo.tagsMap().getOrDefault(reviewId, Collections.emptyList()))
                .author(author)
                .movie(movie)
                .isLiked(additionalInfo.likedReviewIds().contains(reviewId))
                .build();
    }

    /**
     * 현재 사용자가 주어진 리뷰 목록 중에서 '좋아요'를 누른 리뷰 ID들을 한 번의 쿼리로 가져옵니다.
     *
     * @param currentUserId 현재 사용자 ID (비로그인 시 null)
     * @param reviewIds     확인할 리뷰 ID 목록
     * @return 좋아요를 누른 리뷰 ID의 Set
     */
    private Set<UUID> getLikedReviewIds(Long currentUserId, List<UUID> reviewIds) {
        // 비로그인 사용자이거나, 확인할 리뷰 목록이 없으면 빈 Set을 반환
        if (currentUserId == null || reviewIds == null || reviewIds.isEmpty()) {
            return Collections.emptySet();
        }
        // ReviewLikeRepository를 사용하여 한 번의 쿼리로 조회
        return reviewLikeRepository.findLikedReviewIdsByUser(currentUserId, reviewIds);
    }

    /**
     * 여러 리뷰에 대한 태그 목록을 Map<ReviewId, List<TagName>> 형태로 반환합니다.
     *
     * @param reviewIds 태그를 조회할 리뷰 ID 목록
     * @return <ReviewId, List<TagName>> 형태의 Map
     */
    private Map<UUID, List<String>> getTagsMapForReviews(List<UUID> reviewIds) {
        if (reviewIds == null || reviewIds.isEmpty()) {
            return Collections.emptyMap();
        }

        // 1. reviewId 목록으로 모든 관련 ReviewTag를 한 번의 쿼리로 조회 (N+1 방지)
        List<ReviewTag> allReviewTags = reviewRepository.findReviewTagsByReviewIds(reviewIds);

        // 2. Stream API를 사용하여 reviewId를 기준으로 그룹화하고,
        //    각 그룹의 태그 이름만 추출하여 Map<UUID, List<String>>으로 변환합니다.
        return allReviewTags.stream()
                .collect(Collectors.groupingBy(
                        reviewTag -> reviewTag.getReview().getReviewId(), // reviewId로 그룹핑
                        Collectors.mapping(reviewTag -> reviewTag.getTag().getName(), Collectors.toList()) // 각 그룹의 Tag 이름을 List로 매핑
                ));
    }
}