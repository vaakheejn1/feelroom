package com.d208.feelroom.movie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class LikedMovieListResponseDto {
    private List<LikedMovieInfo> movies;
    private boolean hasNext; // 다음 페이지가 있는지 여부
}
