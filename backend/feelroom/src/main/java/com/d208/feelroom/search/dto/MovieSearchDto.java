package com.d208.feelroom.search.dto;

import com.d208.feelroom.search.document.MovieDocument;
import lombok.*;

import java.util.List;

/**
 * 영화 검색 결과 개별 항목 DTO
 * MovieDetailResponseDto에서 검색 결과에 필요한 필드만 선별하여 구성
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieSearchDto {

    private Integer movieId;           // 내부 사용용 (상세 페이지 이동 등)
    private String title;              // 영화 제목
    private String posterUrl;          // 포스터 이미지 URL
    private String releaseYear;        // 개봉년도 (releaseDate에서 년도만 추출)
    private List<String> genres;       // 장르 리스트
    private Integer runtime;           // 상영시간 (분)
    private Double voteAverage;        // TMDB 평점
    private Double userRatingAverage;  // 우리 서비스 평점

    /**
     * MovieDocument에서 기본 정보를 가져와 MovieSearchDto를 생성
     * 장르와 우리 서비스 평점은 별도로 설정해야 함
     */
    public static MovieSearchDto fromMovieDocument(MovieDocument document) {
        return MovieSearchDto.builder()
                .movieId(document.getMovieId())
                .title(document.getTitle())
                .posterUrl(document.getPosterUrl())
                .releaseYear(extractYearFromDate(document.getReleaseDate()))
                .runtime(null) // MovieDocument에 runtime이 없어서 별도 설정 필요
                .voteAverage(document.getVoteAverage())
                .userRatingAverage(0.0) // 기본값, 별도로 설정 필요
                .build();
    }



    /**
     * 장르 정보 설정 (별도 메소드로 체이닝 지원)
     */
    public MovieSearchDto withGenres(List<String> genres) {
        this.genres = genres;
        return this;
    }

    /**
     * 런타임 정보 설정 (MovieDocument에서 누락된 경우)
     */
    public MovieSearchDto withRuntime(Integer runtime) {
        this.runtime = runtime;
        return this;
    }

    /**
     * 우리 서비스 평점 설정
     */
    public MovieSearchDto withUserRatingAverage(Double userRatingAverage) {
        this.userRatingAverage = userRatingAverage;
        return this;
    }

    /**
     * 날짜 문자열에서 년도만 추출하는 헬퍼 메소드
     * "2024-03-15" -> "2024"
     * "2024" -> "2024"
     * null 또는 빈 문자열 -> "미정"
     */
    private static String extractYearFromDate(String releaseDate) {
        if (releaseDate == null || releaseDate.trim().isEmpty()) {
            return "미정";
        }

        // 이미 년도 형태라면 그대로 반환
        if (releaseDate.length() == 4 && releaseDate.matches("\\d{4}")) {
            return releaseDate;
        }

        // "YYYY-MM-DD" 형태에서 년도 추출
        if (releaseDate.length() >= 4) {
            String year = releaseDate.substring(0, 4);
            if (year.matches("\\d{4}")) {
                return year;
            }
        }

        return "미정";
    }
}
