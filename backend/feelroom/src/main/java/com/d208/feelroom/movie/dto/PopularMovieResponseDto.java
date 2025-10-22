package com.d208.feelroom.movie.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopularMovieResponseDto {
    private Integer movieId;
    private String title;
    private String posterUrl;
}