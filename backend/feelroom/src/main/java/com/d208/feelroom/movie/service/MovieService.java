package com.d208.feelroom.movie.service;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.entity.MovieLike;
import com.d208.feelroom.movie.domain.entity.summary.MovieSummary;
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.movie.dto.*;
import com.d208.feelroom.movie.domain.repository.MovieGenreRepository;
import com.d208.feelroom.movie.domain.repository.MovieLikeRepository;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.movie.domain.repository.MovieSummaryRepository;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.movie.dto.cache.MovieStaticCacheDto;
import com.d208.feelroom.review.dto.ReviewListResponseDto;
import com.d208.feelroom.badge.event.EventPublisher;
import com.d208.feelroom.user.event.UserActivityEvent.ActivityType;
import com.d208.feelroom.movie.exception.MovieNotFoundException;
import com.d208.feelroom.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.d208.feelroom.global.util.UuidUtils.bytesToUUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieService {
    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final UserRepository userRepository;
    private final EventPublisher eventPublisher;
    private final MovieCacheService movieCacheService;
    private final MovieSummaryRepository movieSummaryRepository;
    private final MovieLikeRepository movieLikeRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String POPULAR_MOVIES_ZSET_KEY = "popular_movies";
    private static final int POPULAR_MOVIES_COUNT = 30; // 조회할 영화 개수를 상수로 관리

    /**
     * 최종 사용자에게 보여줄 영화 상세 정보를 조회합니다.
     */
    public MovieResponseDto getMovieDetail(Integer movieId, Long userId) {
        // 1. [정적 데이터 조회]
        MovieStaticCacheDto staticData = movieCacheService.findMovieStaticDetails(movieId);

        // 2. [동적 데이터 조회]
        MovieSummary summary = movieSummaryRepository.findById(movieId).orElse(null);

        // 3. [개인화 정보 조회]
        boolean isLiked = checkIfUserLikedMovie(movieId, userId);

        // 4. [데이터 조합]
        return buildFinalResponse(staticData, summary, isLiked);
    }

    private boolean checkIfUserLikedMovie(Integer movieId, Long userId) {
        if (userId == null) {
            return false;
        }
        return movieLikeRepository.existsById_MovieIdAndId_UserId(movieId, userId);
    }

    /**
     * 각기 다른 소스에서 온 데이터들을 최종 응답 DTO로 조립하는 private 헬퍼 메서드
     */
    private MovieResponseDto buildFinalResponse(MovieStaticCacheDto staticData, MovieSummary summary, boolean isLiked) {
        // [수정된 부분]
        // 먼저 정적 데이터와 동적 데이터를 합쳐 공통 상세 정보 DTO를 만듭니다.
        MovieDetailResponseDto commonDetails = new MovieDetailResponseDto(staticData, summary);

        // 그 후, 공통 상세 정보와 개인화 정보를 합쳐 최종 응답 DTO를 만듭니다.
        return new MovieResponseDto(commonDetails, isLiked);
    }

    /**
     * 특정 영화의 리뷰 목록 조회 (Page 객체 활용)
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션
    public ReviewListResponseDto getMovieReviews(Integer movieId, String sortBy, int page, int size, Long userId) {
        // 1. 영화 존재 여부 확인
        if (!movieRepository.existsById(movieId)) {
            throw new MovieNotFoundException(movieId);
        }

        // 2. 페이지네이션 설정
        Pageable pageable = PageRequest.of(page, size);

        // 3. 배치 처리된 summary 테이블을 활용한 정렬 기준별 리뷰 조회
        Page<Object[]> reviewResultPage;
        switch (sortBy.toLowerCase()) {
            case "likes":
                reviewResultPage = reviewRepository.findReviewsByMovieIdOrderByLikesNative(
                        movieId, pageable);
                break;
            case "comments":
                reviewResultPage = reviewRepository.findReviewsByMovieIdOrderByCommentsNative(
                        movieId, pageable);
                break;
            case "latest":
            default:
                reviewResultPage = reviewRepository.findReviewsByMovieIdOrderByLatestNative(
                        movieId, pageable);
                break;
        }

        // 4. 현재 페이지의 리뷰 ID 목록 추출
        List<UUID> reviewIdsOnPage = reviewResultPage.getContent().stream()
                .map(row -> {
                    byte[] reviewIdBytes = (byte[]) row[0];
                    return bytesToUUID(reviewIdBytes);
                })
                .collect(Collectors.toList());

        // 5. 로그인한 사용자의 '좋아요' 상태 조회
        Set<UUID> likedReviewIds = Collections.emptySet();
        if (userId != null && !reviewIdsOnPage.isEmpty()) {
            likedReviewIds = reviewLikeRepository.findLikedReviewIdsByUser(userId, reviewIdsOnPage);
        }

        // 4. Native Query 결과를 DTO로 변환
        final Set<UUID> finalLikedReviewIds = likedReviewIds; // 람다에서 사용하기 위해 final 또는 effectively final로 만듦
        List<ReviewListResponseDto.ReviewInfo> reviewInfoList = reviewResultPage.getContent()
                .stream()
                .map(row -> {
                    ReviewListResponseDto.ReviewInfo reviewInfo = mapToReviewInfo(row); // 여기서 수정된 헬퍼 메서드 사용
                    // isLikedByCurrentUser 값을 설정
                    reviewInfo.setLiked(finalLikedReviewIds.contains(reviewInfo.getReviewId()));
                    return reviewInfo;
                })
                .collect(Collectors.toList());

        // 5. Page 객체에서 총 리뷰 수 가져오기 (자동 count 쿼리 결과)
        long totalReviews = reviewResultPage.getTotalElements();

        // 6. 리뷰 통계 정보 조회
        // MovieSummary에서 총 리뷰 수와 평균 평점을 가져오는 것이 더 효율적입니다.
        MovieSummary movieSummary = movieSummaryRepository.findById(movieId).orElse(null);

        // totalReviews와 averageRating을 MovieSummary에서 가져옵니다.
        int totalReviewsFromSummary = (movieSummary != null) ? movieSummary.getReviewCount() : 0;
        double averageRatingFromSummary = (movieSummary != null) ? movieSummary.getUserRatingAverage() : 0.0;

        ReviewListResponseDto.ReviewStats reviewStats = ReviewListResponseDto.ReviewStats.builder()
                .totalReviews(totalReviewsFromSummary) // MovieSummary의 reviewCount 사용
                .averageRating(averageRatingFromSummary) // MovieSummary의 getUserRatingAverage() 사용
                .build();


        // 7. 최종 응답 DTO 구성
        return ReviewListResponseDto.builder()
                .reviews(reviewInfoList)
                .reviewStats(reviewStats)
                .build();
    }

    /**
     * Native Query 결과를 ReviewInfo DTO로 변환하는 헬퍼 메서드 (Summary 활용)
     * Object[] 배열의 인덱스는 ReviewRepository의 Native Query SELECT 절과 일치해야 합니다.
     * 0: r.review_id
     * 1: r.title
     * 2: r.content
     * 3: r.rating
     * 4: r.created_at
     * 5: r.updated_at (review 엔티티의 updated_at) - 필요한 경우
     * 6: r.deleted_at - 필요한 경우
     * 7: r.deleted_by - 필요한 경우
     * 8: u.nickname
     * 9: COALESCE(rs.review_like_count, 0) as like_count
     * 10: COALESCE(rs.review_comment_count, 0) as comment_count
     *
     * 참고: 현재 ReviewRepository의 findReviewsByMovieIdOrderBy...Native 쿼리 SELECT 절은
     * `r.*, u.nickname, COALESCE(rs.review_like_count, 0) as like_count, COALESCE(rs.review_comment_count, 0) as comment_count`
     * 입니다. `r.*`가 포함되어 있으므로, `r` 테이블의 모든 컬럼이 먼저 오고 그 다음 조인된 컬럼들이 오는 순서입니다.
     * 따라서 인덱스 매핑을 정확히 재확인해야 합니다.
     * 일반적으로 SELECT r.col1, r.col2, ..., u.nickname, rs.like_count 와 같이 명시하는 것이 인덱스 관리에 더 좋습니다.
     */
    private ReviewListResponseDto.ReviewInfo mapToReviewInfo(Object[] row) {
        try {
            // UUID 변환 (BINARY(16) -> UUID)
            byte[] reviewIdBytes = (byte[]) row[0]; // r.review_id
            UUID reviewId = bytesToUUID(reviewIdBytes);

            // User 닉네임 (조인된 users 테이블에서)
            // r.* 다음에 u.nickname 이 오므로 r의 컬럼 개수를 세야 합니다.
            // reviews 테이블 컬럼 순서: review_id, user_id, movie_id, title, content, rating, created_at, updated_at, deleted_at, deleted_by
            // 따라서 u.nickname은 인덱스 10에 해당합니다.
            String userNickname = (String) row[10];

            // 평점
            Integer rating = (Integer) row[5]; // r.rating (인덱스 5)

            // Summary에서 가져온 좋아요/댓글 수 (Native Query에서 이미 COALESCE로 0 처리됨)
            // Native Query SELECT 절에서 likes_count가 인덱스 11, comments_count가 인덱스 12에 해당
            Integer totalLikes = ((Number) row[11]).intValue();
            Integer totalComments = ((Number) row[12]).intValue();

            LocalDateTime createdAt = ((Timestamp) row[6]).toLocalDateTime(); // r.created_at (인덱스 6)

            return ReviewListResponseDto.ReviewInfo.builder()
                    .reviewId(reviewId)
                    .userNickname(userNickname)
                    .rating(rating)
                    .likesCount(totalLikes)   // 직접 ReviewSummary에서 가져온 값 사용
                    .commentsCount(totalComments) // 직접 ReviewSummary에서 가져온 값 사용
                    .createdAt(createdAt)
                    .build();

        } catch (Exception e) {
            System.err.println("Error mapping review data: " + e.getMessage());
            System.err.println("Row data: " + java.util.Arrays.toString(row));
            throw new RuntimeException("Failed to map review data", e);
        }
    }

    /**
     * 영화에 대한 나의 상태 조회
     */
//    public MovieMyStatusResponseDto getMyStatusForMovie(Integer movieId, Long currentUserId) {
//        // 1. 영화 존재 여부 확인
//        if (!movieRepository.existsById(movieId)) {
//            throw new MovieNotFoundException(movieId);
//        }
//
//        // 2. 현재 로그인한 사용자가 이 영화를 좋아요 했는지 확인
//        boolean isLiked = movieLikeRepository.existsById_MovieIdAndId_UserId(movieId, currentUserId);
//
//        // 3. 상태 정보 DTO 반환
//        return new MovieMyStatusResponseDto(isLiked);
//    }

    /**
     * 영화 좋아요 토글 (있으면 삭제, 없으면 추가)
     */
    @Transactional
    public boolean toggleMovieLike(Integer movieId, Long userId) {
        // 1. 영화 존재 여부 확인
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new MovieNotFoundException(movieId));

        // 2. 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 3. 현재 좋아요 상태 확인
        boolean isLiked = movieLikeRepository.existsById_MovieIdAndId_UserId(movieId, userId);

        if (isLiked) {
            // 이미 좋아요를 눌렀다면 취소
            movieLikeRepository.deleteByMovieIdAndUserId(movieId, userId);
            return false; // 좋아요 취소됨
        } else {
            // 좋아요를 누르지 않았다면 추가
            MovieLike movieLike = MovieLike.builder()
                    .user(user)
                    .movie(movie)
                    .build();
            movieLikeRepository.save(movieLike);
            eventPublisher.publishUserActivity(userId, ActivityType.MOVIE_LIKE);
            return true; // 좋아요 추가됨
        }
    }

    @CacheEvict(value = "movie-details", key = "#movieId")
    public void evictMovieDetailsCache(Integer movieId) {
        log.info("===== 영화 ID: {}의 상세 정보 캐시를 삭제합니다. =====", movieId);
        // 이 메서드는 어노테이션이 핵심이므로, 내부 로직은 비워두어도 됩니다.
    }

    /**
     * 특정 사용자가 '좋아요' 한 영화 목록을 조회합니다. (무한 스크롤)
     *
     * @param currentUserId 현재 로그인한 사용자의 ID
     * @param pageable      페이징 정보
     * @return '좋아요' 한 영화 목록과 다음 페이지 존재 여부를 담은 DTO
     */
    public LikedMovieListResponseDto getLikedMovies(Long currentUserId, Pageable pageable) {
        // 1. Repository를 호출하여 '좋아요'한 영화 목록을 Slice 형태로 조회합니다.
        Slice<Object[]> movieSlice = movieRepository.findLikedMoviesByUserId(currentUserId, pageable);
        List<Object[]> results = movieSlice.getContent();

        // 결과가 없으면 바로 빈 응답 반환
        if (results.isEmpty()) {
            return new LikedMovieListResponseDto(Collections.emptyList(), false);
        }

        // 2. 조회된 Native Query 결과(Object[])를 LikedMovieInfo DTO 목록으로 변환합니다.
        List<LikedMovieInfo> likedMovies = results.stream()
                .map(this::mapRowToLikedMovieInfo) // 헬퍼 메서드 사용
                .collect(Collectors.toList());

        // 3. 최종 응답 DTO를 조립하여 반환합니다.
        return new LikedMovieListResponseDto(likedMovies, movieSlice.hasNext());
    }

    /**
     * Native Query 결과(Object[] row)를 LikedMovieInfo DTO로 매핑하는 private 헬퍼 메서드
     */
    private LikedMovieInfo mapRowToLikedMovieInfo(Object[] row) {
        return LikedMovieInfo.builder()
                .movie_id((Integer) row[0])
                .title((String) row[1])
                .poster_url((String) row[2])
                .build();
    }

    // 2. 하드코딩된 온보딩 영화 ID 배열 (MovieController와 동일)
    private static final Integer[] ONBOARDING_MOVIE_LIST = {
            // 100개의 영화 ID를 여기에 추가
            6, 245541, 226506, 29, 2142, 1865, 675, 2466, 245547, 247673, 224669, 4964, 228901, 223512, 434, 236013, 232419, 237461, 546, 245539, 1863, 1206, 252013, 256699, 249809, 256852, 1184, 565, 223039, 224672, 252083, 242132, 256697, 3277, 231276, 3687, 237837, 2850, 2133, 229278, 3219, 233476, 240489, 254257, 232471, 308, 223113, 254299, 263248, 3685, 2129, 1606, 3221, 269548, 238956, 227321, 1385, 1383, 230266, 269545, 2, 105, 306, 601, 3378, 704, 269547, 548, 247649, 256706, 232426, 1, 247640, 223622, 223355, 313, 192, 1016, 112, 549, 224478, 252014, 254254, 314, 687, 3695, 1619, 269546, 224446, 5, 1389, 228865, 237465, 2858, 238958, 230977, 265071, 9039, 245542, 247644            // 실제 사용할 movieId로 교체하세요
    };

    /**
     * 온보딩용 영화 목록을 조회합니다.
     *
     * @param limit 조회할 영화 개수 (최대 100)
     * @return 온보딩 영화 정보 리스트
     */
    @Transactional(readOnly = true)
    public List<OnboardingMovieResponseDto> getOnboardingMovies(int limit) {
        // limit만큼만 처리
        int actualLimit = Math.min(limit, ONBOARDING_MOVIE_LIST.length);

        List<OnboardingMovieResponseDto> result = new ArrayList<>();

        // 배열 순회하면서 각 영화 정보 조회
        for (int i = 0; i < actualLimit; i++) {
            Integer movieId = ONBOARDING_MOVIE_LIST[i];

            // 영화 정보 조회
            Optional<Movie> movieOpt = movieRepository.findById(movieId);

            if (movieOpt.isPresent()) {
                Movie movie = movieOpt.get();

                // 장르 정보 조회
                List<String> genres = movieGenreRepository.findGenreNamesByMovieId(movieId);

                // DTO 생성
                OnboardingMovieResponseDto dto = OnboardingMovieResponseDto.builder()
                        .movieId(movie.getMovieId())
                        .title(movie.getTitle())
                        .posterUrl(movie.getPosterUrl())
                        .genres(genres)
                        .build();

                result.add(dto);
            } else {
                log.warn("온보딩 리스트의 영화 ID {}를 찾을 수 없습니다.", movieId);
            }
        }

        return result;
    }


    /**
     * Redis에 저장된 랭킹을 기반으로 인기 영화 목록을 조회합니다.
     * @return PopularMovieResponseDto 리스트 (상위 30개)
     */
    @Transactional(readOnly = true)
    public List<PopularMovieResponseDto> getPopularMovies() {
        // 1. Redis ZSET에서 인기 영화 ID 목록을 상위 N개 조회합니다. (점수 높은 순)
        // reverseRange(key, start, end) -> 0부터 (POPULAR_MOVIES_COUNT - 1)까지
        Set<Object> movieIdsObjects = redisTemplate.opsForZSet().reverseRange(POPULAR_MOVIES_ZSET_KEY, 0, POPULAR_MOVIES_COUNT - 1);

        if (movieIdsObjects == null || movieIdsObjects.isEmpty()) {
            log.warn("Popular movies ZSET is empty or not found. Returning empty list.");
            return Collections.emptyList();
        }

        // 2. Object 타입을 Integer 타입의 ID 목록으로 변환합니다.
        List<Integer> movieIds = movieIdsObjects.stream()
                .map(id -> Integer.parseInt(id.toString()))
                .collect(Collectors.toList());

        // 3. RDB에서 ID 목록으로 영화의 상세 정보를 한 번에 조회합니다. (IN 쿼리)
        Map<Integer, Movie> movieMap = movieRepository.findAllById(movieIds).stream()
                .collect(Collectors.toMap(Movie::getMovieId, Function.identity()));

        // 4. Redis에서 가져온 순서(랭킹 순서)를 유지하면서 DTO 리스트를 생성합니다.
        return movieIds.stream()
                .map(movieMap::get) // Map에서 ID에 해당하는 Movie 객체를 찾습니다.
                .filter(Objects::nonNull) // DB에서 어떤 이유로 조회가 안 된 경우(삭제 등)를 대비해 null 체크
                .map(movie -> PopularMovieResponseDto.builder() // DTO로 변환
                        .movieId(movie.getMovieId())
                        .title(movie.getTitle())
                        .posterUrl(movie.getPosterUrl())
                        .build())
                .collect(Collectors.toList());
    }
}