package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.MovieNow;
import com.d208.feelroom.movie.domain.entity.MovieNowId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MovieNowRepository extends JpaRepository<MovieNow, MovieNowId> {

    /**
     * 특정 날짜의 박스오피스 데이터를 순위순으로 조회
     */
    @Query("SELECT m FROM MovieNow m WHERE m.id.rankingDate = :rankingDate ORDER BY m.ranking ASC")
    List<MovieNow> findById_RankingDateOrderByRankingAsc(@Param("rankingDate") LocalDate rankingDate);

    /**
     * 특정 영화의 박스오피스 기록 조회
     */
    @Query("SELECT m FROM MovieNow m WHERE m.id.movieId = :movieId ORDER BY m.id.rankingDate DESC")
    List<MovieNow> findByMovieIdOrderByRankingDateDesc(@Param("movieId") Integer movieId);

    /**
     * 특정 날짜 범위의 박스오피스 데이터 조회
     */
    @Query("SELECT m FROM MovieNow m WHERE m.id.rankingDate BETWEEN :startDate AND :endDate ORDER BY m.id.rankingDate DESC, m.ranking ASC")
    List<MovieNow> findByRankingDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 특정 영화의 최고 순위 조회
     */
    @Query("SELECT MIN(m.ranking) FROM MovieNow m WHERE m.id.movieId = :movieId")
    Integer findBestRankingByMovieId(@Param("movieId") Integer movieId);

    /**
     * 가장 최근 박스오피스 데이터 날짜 조회
     */
    @Query("SELECT MAX(m.id.rankingDate) FROM MovieNow m")
    LocalDate findLatestRankingDate();

    /**
     * 특정 날짜의 박스오피스 데이터를 순위순으로 조회 (Movie 조인)
     */
    @Query("SELECT m FROM MovieNow m JOIN FETCH m.movie WHERE m.id.rankingDate = :rankingDate ORDER BY m.ranking ASC")
    List<MovieNow> findByIdRankingDateOrderByRankingAscWithMovie(@Param("rankingDate") LocalDate rankingDate);

    /**
     * 최근 N일간의 박스오피스 데이터 날짜 목록 조회
     */
    @Query("SELECT DISTINCT m.id.rankingDate FROM MovieNow m ORDER BY m.id.rankingDate DESC")
    List<LocalDate> findRecentRankingDates(Pageable pageable);
}