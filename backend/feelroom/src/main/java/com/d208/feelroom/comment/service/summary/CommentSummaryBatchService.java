package com.d208.feelroom.comment.service.summary;

import com.d208.feelroom.comment.domain.entity.Comment; // Comment 엔티티 필요 (summary가 없는 경우 생성 시)
import com.d208.feelroom.comment.domain.entity.summary.CommentSummary;
import com.d208.feelroom.comment.domain.repository.CommentRepository;
import com.d208.feelroom.comment.domain.repository.CommentSummaryRepository; // CommentSummaryRepository 주입
import com.d208.feelroom.comment.domain.repository.CommentLikeRepository; // 좋아요 수 조회용
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentSummaryBatchService {

    private final CommentRepository commentRepository;
    private final CommentSummaryRepository commentSummaryRepository;
    private final CommentLikeRepository commentLikeRepository;

    /**
     * 서버 시작 시 딱 한 번 실행되는 초기화 메서드.
     * 댓글 요약 정보 전체를 DB 기반으로 재계산하여 동기화합니다.
     */
    //@PostConstruct
    public void initializeCommentSummaries() {
        log.info("[PostConstruct] Initializing all comment summaries on application startup.");
        syncExistingCommentSummaries(); // 4. 전체 동기화 로직 호출
        log.info("[PostConstruct] Finished initializing comment summaries.");
    }

    /**
     * 매일 새벽 4시에 기존 댓글 요약 정보(CommentSummary)를 재동기화합니다.
     * 이미 CommentSummary가 존재하는 댓글들만 대상으로 합니다.
     * (새로운 댓글의 좋아요 Summary는 이벤트 리스너가 처리)
     */
    @Scheduled(cron = "0 0 4 * * *") // 매일 새벽 4시 (다른 배치와 겹치지 않게)
    public void syncExistingCommentSummaries() {
        log.info("===== CommentSummary Sync Batch Started (Existing Summaries Only) =====");
        long startTime = System.currentTimeMillis();

        List<CommentSummary> existingSummaries = commentSummaryRepository.findAll();

        int processedCount = 0;
        int failedCount = 0;

        log.info("Processing {} existing CommentSummaries...", existingSummaries.size());
        for (CommentSummary summary : existingSummaries) {
            try {
                // 각 댓글별 요약 정보 업데이트를 별도의 트랜잭션으로 처리
                syncSingleCommentSummary(summary.getCommentId());
                processedCount++;
            } catch (Exception e) {
                failedCount++;
                log.error("Failed to sync CommentSummary for comment ID: {}. Error: {}", summary.getCommentId(), e.getMessage(), e);
            }
        }

        long endTime = System.currentTimeMillis();
        log.info("===== CommentSummary Sync Batch Finished =====");
        log.info("Total existing summaries processed: {}, Success: {}, Failed: {}, Duration: {} ms",
                existingSummaries.size(), processedCount, failedCount, (endTime - startTime));
    }

    /**
     * 특정 댓글의 CommentSummary를 CommentLike 테이블의 실제 데이터와 동기화합니다.
     * 이 메서드는 외부 호출 시 새로운 트랜잭션을 시작합니다.
     *
     * @param commentId 동기화할 댓글의 ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void syncSingleCommentSummary(UUID commentId) {
        log.debug("Syncing CommentSummary for comment ID: {}", commentId);

        // 1. CommentLike 테이블에서 해당 댓글의 실제 좋아요 개수 계산
        long actualLikeCount = commentLikeRepository.countByComment_CommentId(commentId);

        // 2. CommentSummary 엔티티를 찾거나 새로 생성
        CommentSummary commentSummary = commentSummaryRepository.findById(commentId)
                .orElseGet(() -> {
                    // CommentSummary가 없으면 새로 생성해야 하므로, Comment 엔티티를 조회
                    Comment comment = commentRepository.findById(commentId)
                            .orElseThrow(() -> new IllegalStateException("Comment not found for ID: " + commentId));
                    log.warn("CommentSummary for comment ID {} was not found, creating a new one during batch sync.", commentId);
                    return CommentSummary.builder().comment(comment).build();
                });

        // 3. 계산된 실제 값으로 CommentSummary 업데이트 (재조정)
        commentSummary.reconcile(actualLikeCount);

        // 4. 변경된 CommentSummary 저장
        commentSummaryRepository.save(commentSummary);

        log.debug("Successfully synced CommentSummary for comment ID: {}. Likes: {}",
                commentId, actualLikeCount);
    }
}