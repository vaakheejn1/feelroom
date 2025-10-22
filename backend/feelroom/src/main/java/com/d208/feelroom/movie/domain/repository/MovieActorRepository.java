package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.Actor;
import com.d208.feelroom.movie.domain.entity.Movie; // Movie 엔티티 import
import com.d208.feelroom.movie.domain.entity.MovieActor;
import com.d208.feelroom.movie.domain.entity.MovieActorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieActorRepository extends JpaRepository<MovieActor, MovieActorId> {

    /**
     * 복합키로 MovieActor 엔티티를 조회합니다.
     * JPA 기본 메서드인 findById(ID id) 사용을 더 권장합니다.
     */
    Optional<MovieActor> findById_MovieIdAndId_ActorId(Integer movieId, Integer actorId);

    /**
     * 특정 영화 ID에 해당하는 모든 배우 '엔티티'를 조회합니다.
     * @EmbeddedId 방식의 JPQL 경로로 수정합니다.
     */
    @Query("SELECT ma.actor FROM MovieActor ma WHERE ma.id.movieId = :movieId")
    List<Actor> findActorsByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 영화 ID에 해당하는 모든 배우의 '이름'만 조회합니다.
     */
    @Query("SELECT ma.actor.name FROM MovieActor ma WHERE ma.id.movieId = :movieId")
    List<String> findActorNamesByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 배우 ID가 참여한 모든 'Movie' 엔티티를 조회합니다. (필모그래피)
     */
    @Query("SELECT ma.movie FROM MovieActor ma WHERE ma.id.actorId = :actorId")
    List<Movie> findMoviesByActorId(@Param("actorId") Integer actorId);

    /**
     * 특정 영화 ID에 해당하는 모든 MovieActor '연관 엔티티'를 조회합니다.
     * 쿼리 메서드로 자동 생성이 가능합니다.
     */
    List<MovieActor> findById_MovieId(Integer movieId);

    // 영화-배우 관계 추가 (중복 방지)
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO movie_actor (movie_id, actor_id) VALUES (:movieId, :actorId)", nativeQuery = true)
    void insertMovieActor(@Param("movieId") Integer movieId, @Param("actorId") Integer actorId);

    // 영화-배우 관계 존재 여부 확인
    @Query(value = "SELECT COUNT(*) > 0 FROM movie_actor WHERE movie_id = :movieId AND actor_id = :actorId", nativeQuery = true)
    boolean existsByMovieIdAndActorId(@Param("movieId") Integer movieId, @Param("actorId") Integer actorId);

}