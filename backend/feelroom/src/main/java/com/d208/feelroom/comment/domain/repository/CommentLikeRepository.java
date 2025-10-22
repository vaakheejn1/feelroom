package com.d208.feelroom.comment.domain.repository;

import com.d208.feelroom.comment.domain.entity.CommentLike;
import com.d208.feelroom.comment.domain.entity.CommentLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface CommentLikeRepository extends JpaRepository<CommentLike, CommentLikeId> {
    boolean existsByComment_CommentIdAndUser_UserId(UUID commentId, Long userId);

    // 특정 댓글/사용자에 대한 '좋아요' 엔티티 자체를 조회 (삭제를 위해)
    Optional<CommentLike> findByComment_CommentIdAndUser_UserId(UUID commentId, Long userId);

    @Modifying
    @Query("DELETE FROM CommentLike cl WHERE cl.comment.commentId = :commentId AND cl.user.userId = :userId")
    void deleteByCommentIdAndUserId(UUID commentId, Long userId);

    @Query("SELECT cl.comment.commentId FROM CommentLike cl " +
            "WHERE cl.user.userId = :userId AND cl.comment.commentId IN :commentIds")
    Set<UUID> findLikedCommentIdsByUser(@Param("userId") Long userId, @Param("commentIds") List<UUID> commentIds);

    /**
     * 특정 댓글(commentId)에 달린 총 '좋아요' 개수를 계산하여 반환합니다.
     * @param commentId 총 좋아요 수를 계산할 댓글의 ID
     * @return 해당 댓글의 총 좋아요 수
     */
    long countByComment_CommentId(UUID commentId); // 이 메서드가 필요함
}
