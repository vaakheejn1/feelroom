package com.d208.feelroom.movie.dto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TmdbMovieCreditsDto {
    private List<TmdbCastDto> cast; // 배우 목록
    private List<TmdbCrewDto> crew; // 스태프 (감독 포함) 목록
}
