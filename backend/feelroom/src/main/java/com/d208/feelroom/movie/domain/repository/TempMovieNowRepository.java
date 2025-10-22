package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.TempMovieNow;
import com.d208.feelroom.movie.domain.entity.TempMovieNowId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TempMovieNowRepository extends JpaRepository<TempMovieNow, TempMovieNowId> {

    /**
     * 중복 체크: 같은 KOBIS movieCd와 날짜의 데이터가 이미 존재하는지 확인
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM TempMovieNow t WHERE t.id.kobisMovieCd = :kobisMovieCd AND t.id.rankingDate = :rankingDate")
    boolean existsByKobisMovieCdAndRankingDate(@Param("kobisMovieCd") String kobisMovieCd, @Param("rankingDate") LocalDate rankingDate);

    /**
     * 특정 날짜의 박스오피스 데이터를 순위순으로 조회
     */
    @Query("SELECT t FROM TempMovieNow t WHERE t.id.rankingDate = :rankingDate ORDER BY t.ranking ASC")
    List<TempMovieNow> findByRankingDateOrderByRanking(@Param("rankingDate") LocalDate rankingDate);

    /**
     * 매칭 완료된 데이터 조회
     */
    List<TempMovieNow> findByIsMatchedTrue();

    /**
     * 매칭되지 않은 데이터 조회
     */
    List<TempMovieNow> findByIsMatchedFalse();

    /**
     * 특정 KOBIS movieCd의 모든 데이터 조회
     */
    @Query("SELECT t FROM TempMovieNow t WHERE t.id.kobisMovieCd = :kobisMovieCd")
    List<TempMovieNow> findByKobisMovieCd(@Param("kobisMovieCd") String kobisMovieCd);

    /**
     * 영화명으로 검색 (매칭용)
     */
    List<TempMovieNow> findByMovieNameContaining(String movieName);

    /**
     * 특정 날짜 범위의 데이터 조회
     */
    @Query("SELECT t FROM TempMovieNow t WHERE t.id.rankingDate BETWEEN :startDate AND :endDate ORDER BY t.id.rankingDate DESC, t.ranking ASC")
    List<TempMovieNow> findByRankingDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 매칭되지 않은 영화들의 고유한 영화명 목록 조회 (매칭 작업용)
     */
    @Query("SELECT DISTINCT t.movieName FROM TempMovieNow t WHERE t.isMatched = false ORDER BY t.movieName")
    List<String> findDistinctUnmatchedMovieNames();

    /**
     * 9999999로 매칭된 영화들 조회 (매칭 실패한 영화들)
     */
    @Query("SELECT t FROM TempMovieNow t WHERE t.matchedMovieId = 9999999 ORDER BY t.id.rankingDate DESC, t.ranking ASC")
    List<TempMovieNow> findUnmatchedMovies();

    /**
     * 특정 날짜의 9999999로 매칭된 영화들 조회
     */
    @Query("SELECT t FROM TempMovieNow t WHERE t.id.rankingDate = :rankingDate AND t.matchedMovieId = 9999999 ORDER BY t.ranking ASC")
    List<TempMovieNow> findUnmatchedMoviesByDate(@Param("rankingDate") LocalDate rankingDate);

    /**
     * 매칭 통계 조회
     */
    @Query("SELECT " +
            "COUNT(*) as total, " +
            "SUM(CASE WHEN t.isMatched = true AND t.matchedMovieId != 9999999 THEN 1 ELSE 0 END) as matched, " +
            "SUM(CASE WHEN t.matchedMovieId = 9999999 THEN 1 ELSE 0 END) as unmatched, " +
            "SUM(CASE WHEN t.isMatched = false THEN 1 ELSE 0 END) as failed " +
            "FROM TempMovieNow t WHERE t.id.rankingDate = :rankingDate")
    Object[] getMatchingStatsByDate(@Param("rankingDate") LocalDate rankingDate);
}