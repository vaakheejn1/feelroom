package com.d208.feelroom.comment.service;

import com.d208.feelroom.comment.domain.entity.Comment;
import com.d208.feelroom.comment.domain.entity.CommentLike;
import com.d208.feelroom.comment.domain.entity.summary.CommentSummary;
import com.d208.feelroom.comment.domain.repository.CommentLikeRepository;
import com.d208.feelroom.comment.domain.repository.CommentRepository;
import com.d208.feelroom.comment.domain.repository.CommentSummaryRepository;
import com.d208.feelroom.comment.dto.*;
import com.d208.feelroom.comment.exception.CommentAccessDeniedException;
import com.d208.feelroom.comment.exception.CommentNotFoundException;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.review.exception.ReviewNotFoundException;
import com.d208.feelroom.user.domain.UserRole;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.comment.event.CommentInteractionEvent;
import com.d208.feelroom.badge.event.EventPublisher;
import com.d208.feelroom.review.event.ReviewInteractionEvent;
import com.d208.feelroom.user.event.UserActivityEvent.ActivityType;
import com.d208.feelroom.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional // 클래스 레벨에 @Transactional을 붙이면 모든 public 메서드에 적용됩니다.
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final EventPublisher eventPublisher;
    private final ApplicationEventPublisher appEventPublisher;
    private final CommentSummaryRepository commentSummaryRepository; // CommentSummaryRepository 주입
    /**
     * 새로운 댓글 또는 대댓글을 생성합니다.
     *
     * @param userId          댓글 작성자의 ID
     * @param reviewId        댓글이 속한 리뷰의 ID
     * @param requestDto      댓글 생성 요청 데이터 (내용, 부모 댓글 ID)
     * @return 생성된 댓글의 ID를 담은 DTO
     */
    @Transactional
    public CommentCreateResponseDto createComment(Long userId, UUID reviewId, CommentCreateRequestDto requestDto) {
        // 1. 기본 엔티티 조회
        User writer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 2. 대댓글 관련 정보 처리 (parentComment, mentionedUser)
        Comment parentComment = null;
        User mentionedUser = null; // 멘션 대상 사용자 (replyToUser)

        if (requestDto.getParentCommentId() != null) {
            // --- 대댓글인 경우 ---
            // 2-1. 부모 댓글 조회 및 검증
            parentComment = commentRepository.findById(requestDto.getParentCommentId())
                    .orElseThrow(() -> new CommentNotFoundException("부모 댓글을 찾을 수 없습니다. ID: " + requestDto.getParentCommentId()));

            // [정책 검증 1] 부모 댓글은 반드시 최상위 댓글이어야 함
            if (parentComment.getParentComment() != null) {
                throw new IllegalArgumentException("대댓글의 부모는 최상위 댓글만 가능합니다.");
            }

            // [정책 검증 2] 부모 댓글이 같은 리뷰에 속해 있는지 확인
            if (!parentComment.getReview().getReviewId().equals(reviewId)) {
                throw new IllegalArgumentException("부모 댓글이 다른 리뷰에 속해 있습니다.");
            }

            // 2-2. 멘션된 사용자 조회
            if (requestDto.getMentionUserId() == null) {
                throw new IllegalArgumentException("대댓글 작성 시 멘션할 사용자 ID는 필수입니다.");
            }
            mentionedUser = userRepository.findById(requestDto.getMentionUserId())
                    .orElseThrow(() -> new UserNotFoundException(requestDto.getMentionUserId()));
        } else {
            // --- 최상위 댓글인 경우 ---
            // [정책 검증 3] 최상위 댓글은 멘션 사용자가 없어야 함
            if (requestDto.getMentionUserId() != null) {
                throw new IllegalArgumentException("최상위 댓글은 멘션 기능을 사용할 수 없습니다.");
            }
        }

        // 3. Comment 엔티티 생성
        Comment newComment = Comment.builder()
                .user(writer)
                .review(review)
                .content(requestDto.getContent())
                .parentComment(parentComment)     // 대댓글이면 설정, 아니면 null
                .replyToUser(mentionedUser)      // 멘션 대상이 있으면 설정, 아니면 null
                .build();

        // 4. 저장 및 응답 반환
        Comment savedComment = commentRepository.save(newComment);

        // == 이벤트 발생 1. '댓글 작성' 활동 이벤트 ==
        eventPublisher.publishUserActivity(userId, ActivityType.COMMENT_WRITE);

        // == 이벤트 발생 2. '댓글 생성' 알림용 이벤트 ==
        eventPublisher.publishComment(savedComment);

        appEventPublisher.publishEvent(ReviewInteractionEvent.forCommentChange(this, reviewId, +1));

        return new CommentCreateResponseDto(savedComment.getCommentId());
    }

    /**
     * 댓글 내용을 삭제합니다.
     *
     * @param commentId   삭제할 댓글의 ID
     * @param currentUser 삭제 요청한 사용자
     */
    @Transactional
    public void deleteComment(UUID commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));
        Review targetReview = comment.getReview();

        // 이미 삭제된 댓글이면 아무 작업도 하지 않음
        if (comment.isDeleted()) {
            return;
        }

        // 권한 확인 (작성자도 아니고, 관리자도 아닐 경우 예외 발생)
        boolean isOwner = comment.getUser().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getUserRole() == UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new CommentAccessDeniedException("댓글을 삭제할 권한이 없습니다.");
        }

        comment.delete(currentUser);
        appEventPublisher.publishEvent(ReviewInteractionEvent.forCommentChange(this, targetReview.getReviewId(), -1));
    }

    /**
     * 댓글 내용을 수정합니다.
     *
     * @param userId      수정을 요청한 사용자의 ID (권한 확인용)
     * @param commentId   수정할 댓글의 ID
     * @param requestDto  수정할 내용이 담긴 DTO
     */
    @Transactional
    public void updateComment(Long userId, UUID commentId, CommentUpdateRequestDto requestDto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        // 삭제된 댓글은 수정 불가
        if (comment.isDeleted()) {
            throw new CommentAccessDeniedException("삭제된 댓글은 수정할 수 없습니다.");
        }

        // 권한 확인: 현재 로그인한 사용자가 댓글 작성자인지 확인
        if (!comment.getUser().getUserId().equals(userId)) {
            throw new CommentAccessDeniedException("댓글을 수정할 권한이 없습니다.");
        }

        comment.updateContent(requestDto.getContent());
    }

    /**
     * 단일 댓글을 commentId로 조회합니다.
     *
     * @param commentId 댓글 ID
     * @return 단일 댓글 정보
     */

    public CommentDetailResponseDto findCommentById(UUID commentId) {
        Comment comment = commentRepository.findCommentWithDetailsById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));
        return new CommentDetailResponseDto(comment);
    }

    /**
     * 특정 리뷰의 댓글 목록을 2계층 구조로 페이징하여 조회합니다.
     * 좋아요 수, 현재 사용자의 좋아요 여부를 포함합니다.
     *
     * @param reviewId 리뷰 ID
     * @param pageable 페이징 정보
     * @param userId   현재 로그인한 사용자 ID (비로그인 시 null)
     * @return 계층 구조로 변환된 댓글 페이지
     */
    @Transactional(readOnly = true)
    public Page<CommentNodeDto> findCommentsByReview(UUID reviewId, Pageable pageable, Long userId) {
        // 1. DB에서 리뷰의 모든 댓글을 한 번에 조회
        List<Comment> allComments = commentRepository.findAllByReviewIdOrderByParentAndCreatedAt(reviewId);

        if (allComments.isEmpty()) {
            return Page.empty(pageable);
        }

        // --- [수정] 좋아요 수 및 상태 조회를 위한 데이터 준비 ---
        // 2. 조회된 모든 댓글의 ID 리스트 추출
        List<UUID> allCommentIds = allComments.stream()
                .map(Comment::getCommentId)
                .collect(Collectors.toList());

        // 3. TODO: [성능 개선 필요] 각 댓글의 좋아요 수를 Map으로 조회합니다.
        // 현재는 각 댓글 ID마다 COUNT 쿼리를 실행하여 N+1 문제가 발생할 수 있습니다.
        // 추후 GROUP BY를 사용하는 단일 쿼리로 최적화하거나, comment_summary 테이블을 활용해야 합니다.
        Map<UUID, Integer> likeCountMap = new HashMap<>();
        for (UUID commentId : allCommentIds) {
            likeCountMap.put(commentId, (int) commentLikeRepository.countByComment_CommentId(commentId));
        }

        // 4. 현재 사용자가 좋아요 누른 댓글 ID Set 조회 (이 부분은 이미 최적화됨)
        Set<UUID> likedCommentIds = (userId != null) ?
                commentLikeRepository.findLikedCommentIdsByUser(userId, allCommentIds) :
                Collections.emptySet();
        // ----------------------------------------------------

        // 5. 모든 댓글을 DTO로 변환하고, 추가 정보를 주입
        Map<UUID, CommentNodeDto> dtoMap = new HashMap<>();
        for (Comment comment : allComments) {
            CommentNodeDto dto = CommentNodeDto.from(comment);

            // 좋아요 수 설정 (위에서 만든 likeCountMap에서 가져옴)
            dto.setLikeCount(likeCountMap.getOrDefault(comment.getCommentId(), 0));

            // 현재 사용자 좋아요 여부 설정
            dto.setLiked(likedCommentIds.contains(comment.getCommentId()));

            dtoMap.put(comment.getCommentId(), dto);
        }

        // 6. 계층 구조로 재조합
        List<CommentNodeDto> rootComments = new ArrayList<>();
        Map<UUID, List<CommentNodeDto>> repliesMap = new HashMap<>();

        allComments.forEach(comment -> {
            CommentNodeDto dto = dtoMap.get(comment.getCommentId());
            if (comment.getParentComment() == null) {
                rootComments.add(dto);
            } else {
                UUID parentId = comment.getParentComment().getCommentId();
                repliesMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(dto);
            }
        });

        rootComments.forEach(parentDto ->
                parentDto.setReplies(repliesMap.getOrDefault(parentDto.getCommentId(), Collections.emptyList()))
        );

        // 7. 수동 페이징
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), rootComments.size());
        List<CommentNodeDto> pagedContent = (start >= rootComments.size()) ? Collections.emptyList() : rootComments.subList(start, end);

        return new PageImpl<>(pagedContent, pageable, rootComments.size());
    }

    /**
     * 댓글 좋아요 토글 (있으면 삭제, 없으면 추가)
     * @param commentId 댓글 ID
     * @param userId    사용자 ID
     * @return 좋아요 토글 후의 최종 상태와 총 좋아요 수를 담은 DTO
     */
    @Transactional
    public CommentMyStatusResponseDto toggleCommentLike(UUID commentId, Long userId) {
        // 1. 댓글 및 사용자 존재 여부 확인
        Comment comment = commentRepository.findById(commentId) // findWithDetails는 필요 없을 수 있음
                .orElseThrow(() -> new CommentNotFoundException(commentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 2. 현재 좋아요 상태 확인 및 처리
        Optional<CommentLike> commentLikeOptional = commentLikeRepository.findByComment_CommentIdAndUser_UserId(commentId, userId);

        boolean isNowLiked;
        int likeChange; // 좋아요 수 변경량 (+1 or -1)

        if (commentLikeOptional.isPresent()) {
            // 이미 좋아요를 눌렀다면 취소
            commentLikeRepository.delete(commentLikeOptional.get());
            isNowLiked = false;
            likeChange = -1;
        } else {
            // 좋아요를 누르지 않았다면 추가
            CommentLike newCommentLike = CommentLike.builder()
                    .user(user)
                    .comment(comment)
                    .build();
            commentLikeRepository.save(newCommentLike);
            isNowLiked = true;
            likeChange = +1;
        }
        appEventPublisher.publishEvent(CommentInteractionEvent.forLikeChange(this, commentId, likeChange));

        // 4. 사용자에게 즉각적인 피드백을 주기 위한 '예상' 좋아요 수 계산
        // CommentSummary의 현재 값 (아직 비동기 업데이트가 반영되지 않았을 수 있음)에 변경량을 더합니다.
        // comment.getCommentSummary()가 null일 수 있으므로 null 체크
        CommentSummary commentSummary = comment.getCommentSummary(); // Comment 엔티티에 CommentSummary 양방향 관계 설정 필요
        int currentSummaryLikes = (commentSummary != null ? commentSummary.getCommentLikeCount() : 0);
        int estimatedTotalLikes = currentSummaryLikes + likeChange;

        // 4. DTO를 생성하여 반환
        CommentMyStatusResponseDto responseDto = new CommentMyStatusResponseDto(estimatedTotalLikes, isNowLiked);

        return responseDto;
    }
}