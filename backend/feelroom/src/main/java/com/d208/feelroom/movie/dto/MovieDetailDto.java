
package com.d208.feelroom.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieDetailDto {

    @JsonProperty("tmdbId")
    private Integer tmdbId;

    @JsonProperty("title")
    private String title;

    @JsonProperty("releaseDate")
    private String releaseDate;  // Movie 엔티티와 동일하게 String (YYYY-MM-DD 형식)

    @JsonProperty("overview")
    private String overview;

    @JsonProperty("voteAverage")
    private Double voteAverage;

    @JsonProperty("voteCount")
    private Integer voteCount;

    @JsonProperty("runtime")
    private Integer runtime;

    @JsonProperty("posterUrl")
    private String posterUrl;

    // 관계 데이터들 (향후 사용 가능)
    @JsonProperty("actors")
    private List<String> actors;

    @JsonProperty("directors")
    private List<String> directors;

    @JsonProperty("genres")
    private List<String> genres;

    @JsonProperty("keywords")
    private List<String> keywords;
}