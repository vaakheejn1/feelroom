package com.d208.feelroom.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TmdbMovieDetailDto {
    private Integer id; // TMDB 영화 ID
    private String title;
    @JsonProperty("release_date")
    private String releaseDate;
    private String overview;
    @JsonProperty("vote_average")
    private Double voteAverage;
    @JsonProperty("vote_count")
    private Integer voteCount;
    private Integer runtime;
    @JsonProperty("poster_path")
    private String posterPath; // 포스터 이미지 경로

    private List<TmdbGenreDto> genres; // 장르 목록

    // append_to_response로 받아오는 데이터들
    private TmdbMovieCreditsDto credits; // 배우 및 감독 정보
    private TmdbMovieKeywordsDto keywords; // 키워드 정보
}