package com.d208.feelroom.user.exception;

import com.d208.feelroom.global.exception.BusinessException;
import com.d208.feelroom.global.exception.ErrorCode;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException() {
        super(ErrorCode.USER_NOT_FOUND);
    }

    // ID 등을 포함한 더 상세한 메시지를 원할 경우
    public UserNotFoundException(Long userId) {
        super(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다. User ID: " + userId);
    }
}