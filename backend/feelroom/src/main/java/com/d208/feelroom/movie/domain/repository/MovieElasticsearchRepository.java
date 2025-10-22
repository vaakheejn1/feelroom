package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.search.document.MovieDocument;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieElasticsearchRepository extends ElasticsearchRepository<MovieDocument, String> {

    List<MovieDocument> findByTitleContaining(String title);

    @Query("{\"match_phrase\": {\"title\": \"?0\"}}")
    List<MovieDocument> findByExactTitle(@Param("title") String title);

    @Query("{\"fuzzy\": {\"title\": {\"value\": \"?0\", \"fuzziness\": \"AUTO\"}}}")
    List<MovieDocument> findByFuzzyTitle(@Param("title") String title);

    @Query("{\"bool\": {\"must\": [{\"match\": {\"title\": \"?0\"}}], \"filter\": [{\"range\": {\"releaseDate\": {\"gte\": \"?1\", \"lte\": \"?2\"}}}]}}")
    List<MovieDocument> findByTitleAndReleaseDateRange(
            @Param("title") String title,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    @Query("{\"bool\": {\"should\": [{\"match\": {\"title\": {\"query\": \"?0\", \"boost\": 2.0}}}, {\"match\": {\"originalTitle\": {\"query\": \"?0\", \"boost\": 1.5}}}], \"filter\": [{\"range\": {\"releaseDate\": {\"gte\": \"?1\", \"lte\": \"?2\"}}}], \"minimum_should_match\": 1}}")
    List<MovieDocument> searchByTitleWithDateFilter(
            @Param("title") String title,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );
}
