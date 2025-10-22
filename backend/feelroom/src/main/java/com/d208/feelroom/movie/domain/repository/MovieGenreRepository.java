package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.Genre;
import com.d208.feelroom.movie.domain.entity.Movie; // Movie 엔티티 import
import com.d208.feelroom.movie.domain.entity.MovieGenre;
import com.d208.feelroom.movie.domain.entity.MovieGenreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieGenreRepository extends JpaRepository<MovieGenre, MovieGenreId> {

    /**
     * 복합키로 MovieGenre 엔티티를 조회합니다.
     * JpaRepository 기본 메서드인 findById(ID id) 사용을 더 권장합니다.
     */
    Optional<MovieGenre> findById_MovieIdAndId_GenreId(Integer movieId, Integer genreId);

    /**
     * 특정 영화 ID에 해당하는 모든 장르 '엔티티'를 조회합니다.
     * JOIN FETCH 대신 경로 탐색을 사용합니다.
     */
    @Query("SELECT mg.genre FROM MovieGenre mg WHERE mg.id.movieId = :movieId")
    List<Genre> findGenresByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 영화 ID에 해당하는 모든 장르의 '이름'만 조회합니다.
     */
    @Query("SELECT mg.genre.name FROM MovieGenre mg WHERE mg.id.movieId = :movieId")
    List<String> findGenreNamesByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 장르 ID에 해당하는 모든 'Movie' 엔티티를 조회합니다.
     */
    @Query("SELECT mg.movie FROM MovieGenre mg WHERE mg.id.genreId = :genreId")
    List<Movie> findMoviesByGenreId(@Param("genreId") Integer genreId);

    /**
     * 특정 영화 ID에 해당하는 모든 MovieGenre '연관 엔티티'를 조회합니다.
     * 쿼리 메서드로 자동 생성이 가능합니다.
     */
    List<MovieGenre> findById_MovieId(Integer movieId);

    // 영화-장르 관계 추가 (중복 방지)
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO movie_genre (movie_id, genre_id) VALUES (:movieId, :genreId)", nativeQuery = true)
    void insertMovieGenre(@Param("movieId") Integer movieId, @Param("genreId") Integer genreId);

    // 영화-장르 관계 존재 여부 확인
    @Query(value = "SELECT COUNT(*) > 0 FROM movie_genre WHERE movie_id = :movieId AND genre_id = :genreId", nativeQuery = true)
    boolean existsByMovieIdAndGenreId(@Param("movieId") Integer movieId, @Param("genreId") Integer genreId);

}