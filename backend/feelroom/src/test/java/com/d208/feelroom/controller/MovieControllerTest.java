package com.d208.feelroom.controller;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.movie.controller.MovieController;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.movie.dto.MovieMyStatusResponseDto;
import com.d208.feelroom.movie.dto.MovieResponseDto;
import com.d208.feelroom.review.dto.ReviewListResponseDto;
import com.d208.feelroom.movie.exception.MovieNotFoundException;
//import com.d208.feelroom.movie.service.scheduler.MovieNowService;
import com.d208.feelroom.movie.service.MovieService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MovieControllerTest {

    private MovieService movieService;
    private MovieController movieController;
    private UserDetailsImpl userDetails;
    private User mockUser;

    //private MovieNowService movieNowService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Mock 서비스 생성
        movieService = mock(MovieService.class);

        //movieController = new MovieController(movieService, movieNowService);

        // 테스트용 사용자 설정
        mockUser = User.builder()
                .userId(1L)
                .email("test@test.com")
                .username("testuser")
                .nickname("테스트유저")
                .build();

        // UserDetailsImpl Mock 생성
        userDetails = mock(UserDetailsImpl.class);
        when(userDetails.getUser()).thenReturn(mockUser);
    }

    @Test
    @DisplayName("영화 좋아요 토글 - 좋아요 추가 성공")
    void toggleMovieLike_Success_LikeAdded() {
        // given
        Integer movieId = 1;
        when(movieService.toggleMovieLike(movieId, 1L)).thenReturn(true);

        // when
        ResponseEntity<MovieMyStatusResponseDto> response = movieController.toggleMovieLike(movieId, userDetails);

        // then
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("영화 좋아요가 추가되었습니다.", response.getBody());
        verify(movieService).toggleMovieLike(movieId, 1L);
    }

    @Test
    @DisplayName("영화 좋아요 토글 - 좋아요 취소 성공")
    void toggleMovieLike_Success_LikeRemoved() {
        // given
        Integer movieId = 1;
        when(movieService.toggleMovieLike(movieId, 1L)).thenReturn(false);

        // when
        ResponseEntity<MovieMyStatusResponseDto> response = movieController.toggleMovieLike(movieId, userDetails);

        // then
        assertEquals(200, response.getStatusCodeValue());
        //assertEquals("영화 좋아요가 취소되었습니다.", response.getBody());
        verify(movieService).toggleMovieLike(movieId, 1L);
    }

    @Test
    @DisplayName("영화 상세정보 조회 - 성공")
    void searchMovieById_Success() {
        // given
        Integer movieId = 1;
        MovieResponseDto mockResponse = MovieResponseDto.builder()
                .movieId(movieId)
                .title("테스트 영화")
                .genre(Arrays.asList("액션", "드라마"))
                .posterUrl("http://poster.url")
                .keyword(Arrays.asList("키워드1", "키워드2"))
                .actors(Arrays.asList("배우1", "배우2"))
                .directors(Arrays.asList("감독1"))
                .releaseDate("2024-01-01")
                .voteCount(1000)
                .voteAverage(8.5)
                .userReviewCount(50)
                .userRatingAverage(4.2)
                .build();

        when(movieService.getMovieDetail(movieId, null)).thenReturn(mockResponse);

        // when
        ResponseEntity<?> response = movieController.searchMovieById(movieId, null);

        // then
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockResponse, response.getBody());
        verify(movieService).getMovieDetail(movieId, null);
    }

    @Test
    @DisplayName("영화 리뷰 목록 조회 - 성공")
    void getMovieReviews_Success() {
        // given
        Integer movieId = 1;
        ReviewListResponseDto mockResponse = ReviewListResponseDto.builder()
                .reviews(Arrays.asList(
                        ReviewListResponseDto.ReviewInfo.builder()
                                .reviewId(UUID.randomUUID())
                                .userNickname("리뷰어1")
                                .rating(5)
                                .likesCount(10)
                                .commentsCount(3)
                                .createdAt(LocalDateTime.now())
                                .build()
                ))
                .reviewStats(ReviewListResponseDto.ReviewStats.builder()
                        .totalReviews(1)
                        .averageRating(5.0)
                        .build())
                .build();

        when(movieService.getMovieReviews(movieId, "latest", 0, 10, null))
                .thenReturn(mockResponse);

        // when
        ResponseEntity<ReviewListResponseDto> response =
                movieController.getMovieReviews(movieId, "latest", 0, 10, null);

        // then
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockResponse, response.getBody());
        verify(movieService).getMovieReviews(movieId, "latest", 0, 10, null);
    }

    @Test
    @DisplayName("예외 처리 테스트 - 영화 없음")
    void movieNotFound_Exception() {
        // given
        Integer movieId = 999;
        when(movieService.getMovieDetail(movieId, null))
                .thenThrow(new MovieNotFoundException(movieId));

        // when & then
        assertThrows(MovieNotFoundException.class, () -> {
            movieController.searchMovieById(movieId, null);
        });

        verify(movieService).getMovieDetail(movieId, null);
    }
}