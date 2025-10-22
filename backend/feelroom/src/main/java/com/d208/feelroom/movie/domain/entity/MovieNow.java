package com.d208.feelroom.movie.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "movie_now")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieNow {

    @EmbeddedId // 복합 키를 나타내는 임베디드 ID 필드
    private MovieNowId id;

    // Movie와의 관계 매핑 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", insertable = false, updatable = false)
    private Movie movie;

    @Column(name = "ranking", nullable = false)
    private Integer ranking; // KOBIS API의 rank에 해당

    @Column(name = "audience", nullable = false)
    private Integer audience; // KOBIS API의 audiAcc에 해당 (누적 관객수)

    // 편의 메서드: MovieNowId에서 값들을 쉽게 접근
    public Integer getMovieId() {
        return id != null ? id.getMovieId() : null;
    }

    public LocalDate getRankingDate() {
        return id != null ? id.getRankingDate() : null;
    }
}