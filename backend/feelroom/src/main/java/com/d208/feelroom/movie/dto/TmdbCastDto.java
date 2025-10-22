package com.d208.feelroom.movie.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TmdbCastDto {
    private Integer id; // TMDB 인물 ID
    private String name;
    private String character; // 캐릭터 이름
    private Integer order; // 순서
}
