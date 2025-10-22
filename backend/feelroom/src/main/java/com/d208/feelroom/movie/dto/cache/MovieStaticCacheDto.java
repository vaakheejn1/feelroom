package com.d208.feelroom.movie.dto.cache;

import com.d208.feelroom.movie.domain.entity.Movie;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable; // 캐시 직렬화를 위해 추가
import java.util.List;

@Getter
@NoArgsConstructor
public class MovieStaticCacheDto implements Serializable {
    private Integer movieId;
    private String title;
    private String overview;
    private List<String> genres;
    private String posterUrl;
    private List<String> keywords;
    private List<String> actors;
    private List<String> directors;
    private String releaseDate;
    private Integer runtime;
    private Integer voteCount;      // TMDB vote count
    private Double voteAverage;     // TMDB vote average


    // Movie 엔티티와 관련 정보를 받아 DTO를 생성하는 생성자
    public MovieStaticCacheDto(Movie movie, List<String> genres, List<String> directors, List<String> actors, List<String> keywords) {
        this.movieId = movie.getMovieId();
        this.title = movie.getTitle();
        this.overview = movie.getOverview();
        this.genres = genres;
        this.posterUrl = movie.getPosterUrl();
        this.keywords = keywords;
        this.actors = actors;
        this.directors = directors;
        this.releaseDate = movie.getReleaseDate();
        this.runtime = movie.getRuntime();
        this.voteCount = movie.getVoteCount();
        this.voteAverage = movie.getVoteAverage();
    }
}