package com.d208.feelroom.movie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieMatchingDto {

    private String kobisMovieCd;
    private String kobisMovieName;
    private Integer ranking;
    private Integer audience;
    private LocalDate rankingDate;

    private Integer matchedMovieId;
    private String matchedMovieTitle;
    private String matchedReleaseDate;
    private Integer matchedTmdbId;

    private Double similarityScore;
    private String matchingMethod;
    private boolean isMatched;
    private String failureReason;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchingResult {
        private int totalProcessed;
        private int successfulMatches;
        private int failedMatches;
        private int savedToMovieNow;
        private LocalDate processedDate;

        public String getSummary() {
            return String.format(
                    "매칭 결과 - 처리: %d건, 성공: %d건, 실패: %d건, 저장: %d건 (날짜: %s)",
                    totalProcessed, successfulMatches, failedMatches, savedToMovieNow, processedDate
            );
        }
    }
}
