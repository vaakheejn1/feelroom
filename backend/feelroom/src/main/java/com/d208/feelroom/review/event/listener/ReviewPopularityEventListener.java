// package com.d208.feelroom.domain.review.listener;
package com.d208.feelroom.review.event.listener;

import com.d208.feelroom.review.domain.repository.ReviewRepository; // 실제 경로
import com.d208.feelroom.review.domain.repository.ReviewSummaryRepository; // 실제 경로
import com.d208.feelroom.review.event.ReviewPopularityUpdateEvent;
import com.d208.feelroom.review.util.PopularityCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

import static com.d208.feelroom.review.event.ReviewPopularityUpdateEvent.EventType.DELETED;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewPopularityEventListener {

    private final ReviewRepository reviewRepository;
    private final ReviewSummaryRepository reviewSummaryRepository; // 좋아요 수 조회를 위해 주입
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String POPULAR_REVIEWS_ZSET_KEY = "popular_reviews";

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleReviewPopularityUpdate(ReviewPopularityUpdateEvent event) {
        UUID reviewId = event.getReviewId();
        String reviewIdStr = reviewId.toString();

        if (event.getType() == DELETED) {
            redisTemplate.opsForZSet().remove(POPULAR_REVIEWS_ZSET_KEY, reviewIdStr);
            log.info("[Redis] Removed deleted review {} from popular_reviews ZSET.", reviewId);
            return;
        }

        // LIKED 이벤트 처리
        // 1. 리뷰의 생성 시간을 가져옵니다. (리뷰가 없다면 처리 중단)
        reviewRepository.findById(reviewId).ifPresent(review -> {
            // 2. ReviewSummary에서 최신 좋아요 수를 가져옵니다.
            //    ReviewSummary가 아직 없거나 좋아요가 0일 수 있으므로, null일 경우 0으로 처리합니다.
            Integer likesCount = reviewSummaryRepository.findById(reviewId)
                    .map(summary -> summary.getReviewLikeCount())
                    .orElse(0);

            // 3. 인기 점수를 계산합니다.
            double score = PopularityCalculator.calculateReviewPopularity(likesCount, review.getCreatedAt());

            // 4. Redis ZSET에 점수를 업데이트합니다.
            redisTemplate.opsForZSet().add(POPULAR_REVIEWS_ZSET_KEY, reviewIdStr, score);
            log.info("[Redis] Updated review {} with score {}. Likes: {}", reviewId, score, likesCount);
        });
    }
}