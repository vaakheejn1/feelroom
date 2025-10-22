package com.d208.feelroom.movie.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "temp_movie_now")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TempMovieNow {

    @EmbeddedId
    private TempMovieNowId id;

    @Column(name = "movie_name", nullable = false, length = 200)
    private String movieName;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "ranking", nullable = false)
    private Integer ranking;

    @Column(name = "audience", nullable = false)
    private Integer audience;

    // 매칭 관련
    @Column(name = "matched_movie_id")
    private Integer matchedMovieId;

    @Column(name = "is_matched")
    private Boolean isMatched = false;

    // 매칭된 Movie 엔티티 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matched_movie_id", insertable = false, updatable = false)
    private Movie matchedMovie;

    // 편의 메서드: TempMovieNowId에서 값들을 쉽게 접근
    public String getKobisMovieCd() {
        return id != null ? id.getKobisMovieCd() : null;
    }

    public LocalDate getRankingDate() {
        return id != null ? id.getRankingDate() : null;
    }
}