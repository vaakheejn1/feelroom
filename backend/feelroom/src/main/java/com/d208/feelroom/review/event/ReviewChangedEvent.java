package com.d208.feelroom.review.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 리뷰가 생성되거나 삭제되었을 때 발행되는 이벤트
 */
@Getter
@RequiredArgsConstructor // final 필드만 포함하는 생성자를 만들어줍니다.
public class ReviewChangedEvent {

    private final Integer movieId;
    private final int ratingChange; // 평점 변화량 (추가: +rating, 삭제: -rating)
    private final int countChange;  // 리뷰 개수 변화량 (+1 또는 -1)

}