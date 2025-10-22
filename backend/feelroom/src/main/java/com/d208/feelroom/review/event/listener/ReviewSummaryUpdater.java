package com.d208.feelroom.review.event.listener;

import com.d208.feelroom.review.domain.repository.ReviewSummaryRepository;
import com.d208.feelroom.review.event.ReviewInteractionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewSummaryUpdater {

    private final ReviewSummaryRepository reviewSummaryRepository;

    /**
     * 리뷰에 대한 좋아요 또는 댓글 변경 이벤트를 비동기적으로 처리하여
     * ReviewSummary 테이블을 업데이트합니다.
     * 트랜잭션이 성공적으로 커밋된 후에 새로운 트랜잭션으로 실행됩니다.
     *
     * @param event 좋아요 또는 댓글 변경 이벤트
     */
    @Async // 비동기적으로 실행
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) // 부모 트랜잭션 커밋 후 실행
    @Transactional(propagation = Propagation.REQUIRES_NEW) // 새로운 트랜잭션에서 실행
    public void handleReviewInteractionEvent(ReviewInteractionEvent event) {
        log.info("UPSERT ReviewSummary 실행: reviewId={}, likeChange={}, commentChange={}",
                event.getReviewId(), event.getLikeChange(), event.getCommentChange());

        try {
            // ReviewSummaryRepository의 upsertReviewInteractionSummary 메서드 호출
            reviewSummaryRepository.upsertReviewInteractionSummary(
                    event.getReviewId(),
                    event.getLikeChange(),
                    event.getCommentChange()
            );
            log.debug("ReviewSummary updated successfully for reviewId: {}", event.getReviewId());
        } catch (Exception e) {
            // DB 제약 조건 위반 등 예외 발생 시 로그 기록 및 후속 처리
            log.error("ReviewSummary UPSERT 중 오류 발생 (reviewId: {})", event.getReviewId(), e);
            // 필요 시 에러 알림(Sentry, Slack 등) 로직 추가
        }
    }
}