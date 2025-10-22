package com.d208.feelroom.review.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 요청된 태그 ID에 해당하는 태그를 찾을 수 없을 때 발생하는 예외입니다.
 * 이 예외가 Controller 레벨까지 전파되면 HTTP 404 Not Found 상태 코드를 반환합니다.
 */
@ResponseStatus(HttpStatus.NOT_FOUND) // 이 어노테이션을 붙이면 Spring이 자동으로 HTTP 404 응답을 생성해줍니다.
public class TagNotFoundException extends RuntimeException {

    // 기본 생성자
    public TagNotFoundException() {
        super("해당 태그를 찾을 수 없습니다.");
    }

    // 메시지를 받는 생성자
    public TagNotFoundException(String message) {
        super(message);
    }

    // 메시지와 원인(cause)을 받는 생성자
    public TagNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}