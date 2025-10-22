package com.d208.feelroom.movie.event; // listener 패키지를 만들어 관리합니다.

import com.d208.feelroom.movie.domain.repository.MovieSummaryRepository;
import com.d208.feelroom.review.event.ReviewChangedEvent;
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
public class MovieSummaryUpdater {

    private final MovieSummaryRepository movieSummaryRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleReviewChangeEvent(ReviewChangedEvent event) {
        log.info("UPSERT 실행: movieId={}, ratingChange={}, countChange={}",
                event.getMovieId(), event.getRatingChange(), event.getCountChange());

        try {
            movieSummaryRepository.upsertReviewSummary(
                    event.getMovieId(),
                    event.getCountChange(),
                    event.getRatingChange()
            );
        } catch (Exception e) {
            // DB 제약 조건 위반 등 예외 발생 시 로그 기록 및 후속 처리
            log.error("MovieSummary UPSERT 중 오류 발생", e);
            // 필요 시 에러 알림(Sentry, Slack 등) 로직 추가
        }
    }
}