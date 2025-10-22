package com.d208.feelroom.search.document;

import com.d208.feelroom.movie.domain.entity.Movie;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "#{@environment.getProperty('elasticsearch.index.movie', 'movie_index')}", createIndex = false)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieDocument {

    @Id
    private String id;

    @Field(type = FieldType.Integer)
    private Integer movieId;

    @Field(type = FieldType.Text, analyzer = "nori_analyzer", searchAnalyzer = "nori_analyzer")
    private String title;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String originalTitle;

    @Field(type = FieldType.Keyword)  // Date 대신 Keyword로 변경
    private String releaseDate;

    @Field(type = FieldType.Integer)
    private Integer tmdbId;

    @Field(type = FieldType.Double)
    private Double voteAverage;

    @Field(type = FieldType.Integer)
    private Integer voteCount;

    @Field(type = FieldType.Text, analyzer = "nori_analyzer")
    private String overview;

    @Field(type = FieldType.Keyword)
    private String posterUrl;

    public static MovieDocument fromMovie(Movie movie) {
        return MovieDocument.builder()
                .id(movie.getMovieId().toString())
                .movieId(movie.getMovieId())
                .title(movie.getTitle())
                .originalTitle(extractOriginalTitle(movie.getTitle()))
                .releaseDate(movie.getReleaseDate())
                .tmdbId(movie.getTmdbId())
                .voteAverage(movie.getVoteAverage())
                .voteCount(movie.getVoteCount())
                .overview(movie.getOverview())
                .posterUrl(movie.getPosterUrl())
                .build();
    }

    private static String extractOriginalTitle(String title) {
        if (title != null && title.contains("(") && title.contains(")")) {
            int start = title.lastIndexOf("(");
            int end = title.lastIndexOf(")");
            if (start < end && start > 0) {
                String extracted = title.substring(start + 1, end).trim();
                if (extracted.matches(".*[a-zA-Z].*")) {
                    return extracted;
                }
            }
        }
        return null;
    }
}