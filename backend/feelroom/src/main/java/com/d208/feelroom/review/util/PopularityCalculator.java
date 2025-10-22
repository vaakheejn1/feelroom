package com.d208.feelroom.review.util;

import java.time.LocalDateTime;
import java.time.Duration;

public class PopularityCalculator {

    // Hacker News 랭킹 알고리즘의 중력 상수
    // 값이 클수록 최신 리뷰가 더 유리해집니다. 서비스에 맞게 튜닝 필요 (1.5 ~ 2.0 권장)
    private static final double GRAVITY = 1.8;

    /**
     * 리뷰의 인기 점수를 계산합니다.
     * Score = (likesCount) / (hoursSinceCreation + 2)^GRAVITY
     *
     * @param likesCount 리뷰의 좋아요 수
     * @param createdAt 리뷰 생성 시간
     * @return 계산된 인기 점수
     */
        public static double calculateReviewPopularity(int likesCount, LocalDateTime createdAt) {
            if (createdAt == null) {
                // 생성 시간이 없으면 점수 계산 불가, 0 또는 예외 처리
                return 0.0;
            }

            long hoursSinceCreation = Duration.between(createdAt, LocalDateTime.now()).toHours();

            // 0으로 나누는 것을 방지하고, 시간이 적어도 기본값 2를 가지도록 합니다.
            // likesCount가 0일 때도 0이 되도록 함
            return (double) likesCount / Math.pow(hoursSinceCreation + 2, GRAVITY);
        }
}