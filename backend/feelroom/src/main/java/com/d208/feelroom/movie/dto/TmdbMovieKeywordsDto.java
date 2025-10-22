package com.d208.feelroom.movie.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TmdbMovieKeywordsDto {
    private List<TmdbKeywordDto> keywords;
}
