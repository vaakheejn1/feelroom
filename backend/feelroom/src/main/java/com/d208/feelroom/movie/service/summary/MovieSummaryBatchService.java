package com.d208.feelroom.movie.service.summary;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.entity.summary.MovieSummary;
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.movie.domain.repository.MovieSummaryRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieSummaryBatchService {

    private final MovieRepository movieRepository; // MovieSummary 생성 시 Movie 엔티티 조회용으로 필요
    private final ReviewRepository reviewRepository;
    private final MovieSummaryRepository movieSummaryRepository;

    /**
     * 서버 시작 시 딱 한 번 실행되는 초기화 메서드.
     * 영화 요약 정보 전체를 DB 기반으로 재계산하여 동기화합니다.
     */
    //@PostConstruct
    public void initializeMovieSummaries() {
        log.info("[PostConstruct] Initializing all comment summaries on application startup.");
        syncExistingMovieSummaries(); // 4. 전체 동기화 로직 호출
        log.info("[PostConstruct] Finished initializing comment summaries.");
    }

    /**
     * 매일 새벽 2시에 기존 MovieSummary 레코드들을 Review 테이블의 실제 데이터와 재동기화합니다.
     * 이 배치는 이미 리뷰가 하나라도 달려 MovieSummary 레코드가 생성된 영화들만 대상으로 합니다.
     */
    @Scheduled(cron = "0 0 2 * * *") // 매일 2 AM에 실행
    public void syncExistingMovieSummaries() {
        log.info("===== MovieSummary Sync Batch Started (Existing Summaries Only) =====");
        long startTime = System.currentTimeMillis();

        // 1. 현재 MovieSummary 테이블에 존재하는 모든 MovieSummary 엔티티를 가져옵니다.
        //    (id만 가져와도 되지만, 엔티티를 가져와서 바로 사용할 수 있도록 findAll 사용)
        List<MovieSummary> existingSummaries = movieSummaryRepository.findAll();

        int processedCount = 0;
        int failedCount = 0;

        log.info("Processing {} existing MovieSummaries...", existingSummaries.size());
        for (MovieSummary summary : existingSummaries) {
            try {
                // 각 영화별 요약 정보 업데이트를 별도의 트랜잭션으로 처리
                // syncSingleMovieSummary는 MovieSummary를 찾거나 생성하고 reconcile 후 저장합니다.
                // 이미 summary 객체를 가지고 있지만, 트랜잭션 분리를 위해 movieId로 다시 찾도록 합니다.
                // 아니면, summary 객체를 넘겨주는 오버로드 메서드를 만들 수도 있습니다. (여기서는 기존 로직 유지)
                syncSingleMovieSummary(summary.getMovieId());
                processedCount++;
            } catch (Exception e) {
                failedCount++;
                log.error("Failed to sync MovieSummary for movie ID: {}. Error: {}", summary.getMovieId(), e.getMessage(), e);
                // 특정 영화 처리 실패 시에도 다른 영화 처리는 계속 진행
            }
        }

        long endTime = System.currentTimeMillis();
        log.info("===== MovieSummary Sync Batch Finished =====");
        log.info("Total existing summaries processed: {}, Success: {}, Failed: {}, Duration: {} ms",
                existingSummaries.size(), processedCount, failedCount, (endTime - startTime));
    }


    /**
     * 특정 영화의 MovieSummary를 Review 테이블의 실제 데이터와 동기화합니다.
     * 이 메서드는 외부 호출 시 새로운 트랜잭션을 시작합니다.
     *
     * @param movieId 동기화할 영화의 ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void syncSingleMovieSummary(Integer movieId) {
        log.debug("Syncing MovieSummary for movie ID: {}", movieId);

        // 1. Review 테이블에서 해당 영화의 실제 리뷰 개수와 평점 합계 계산
        long actualReviewCount = reviewRepository.countTotalReviewsByMovieId(movieId);
        Long actualRatingSum = reviewRepository.sumTotalRatingsByMovieId(movieId);

        if (actualRatingSum == null) {
            actualRatingSum = 0L;
        }

        // 2. MovieSummary 엔티티를 찾거나 새로 생성 (여기서 새로 생성되는 경우는 거의 없을 것입니다.
        //    단, 수동 삭제 또는 특정 오류로 Summary 레코드가 없어진 경우를 대비한 안전 장치)
        MovieSummary movieSummary = movieSummaryRepository.findByMovieId(movieId)
                .orElseGet(() -> {
                    // MovieSummary가 없으면 새로 생성해야 하므로, Movie 엔티티를 조회
                    Movie movie = movieRepository.findById(movieId)
                            .orElseThrow(() -> new IllegalStateException("Movie not found for ID: " + movieId));
                    log.warn("MovieSummary for movie ID {} was not found, creating a new one during batch sync.", movieId);
                    return MovieSummary.builder().movie(movie).build();
                });

        // 3. 계산된 실제 값으로 MovieSummary 업데이트 (재조정)
        movieSummary.reconcile(actualReviewCount, actualRatingSum);

        // 4. 변경된 MovieSummary 저장
        movieSummaryRepository.save(movieSummary);

        log.debug("Successfully synced MovieSummary for movie ID: {}. Count: {}, Sum: {}",
                movieId, actualReviewCount, actualRatingSum);
    }
}