package com.d208.feelroom.movie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikedMovieInfo {
    private Integer movie_id;
    private String title;
    private String poster_url;
}
