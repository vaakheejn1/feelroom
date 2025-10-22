package com.d208.feelroom.comment.exception;

import com.d208.feelroom.global.exception.BusinessException;
import com.d208.feelroom.global.exception.ErrorCode;

import java.util.UUID;

// 이제 @ResponseStatus 어노테이션은 필요 없습니다.
// ErrorCode에 포함된 HttpStatus를 GlobalExceptionHandler에서 사용하게 됩니다.
public class CommentNotFoundException extends BusinessException {

    // 기본 생성자: ErrorCode만 사용
    public CommentNotFoundException() {
        super(ErrorCode.COMMENT_NOT_FOUND);
    }

    // ID를 메시지에 포함하고 싶을 때 사용하는 생성자
    public CommentNotFoundException(UUID commentId) {
        super(ErrorCode.COMMENT_NOT_FOUND, "해당 댓글을 찾을 수 없습니다. ID: " + commentId);
    }

    // 메시지만 커스텀하고 싶을 때 사용하는 생성자
    public CommentNotFoundException(String message) {
        super(ErrorCode.COMMENT_NOT_FOUND, message);
    }
}