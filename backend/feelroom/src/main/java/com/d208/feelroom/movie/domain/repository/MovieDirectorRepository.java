package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.Director;
import com.d208.feelroom.movie.domain.entity.Movie; // Movie 엔티티 import
import com.d208.feelroom.movie.domain.entity.MovieDirector;
import com.d208.feelroom.movie.domain.entity.MovieDirectorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieDirectorRepository extends JpaRepository<MovieDirector, MovieDirectorId> {

    /**
     * 복합키로 MovieDirector 엔티티를 조회합니다.
     * JPA 기본 메서드인 findById(ID id) 사용을 더 권장합니다.
     * 예: findById(new MovieDirectorId(movieId, directorId))
     */
    Optional<MovieDirector> findById_MovieIdAndId_DirectorId(Integer movieId, Integer directorId);

    /**
     * 특정 영화 ID에 해당하는 모든 감독 '엔티티'를 조회합니다.
     */
    @Query("SELECT md.director FROM MovieDirector md WHERE md.id.movieId = :movieId")
    List<Director> findDirectorsByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 영화 ID에 해당하는 모든 감독의 '이름'만 조회합니다. (가장 효율적)
     * JOIN을 명시하지 않아도 JPA가 묵시적으로 조인합니다.
     */
    @Query("SELECT md.director.name FROM MovieDirector md WHERE md.id.movieId = :movieId")
    List<String> findDirectorNamesByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 감독 ID가 참여한 모든 'Movie' 엔티티를 조회합니다. (필모그래피)
     */
    @Query("SELECT md.movie FROM MovieDirector md WHERE md.id.directorId = :directorId")
    List<Movie> findMoviesByDirectorId(@Param("directorId") Integer directorId);

    /**
     * 특정 영화 ID에 해당하는 모든 MovieDirector '연관 엔티티'를 조회합니다.
     * 쿼리 메서드로도 생성이 가능합니다.
     */
    List<MovieDirector> findById_MovieId(Integer movieId);

    // 영화-감독 관계 추가 (중복 방지)
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO movie_director (movie_id, director_id) VALUES (:movieId, :directorId)", nativeQuery = true)
    void insertMovieDirector(@Param("movieId") Integer movieId, @Param("directorId") Integer directorId);

    // 영화-감독 관계 존재 여부 확인
    @Query(value = "SELECT COUNT(*) > 0 FROM movie_director WHERE movie_id = :movieId AND director_id = :directorId", nativeQuery = true)
    boolean existsByMovieIdAndDirectorId(@Param("movieId") Integer movieId, @Param("directorId") Integer directorId);

}