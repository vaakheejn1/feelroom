package com.d208.feelroom.review.domain.entity.summary;

import com.d208.feelroom.review.domain.entity.Review;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "review_summary")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자 추가
@AllArgsConstructor // Builder와 함께 사용하면 유용 (옵션)
@Builder // Builder 패턴 사용 시 (옵션)
@EntityListeners(AuditingEntityListener.class)
public class ReviewSummary {

    @Id
    @Column(name = "review_id", columnDefinition = "BINARY(16)", nullable = false) // Review의 columnDefinition과 일치
    private UUID reviewId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // Review 엔티티의 reviewId를 이 엔티티의 PK로 매핑합니다.
    @JoinColumn(name = "review_id") // 실제 DB 컬럼명
    private Review review;

    @Builder.Default // Builder 패턴 사용 시
    @Column(name = "review_like_count", nullable = false)
    private Integer reviewLikeCount = 0;

    @Builder.Default // Builder 패턴 사용 시
    @Column(name = "review_comment_count", nullable = false)
    private Integer reviewCommentCount = 0;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 요약 정보에 대한 업데이트 시간

    // 편의 메서드 (ReviewSummary 객체 생성 시 활용)
    public ReviewSummary(Review review) {
        this.review = review;
        this.reviewId = review.getReviewId(); // Review의 ID를 Summary의 ID로 설정
        this.reviewLikeCount = 0;
        this.reviewCommentCount = 0;
        // updatedAt은 @LastModifiedDate에 의해 자동으로 설정
    }

    /**
     * 실제 좋아요/댓글 수를 기반으로 ReviewSummary를 재조정합니다. - 배치 작업용
     * @param newLikeCount 실제 좋아요 개수
     * @param newCommentCount 실제 댓글 개수
     */
    public void reconcile(long newLikeCount, long newCommentCount) {
        // Integer.MAX_VALUE를 넘어가지 않는다고 가정하지만,
        // 만약 넘어갈 가능성이 있다면 Integer 대신 Long으로 변경 고려 필요
        this.reviewLikeCount = (int) newLikeCount;
        this.reviewCommentCount = (int) newCommentCount;
    }
}