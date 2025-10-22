// CommentController.java (기존 파일 수정)
package com.d208.feelroom.comment.controller;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.comment.dto.CommentDetailResponseDto;
import com.d208.feelroom.comment.dto.CommentMyStatusResponseDto;
import com.d208.feelroom.comment.dto.CommentUpdateRequestDto;
import com.d208.feelroom.comment.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "5. Comment Management", description = "댓글/대댓글 관리 API")
@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController { // 클래스 이름은 그대로 유지해도 좋습니다.
    private final CommentService commentService;

    @Operation(summary = "단일 댓글 조회", description = "특정 댓글의 상세 정보를 조회합니다.")
    // [수정] 경로에서 중복되는 "/comments" 제거
    @GetMapping("/{commentId}")
    public ResponseEntity<CommentDetailResponseDto> getComment(
            @Parameter(description = "조회할 댓글 ID") @PathVariable UUID commentId) {

        CommentDetailResponseDto responseDto = commentService.findCommentById(commentId);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "댓글/대댓글 수정", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{commentId}")
    public ResponseEntity<Void> updateComment(
            @Parameter(description = "수정할 댓글 ID") @PathVariable UUID commentId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CommentUpdateRequestDto requestDto) {

        Long userId = userDetails.getUser().getUserId();
        commentService.updateComment(userId, commentId, requestDto);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "댓글/대댓글 삭제", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "삭제할 댓글 ID") @PathVariable UUID commentId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) { // [수정] 불필요한 RequestBody 제거

        User currentUser = userDetails.getUser();
        commentService.deleteComment(commentId, currentUser);

        return ResponseEntity.noContent().build();
    }

    /**
     * 댓글 좋아요 토글
     */
    @Operation(
            summary = "댓글 좋아요 토글",
            description = "특정 댓글의 좋아요를 토글합니다. 좋아요가 있으면 취소하고, 없으면 추가합니다. 인증이 필요합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좋아요 토글 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    })
    @PutMapping("/{commentId}/like")
    public ResponseEntity<CommentMyStatusResponseDto> toggleMovieLike(
            @Parameter(description = "토글할 댓글 ID") @PathVariable UUID commentId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long currentUserId = userDetails.getUser().getUserId();

        CommentMyStatusResponseDto responseDto = commentService.toggleCommentLike(commentId, currentUserId);

        return ResponseEntity.ok(responseDto);
    }
}