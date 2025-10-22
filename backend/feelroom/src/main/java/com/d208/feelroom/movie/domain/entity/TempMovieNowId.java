package com.d208.feelroom.movie.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.time.LocalDate;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TempMovieNowId {

    @Column(name = "kobis_movie_cd", nullable = false, length = 20)
    private String kobisMovieCd;

    @Column(name = "ranking_date", nullable = false)
    private LocalDate rankingDate;
}