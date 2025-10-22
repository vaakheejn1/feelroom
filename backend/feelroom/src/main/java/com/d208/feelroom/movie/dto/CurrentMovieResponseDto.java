package com.d208.feelroom.movie.dto;

import com.d208.feelroom.movie.domain.entity.MovieNow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentMovieResponseDto {

    private Integer movieId;
    private String title;
    private String posterUrl;
    private Integer ranking;
    private Integer audience;
    private LocalDate rankingDate;
    private Double voteAverage;
    private String releaseDate; // String 타입

    // 매칭되지 않은 영화인지 여부
    private Boolean isUnmatched;

    public static CurrentMovieResponseDto fromMovieNow(MovieNow movieNow) {
        CurrentMovieResponseDtoBuilder builder = CurrentMovieResponseDto.builder()
                .movieId(movieNow.getMovieId())
                .ranking(movieNow.getRanking())
                .audience(movieNow.getAudience())
                .rankingDate(movieNow.getRankingDate())
                .isUnmatched(false); // 기본값: 매칭된 영화

        if (movieNow.getMovie() != null) {
            builder.title(movieNow.getMovie().getTitle())
                    .posterUrl(movieNow.getMovie().getPosterUrl())
                    .voteAverage(movieNow.getMovie().getVoteAverage())
                    .releaseDate(movieNow.getMovie().getReleaseDate()); // String 그대로 사용
        }

        return builder.build();
    }

    // 매칭되지 않은 영화를 위한 생성자
    public static CurrentMovieResponseDto createUnmatchedMovie(
            String title,
            Integer ranking,
            Integer audience,
            LocalDate rankingDate,
            String releaseDate) { // String 타입

        return CurrentMovieResponseDto.builder()
                .movieId(9999999) // 특별한 ID
                .title(title)
                .posterUrl(null)
                .ranking(ranking)
                .audience(audience)
                .rankingDate(rankingDate)
                .voteAverage(null)
                .releaseDate(releaseDate) // String 그대로 사용
                .isUnmatched(true) // 매칭되지 않은 영화 표시
                .build();
    }
}