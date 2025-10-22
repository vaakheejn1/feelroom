package com.d208.feelroom.review.domain.repository;

import com.d208.feelroom.review.domain.entity.summary.ReviewSummary;
import org.springframework.data.jpa.repository.JpaRepository;
// ========== 🆕 새로 추가할 import들 ==========
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
// ===============================================
import org.springframework.stereotype.Repository;

// ========== 🆕 새로 추가할 import들 ==========
// ===============================================
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewSummaryRepository extends JpaRepository<ReviewSummary, UUID> {
    // MovieSummary와 유사한 UPSERT 쿼리 (이벤트 리스너용)
    @Modifying
    @Query(value = """
        INSERT INTO review_summary (review_id, review_like_count, review_comment_count)
        VALUES (:reviewId, :likeChange, :commentChange)
        ON DUPLICATE KEY UPDATE
            review_like_count = review_like_count + :likeChange,
            review_comment_count = review_comment_count + :commentChange
        """, nativeQuery = true)
    void upsertReviewInteractionSummary(
            UUID reviewId, // @Param 생략 가능 (매개변수 이름과 컬럼 이름 일치 시)
            int likeChange,
            int commentChange
    );

    /**
     * 가장 최근에 업데이트된 ReviewSummary를 조회하여 배치 처리 시간을 확인합니다.
     * @return 가장 최근 업데이트된 ReviewSummary Optional
     */
    Optional<ReviewSummary> findTopByOrderByUpdatedAtDesc();

    // ReviewSummaryBatch

    /**
     * 전체 리뷰 요약 정보 재계산
     */
    @Modifying
    @Query(value = """
        INSERT INTO review_summary (review_id, review_like_count, review_comment_count, updated_at)
        SELECT 
            r.review_id,
            COALESCE(like_counts.like_count, 0) as review_like_count,
            COALESCE(comment_counts.comment_count, 0) as review_comment_count,
            NOW() as updated_at
        FROM reviews r
        LEFT JOIN (
            SELECT review_id, COUNT(*) as like_count
            FROM review_likes
            GROUP BY review_id
        ) like_counts ON r.review_id = like_counts.review_id
        LEFT JOIN (
            SELECT review_id, COUNT(*) as comment_count
            FROM comments
            WHERE deleted_at IS NULL
            GROUP BY review_id
        ) comment_counts ON r.review_id = comment_counts.review_id
        WHERE r.deleted_at IS NULL
        """, nativeQuery = true)
    int insertAllReviewSummary();

    /**
     * 기존 review_summary 데이터 전체 삭제
     */
    @Modifying
    @Query(value = "DELETE FROM review_summary", nativeQuery = true)
    void deleteAllReviewSummary();


}