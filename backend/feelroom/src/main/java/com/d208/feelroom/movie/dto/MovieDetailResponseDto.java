package com.d208.feelroom.movie.dto;

import com.d208.feelroom.movie.domain.entity.summary.MovieSummary;
import com.d208.feelroom.movie.dto.cache.MovieStaticCacheDto;
import lombok.Getter;

import java.util.List;

@Getter
public class MovieDetailResponseDto {
    // === 정적 데이터 ===
    private Integer movieId;
    private String title;
    private String overview;
    private List<String> genres;
    private String posterUrl;
    private List<String> keywords;
    private List<String> actors;
    private List<String> directors;
    private String releaseDate;
    private Integer voteCount;
    private Double voteAverage;
    private Integer runtime;

    // === 동적 데이터 ===
    private int userReviewCount;        // 우리 서비스 리뷰 개수
    private double userRatingAverage;   // 우리 서비스 평점 평균

    // 생성자: 두 DTO를 조합하여 생성
    public MovieDetailResponseDto(MovieStaticCacheDto staticData, MovieSummary summary) {
        // staticData에서 필드 복사
        this.movieId = staticData.getMovieId();
        this.title = staticData.getTitle();
        this.overview = staticData.getOverview();
        this.genres = staticData.getGenres();
        this.posterUrl = staticData.getPosterUrl();
        this.keywords = staticData.getKeywords();
        this.actors = staticData.getActors();
        this.directors = staticData.getDirectors();
        this.releaseDate = staticData.getReleaseDate();
        this.voteCount = staticData.getVoteCount();
        this.voteAverage = staticData.getVoteAverage();
        this.runtime = staticData.getRuntime();
        // 2. 동적 데이터 복사 (MovieSummary가 null일 경우 처리)
        if (summary != null) {
            this.userReviewCount = summary.getReviewCount();
            this.userRatingAverage = summary.getUserRatingAverage(); // 엔티티의 헬퍼 메서드 사용
        } else {
            this.userReviewCount = 0;
            this.userRatingAverage = 0.0;
        }
    }
}
