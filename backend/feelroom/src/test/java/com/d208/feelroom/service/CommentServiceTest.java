package com.d208.feelroom.service;

import com.d208.feelroom.comment.domain.entity.Comment;
import com.d208.feelroom.comment.domain.entity.CommentLike;
import com.d208.feelroom.comment.domain.repository.CommentLikeRepository;
import com.d208.feelroom.comment.domain.repository.CommentRepository;
import com.d208.feelroom.comment.service.CommentService;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.user.domain.UserRole;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.comment.dto.CommentCreateRequestDto;
import com.d208.feelroom.comment.dto.CommentCreateResponseDto;
import com.d208.feelroom.comment.dto.CommentMyStatusResponseDto;
import com.d208.feelroom.comment.dto.CommentUpdateRequestDto;
import com.d208.feelroom.comment.exception.CommentAccessDeniedException;
import com.d208.feelroom.comment.exception.CommentNotFoundException;
import com.d208.feelroom.user.exception.UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @InjectMocks
    private CommentService commentService;

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private CommentLikeRepository commentLikeRepository;

    // --- 테스트용 공통 변수 ---
    private final Long userId = 1L;
    private final User mockUser = mock(User.class);
    private final Review mockReview = mock(Review.class);
    private final UUID reviewId = UUID.randomUUID();
    private final UUID commentId = UUID.randomUUID();
    private final CommentLike commentLike = mock(CommentLike.class);

    @Nested
    @DisplayName("댓글 생성 테스트")
    class CreateCommentTest {

        @Test
        @DisplayName("성공: 최상위 댓글 생성")
        void createTopLevelComment_Success() {
            // given
            CommentCreateRequestDto requestDto = new CommentCreateRequestDto("댓글 내용", null, null);
            Comment savedComment = Comment.builder().commentId(commentId).build();

            given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
            given(reviewRepository.findById(reviewId)).willReturn(Optional.of(mockReview));
            given(commentRepository.save(any(Comment.class))).willReturn(savedComment);

            // when
            CommentCreateResponseDto responseDto = commentService.createComment(userId, reviewId, requestDto);

            // then
            assertThat(responseDto.getCommentId()).isEqualTo(commentId);

            ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
            verify(commentRepository).save(commentCaptor.capture());
            Comment newComment = commentCaptor.getValue();

            assertThat(newComment.getParentComment()).isNull();
            assertThat(newComment.getReplyToUser()).isNull(); // 최상위 댓글은 멘션 대상이 없음
        }

        @Test
        @DisplayName("실패: 대댓글 생성 시 부모 댓글이 다른 리뷰에 속함")
        void createReplyComment_Fail_InvalidParent() {
            // given
            UUID parentCommentId = UUID.randomUUID();
            UUID anotherReviewId = UUID.randomUUID();
            CommentCreateRequestDto requestDto = new CommentCreateRequestDto("대댓글 내용", parentCommentId, 1L);

            Review anotherMockReview = mock(Review.class);
            Comment mockParentComment = mock(Comment.class);

            given(anotherMockReview.getReviewId()).willReturn(anotherReviewId);
            given(mockParentComment.getReview()).willReturn(anotherMockReview);

            given(userRepository.findById(userId)).willReturn(Optional.of(mock(User.class)));
            given(reviewRepository.findById(reviewId)).willReturn(Optional.of(mockReview));
            given(commentRepository.findById(parentCommentId)).willReturn(Optional.of(mockParentComment));

            // when & then
            assertThrows(IllegalArgumentException.class, () -> commentService.createComment(userId, reviewId, requestDto));
        }
    }

    @Nested
    @DisplayName("댓글 수정 테스트")
    class UpdateCommentTest {

        @Test
        @DisplayName("성공: 댓글 수정")
        void updateComment_Success() {
            // given
            CommentUpdateRequestDto requestDto = new CommentUpdateRequestDto("수정된 내용");
            Comment mockComment = mock(Comment.class);

            given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
            given(mockComment.isDeleted()).willReturn(false); // 삭제되지 않은 상태
            given(mockComment.getUser()).willReturn(mockUser);
            given(mockUser.getUserId()).willReturn(userId); // 권한 확인용

            // when
            commentService.updateComment(userId, commentId, requestDto);

            // then
            verify(mockComment, times(1)).updateContent("수정된 내용");
        }

        @Test
        @DisplayName("실패: 수정하려는 댓글이 이미 삭제됨")
        void updateComment_Fail_AlreadyDeleted() {
            // given
            CommentUpdateRequestDto requestDto = new CommentUpdateRequestDto("수정 시도");
            Comment mockComment = mock(Comment.class);

            given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
            given(mockComment.isDeleted()).willReturn(true); // 삭제된 상태

            // when & then
            assertThrows(CommentAccessDeniedException.class, () -> commentService.updateComment(userId, commentId, requestDto));
        }

        @Test
        @DisplayName("실패: 댓글을 찾을 수 없음")
        void updateComment_Fail_CommentNotFound() {
            // given
            CommentUpdateRequestDto requestDto = new CommentUpdateRequestDto("수정된 내용");
            given(commentRepository.findById(commentId)).willReturn(Optional.empty());

            // when & then
            assertThrows(CommentNotFoundException.class, () -> commentService.updateComment(userId, commentId, requestDto));
        }

        @Test
        @DisplayName("실패: 권한 없음")
        void updateComment_Fail_AccessDenied() {
            // given
            Long anotherUserId = 2L;
            CommentUpdateRequestDto requestDto = new CommentUpdateRequestDto("수정된 내용");
            User anotherUser = mock(User.class);
            Comment mockComment = mock(Comment.class);

            given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
            given(mockComment.isDeleted()).willReturn(false); // 삭제되지 않은 상태
            given(mockComment.getUser()).willReturn(anotherUser);
            given(anotherUser.getUserId()).willReturn(anotherUserId); // 다른 사용자의 ID

            // when & then
            assertThrows(CommentAccessDeniedException.class, () -> commentService.updateComment(userId, commentId, requestDto));
        }
    }

    @Nested
    @DisplayName("댓글 삭제 테스트")
    class DeleteCommentTest {

        @Test
        @DisplayName("성공: 댓글 작성자가 삭제")
        void deleteComment_Success_ByOwner() {
            // given
            Comment mockComment = mock(Comment.class);

            given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
            given(mockComment.isDeleted()).willReturn(false);
            given(mockComment.getUser()).willReturn(mockUser);
            given(mockUser.getUserId()).willReturn(userId);

            // when
            commentService.deleteComment(commentId, mockUser);

            // then
            verify(mockComment, times(1)).delete(mockUser);
        }

        @Test
        @DisplayName("성공: 관리자가 삭제")
        void deleteComment_Success_ByAdmin() {
            // given
            Long ownerId = 2L;
            User ownerUser = mock(User.class);
            User adminUser = mock(User.class);
            Comment mockComment = mock(Comment.class);

            given(ownerUser.getUserId()).willReturn(ownerId); // 댓글 주인
            given(adminUser.getUserId()).willReturn(userId); // 관리자
            given(adminUser.getUserRole()).willReturn(UserRole.ADMIN);

            given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
            given(mockComment.isDeleted()).willReturn(false);
            given(mockComment.getUser()).willReturn(ownerUser);

            // when
            commentService.deleteComment(commentId, adminUser);

            // then
            verify(mockComment, times(1)).delete(adminUser);
        }

        @Test
        @DisplayName("실패: 권한 없는 사용자가 삭제 시도")
        void deleteComment_Fail_AccessDenied() {
            // given
            Long ownerId = 2L;
            User ownerUser = mock(User.class);
            User otherUser = mock(User.class);
            Comment mockComment = mock(Comment.class);

            given(ownerUser.getUserId()).willReturn(ownerId);
            given(otherUser.getUserId()).willReturn(userId);
            given(otherUser.getUserRole()).willReturn(UserRole.USER); // 일반 유저

            given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
            given(mockComment.isDeleted()).willReturn(false);
            given(mockComment.getUser()).willReturn(ownerUser);

            // when & then
            assertThrows(CommentAccessDeniedException.class, () -> commentService.deleteComment(commentId, otherUser));
        }

        @Test
        @DisplayName("성공: 이미 삭제된 댓글을 다시 삭제 시도해도 아무 일도 일어나지 않음 (멱등성)")
        void deleteComment_Idempotent_WhenAlreadyDeleted() {
            // given
            Comment mockComment = mock(Comment.class);
            given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
            given(mockComment.isDeleted()).willReturn(true); // 이미 삭제된 상태

            // when
            commentService.deleteComment(commentId, mockUser);

            // then
            // delete 메서드가 절대 호출되지 않아야 함
            verify(mockComment, never()).delete(any(User.class));
        }
    }

    @Nested
    @DisplayName("댓글 좋아요 토글 테스트")
    class ToggleCommentLikeTest {

        private UUID commentId;
        // @BeforeEach에서 mockComment를 생성할 필요가 없어짐

        @BeforeEach
        void setUp() {
            commentId = UUID.randomUUID();
        }

        @Test
        @DisplayName("성공: 좋아요가 없는 상태에서 좋아요 추가")
        void toggleCommentLike_AddLike() {
            // given
            User mockUser = mock(User.class);
            Comment mockComment = mock(Comment.class); // 테스트 케이스 내에서 Mock 객체 생성

            // 이 테스트에 필요한 모든 스터빙을 명시적으로 정의
            given(commentRepository.findCommentWithDetailsById(commentId)).willReturn(Optional.of(mockComment));
            given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
            given(commentLikeRepository.existsByComment_CommentIdAndUser_UserId(commentId, userId)).willReturn(false);
            given(commentLikeRepository.save(any(CommentLike.class))).willReturn(mock(CommentLike.class));

            // when
            CommentMyStatusResponseDto result = commentService.toggleCommentLike(commentId, userId);

            // then
            assertThat(result.isLiked()).isTrue();
            verify(commentLikeRepository).save(any(CommentLike.class));
            verify(commentLikeRepository, never()).deleteByCommentIdAndUserId(any(), any());
        }

        @Test
        @DisplayName("성공: 이미 좋아요를 누른 상태에서 좋아요 취소")
        void toggleCommentLike_RemoveLike() {
            // given
            User mockUser = mock(User.class);
            Comment mockComment = mock(Comment.class);

            given(commentRepository.findCommentWithDetailsById(commentId)).willReturn(Optional.of(mockComment));
            given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
            given(commentLikeRepository.existsByComment_CommentIdAndUser_UserId(commentId, userId)).willReturn(true);
            doNothing().when(commentLikeRepository).deleteByCommentIdAndUserId(commentId, userId);

            // when
            CommentMyStatusResponseDto result = commentService.toggleCommentLike(commentId, userId);

            // then
            assertThat(result.isLiked()).isFalse();
            verify(commentLikeRepository).deleteByCommentIdAndUserId(commentId, userId);
            verify(commentLikeRepository, never()).save(any());
        }

        @Test
        @DisplayName("실패: 좋아요 토글 시 댓글을 찾을 수 없음")
        void toggleCommentLike_Fail_CommentNotFound() {
            // given
            // 오직 이 테스트 케이스에서만 '못 찾는' 상황을 스터빙
            given(commentRepository.findCommentWithDetailsById(commentId)).willReturn(Optional.empty());

            // when & then
            assertThrows(CommentNotFoundException.class, () -> {
                commentService.toggleCommentLike(commentId, userId);
            });

            // userRepository.findById는 호출되기 전에 예외가 발생하므로 스터빙 필요 없음
            // 다른 repository 메서드들이 전혀 호출되지 않았는지 검증
            verify(userRepository, never()).findById(any());
            verify(commentLikeRepository, never()).existsByComment_CommentIdAndUser_UserId(any(), any());
            verify(commentLikeRepository, never()).save(any());
            verify(commentLikeRepository, never()).deleteByCommentIdAndUserId(any(), any());
        }

        @Test
        @DisplayName("실패: 좋아요 토글 시 사용자를 찾을 수 없음")
        void toggleCommentLike_Fail_UserNotFound() {
            // given
            Comment mockComment = mock(Comment.class);

            // 댓글은 찾았지만, 사용자는 못 찾는 상황을 스터빙
            given(commentRepository.findCommentWithDetailsById(commentId)).willReturn(Optional.of(mockComment));
            given(userRepository.findById(userId)).willReturn(Optional.empty());

            // when & then
            assertThrows(UserNotFoundException.class, () -> {
                commentService.toggleCommentLike(commentId, userId);
            });

            // 좋아요 관련 repository 메서드들이 전혀 호출되지 않았는지 검증
            verify(commentLikeRepository, never()).existsByComment_CommentIdAndUser_UserId(any(), any());
            verify(commentLikeRepository, never()).save(any());
            verify(commentLikeRepository, never()).deleteByCommentIdAndUserId(any(), any());
        }
    }
}