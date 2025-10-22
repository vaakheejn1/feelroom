package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.dto.LikedMovieInfo;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface MovieRepository extends JpaRepository<Movie,Integer> {
    // 기존 코드는 그대로 두고 이것만 추가
    @Query("SELECT m FROM Movie m WHERE m.tmdbId = :tmdbId")
    Optional<Movie> findByTmdbId(@Param("tmdbId") Integer tmdbId);

    boolean existsByTmdbId(Integer tmdbId);

    @Query("SELECT m.tmdbId FROM Movie m WHERE m.tmdbId IN :tmdbIds")
    Set<Integer> findExistingTmdbIds(@Param("tmdbIds") List<Integer> tmdbIds);

    /**
     * 특정 사용자가 '좋아요'를 누른 영화 목록을 최신순(가장 최근에 좋아요 누른 순)으로 조회합니다.
     * 무한 스크롤(Slice)을 지원합니다.
     *
     * @param userId   현재 사용자의 ID
     * @param pageable 페이징 정보 (size, page)
     * @return Native Query 결과를 담은 Slice 객체. 각 row는 Object[] 타입입니다.
     *         - [0] movie_id (Integer)
     *         - [1] title (String)
     *         - [2] poster_url (String)
     */
    @Query(value = """
        SELECT m.movie_id, m.title, m.poster_url
        FROM movie_likes ml
        JOIN movies m ON ml.movie_id = m.movie_id
        WHERE ml.user_id = :userId
        ORDER BY ml.created_at DESC
        """,
            countQuery = "SELECT count(*) FROM movie_likes ml WHERE ml.user_id = :userId",
            nativeQuery = true)
    Slice<Object[]> findLikedMoviesByUserId(@Param("userId") Long userId, Pageable pageable);

    // 🆕 추가된 메서드들

    /**
     * 정확한 제목으로 영화 검색
     */
    Optional<Movie> findByTitle(String title);

    /**
     * 제목 포함 검색
     */
    List<Movie> findByTitleContaining(String title);

    /**
     * 제목 포함 검색 (대소문자 무시)
     */
    @Query("SELECT m FROM Movie m WHERE UPPER(m.title) LIKE UPPER(CONCAT('%', :title, '%'))")
    List<Movie> findByTitleContainingIgnoreCase(@Param("title") String title);

    /**
     * 🔧 수정된 제목과 개봉일로 검색 (년도 기준) - LIKE 패턴 사용
     */
    @Query("SELECT m FROM Movie m WHERE m.title LIKE CONCAT('%', :title, '%') AND m.releaseDate LIKE CONCAT(:releaseYear, '%')")
    List<Movie> findByTitleContainingAndReleaseYear(@Param("title") String title, @Param("releaseYear") String releaseYear);

    /**
     * 🔧 수정된 제목과 개봉일 범위로 검색 - LIKE 패턴 사용
     */
    @Query("SELECT m FROM Movie m WHERE m.title LIKE CONCAT('%', :title, '%') AND (m.releaseDate LIKE CONCAT(:startYear, '%') OR m.releaseDate LIKE CONCAT(:endYear, '%'))")
    List<Movie> findByTitleContainingAndReleaseDateBetween(
            @Param("title") String title,
            @Param("startYear") String startYear,
            @Param("endYear") String endYear
    );

    @Query("SELECT m.movieId FROM Movie m WHERE m.releaseDate >= :dateString")
    List<Integer> findMovieIdsByReleaseDateAfter(@Param("dateString") String dateString);

    /**
     * ✨ 추가된 메서드
     * 주어진 영화 ID 목록에 해당하는 영화 정보를 'LikedMovieInfo' DTO 형태로 조회합니다.
     * JPQL 생성자 표현식을 사용하여 필요한 데이터만 선택적으로 로딩하므로 효율적입니다.
     *
     * @param tmdbIds 조회할 영화 ID 리스트
     * @return 영화 정보를 담은 LikedMovieInfo DTO 리스트
     */
    @Query("SELECT new com.d208.feelroom.movie.dto.LikedMovieInfo(m.movieId, m.title, m.posterUrl) " +
            "FROM Movie m WHERE m.tmdbId IN :tmdbIds")
    List<LikedMovieInfo> findLikedMovieInfoByTmdbIds(@Param("tmdbIds") List<Integer> tmdbIds);
}