package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.summary.MovieSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MovieSummaryRepository extends JpaRepository<MovieSummary, Integer> {

    /**
     * 영화 ID로 MovieSummary 조회
     */
    Optional<MovieSummary> findByMovieId(Integer movieId);

    @Modifying // INSERT, UPDATE, DELETE 쿼리 실행 시 필요
    @Query(value = """
        INSERT INTO movie_summary (movie_id, review_count, rating_sum)
        VALUES (:movieId, :countChange, :ratingChange)
        ON DUPLICATE KEY UPDATE 
            review_count = review_count + :countChange,
            rating_sum = rating_sum + :ratingChange
        """, nativeQuery = true)
    void upsertReviewSummary(
            @Param("movieId") Integer movieId,
            @Param("countChange") int countChange,
            @Param("ratingChange") long ratingChange
    );
}