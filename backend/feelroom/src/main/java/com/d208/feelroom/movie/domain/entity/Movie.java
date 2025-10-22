package com.d208.feelroom.movie.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Integer movieId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "release_date", nullable = false, length = 10)
    private String releaseDate; // CHAR(10)에 맞춰 String으로 유지

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(name = "vote_average")
    private Double voteAverage;

    @Column(name = "vote_count")
    private Integer voteCount;

    private Integer runtime;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "tmdb_id", unique = true)
    private Integer tmdbId; // TMDB의 영화 ID
}
