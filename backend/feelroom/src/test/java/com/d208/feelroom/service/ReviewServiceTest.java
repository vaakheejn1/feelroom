package com.d208.feelroom.service;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.review.exception.TagNotFoundException;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.review.domain.entity.tag.Tag;
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.review.domain.repository.TagRepository;
import com.d208.feelroom.movie.exception.MovieNotFoundException;
import com.d208.feelroom.review.dto.*;
import com.d208.feelroom.review.exception.ReviewAccessDeniedException;
import com.d208.feelroom.review.exception.ReviewNotFoundException;
import com.d208.feelroom.review.service.ReviewService;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.user.exception.UserNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @InjectMocks
    private ReviewService reviewService;

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MovieRepository movieRepository;
    @Mock
    private TagRepository tagRepository;
    @Mock
    private ReviewLikeRepository reviewLikeRepository;

    @Test
    @DisplayName("리뷰 생성 성공")
    void createReview_Success() {
        // given
        Long userId = 1L;
        Integer movieId = 101;
        Set<Integer> tagIds = Set.of(1, 2);

        ReviewCreateRequestDto requestDto = new ReviewCreateRequestDto(
                movieId, "테스트 제목", "테스트 내용", 9, tagIds
        );

        User mockUser = mock(User.class);
        Movie mockMovie = mock(Movie.class);
        // Tag는 실제 객체를 만들어 주는 것이 더 명확할 수 있습니다.
        Tag tag1 = Tag.builder().tagId(1).name("감동").build();
        Tag tag2 = Tag.builder().tagId(2).name("재미").build();
        List<Tag> mockTags = List.of(tag1, tag2);

        // Mock의 행동 정의
        given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
        given(movieRepository.findById(movieId)).willReturn(Optional.of(mockMovie));
        given(tagRepository.findAllById(tagIds)).willReturn(mockTags);

        // ArgumentCaptor: save 메서드에 실제로 어떤 Review 객체가 전달되는지 캡처
        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);

        // reviewRepository.save가 호출되면, 캡처된 Review 객체를 그대로 반환하도록 설정
        // 이 때, 반환되는 객체는 ID가 할당되어 있어야 하므로, 추가적인 Mocking이 필요합니다.
        Review savedReview = mock(Review.class);
        given(savedReview.getReviewId()).willReturn(UUID.randomUUID());
        given(reviewRepository.save(reviewCaptor.capture())).willReturn(savedReview);

        // when
        ReviewCreateResponseDto responseDto = reviewService.createReview(userId, requestDto);

        // then
        // 1. 응답 DTO 검증
        assertThat(responseDto).isNotNull();
        assertThat(responseDto.getReviewId()).isNotNull();
        assertThat(responseDto.getMessage()).isEqualTo("리뷰 작성 완료");

        // 2. 캡처된 Review 객체 검증
        Review capturedReview = reviewCaptor.getValue();
        assertThat(capturedReview.getUser()).isEqualTo(mockUser);
        assertThat(capturedReview.getMovie()).isEqualTo(mockMovie);
        assertThat(capturedReview.getTitle()).isEqualTo("테스트 제목");
        // Review의 addTag 로직이 잘 동작했는지 확인 (reviewTags의 사이즈로 간접 확인)
        assertThat(capturedReview.getReviewTags()).hasSize(2);

        // 3. Mock 객체 호출 횟수 검증
        verify(userRepository, times(1)).findById(userId);
        verify(movieRepository, times(1)).findById(movieId);
        verify(tagRepository, times(1)).findAllById(tagIds);
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    @DisplayName("리뷰 생성 실패 - 사용자를 찾을 수 없음")
    void createReview_Fail_UserNotFound() {
        // given
        Long userId = 999L;
        ReviewCreateRequestDto requestDto = new ReviewCreateRequestDto(101, "제목", "내용", 9, Set.of(1));

        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // when & then
        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> {
            reviewService.createReview(userId, requestDto);
        });

        assertThat(exception.getMessage()).isEqualTo("사용자를 찾을 수 없습니다. User ID: " + userId);
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 생성 실패 - 영화를 찾을 수 없음")
    void createReview_Fail_MovieNotFound() {
        // given
        Long userId = 1L;
        Integer movieId = 999;
        ReviewCreateRequestDto requestDto = new ReviewCreateRequestDto(movieId, "제목", "내용", 9, Set.of(1));

        given(userRepository.findById(userId)).willReturn(Optional.of(mock(User.class)));
        given(movieRepository.findById(movieId)).willReturn(Optional.empty());

        // when & then
        MovieNotFoundException exception = assertThrows(MovieNotFoundException.class, () -> {
            reviewService.createReview(userId, requestDto);
        });

        assertThat(exception.getMessage()).isEqualTo("영화를 찾을 수 없습니다. Movie ID: " + movieId);
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 생성 실패 - 존재하지 않는 태그 ID 포함")
    void createReview_Fail_TagNotFound() {
        // given
        Long userId = 1L;
        Integer movieId = 101;
        Set<Integer> tagIds = Set.of(1, 999);

        ReviewCreateRequestDto requestDto = new ReviewCreateRequestDto(movieId, "제목", "내용", 9, tagIds);

        // findAllById는 존재하는 태그(1번)만 반환할 것
        List<Tag> foundTags = List.of(mock(Tag.class));

        given(userRepository.findById(userId)).willReturn(Optional.of(mock(User.class)));
        given(movieRepository.findById(movieId)).willReturn(Optional.of(mock(Movie.class)));
        given(tagRepository.findAllById(tagIds)).willReturn(foundTags);

        // when & then
        TagNotFoundException exception = assertThrows(TagNotFoundException.class, () -> {
            reviewService.createReview(userId, requestDto);
        });

        assertThat(exception.getMessage()).isEqualTo("존재하지 않는 태그 ID가 포함되어 있습니다.");
        verify(reviewRepository, never()).save(any());
    }

    // ===================================================================
    //                        updateReview 테스트
    // ===================================================================

    @Test
    @DisplayName("리뷰 수정 성공")
    void updateReview_Success() {
        // given
        Long userId = 1L;
        UUID reviewId = UUID.randomUUID();

        // 원본 리뷰 객체 생성 (실제 엔티티처럼 동작하도록 spy 사용)
        User owner = User.builder().userId(userId).build();
        Review originalReview = spy(Review.builder()
                .reviewId(reviewId)
                .user(owner)
                .title("원본 제목")
                .content("원본 내용")
                .rating(5)
                .build());

        // 수정 요청 DTO
        ReviewUpdateRequestDto requestDto = new ReviewUpdateRequestDto();
        requestDto.setTitle("수정된 제목");
        requestDto.setContent("수정된 내용");

        // Mock 행동 정의
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(originalReview));

        // when
        reviewService.updateReview(reviewId, userId, requestDto);

        // then
        // originalReview의 update 메서드가 올바른 인자와 함께 호출되었는지 검증
        verify(originalReview, times(1)).update("수정된 제목", "수정된 내용", null);

        // save 메서드는 호출되지 않아야 함 (변경 감지)
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("리뷰 수정 실패 - 리뷰를 찾을 수 없음")
    void updateReview_Fail_ReviewNotFound() {
        // given
        Long userId = 1L;
        UUID reviewId = UUID.randomUUID();
        ReviewUpdateRequestDto requestDto = new ReviewUpdateRequestDto();

        given(reviewRepository.findById(reviewId)).willReturn(Optional.empty());

        // when & then
        assertThrows(ReviewNotFoundException.class, () -> {
            reviewService.updateReview(reviewId, userId, requestDto);
        });
    }

    @Test
    @DisplayName("리뷰 수정 실패 - 권한 없음")
    void updateReview_Fail_AccessDenied() {
        // given
        Long ownerId = 1L;
        Long attackerId = 2L; // 다른 사용자 ID
        UUID reviewId = UUID.randomUUID();

        User owner = User.builder().userId(ownerId).build();
        Review review = Review.builder().reviewId(reviewId).user(owner).build();

        ReviewUpdateRequestDto requestDto = new ReviewUpdateRequestDto();

        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));

        // when & then
        assertThrows(ReviewAccessDeniedException.class, () -> {
            reviewService.updateReview(reviewId, attackerId, requestDto);
        });
    }


    // ===================================================================
    //                        deleteReview 테스트
    // ===================================================================

    @Test
    @DisplayName("리뷰 삭제 성공")
    void deleteReview_Success() {
        // given
        Long userId = 1L;
        UUID reviewId = UUID.randomUUID();

        User ownerAndDeleter = User.builder().userId(userId).build();
        Review reviewToDelete = spy(Review.builder()
                .reviewId(reviewId)
                .user(ownerAndDeleter)
                .build());

        // Mock 행동 정의
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(reviewToDelete));
        given(userRepository.findById(userId)).willReturn(Optional.of(ownerAndDeleter));

        // when
        reviewService.deleteReview(reviewId, userId);

        // then
        // reviewToDelete의 softDelete 메서드가 올바른 deleter와 함께 호출되었는지 검증
        verify(reviewToDelete, times(1)).softDelete(ownerAndDeleter);

        // save 메서드는 호출되지 않아야 함 (변경 감지)
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("리뷰 삭제 실패 - 리뷰를 찾을 수 없음")
    void deleteReview_Fail_ReviewNotFound() {
        // given
        Long userId = 1L;
        UUID reviewId = UUID.randomUUID();

        given(reviewRepository.findById(reviewId)).willReturn(Optional.empty());

        // when & then
        assertThrows(ReviewNotFoundException.class, () -> {
            reviewService.deleteReview(reviewId, userId);
        });
    }

    @Test
    @DisplayName("리뷰 삭제 실패 - 권한 없음")
    void deleteReview_Fail_AccessDenied() {
        // given
        Long ownerId = 1L;
        Long attackerId = 2L;
        UUID reviewId = UUID.randomUUID();

        User owner = User.builder().userId(ownerId).build();
        User attacker = User.builder().userId(attackerId).build();
        Review review = Review.builder().reviewId(reviewId).user(owner).build();

        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));
        given(userRepository.findById(attackerId)).willReturn(Optional.of(attacker));

        // when & then
        assertThrows(ReviewAccessDeniedException.class, () -> {
            reviewService.deleteReview(reviewId, attackerId);
        });
    }

    // ===================================================================
    //                        findReviewById 테스트
    // ===================================================================

    @Test
    @DisplayName("리뷰 상세 조회 성공")
    void findReviewById_Success() {
        // given
        UUID reviewId = UUID.randomUUID();

        // Mock Review 객체 생성
        // DTO 변환에 필요한 최소한의 필드를 가진 실제 객체를 만드는 것이 좋습니다.
        User mockUser = mock(User.class);
        Movie mockMovie = mock(Movie.class);
        Review mockReview = Review.builder()
                .reviewId(reviewId)
                .title("테스트 제목")
                .content("테스트 내용")
                .rating(8)
                .createdAt(LocalDateTime.now())
                .user(mockUser)
                .movie(mockMovie)
                .build();

        // Mock Repository 행동 정의
        given(reviewRepository.findReviewWithDetailsById(reviewId)).willReturn(Optional.of(mockReview));

        // when
        ReviewDetailResponseDto responseDto = reviewService.findReviewById(reviewId, null);

        // then
        assertThat(responseDto).isNotNull();
        assertThat(responseDto.getReviewId()).isEqualTo(reviewId);
        assertThat(responseDto.getTitle()).isEqualTo("테스트 제목");

        verify(reviewRepository, times(1)).findReviewWithDetailsById(reviewId);
    }

    @Test
    @DisplayName("리뷰 상세 조회 실패 - 리뷰를 찾을 수 없음")
    void findReviewById_Fail_ReviewNotFound() {
        // given
        UUID nonExistentReviewId = UUID.randomUUID();

        given(reviewRepository.findReviewWithDetailsById(nonExistentReviewId)).willReturn(Optional.empty());

        // when & then
        // 예외가 발생하는지와, 예외 메시지가 올바른지 검증
        ReviewNotFoundException exception = assertThrows(ReviewNotFoundException.class, () -> {
            reviewService.findReviewById(nonExistentReviewId, null);
        });

        assertThat(exception.getMessage()).contains(nonExistentReviewId.toString());
    }

    // ===================================================================
    //                      getMyStatusForReview 테스트
    // ===================================================================

    @Test
    @DisplayName("나의 리뷰 상태 조회 성공 - 좋아요를 누른 경우")
    void getMyStatusForReview_Success_Liked() {
        // given
        Long currentUserId = 1L;
        UUID reviewId = UUID.randomUUID();

        // Mock 행동 정의
        given(reviewRepository.existsById(reviewId)).willReturn(true);
        given(reviewLikeRepository.existsById_ReviewIdAndId_UserId(reviewId, currentUserId)).willReturn(true);

        // when
        ReviewMyStatusResponseDto responseDto = reviewService.getMyStatusForReview(reviewId, currentUserId);

        // then
        assertThat(responseDto).isNotNull();
        assertThat(responseDto.isLiked()).isTrue();

        verify(reviewRepository, times(1)).existsById(reviewId);
        verify(reviewLikeRepository, times(1)).existsById_ReviewIdAndId_UserId(reviewId, currentUserId);
    }

    @Test
    @DisplayName("나의 리뷰 상태 조회 성공 - 좋아요를 누르지 않은 경우")
    void getMyStatusForReview_Success_NotLiked() {
        // given
        Long currentUserId = 1L;
        UUID reviewId = UUID.randomUUID();

        // Mock 행동 정의
        given(reviewRepository.existsById(reviewId)).willReturn(true);
        given(reviewLikeRepository.existsById_ReviewIdAndId_UserId(reviewId, currentUserId)).willReturn(false);

        // when
        ReviewMyStatusResponseDto responseDto = reviewService.getMyStatusForReview(reviewId, currentUserId);

        // then
        assertThat(responseDto).isNotNull();
        assertThat(responseDto.isLiked()).isFalse();
    }

    @Test
    @DisplayName("나의 리뷰 상태 조회 실패 - 리뷰를 찾을 수 없음")
    void getMyStatusForReview_Fail_ReviewNotFound() {
        // given
        Long currentUserId = 1L;
        UUID nonExistentReviewId = UUID.randomUUID();

        given(reviewRepository.existsById(nonExistentReviewId)).willReturn(false);

        // when & then
        assertThrows(ReviewNotFoundException.class, () -> {
            reviewService.getMyStatusForReview(nonExistentReviewId, currentUserId);
        });

        // reviewLikeRepository는 호출되지 않아야 함
        verify(reviewLikeRepository, never()).existsById_ReviewIdAndId_UserId(any(UUID.class), anyLong());
    }
}