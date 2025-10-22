package com.d208.feelroom.movie.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TmdbCrewDto {
    private Integer id; // TMDB 인물 ID
    private String name;
    private String job; // 역할 (예: "Director")
}
