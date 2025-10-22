package com.d208.feelroom.movie.service;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.repository.*;
import com.d208.feelroom.movie.dto.cache.MovieStaticCacheDto;
import com.d208.feelroom.movie.exception.MovieNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieCacheService {

    // === '정적' 데이터를 조회하기 위한 Repository들만 주입 ===
    private final MovieRepository movieRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final MovieDirectorRepository movieDirectorRepository;
    private final MovieActorRepository movieActorRepository;
    private final MovieKeywordRepository movieKeywordRepository;

    /**
     * 영화의 '정적'인 공통 상세 정보를 조회합니다.
     * 캐시에 데이터가 있으면 캐시에서 바로 반환하고, 없으면 DB에서 조회 후 캐시에 저장합니다.
     * 이 메서드는 반드시 외부 클래스(예: MovieService)에서 호출되어야 AOP 프록시가 동작합니다.
     *
     * @param movieId 조회할 영화의 ID
     * @return 캐시되거나 DB에서 조회된 영화의 정적 정보 DTO
     */
    @Cacheable(value = "movieStaticDetails", key = "#movieId", unless = "#result == null")
    public MovieStaticCacheDto findMovieStaticDetails(Integer movieId) {
        log.info("===== [Cache Miss] DB에서 영화 정적 정보를 조회합니다. Movie ID: {} =====", movieId);

        // 1. 기본 영화 정보 조회
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new MovieNotFoundException(movieId));

        // 2. 관련 데이터들(모두 정적인 정보)을 각각 조회
        List<String> genreNames = movieGenreRepository.findGenreNamesByMovieId(movieId);
        List<String> actorNames = movieActorRepository.findActorNamesByMovieId(movieId);
        List<String> directorNames = movieDirectorRepository.findDirectorNamesByMovieId(movieId);
        List<String> keywordNames = movieKeywordRepository.findKeywordNamesByMovieId(movieId);

        // 3. '정적' 정보만을 담은 캐시용 DTO로 변환하여 반환
        return new MovieStaticCacheDto(movie, genreNames, directorNames, actorNames, keywordNames);
    }
}