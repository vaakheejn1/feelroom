package com.d208.feelroom.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 공통
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "유효하지 않은 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C002", "서버 내부 오류가 발생했습니다."),

    // 인증 및 인가 (Auth)
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증되지 않은 사용자입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "A002", "접근 권한이 없습니다."),

    // 사용자 (User)
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "해당 사용자를 찾을 수 없습니다."),
    EMAIL_DUPLICATION(HttpStatus.CONFLICT, "U002", "이미 사용 중인 이메일입니다."),
    USERNAME_DUPLICATION(HttpStatus.CONFLICT, "U003", "이미 사용 중인 사용자 이름입니다."),

    // 리뷰 (Review)
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "해당 리뷰를 찾을 수 없습니다."),

    // 영화 (Movie)
    MOVIE_NOT_FOUND(HttpStatus.NOT_FOUND, "M001", "해당 영화를 찾을 수 없습니다."),

    // 태그 (Tag)
    TAG_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "해당 태그를 찾을 수 없습니다."),

    // Comment
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "CM001", "댓글을 찾을 수 없습니다."),
    COMMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "CM002", "댓글에 대한 접근 권한이 없습니다."),
    INVALID_PARENT_COMMENT(HttpStatus.BAD_REQUEST, "CM003", "부모 댓글이 다른 리뷰에 속해 있습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}