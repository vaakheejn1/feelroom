package com.d208.feelroom.review.service.scheduler;

import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.review.domain.repository.ReviewSummaryRepository;
import com.d208.feelroom.review.util.PopularityCalculator;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class PopularReviewScheduler {

    private final ReviewRepository reviewRepository;
    private final ReviewSummaryRepository reviewSummaryRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String POPULAR_REVIEWS_ZSET_KEY = "popular_reviews";

    /**
     * 서버 시작 시 딱 한 번 실행되는 초기화 메서드.
     * updatePopularReviewsScore() 메서드를 직접 호출합니다.
     */
    //@PostConstruct // 2. 어노테이션 추가
    public void init() {
        log.info("[PostConstruct] Initializing popular review scores on application startup.");
        updatePopularReviewsScore(); // 3. 스케줄러 로직 호출
    }

    /**
     * 1시간마다 '최근 7일 이내에 작성된' 리뷰들의 인기 점수를 재계산합니다.
     * 모든 리뷰를 대상으로 하지 않아 DB 부하를 줄입니다.
     */
    @Scheduled(cron = "0 0 * * * *") // 매시 정각에 실행
    public void updatePopularReviewsScore() {
        log.info("[Scheduler] Starting popular review score update at {}", LocalDateTime.now());
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        // findByCreatedAtAfter는 ReviewRepository에 추가해야 할 메서드
        reviewRepository.findByCreatedAtAfter(sevenDaysAgo).forEach(review -> {
            Integer likesCount = reviewSummaryRepository.findById(review.getReviewId())
                    .map(summary -> summary.getReviewLikeCount())
                    .orElse(0);

            double score = PopularityCalculator.calculateReviewPopularity(likesCount, review.getCreatedAt());
            redisTemplate.opsForZSet().add(POPULAR_REVIEWS_ZSET_KEY, review.getReviewId().toString(), score);
        });

        log.info("[Scheduler] Finished popular review score update.");
    }
}