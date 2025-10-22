package com.d208.feelroom.comment.exception;

import com.d208.feelroom.global.exception.BusinessException;
import com.d208.feelroom.global.exception.ErrorCode;

public class CommentAccessDeniedException extends BusinessException {

  // 기본 생성자: ErrorCode만 사용
  public CommentAccessDeniedException() {
    super(ErrorCode.COMMENT_ACCESS_DENIED, "댓글을 수정할 권한이 없습니다.");
  }

  // 메시지를 커스텀하고 싶을 때 사용하는 생성자
  public CommentAccessDeniedException(String message) {
    super(ErrorCode.COMMENT_ACCESS_DENIED, message);
  }
}