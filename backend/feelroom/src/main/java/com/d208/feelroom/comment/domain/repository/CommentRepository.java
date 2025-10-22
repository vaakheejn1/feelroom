package com.d208.feelroom.comment.domain.repository;

import com.d208.feelroom.comment.domain.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    /**
     * 특정 댓글 ID로 댓글을 조회할 때, 연관된 모든 엔티티(작성자, 부모댓글, 리뷰)를
     * fetch join으로 한 번에 가져옵니다. N+1 문제를 방지합니다. CommentSummary 함께 조회
     * @param commentId 조회할 댓글의 ID
     * @return Comment Optional
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user u " +
            "LEFT JOIN FETCH c.replyToUser r " +
            "JOIN FETCH c.review rv " +
            "LEFT JOIN FETCH c.parentComment p " +
            "LEFT JOIN FETCH c.commentSummary cs " +
            "WHERE c.commentId = :commentId")
    Optional<Comment> findCommentWithDetailsById(@Param("commentId") UUID commentId);

    // 특정 리뷰의 모든 댓글을 정렬된 'List'로 반환
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user u " +
            "LEFT JOIN FETCH c.parentComment p " +
            "LEFT JOIN FETCH c.replyToUser r " +
            "LEFT JOIN FETCH c.commentSummary cs " +
            "WHERE c.review.reviewId = :reviewId " +
            "ORDER BY p.createdAt ASC NULLS FIRST, c.createdAt ASC")
    List<Comment> findAllByReviewIdOrderByParentAndCreatedAt(@Param("reviewId") UUID reviewId);

    @Query("SELECT c.commentId FROM Comment c " +
            "WHERE c.review.reviewId = :reviewId AND c.deletedAt IS NULL")
    List<UUID> findAllCommentIdsByReviewId(@Param("reviewId") UUID reviewId);

    /**
     * User Activity Badge System
     */
    long countByUser_UserId(Long userId); // 사용자가 작성한 총 댓글 수

    /**
     * 특정 리뷰에 대한 총 댓글 개수를 조회합니다. (deletedAt이 null인 댓글만 고려)
     * @param reviewId 리뷰 ID
     * @return 해당 리뷰의 총 댓글 개수
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.review.reviewId = :reviewId AND c.deletedAt IS NULL")
    long countByReview_ReviewId(@Param("reviewId") UUID reviewId);

    // =======================================================
    // ======== ✨ CommentSummaryBatchService를 위한 새로운 메서드들 ========
    // =======================================================

    /**
     * 모든 유효한 댓글의 ID만 조회합니다. (deletedAt이 null인 댓글만)
     * fullUpdateCommentSummary 배치에서 모든 CommentSummary를 재계산할 때 사용됩니다.
     * @return 모든 유효한 댓글 ID 리스트
     */
    @Query("SELECT c.commentId FROM Comment c WHERE c.deletedAt IS NULL")
    List<UUID> findAllCommentIds();
}