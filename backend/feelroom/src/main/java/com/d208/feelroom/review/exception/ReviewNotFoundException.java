package com.d208.feelroom.review.exception;

import com.d208.feelroom.global.exception.BusinessException;
import com.d208.feelroom.global.exception.ErrorCode;

import java.util.UUID;

public class ReviewNotFoundException extends BusinessException {
    public ReviewNotFoundException(){
        super(ErrorCode.REVIEW_NOT_FOUND);
    }

    // ID 포함 더 상세한 메시지
    public ReviewNotFoundException(UUID reviewId){
        super(ErrorCode.REVIEW_NOT_FOUND, "해당 리뷰를 찾을 수 없습니다. Review ID: " + reviewId);
    }
}
