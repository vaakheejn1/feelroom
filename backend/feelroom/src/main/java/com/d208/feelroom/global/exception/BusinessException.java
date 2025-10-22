package com.d208.feelroom.global.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

  private final ErrorCode errorCode;

  public BusinessException(ErrorCode errorCode) {
    super(errorCode.getMessage()); // RuntimeException의 message 필드에 메시지 저장
    this.errorCode = errorCode;
  }

  // 메시지를 동적으로 변경하고 싶을 때 사용
  public BusinessException(ErrorCode errorCode, String customMessage) {
    super(customMessage);
    this.errorCode = errorCode;
  }
}