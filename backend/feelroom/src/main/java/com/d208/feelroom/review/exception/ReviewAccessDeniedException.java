package com.d208.feelroom.review.exception;

import com.d208.feelroom.global.exception.BusinessException;
import com.d208.feelroom.global.exception.ErrorCode;

public class ReviewAccessDeniedException extends BusinessException {
    public ReviewAccessDeniedException() {
        super(ErrorCode.ACCESS_DENIED, "이 리뷰에 접근할 권한이 없습니다.");
    }
}