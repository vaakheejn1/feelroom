package com.d208.feelroom.movie.exception;

import com.d208.feelroom.global.exception.BusinessException;
import com.d208.feelroom.global.exception.ErrorCode;

public class MovieNotFoundException extends BusinessException {
    public MovieNotFoundException() {
        super(ErrorCode.MOVIE_NOT_FOUND);
    }

    public MovieNotFoundException(Integer movieId) {
        super(ErrorCode.MOVIE_NOT_FOUND, "영화를 찾을 수 없습니다. Movie ID: " + movieId);
    }
}