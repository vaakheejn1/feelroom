package com.d208.feelroom.movie.domain.entity.summary;

import com.d208.feelroom.movie.domain.entity.Movie;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "movie_summary")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 외부에서 무분별한 생성을 막기 위함
public class MovieSummary {

    @Id
    @Column(name = "movie_id")
    private Integer movieId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @Column(name = "review_count", nullable = false)
    private int reviewCount = 0;

    @Column(name = "rating_sum", nullable = false)
    private long ratingSum = 0L;

    @UpdateTimestamp // Hibernate가 제공하는 자동 시간 기록 기능
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 객체 생성은 Builder를 통해 명확하게
    @Builder
    public MovieSummary(Movie movie) {
        this.movie = movie;
        this.movieId = movie.getMovieId();
        this.reviewCount = 0;
        this.ratingSum = 0L;
    }

    //== 비즈니스 로직: 상태 변경은 의도가 명확한 메서드로만 ==//

    /**
     * 리뷰 정보를 업데이트합니다. (증가/감소)
     * @param ratingChange 평점 변화량 (리뷰 추가 시: +rating, 리뷰 삭제 시: -rating)
     * @param countChange  리뷰 개수 변화량 (+1 또는 -1)
     */
    public void updateReviewSummary(int ratingChange, int countChange) {
        this.ratingSum += ratingChange;
        this.reviewCount += countChange;
    }

    //== 조회용 편의 메서드 ==//

    /**
     * 우리 서비스 사용자들의 평균 평점을 계산하여 반환합니다.
     * @return 리뷰가 없으면 0.0, 있으면 계산된 평균 평점
     */
    public double getUserRatingAverage() {
        if (this.reviewCount == 0) {
            return 0.0;
        }
        // 소수점 표현을 위해 double로 형변환 후 나눗셈 수행
        return (double) this.ratingSum / this.reviewCount;
    }

    /**
     * 실제 리뷰 테이블의 집계 값으로 MovieSummary를 재조정합니다. - 배치 작업용
     * @param newReviewCount 실제 리뷰 개수
     * @param newRatingSum   실제 평점 합계
     */
    public void reconcile(long newReviewCount, long newRatingSum) {
        this.reviewCount = (int) newReviewCount; // long -> int 캐스팅 (주의: int 범위를 넘어가지 않는다고 가정)
        this.ratingSum = newRatingSum;
    }
}