package com.d208.feelroom.movie.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingMovieResponseDto {
    private Integer movieId;
    private String title;
    private String posterUrl;
    private List<String> genres;
}