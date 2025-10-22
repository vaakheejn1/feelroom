package com.d208.feelroom.comment.domain.entity; // 또는 ...like 패키지

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

/**
 * CommentLike 엔티티의 복합키를 위한 ID 클래스입니다.
 */
@Data // @Getter, @Setter, @EqualsAndHashCode, @NoArgsConstructor 등을 포함
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class CommentLikeId implements Serializable {
    @Column(name = "user_id") // 실제 DB 컬럼명을 여기에 명시
    private Long userId;

    @Column(name = "comment_id", columnDefinition = "BINARY(16)")
    private UUID commentId;
}