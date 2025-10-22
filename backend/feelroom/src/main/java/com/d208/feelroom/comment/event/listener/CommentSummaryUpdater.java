package com.d208.feelroom.comment.event.listener;

import com.d208.feelroom.comment.domain.repository.CommentSummaryRepository;
import com.d208.feelroom.comment.event.CommentInteractionEvent;
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
public class CommentSummaryUpdater {

    private final CommentSummaryRepository commentSummaryRepository;

    /**
     * 댓글에 대한 좋아요 변경 이벤트를 비동기적으로 처리하여
     * CommentSummary 테이블을 업데이트합니다.
     * 트랜잭션이 성공적으로 커밋된 후에 새로운 트랜잭션으로 실행됩니다.
     *
     * @param event 좋아요 변경 이벤트
     */
    @Async // 비동기적으로 실행
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) // 부모 트랜잭션 커밋 후 실행
    @Transactional(propagation = Propagation.REQUIRES_NEW) // 새로운 트랜잭션에서 실행
    public void handleCommentInteractionEvent(CommentInteractionEvent event) {
        log.info("UPSERT CommentSummary 실행: commentId={}, likeChange={}",
                event.getCommentId(), event.getLikeChange());

        try {
            // CommentSummaryRepository의 upsertCommentLikeSummary 메서드 호출
            commentSummaryRepository.upsertCommentLikeSummary(
                    event.getCommentId(),
                    event.getLikeChange()
            );
            log.debug("CommentSummary updated successfully for commentId: {}", event.getCommentId());
        } catch (Exception e) {
            log.error("CommentSummary UPSERT 중 오류 발생 (commentId: {})", event.getCommentId(), e);
            // 에러 알림 로직 추가
        }
    }
}