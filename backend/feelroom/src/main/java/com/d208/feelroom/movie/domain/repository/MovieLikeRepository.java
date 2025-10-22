package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.MovieLike;
import com.d208.feelroom.movie.domain.entity.MovieLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieLikeRepository extends JpaRepository<MovieLike, MovieLikeId> {

    //boolean existsByMovie_MovieIdAndUser_UserId(Integer movieId, Long userId);

    Optional<MovieLike> findByMovie_MovieIdAndUser_UserId(Integer movieId, Long userId);

    @Modifying
    @Query("DELETE FROM MovieLike ml WHERE ml.movie.movieId = :movieId AND ml.user.userId = :userId")
    void deleteByMovieIdAndUserId(@Param("movieId") Integer movieId, @Param("userId") Long userId);

    /**
     * User Activity Badge System
     */
    long countByUser_UserId(Long userId); // 사용자가 누른 총 영화 좋아요 수

    boolean existsById_MovieIdAndId_UserId(Integer movieId, Long userId);

    /**
     * [신규] 특정 사용자가 '좋아요'를 누른 모든 영화의 tmdb_id 목록을 조회합니다.
     *
     * @param userId 사용자의 ID
     * @return '좋아요'를 누른 영화의 tmdb_id 목록
     */
    @Query("SELECT ml.movie.tmdbId FROM MovieLike ml WHERE ml.user.userId = :userId")
    List<Integer> findLikedMovieTmdbIdsByUserId(@Param("userId") Long userId);
}
