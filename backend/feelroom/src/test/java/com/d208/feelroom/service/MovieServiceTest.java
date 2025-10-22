//package com.d208.feelroom.service;
//
//import com.d208.feelroom.movie.domain.entity.Movie;
//import com.d208.feelroom.domain.movie.repository.*;
//import com.d208.feelroom.review.domain.entity.Review;
//import com.d208.feelroom.review.domain.repository.ReviewRepository;
//import com.d208.feelroom.movie.dto.MovieResponseDto;
//import com.d208.feelroom.movie.service.MovieService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
////import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
//import static org.mockito.Mockito.*;
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//// 순수 JUnit 5 + Mockito (Spring 없음)
//// 순수 JUnit 5 + Mockito (Spring 없음)
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//
//import java.util.*;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//class MovieServiceTest {
//
//    private ActorRepository actorRepository;
//    private DirectorRepository directorRepository;
//    private GenreRepository genreRepository;
//    private KeywordRepository keywordRepository;
//    private MovieActorRepository movieActorRepository;
//    private MovieDirectorRepository movieDirectorRepository;
//    private MovieGenreRepository movieGenreRepository;
//    private MovieKeywordRepository movieKeywordRepository;
//    private MovieRepository movieRepository;
//    private ReviewRepository reviewRepository;  // 추가
//    private MovieService movieService;
//
//    private MovieLikeRepository movieLikeRepository;
//
//    @BeforeEach
//    void setUp() {
//        // 수동으로 Mock 생성
//        this.actorRepository = Mockito.mock(ActorRepository.class);
//        this.directorRepository = Mockito.mock(DirectorRepository.class);
//        this.genreRepository = Mockito.mock(GenreRepository.class);
//        this.keywordRepository = Mockito.mock(KeywordRepository.class);
//        this.movieActorRepository = Mockito.mock(MovieActorRepository.class);
//        this.movieDirectorRepository = Mockito.mock(MovieDirectorRepository.class);
//        this.movieGenreRepository = Mockito.mock(MovieGenreRepository.class);
//        this.movieKeywordRepository = Mockito.mock(MovieKeywordRepository.class);
//        this.movieRepository = Mockito.mock(MovieRepository.class);
//        this.reviewRepository = Mockito.mock(ReviewRepository.class);
//        this.movieLikeRepository = Mockito.mock(MovieLikeRepository.class);
//
//        // @RequiredArgsConstructor 순서에 맞게 생성자 호출
//        // 라인 65-75 수정
//        movieService = new MovieService(
//                actorRepository,           // 1번째
//                directorRepository,        // 2번째
//                genreRepository,          // 3번째
//                keywordRepository,        // 4번째
//                movieActorRepository,     // 5번째
//                movieDirectorRepository,  // 6번째
//                movieGenreRepository,     // 7번째
//                movieKeywordRepository,   // 8번째
//                movieRepository,          // 9번째
//                reviewRepository,         // 10번째
//                movieLikeRepository       // 11번째
//        );
//    }
//
//    private Movie createTestMovie() {
//        Movie movie = new Movie();
//        movie.setMovieId(1);
//        movie.setTitle("테스트 영화");
//        movie.setPosterUrl("https://example.com/poster.jpg");
//        movie.setReleaseDate("2024-01-15");
//        movie.setVoteCount(5000);
//        movie.setVoteAverage(8.5);
//        movie.setRuntime(120);
//        movie.setOverview("테스트 영화 개요");
//        movie.setTmdbId(12345);
//        return movie;
//    }
//
//    // 테스트용 가상 리뷰 객체 생성 메서드들 (빌더 패턴)
//    private Review createReview1() {
//        return Review.builder()
//                .reviewId(UUID.randomUUID())
//                .title("정말 재미있는 영화였습니다!")
//                .content("액션 장면이 정말 박진감 넘치고, 배우들의 연기도 훌륭했어요. 특히 마지막 장면에서는 감동까지 받았습니다. 강력 추천합니다!")
//                .rating(9)
//                .createdAt(LocalDateTime.now().minusDays(5))
//                .updatedAt(LocalDateTime.now().minusDays(5))
//                .build();
//    }
//
//    private Review createReview2() {
//        return Review.builder()
//                .reviewId(UUID.randomUUID())
//                .title("기대보다는 아쉬웠어요")
//                .content("스토리가 조금 뻔했고, 중간에 지루한 부분들이 있었습니다. 그래도 볼 만은 했어요.")
//                .rating(6)
//                .createdAt(LocalDateTime.now().minusDays(3))
//                .updatedAt(LocalDateTime.now().minusDays(3))
//                .build();
//    }
//
//    private Review createReview3() {
//        return Review.builder()
//                .reviewId(UUID.randomUUID())
//                .title("완벽한 작품!")
//                .content("연출, 연기, 스토리 모든 면에서 완벽했습니다. 올해 최고의 영화라고 생각해요. 여러 번 봐도 질리지 않을 것 같습니다.")
//                .rating(10)
//                .createdAt(LocalDateTime.now().minusDays(1))
//                .updatedAt(LocalDateTime.now().minusDays(1))
//                .build();
//    }
//
//    private Review createReview4() {
//        return Review.builder()
//                .reviewId(UUID.randomUUID())
//                .title("무난한 영화")
//                .content("특별히 나쁘지도, 좋지도 않은 평범한 영화였습니다. 시간 때우기용으로는 괜찮을 것 같아요.")
//                .rating(7)
//                .createdAt(LocalDateTime.now().minusDays(7))
//                .updatedAt(LocalDateTime.now().minusDays(7))
//                .build();
//    }
//
//    private Review createReview5() {
//        return Review.builder()
//                .reviewId(UUID.randomUUID())
//                .title("별로였습니다")
//                .content("스토리가 산만하고 캐릭터들의 행동이 이해가 안 갔어요. 돈이 아까웠습니다.")
//                .rating(3)
//                .createdAt(LocalDateTime.now().minusDays(10))
//                .updatedAt(LocalDateTime.now().minusDays(10))
//                .build();
//    }
//
//    @Test
//    @DisplayName("영화 상세 정보를 성공적으로 조회한다")
//    void getMovieDetail_Success() {
//        // Given
//        Integer movieId = 1;
//        Movie testMovie = createTestMovie();
//
//        List<String> genreNames = Arrays.asList("액션", "드라마");
//        List<String> actorNames = Arrays.asList("김민수", "이영희");
//        List<String> directorNames = Arrays.asList("박감독");
//        List<String> keywordNames = Arrays.asList("복수", "우정");
//
//        when(movieRepository.findById(movieId)).thenReturn(Optional.of(testMovie));
//        when(movieGenreRepository.findGenreNamesByMovieId(movieId)).thenReturn(genreNames);
//        when(movieActorRepository.findActorNamesByMovieId(movieId)).thenReturn(actorNames);
//        when(movieDirectorRepository.findDirectorNamesByMovieId(movieId)).thenReturn(directorNames);
//        when(movieKeywordRepository.findKeywordNamesByMovieId(movieId)).thenReturn(keywordNames);
//
//        // 리뷰 통계 Mock 설정 (별개 쿼리)
//        when(reviewRepository.countReviewsByMovieId(movieId)).thenReturn(5);
//        when(reviewRepository.findAverageRatingByMovieId(movieId)).thenReturn(8.2);
//
//        // When
//        MovieResponseDto result = movieService.getMovieDetail(movieId);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getMovieId()).isEqualTo(1);
//        assertThat(result.getPosterUrl()).isEqualTo("https://example.com/poster.jpg");
//        assertThat(result.getReleaseDate()).isEqualTo("2024-01-15");
//        assertThat(result.getVoteCount()).isEqualTo(5000);
//        assertThat(result.getVoteAverage()).isEqualTo(8.5);
//
//        // 관련 데이터 검증
//        assertThat(result.getGenre()).isNotNull().hasSize(2);
//        assertThat(result.getGenre()).containsExactlyInAnyOrder("액션", "드라마");
//
//        assertThat(result.getActors()).isNotNull().hasSize(2);
//        assertThat(result.getActors()).containsExactlyInAnyOrder("김민수", "이영희");
//
//        assertThat(result.getDirectors()).isNotNull().hasSize(1);
//        assertThat(result.getDirectors()).contains("박감독");
//
//        assertThat(result.getKeyword()).isNotNull().hasSize(2);
//        assertThat(result.getKeyword()).containsExactlyInAnyOrder("복수", "우정");
//
//        // 사용자 리뷰 통계 검증 (추가)
//        assertThat(result.getUserReviewCount()).isEqualTo(5);
//        assertThat(result.getUserRatingAverage()).isEqualTo(8.2);
//
//        // Mock 호출 검증
//        verify(movieRepository, times(1)).findById(movieId);
//        verify(movieGenreRepository, times(1)).findGenreNamesByMovieId(movieId);
//        verify(movieActorRepository, times(1)).findActorNamesByMovieId(movieId);
//        verify(movieDirectorRepository, times(1)).findDirectorNamesByMovieId(movieId);
//        verify(movieKeywordRepository, times(1)).findKeywordNamesByMovieId(movieId);
//        verify(reviewRepository, times(1)).countReviewsByMovieId(movieId);           // 수정
//        verify(reviewRepository, times(1)).findAverageRatingByMovieId(movieId);      // 수정
//    }
//
//    @Test
//    @DisplayName("존재하지 않는 영화 ID로 조회 시 예외가 발생한다")
//    void getMovieDetail_MovieNotFound_ThrowsException() {
//        // Given
//        Integer nonExistentMovieId = 999;
//
//        when(movieRepository.findById(nonExistentMovieId)).thenReturn(Optional.empty());
//
//        // When & Then
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
//            movieService.getMovieDetail(nonExistentMovieId);
//        });
//
//        assertThat(exception.getMessage()).isEqualTo("Movie not found with id: " + nonExistentMovieId);
//
//        // Movie를 찾지 못했으므로 다른 Repository는 호출되지 않아야 함
//        verify(movieRepository, times(1)).findById(nonExistentMovieId);
//        verify(movieGenreRepository, never()).findGenreNamesByMovieId(any());
//        verify(movieActorRepository, never()).findActorNamesByMovieId(any());
//        verify(movieDirectorRepository, never()).findDirectorNamesByMovieId(any());
//        verify(movieKeywordRepository, never()).findKeywordNamesByMovieId(any());
//        verify(reviewRepository, never()).countReviewsByMovieId(any());              // 수정
//        verify(reviewRepository, never()).findAverageRatingByMovieId(any());         // 수정
//    }
//
//    @Test
//    @DisplayName("관련 데이터가 없는 영화도 정상적으로 조회된다")
//    void getMovieDetail_WithEmptyRelations_Success() {
//        // Given
//        Integer movieId = 2;
//        Movie movieWithoutRelations = new Movie();
//        movieWithoutRelations.setMovieId(2);
//        movieWithoutRelations.setTitle("관련 데이터 없는 영화");
//        movieWithoutRelations.setPosterUrl("https://example.com/poster2.jpg");
//        movieWithoutRelations.setReleaseDate("2024-02-20");
//        movieWithoutRelations.setVoteCount(2000);
//        movieWithoutRelations.setVoteAverage(7.0);
//
//        when(movieRepository.findById(movieId)).thenReturn(Optional.of(movieWithoutRelations));
//        when(movieGenreRepository.findGenreNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//        when(movieActorRepository.findActorNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//        when(movieDirectorRepository.findDirectorNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//        when(movieKeywordRepository.findKeywordNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//
//        // 리뷰가 없는 경우 Mock 설정
//        when(reviewRepository.countReviewsByMovieId(movieId)).thenReturn(0);
//        when(reviewRepository.findAverageRatingByMovieId(movieId)).thenReturn(null); // 평균이 null인 경우
//
//        // When
//        MovieResponseDto result = movieService.getMovieDetail(movieId);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getMovieId()).isEqualTo(2);
//        assertThat(result.getGenre()).isEmpty();
//        assertThat(result.getActors()).isEmpty();
//        assertThat(result.getDirectors()).isEmpty();
//        assertThat(result.getKeyword()).isEmpty();
//
//        // 리뷰 통계 검증 (리뷰가 없는 경우)
//        assertThat(result.getUserReviewCount()).isEqualTo(0);
//        assertThat(result.getUserRatingAverage()).isEqualTo(0.0);
//
//        // 모든 Repository가 호출되었는지 확인
//        verify(movieRepository, times(1)).findById(movieId);
//        verify(movieGenreRepository, times(1)).findGenreNamesByMovieId(movieId);
//        verify(movieActorRepository, times(1)).findActorNamesByMovieId(movieId);
//        verify(movieDirectorRepository, times(1)).findDirectorNamesByMovieId(movieId);
//        verify(movieKeywordRepository, times(1)).findKeywordNamesByMovieId(movieId);
//        verify(reviewRepository, times(1)).countReviewsByMovieId(movieId);           // 추가
//        verify(reviewRepository, times(1)).findAverageRatingByMovieId(movieId);      // 추가
//    }
//
//    @Test
//    @DisplayName("리뷰 통계 조회 시 null 값을 안전하게 처리한다")
//    void getMovieDetail_WithNullReviewStats_Success() {
//        // Given
//        Integer movieId = 3;
//        Movie testMovie = createTestMovie();
//        testMovie.setMovieId(3);
//
//        when(movieRepository.findById(movieId)).thenReturn(Optional.of(testMovie));
//        when(movieGenreRepository.findGenreNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//        when(movieActorRepository.findActorNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//        when(movieDirectorRepository.findDirectorNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//        when(movieKeywordRepository.findKeywordNamesByMovieId(movieId)).thenReturn(Collections.emptyList());
//
//        // null 반환 케이스
//        when(reviewRepository.countReviewsByMovieId(movieId)).thenReturn(null);
//        when(reviewRepository.findAverageRatingByMovieId(movieId)).thenReturn(null);
//
//        // When
//        MovieResponseDto result = movieService.getMovieDetail(movieId);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getUserReviewCount()).isEqualTo(0);      // null -> 0
//        assertThat(result.getUserRatingAverage()).isEqualTo(0.0);  // null -> 0.0
//
//        verify(reviewRepository, times(1)).countReviewsByMovieId(movieId);
//        verify(reviewRepository, times(1)).findAverageRatingByMovieId(movieId);
//    }
//
//    @Test
//    @DisplayName("리뷰 개수는 있지만 평점이 없는 경우를 처리한다")
//    void getMovieDetail_WithReviewsButNoRatings_Success() {
//        // Given
//        Integer movieId = 4;
//        Movie testMovie = createTestMovie();
//        testMovie.setMovieId(4);
//
//        when(movieRepository.findById(movieId)).thenReturn(Optional.of(testMovie));
//        when(movieGenreRepository.findGenreNamesByMovieId(movieId)).thenReturn(Arrays.asList("드라마"));
//        when(movieActorRepository.findActorNamesByMovieId(movieId)).thenReturn(Arrays.asList("김배우"));
//        when(movieDirectorRepository.findDirectorNamesByMovieId(movieId)).thenReturn(Arrays.asList("이감독"));
//        when(movieKeywordRepository.findKeywordNamesByMovieId(movieId)).thenReturn(Arrays.asList("감동"));
//
//        // 리뷰는 3개 있지만 평점은 없는 경우
//        when(reviewRepository.countReviewsByMovieId(movieId)).thenReturn(3);
//        when(reviewRepository.findAverageRatingByMovieId(movieId)).thenReturn(null);
//
//        // When
//        MovieResponseDto result = movieService.getMovieDetail(movieId);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getUserReviewCount()).isEqualTo(3);      // 리뷰 3개
//        assertThat(result.getUserRatingAverage()).isEqualTo(0.0);  // 평점 없음 -> 0.0
//
//        verify(reviewRepository, times(1)).countReviewsByMovieId(movieId);
//        verify(reviewRepository, times(1)).findAverageRatingByMovieId(movieId);
//    }
//}