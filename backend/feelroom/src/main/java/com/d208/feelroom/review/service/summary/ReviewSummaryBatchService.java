package com.d208.feelroom.review.service.summary;

import com.d208.feelroom.review.domain.entity.Review; // Review 엔티티 필요 (summary가 없는 경우 생성 시)
import com.d208.feelroom.review.domain.entity.summary.ReviewSummary;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.review.domain.repository.ReviewSummaryRepository;
import com.d208.feelroom.comment.domain.repository.CommentRepository; // 댓글 수 조회용
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository; // 좋아요 수 조회용
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID; // Review ID가 UUID임을 명심

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewSummaryBatchService {

    private final ReviewRepository reviewRepository;
    private final ReviewSummaryRepository reviewSummaryRepository;
    private final ReviewLikeRepository reviewLikeRepository; // 좋아요 레포지토리 주입
    private final CommentRepository commentRepository;       // 댓글 레포지토리 주입

    /**
     * 서버 시작 시 딱 한 번 실행되는 초기화 메서드.
     * 댓글 요약 정보 전체를 DB 기반으로 재계산하여 동기화합니다.
     */
    //@PostConstruct
    public void initializeReviewSummaries() {
        log.info("[PostConstruct] Initializing all comment summaries on application startup.");
        syncExistingReviewSummaries(); // 4. 전체 동기화 로직 호출
        log.info("[PostConstruct] Finished initializing comment summaries.");
    }

    /**
     * 매일 새벽 3시에 기존 리뷰 요약 정보(ReviewSummary)를 재동기화합니다.
     * 이미 ReviewSummary가 존재하는 리뷰들만 대상으로 합니다.
     * (새로운 리뷰의 좋아요/댓글 Summary는 이벤트 리스너가 처리)
     */
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시 (MovieSummary와 겹치지 않게)
    public void syncExistingReviewSummaries() {
        log.info("===== ReviewSummary Sync Batch Started (Existing Summaries Only) =====");
        long startTime = System.currentTimeMillis();

        List<ReviewSummary> existingSummaries = reviewSummaryRepository.findAll();

        int processedCount = 0;
        int failedCount = 0;

        log.info("Processing {} existing ReviewSummaries...", existingSummaries.size());
        for (ReviewSummary summary : existingSummaries) {
            try {
                // 각 리뷰별 요약 정보 업데이트를 별도의 트랜잭션으로 처리
                syncSingleReviewSummary(summary.getReviewId());
                processedCount++;
            } catch (Exception e) {
                failedCount++;
                log.error("Failed to sync ReviewSummary for review ID: {}. Error: {}", summary.getReviewId(), e.getMessage(), e);
            }
        }

        long endTime = System.currentTimeMillis();
        log.info("===== ReviewSummary Sync Batch Finished =====");
        log.info("Total existing summaries processed: {}, Success: {}, Failed: {}, Duration: {} ms",
                existingSummaries.size(), processedCount, failedCount, (endTime - startTime));
    }

    /**
     * 특정 리뷰의 ReviewSummary를 ReviewLike/Comment 테이블의 실제 데이터와 동기화합니다.
     * 이 메서드는 외부 호출 시 새로운 트랜잭션을 시작합니다.
     *
     * @param reviewId 동기화할 리뷰의 ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void syncSingleReviewSummary(UUID reviewId) {
        log.debug("Syncing ReviewSummary for review ID: {}", reviewId);

        // 1. ReviewLike 테이블에서 해당 리뷰의 실제 좋아요 개수 계산
        long actualLikeCount = reviewLikeRepository.countByReview_ReviewId(reviewId);
        // 2. Comment 테이블에서 해당 리뷰의 실제 댓글 개수 계산
        long actualCommentCount = commentRepository.countByReview_ReviewId(reviewId);

        // 3. ReviewSummary 엔티티를 찾거나 새로 생성
        ReviewSummary reviewSummary = reviewSummaryRepository.findById(reviewId)
                .orElseGet(() -> {
                    // ReviewSummary가 없으면 새로 생성해야 하므로, Review 엔티티를 조회
                    Review review = reviewRepository.findById(reviewId)
                            .orElseThrow(() -> new IllegalStateException("Review not found for ID: " + reviewId));
                    log.warn("ReviewSummary for review ID {} was not found, creating a new one during batch sync.", reviewId);
                    return ReviewSummary.builder().review(review).build();
                });

        // 4. 계산된 실제 값으로 ReviewSummary 업데이트 (재조정)
        reviewSummary.reconcile(actualLikeCount, actualCommentCount);

        // 5. 변경된 ReviewSummary 저장
        reviewSummaryRepository.save(reviewSummary);

        log.debug("Successfully synced ReviewSummary for review ID: {}. Likes: {}, Comments: {}",
                reviewId, actualLikeCount, actualCommentCount);
    }

    /**
     * 전체 리뷰 요약 정보 재계산 (관리자용)
     */
    @Transactional
    public void fullUpdateReviewSummary() {
        log.info("전체 리뷰 요약 정보 재계산 시작");

        try {
            reviewSummaryRepository.deleteAllReviewSummary();
            int insertedCount = reviewSummaryRepository.insertAllReviewSummary();
            log.info("전체 리뷰 요약 정보 재계산 완료 - 처리된 리뷰 수: {}", insertedCount);
        } catch (Exception e) {
            log.error("전체 리뷰 요약 정보 재계산 중 오류 발생", e);
            throw e;
        }
    }


    /**
     * 개발/테스트 환경에서 ReviewSummary 기존 데이터 동기화 배치를 수동으로 실행합니다.
     * 이 메서드는 프로덕션 환경에서는 호출되지 않도록 주의해야 합니다.
     */
    @Transactional
    public void runSyncManually() {
        log.info("Manual Sync (Existing Review Summaries) initiated...");
        syncExistingReviewSummaries();
        log.info("Manual Sync (Existing Review Summaries) finished.");
    }

//    /**
//     * 배치 처리 상태 확인 (모니터링용)
//     */
//    @Transactional(readOnly = true)
//    public BatchStatus getBatchStatus() {
//        try {
//            long totalReviews = reviewRepository.countTotalValidReviews(); // 모든 유효한 리뷰 수
//            long summarizedReviews = reviewSummaryRepository.count();
//
//            // 가장 최근 업데이트 시간 조회 (ReviewSummary 엔티티의 updatedAt 필드 활용)
//            LocalDateTime lastBatchTime = reviewSummaryRepository.findTopByOrderByUpdatedAtDesc()
//                    .map(ReviewSummary::getUpdatedAt)
//                    .orElse(null); // Summary가 하나도 없으면 null
//
//            return BatchStatus.builder()
//                    .totalReviews(totalReviews)
//                    .summarizedReviews(summarizedReviews)
//                    .lastBatchTime(lastBatchTime)
//                    // totalReviews와 summarizedReviews가 같다고 해서 항상 최신이라는 보장은 없음.
//                    // 이 지표는 주로 "누락된 Summary가 있는지"를 확인하는 데 유용.
//                    .isUpToDate(totalReviews == summarizedReviews && lastBatchTime != null) // 더 의미있는 isUpToDate
//                    .build();
//
//        } catch (Exception e) {
//            log.error("배치 상태 확인 중 오류 발생", e);
//            throw e;
//        }
//    }
//
//    // BatchStatus 내부 클래스는 이전과 동일
//    public static class BatchStatus {
//        private final long totalReviews;
//        private final long summarizedReviews;
//        private final LocalDateTime lastBatchTime;
//        private final boolean isUpToDate;
//
//        @Builder // Lombok @Builder 어노테이션 추가
//        public BatchStatus(long totalReviews, long summarizedReviews,
//                           LocalDateTime lastBatchTime, boolean isUpToDate) {
//            this.totalReviews = totalReviews;
//            this.summarizedReviews = summarizedReviews;
//            this.lastBatchTime = lastBatchTime;
//            this.isUpToDate = isUpToDate;
//        }
//
//        // Getters
//        public long getTotalReviews() { return totalReviews; }
//        public long getSummarizedReviews() { return summarizedReviews; }
//        public LocalDateTime getLastBatchTime() { return lastBatchTime; }
//        public boolean isUpToDate() { return isUpToDate; }
//    }
}