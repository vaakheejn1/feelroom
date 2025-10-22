package com.d208.feelroom.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TmdbChangesResponseDto {
    private List<ChangedMovie> results;
    private Integer page;
    @JsonProperty("total_pages")
    private Integer totalPages;
    @JsonProperty("total_results")
    private Integer totalResults;

    @Getter
    @Setter
    public static class ChangedMovie {
        private Integer id; // TMDB 영화 ID
        private Boolean adult;
    }
}