package com.d208.feelroom.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TmdbPagedResponseDto {
    private Integer page;
    private List<MovieResult> results;
    @JsonProperty("total_pages")
    private Integer totalPages;
    @JsonProperty("total_results")
    private Integer totalResults;

    @Getter
    @Setter
    public static class MovieResult {
        private Integer id;
        private String title;
        @JsonProperty("release_date")
        private String releaseDate;
        // 필요에 따라 다른 필드 추가 가능
    }
}
