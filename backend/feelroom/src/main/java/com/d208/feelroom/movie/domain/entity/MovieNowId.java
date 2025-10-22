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
public class MovieNowId {
    @Column(name = "movie_id", nullable = false)
    private Integer movieId; // movie_id 필드와 매칭

    @Column(name = "ranking_date", nullable = false)
    private LocalDate rankingDate; // ranking_date 필드와 매칭
}