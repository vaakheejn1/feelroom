package com.d208.feelroom.movie.domain.entity;

import com.d208.feelroom.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "movie_likes") // DDL의 테이블 이름은 'review_likes' 입니다.
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class MovieLike {

    @EmbeddedId
    private MovieLikeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("movieId")
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @CreatedDate // Auditing 기능으로 생성 시각 자동 주입
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // --- 생성자 ---

    @Builder
    public MovieLike(User user, Movie movie) {
        this.id = new MovieLikeId(user.getUserId(), movie.getMovieId());
        this.user = user;
        this.movie = movie;
    }
}

