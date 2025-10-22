package com.d208.feelroom.comment.domain.repository;

import com.d208.feelroom.comment.domain.entity.summary.CommentSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentSummaryRepository extends JpaRepository<CommentSummary, UUID> {

    @Modifying
    @Query(value = """
            INSERT INTO comment_summary (comment_id, comment_like_count)
            VALUES (:commentId, :likeChange)
            ON DUPLICATE KEY UPDATE
                comment_like_count = comment_like_count + :likeChange
            """, nativeQuery = true)
    void upsertCommentLikeSummary(UUID commentId, int likeChange);

    Optional<CommentSummary> findByCommentId(UUID commentId);

    /**
     * 모든 유효한 댓글에 대한 좋아요 수를 집계하여 CommentSummary 테이블을
     * 일괄적으로 삽입하거나 업데이트합니다.
     * (MySQL의 ON DUPLICATE KEY UPDATE를 활용한 UPSERT)
     *
     * @return 삽입 또는 업데이트된 레코드의 수
     */
    @Modifying // INSERT, UPDATE 쿼리 실행 시 필요
    @Query(value = """
        INSERT INTO comment_summary (comment_id, comment_like_count, updated_at)
        SELECT
            c.comment_id,
            COALESCE(like_counts.like_count, 0) as calculated_like_count,
            NOW() as calculated_updated_at
        FROM comments c
        LEFT JOIN (
            SELECT comment_id, COUNT(*) as like_count
            FROM comment_likes
            GROUP BY comment_id
        ) like_counts ON c.comment_id = like_counts.comment_id
        WHERE c.deleted_at IS NULL -- 소프트 삭제된 댓글 제외 (Comment 엔티티에 deletedAt 필드 가정)
        ON DUPLICATE KEY UPDATE
            comment_like_count = VALUES(comment_like_count),
            updated_at = VALUES(updated_at)
        """, nativeQuery = true)
    int upsertAllCommentSummaries(); // 새로운 메서드
}
