package com.d208.feelroom.comment.event;

import com.d208.feelroom.comment.domain.entity.Comment;

public record CommentEvent(Comment newComment) {
}