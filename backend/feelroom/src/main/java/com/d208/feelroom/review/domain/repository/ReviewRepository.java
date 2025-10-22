package com.d208.feelroom.review.domain.repository;

import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.review.domain.entity.tag.ReviewTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    // 기존 메서드들
    @Query("SELECT COUNT(r) FROM Review r WHERE r.movie.movieId = :movieId")
    Integer countReviewsByMovieId(@Param("movieId") Integer movieId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.movie.movieId = :movieId AND r.rating IS NOT NULL")
    Double findAverageRatingByMovieId(@Param("movieId") Integer movieId);

    @Query("SELECT r FROM Review r " +
            "LEFT JOIN FETCH r.user " +
            "LEFT JOIN FETCH r.movie " +
            "LEFT JOIN FETCH r.reviewTags rt " +
            "LEFT JOIN FETCH rt.tag " +
            "LEFT JOIN FETCH r.reviewSummary " +
            "WHERE r.reviewId = :reviewId")
    Optional<Review> findReviewWithDetailsById(@Param("reviewId") UUID reviewId);

    @Query("SELECT COUNT(rl) FROM ReviewLike rl " +
            "WHERE rl.review.reviewId = :reviewId " +
            "AND rl.createdAt > :updatedAt")
    int countLikesAfterUpdatedAt(@Param("reviewId") UUID reviewId, @Param("updatedAt") LocalDateTime updatedAt);

    @Query("SELECT COUNT(c) FROM Comment c " +
            "WHERE c.review.reviewId = :reviewId " +
            "AND c.createdAt > :updatedAt")
    int countCommentsAfterUpdatedAt(@Param("reviewId") UUID reviewId, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * [신규] 여러 리뷰 ID에 해당하는 모든 ReviewTag들을 한 번의 쿼리로 조회합니다.
     * Review와 Tag 엔티티를 fetch join하여 N+1 문제를 방지합니다.
     *
     * @param reviewIds 태그를 조회할 리뷰 ID 목록
     * @return List<ReviewTag>
     */
    @Query("SELECT rt FROM ReviewTag rt " +
            "JOIN FETCH rt.tag " +
            "WHERE rt.review.reviewId IN :reviewIds")
    List<ReviewTag> findReviewTagsByReviewIds(@Param("reviewIds") List<UUID> reviewIds);

    // ========== 🔧 수정된 Native Query 메서드들 ==========

    /**
     * 배치 처리된 summary 테이블을 활용한 리뷰 목록 조회 (좋아요 수 기준 정렬)
     * LIMIT, OFFSET 제거 - Spring Data JPA가 자동으로 페이징 처리
     */
    @Query(value = """
        SELECT r.*, u.nickname, 
               COALESCE(rs.review_like_count, 0) as like_count,
               COALESCE(rs.review_comment_count, 0) as comment_count
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id
        LEFT JOIN review_summary rs ON r.review_id = rs.review_id
        WHERE r.movie_id = :movieId 
        AND r.deleted_at IS NULL
        ORDER BY COALESCE(rs.review_like_count, 0) DESC, r.created_at DESC
        """,
            nativeQuery = true)
    Page<Object[]> findReviewsByMovieIdOrderByLikesNative(
            @Param("movieId") Integer movieId,
            Pageable pageable
    );

    /**
     * 배치 처리된 summary 테이블을 활용한 리뷰 목록 조회 (댓글 수 기준 정렬)
     */
    @Query(value = """
        SELECT r.*, u.nickname, 
               COALESCE(rs.review_like_count, 0) as like_count,
               COALESCE(rs.review_comment_count, 0) as comment_count
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id
        LEFT JOIN review_summary rs ON r.review_id = rs.review_id
        WHERE r.movie_id = :movieId 
        AND r.deleted_at IS NULL
        ORDER BY COALESCE(rs.review_comment_count, 0) DESC, r.created_at DESC
        """,
            nativeQuery = true)
    Page<Object[]> findReviewsByMovieIdOrderByCommentsNative(
            @Param("movieId") Integer movieId,
            Pageable pageable
    );

    /**
     * 배치 처리된 summary 테이블을 활용한 리뷰 목록 조회 (최신순 정렬)
     */
    @Query(value = """
        SELECT r.*, u.nickname, 
               COALESCE(rs.review_like_count, 0) as like_count,
               COALESCE(rs.review_comment_count, 0) as comment_count
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id
        LEFT JOIN review_summary rs ON r.review_id = rs.review_id
        WHERE r.movie_id = :movieId 
        AND r.deleted_at IS NULL
        ORDER BY r.created_at DESC
        """,
            nativeQuery = true)
    Page<Object[]> findReviewsByMovieIdOrderByLatestNative(
            @Param("movieId") Integer movieId,
            Pageable pageable
    );

    /**
     * 특정 영화의 총 리뷰 수 조회 (페이징을 위한 전체 개수)
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM reviews r
        WHERE r.movie_id = :movieId 
        AND r.deleted_at IS NULL
        """,
            nativeQuery = true)
    long countReviewsByMovieIdForPaging(@Param("movieId") Integer movieId);

    /**
     * 특정 영화의 특정 시점 이후 작성된 리뷰 개수 조회
     * (MovieSummary 업데이트 이후 새로 작성된 리뷰 개수 계산용)
     */
    @Query("SELECT COUNT(r) FROM Review r " +
            "WHERE r.movie.movieId = :movieId " +
            "AND r.createdAt > :updatedAt " +
            "AND r.deletedAt IS NULL")
    int countReviewsAfterUpdatedAt(@Param("movieId") Integer movieId,
                                   @Param("updatedAt") LocalDateTime updatedAt);


    /**
     * userId로 해당 유저가 작성한 리뷰 리스트
     * @param userId 사용자 아이디
     * @return List
     */
    @Query(value = """
    SELECT r.review_id, r.title, r.content, r.rating, r.created_at,
           m.movie_id, m.title, m.poster_url,
           COALESCE(rs.review_like_count, 0) as likes_count,
           COALESCE(rs.review_comment_count, 0) as comments_count
    FROM reviews r
    INNER JOIN movies m ON r.movie_id = m.movie_id
    LEFT JOIN review_summary rs ON r.review_id = rs.review_id
    WHERE r.user_id = :userId
    AND r.deleted_at IS NULL
    ORDER BY r.created_at DESC
    """, nativeQuery = true)
    List<Object[]> findUserReviewsWithMovieInfoByUserId(@Param("userId") Long userId);

    /**
     * 지정된 사용자 목록(authorIds)이 작성한 리뷰를 최신순으로 조회하여 피드를 구성합니다. (무한 스크롤용 Slice)
     *
     * @param authorIds '나'와 내가 팔로우하는 사람들의 ID 목록
     * @param pageable 페이징 및 정렬 정보 (size, page)
     * @return Native Query 결과를 담은 Slice 객체. 각 row는 Object[] 타입입니다.
     *         - [0] review_id (String, UUID)
     *         - [1] review_title (String)
     *         - [2] review_content (String)
     *         - [3] review_rating (Integer)
     *         - [4] review_created_at (Timestamp)
     *         - [5] movie_id (Integer)
     *         - [6] movie_title (String)
     *         - [7] movie_poster_url (String)
     *         - [8] author_user_id (Long)
     *         - [9] author_nickname (String)
     *         - [10] author_profile_image_url (String)
     *         - [11] likes_count (Integer)
     *         - [12] comments_count (Integer)
     */
    @Query(value = """
        SELECT r.review_id, r.title as review_title, r.content as review_content, r.rating as review_rating, r.created_at as review_created_at,
               m.movie_id, m.title as movie_title, m.poster_url,
               u.user_id as author_user_id, u.nickname as author_nickname, u.profile_image_url as author_profile_image_url,
               COALESCE(rs.review_like_count, 0) as likes_count,
               COALESCE(rs.review_comment_count, 0) as comments_count
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id
        INNER JOIN movies m ON r.movie_id = m.movie_id
        LEFT JOIN review_summary rs ON r.review_id = rs.review_id
        WHERE r.user_id IN :authorIds
        AND r.deleted_at IS NULL
        ORDER BY r.created_at DESC
        """,
            countQuery = "SELECT count(*) FROM reviews r WHERE r.user_id IN :authorIds AND r.deleted_at IS NULL",
            nativeQuery = true)
    Slice<Object[]> findFeedReviewsByAuthorIds(@Param("authorIds") Set<Long> authorIds, Pageable pageable);

    /**
     * 특정 사용자가 '좋아요'를 누른 리뷰 목록을 최신순(가장 최근에 좋아요 누른 순)으로 조회합니다.
     * (무한 스크롤용 Slice)
     *
     * @param userId 현재 사용자의 ID
     * @param pageable 페이징 정보 (size, page)
     * @return Native Query 결과를 담은 Slice 객체. 각 row는 Object[] 타입입니다.
     *         (findFeedReviewsByAuthorIds 와 동일한 컬럼 순서를 가짐)
     */
    @Query(value = """
        SELECT r.review_id, r.title as review_title, r.content as review_content, r.rating as review_rating, r.created_at as review_created_at,
               m.movie_id, m.title as movie_title, m.poster_url,
               u.user_id as author_user_id, u.nickname as author_nickname, u.profile_image_url as author_profile_image_url,
               COALESCE(rs.review_like_count, 0) as likes_count,
               COALESCE(rs.review_comment_count, 0) as comments_count
        FROM review_likes rl
        INNER JOIN reviews r ON rl.review_id = r.review_id
        INNER JOIN users u ON r.user_id = u.user_id
        INNER JOIN movies m ON r.movie_id = m.movie_id
        LEFT JOIN review_summary rs ON r.review_id = rs.review_id
        WHERE rl.user_id = :userId
        AND r.deleted_at IS NULL
        ORDER BY rl.created_at DESC
        """,
            countQuery = "SELECT count(*) FROM review_likes rl INNER JOIN reviews r ON rl.review_id = r.review_id WHERE rl.user_id = :userId AND r.deleted_at IS NULL",
            nativeQuery = true)
    Slice<Object[]> findLikedReviewsByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * 인기 피드 조회를 위해 Redis에서 가져온 리뷰 ID 목록으로 상세 정보를 조회합니다.
     * (findFeedReviewsByAuthorIds 와 컬럼 순서 및 내용 동일)
     *
     * @param reviewIds Redis에서 가져온 인기 리뷰 ID 목록
     * @return Native Query 결과를 담은 List 객체. 각 row는 Object[] 타입입니다.
     */
    @Query(value = """
        SELECT r.review_id, r.title as review_title, r.content as review_content, r.rating as review_rating, r.created_at as review_created_at,
               m.movie_id, m.title as movie_title, m.poster_url,
               u.user_id as author_user_id, u.nickname as author_nickname, u.profile_image_url as author_profile_image_url,
               COALESCE(rs.review_like_count, 0) as likes_count,
               COALESCE(rs.review_comment_count, 0) as comments_count
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id
        INNER JOIN movies m ON r.movie_id = m.movie_id
        LEFT JOIN review_summary rs ON r.review_id = rs.review_id
        WHERE r.review_id IN :reviewIds
        """, nativeQuery = true)
    List<Object[]> findFeedReviewsByIds(@Param("reviewIds") List<UUID> reviewIds);

    /**
     * User Activity Badge System
     */
    long countByUser_UserId(Long userId); // 사용자가 작성한 총 리뷰 수

    // 스케줄러가 최근 7일 이내의 리뷰만 조회하도록 함.
    List<Review> findByCreatedAtAfter(LocalDateTime dateTime);

    // =======================================================
    // ======== ✨ MovieSummaryBatchService를 위한 새로운 메서드들 ========
    // =======================================================


    /**
     * 특정 영화의 모든 유효한 리뷰 평점의 합계를 조회합니다.
     * 특정 영화의 모든 유효한 리뷰 평점의 합계를 조회합니다.
     * MovieSummary의 ratingSum 필드 업데이트에 사용됩니다.
     * 결과가 없을 경우 (리뷰가 없거나 모든 평점이 null인 경우) null을 반환할 수 있으므로 Long으로 받습니다.
     *
     * @param movieId 영화 ID
     * @return 해당 영화의 총 평점 합계
     */
    @Query("SELECT SUM(r.rating) FROM Review r WHERE r.movie.movieId = :movieId AND r.deletedAt IS NULL")
    Long sumTotalRatingsByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 영화의 총 리뷰 개수를 조회합니다. (deletedAt이 null인 유효한 리뷰만 카운트)
     * MovieSummary의 reviewCount 필드 업데이트에 사용됩니다.
     *
     * @param movieId 영화 ID
     * @return 해당 영화의 총 리뷰 개수
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.movie.movieId = :movieId AND r.deletedAt IS NULL")

    long countTotalReviewsByMovieId(Integer movieId);

    /**
     * 모든 유효한 리뷰의 ID만 조회합니다. (deletedAt이 null인 리뷰만)
     * fullUpdateReviewSummary 배치에서 모든 ReviewSummary를 재계산할 때 사용됩니다.
     * @return 모든 유효한 리뷰 ID 리스트
     */
    @Query("SELECT r.reviewId FROM Review r WHERE r.deletedAt IS NULL")
    List<UUID> findAllReviewIds();

    /**
     * 모든 유효한 리뷰의 총 개수를 조회합니다. (deletedAt이 null인 리뷰만)
     * 배치 상태 확인(`getBatchStatus`)에서 사용됩니다.
     * @return 모든 유효한 리뷰의 총 개수
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.deletedAt IS NULL")
    long countTotalValidReviews();

    @Query("SELECT DISTINCT r.movie.movieId FROM Review r WHERE r.createdAt >= :dateTime")
    List<Integer> findMovieIdsWithRecentActivity(@Param("dateTime") LocalDateTime dateTime);

    List<Review> findByReviewIdIn(List<Integer> reviewIds);

    /**
     * [신규] 특정 사용자가 리뷰를 작성한 영화의 tmdb_id와 평점 목록만 조회합니다.
     * AI 추천 모델의 사용자 활동 데이터 생성을 위해 사용됩니다.
     *
     * @param userId 사용자의 ID
     * @return List<Object[]>, 각 row는 [0]: tmdb_id (Integer), [1]: rating (Integer)
     */
    @Query("SELECT r.movie.tmdbId, r.rating FROM Review r WHERE r.user.userId = :userId AND r.deletedAt IS NULL")
    List<Object[]> findReviewedMovieTmdbIdsAndRatingsByUserId(@Param("userId") Long userId);
}