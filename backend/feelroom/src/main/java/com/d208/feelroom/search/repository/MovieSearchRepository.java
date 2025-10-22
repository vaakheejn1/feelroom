package com.d208.feelroom.search.repository;

import com.d208.feelroom.search.document.MovieDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieSearchRepository extends ElasticsearchRepository<MovieDocument, String> {

    // 1. Page 사용 (가장 안전함)
    @Query("{\"match_phrase_prefix\": {\"title\": \"?0\"}}")
    Page<MovieDocument> findByTitleContaining(String title, Pageable pageable);

    @Query("{\"wildcard\": {\"title\": \"*?0*\"}}")
    Page<MovieDocument> findByTitleWildcard(String title, Pageable pageable);

    // 2. List 사용 (기본)
    List<MovieDocument> findByTitleContaining(String title);

    // 3. 단일 결과 테스트
    MovieDocument findFirstByTitleContaining(String title);

}