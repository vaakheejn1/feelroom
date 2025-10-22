package com.d208.feelroom.global.exception;

import com.d208.feelroom.movie.exception.MovieNotFoundException;
import com.d208.feelroom.review.exception.ReviewNotFoundException;
import com.d208.feelroom.review.exception.TagNotFoundException;
import com.d208.feelroom.user.exception.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
	// --- 리소스 찾기 실패 예외 (404 Not Found) ---
	@ExceptionHandler({ MovieNotFoundException.class, TagNotFoundException.class, UserNotFoundException.class,
			ReviewNotFoundException.class })
	public ResponseEntity<ErrorResponse> handleResourceNotFoundException(RuntimeException ex) {
		log.warn(ex.getMessage());
		ErrorResponse error = new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage());
		return new ResponseEntity<>(error, HttpStatus.NOT_FOUND); // 404 Not Found
	}

	// --- 유효성 검사 실패 예외 (400 Bad Request) ---
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
		BindingResult bindingResult = ex.getBindingResult();
		StringBuilder sb = new StringBuilder();

		for (FieldError fieldError : bindingResult.getFieldErrors()) {
			sb.append("[");
			sb.append(fieldError.getField());
			sb.append("](은)는 ");
			sb.append(fieldError.getDefaultMessage());
			sb.append(". ");
		}

		String errorMessage = sb.toString();
		log.warn("Validation failed: {}", errorMessage);

		ErrorResponse error = new ErrorResponse("INVALID_INPUT_VALUE", errorMessage);
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST); // 400 Bad Request
	}

	// --- IllegalArgumentException 처리 (400 Bad Request) ---
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
		log.warn("Illegal argument: {}", ex.getMessage());
		ErrorResponse error = new ErrorResponse("BAD_REQUEST", ex.getMessage());
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST); // 400 Bad Request
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex) {
		ErrorResponse errorResponse = new ErrorResponse("ALREADY_SUBMITTED", ex.getMessage());
		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	// --- 그 외 모든 예상치 못한 예외 (500 Internal Server Error) ---
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleAllUncaughtException(Exception ex) {
		// 심각한 오류이므로 error 레벨로 로그를 남기고, 스택 트레이스도 함께 기록합니다.
		log.error("Unhandled exception occurred", ex);

		ErrorResponse error = new ErrorResponse("INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.");
		return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
	}

	public static record ErrorResponse(String code, String message) {
	}
}
