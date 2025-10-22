package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.Keyword;
import com.d208.feelroom.movie.domain.entity.Movie; // Movie 엔티티 import
import com.d208.feelroom.movie.domain.entity.MovieKeyword;
import com.d208.feelroom.movie.domain.entity.MovieKeywordId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieKeywordRepository extends JpaRepository<MovieKeyword, MovieKeywordId> {

    /**
     * 복합키로 MovieKeyword 엔티티를 조회합니다.
     * JpaRepository 기본 메서드인 findById(ID id) 사용을 더 권장합니다.
     */
    Optional<MovieKeyword> findById_MovieIdAndId_KeywordId(Integer movieId, Integer keywordId);

    /**
     * 특정 영화 ID에 해당하는 모든 키워드 '엔티티'를 조회합니다.
     * JOIN FETCH 대신 경로 탐색을 사용합니다.
     */
    @Query("SELECT mk.keyword FROM MovieKeyword mk WHERE mk.id.movieId = :movieId")
    List<Keyword> findKeywordsByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 영화 ID에 해당하는 모든 키워드의 '이름'만 조회합니다.
     */
    @Query("SELECT mk.keyword.name FROM MovieKeyword mk WHERE mk.id.movieId = :movieId")
    List<String> findKeywordNamesByMovieId(@Param("movieId") Integer movieId);

    /**
     * 특정 키워드 ID를 가진 모든 'Movie' 엔티티를 조회합니다.
     */
    @Query("SELECT mk.movie FROM MovieKeyword mk WHERE mk.id.keywordId = :keywordId")
    List<Movie> findMoviesByKeywordId(@Param("keywordId") Integer keywordId);

    /**
     * 특정 영화 ID에 해당하는 모든 MovieKeyword '연관 엔티티'를 조회합니다.
     * 쿼리 메서드로 자동 생성이 가능합니다.
     */
    List<MovieKeyword> findById_MovieId(Integer movieId);

    // 영화-키워드 관계 추가 (중복 방지)
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO movie_keyword (movie_id, keyword_id) VALUES (:movieId, :keywordId)", nativeQuery = true)
    void insertMovieKeyword(@Param("movieId") Integer movieId, @Param("keywordId") Integer keywordId);

    // 영화-키워드 관계 존재 여부 확인
    @Query(value = "SELECT COUNT(*) > 0 FROM movie_keyword WHERE movie_id = :movieId AND keyword_id = :keywordId", nativeQuery = true)
    boolean existsByMovieIdAndKeywordId(@Param("movieId") Integer movieId, @Param("keywordId") Integer keywordId);

}