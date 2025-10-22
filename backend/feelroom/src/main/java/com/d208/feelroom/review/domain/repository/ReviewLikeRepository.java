package com.d208.feelroom.review.domain.repository;

import com.d208.feelroom.review.domain.entity.ReviewLike; // 경로에 맞게 수정
import com.d208.feelroom.review.domain.entity.ReviewLikeId; // 경로에 맞게 수정
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, ReviewLikeId> {
    // 특정 사용자가 특정 리뷰를 좋아요 했는지 존재 여부만 확인 (가장 효율적)
    // Spring Data JPA가 메서드 이름을 보고 자동으로 쿼리를 생성합니다.
    boolean existsById_ReviewIdAndId_UserId(UUID reviewId, Long userId);

    /**
     * 특정 사용자가 주어진 여러 리뷰들 중에서 '좋아요'를 누른 리뷰의 ID 목록을 조회합니다.
     * @param userId 현재 로그인한 사용자의 ID
     * @param reviewIds 확인할 리뷰 ID 목록
     * @return '좋아요'를 누른 리뷰 ID의 Set
     */
    @Query("SELECT rl.review.id FROM ReviewLike rl " +
            "WHERE rl.user.id = :userId AND rl.review.id IN :reviewIds")
    Set<UUID> findLikedReviewIdsByUser(@Param("userId") Long userId, @Param("reviewIds") List<UUID> reviewIds);
    
    long countByReview_ReviewId(UUID reviewId);

    /**
     * 특정 리뷰(reviewId)에 대해 특정 사용자(userId)가 '좋아요'를 눌렀는지 확인하고,
     * 만약 '좋아요' 기록이 존재한다면 ReviewLike 엔티티 자체를 Optional에 담아 반환합니다.
     * '좋아요' 기록이 없으면 Optional.empty()를 반환합니다.
     *
     * 이 메서드는 주로 '좋아요 토글' 기능에서 사용됩니다.
     * 1. `isPresent()`를 통해 좋아요 존재 여부를 확인합니다.
     * 2. 존재할 경우, 반환된 ReviewLike 엔티티를 `delete()` 메서드에 전달하여 '좋아요'를 취소합니다.
     *
     * @param reviewId 확인할 리뷰의 ID
     * @param userId   확인할 사용자의 ID
     * @return ReviewLike 엔티티를 담은 Optional 객체
     */
    Optional<ReviewLike> findByReview_ReviewIdAndUser_UserId(UUID reviewId, Long userId);

    /**
     * User Activity Badge System
     */
    @Query("SELECT COUNT(rl) FROM ReviewLike rl WHERE rl.review.user.id = :userId")
    long countLikesReceivedOnUserReviews(@Param("userId") Long userId); // 내 리뷰가 받은 총 좋아요 수

    /**
     * 특정 사용자가 '좋아요'를 누른 모든 리뷰의 ID(UUID) 목록을 조회합니다.
     * AI 추천 모델에 사용자 활동 데이터를 전달하기 위해 사용됩니다.
     * @param userId 사용자의 ID
     * @return 해당 사용자가 '좋아요'한 리뷰의 ID(UUID) 리스트
     */
    @Query("SELECT rl.review.reviewId FROM ReviewLike rl WHERE rl.user.userId = :userId")
    List<UUID> findReviewIdsByUserId(@Param("userId") Long userId);
}