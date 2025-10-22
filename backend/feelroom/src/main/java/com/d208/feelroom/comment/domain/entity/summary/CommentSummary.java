package com.d208.feelroom.comment.domain.entity.summary;

import com.d208.feelroom.comment.domain.entity.Comment;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment_summary")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자 추가
@AllArgsConstructor // Builder와 함께 사용하면 유용 (옵션)
@Builder // Builder 패턴 사용 시 (옵션)
@EntityListeners(AuditingEntityListener.class)
public class CommentSummary {
    @Id
    @Column(name = "comment_id", columnDefinition = "BINARY(16)", nullable = false) // Review의 columnDefinition과 일치
    private UUID commentId;

    @Setter
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // Comment 엔티티의 commentId를 이 엔티티의 PK로 매핑합니다.
    @JoinColumn(name = "comment_id") // 실제 DB 컬럼명 (FK 역할도 겸함)
    private Comment comment; // Comment 엔티티 참조

    @Builder.Default // Builder 패턴 사용 시
    @Column(name = "comment_like_count", nullable = false)
    private Integer commentLikeCount = 0;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 요약 정보에 대한 업데이트 시간

    // 편의 생성자 (CommentSummary 객체 생성 시 활용)
    @Builder
    public CommentSummary(Comment comment) {
        this.comment = comment;
        this.commentId = comment.getCommentId(); // Comment의 ID를 Summary의 ID로 설정
        this.commentLikeCount = 0;
        // updatedAt은 @LastModifiedDate에 의해 자동으로 설정
    }

    /**
     * 실제 좋아요 수를 기반으로 CommentSummary를 재조정합니다. - 배치 작업용
     * @param newLikeCount 실제 좋아요 개수
     */
    public void reconcile(long newLikeCount) {
        // Integer.MAX_VALUE를 넘어가지 않는다고 가정.
        this.commentLikeCount = (int) newLikeCount;
    }
}
