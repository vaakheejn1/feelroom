// package com.d208.feelroom.movie.service.scheduler;
package com.d208.feelroom.movie.scheduler;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.movie.domain.entity.summary.MovieSummary; // MovieSummary 임포트
import com.d208.feelroom.movie.domain.repository.MovieRepository;
import com.d208.feelroom.movie.domain.repository.MovieSummaryRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository; // 리뷰 레포지토리 추가
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class PopularMovieScheduler {

    private final MovieRepository movieRepository;
    private final MovieSummaryRepository movieSummaryRepository;
    private final ReviewRepository reviewRepository; // 최근 활동 조회를 위해 추가
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String POPULAR_MOVIES_ZSET_KEY = "popular_movies";
    private static final double GRAVITY = 1.5;

    @PostConstruct
    public void init() {
        StopWatch stopWatch = new StopWatch("MoviePopularityInitializer");
        stopWatch.start("Calculating popular movie scores");
        log.info("[PostConstruct] Initializing popular movie scores on application startup...");

        try {
            updatePopularMovieScores();
        } finally {
            stopWatch.stop();
            log.info("[PostConstruct] Finished initializing popular movie scores. {}", stopWatch.prettyPrint());
        }
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void updatePopularMovieScores() {
        log.info("[Scheduler] Starting popular movie score update...");

        // 1. 처리할 영화 ID들을 선별해서 가져옵니다. (10만 개 -> 수천 개)
        Set<Integer> targetMovieIds = getTargetMovieIds();
        if (targetMovieIds.isEmpty()) {
            log.info("[Scheduler] No target movies to update. Skipping.");
            return;
        }
        log.info("[Scheduler] Target movie count: {}", targetMovieIds.size());

        // 2. 선별된 영화 정보와 요약 정보를 한 번에 DB에서 가져옵니다. (N+1 방지)
        List<Movie> targetMovies = movieRepository.findAllById(targetMovieIds);
        Map<Integer, MovieSummary> summaryMap = movieSummaryRepository.findAllById(targetMovieIds).stream()
                .collect(Collectors.toMap(MovieSummary::getMovieId, Function.identity()));

        // 3. 선별된 영화들에 대해서만 점수를 계산하고 Redis에 업데이트합니다.
        targetMovies.forEach(movie -> {
            MovieSummary summary = summaryMap.get(movie.getMovieId());
            if (summary == null || summary.getReviewCount() == 0) {
                return; // 요약 정보가 없거나 리뷰가 없으면 건너뜀
            }

            double averageRating = (double) summary.getRatingSum() / summary.getReviewCount();
            double baseScore = summary.getReviewCount() * Math.pow(averageRating, 2);
            double finalScore = calculateDecayedScore(baseScore, movie.getReleaseDate());

            redisTemplate.opsForZSet().add(POPULAR_MOVIES_ZSET_KEY, movie.getMovieId(), finalScore);
        });

        // 4. ZSET을 정리하여 너무 오래된 데이터를 삭제합니다.
        trimZSet();

        log.info("[Scheduler] Finished popular movie score update for {} movies.", targetMovies.size());
    }

    /**
     * 점수를 계산할 대상 영화 ID 목록을 선별합니다.
     */
    private Set<Integer> getTargetMovieIds() {
        Set<Integer> movieIds = new HashSet<>();

        // A. 최근 180일 이내 개봉작
        LocalDate recentDate = LocalDate.now().minusDays(180);
        // MovieRepository에 findMovieIdsByReleaseDateAfter 메서드 추가 필요
        movieIds.addAll(movieRepository.findMovieIdsByReleaseDateAfter(recentDate.toString()));

        // B. 최근 7일 이내 리뷰가 작성된 영화
        // ReviewRepository에 findMovieIdsWithRecentReviews 메서드 추가 필요
        movieIds.addAll(reviewRepository.findMovieIdsWithRecentActivity(LocalDateTime.now().minusDays(7)));

        // C. 현재 인기 랭킹 상위 200위 영화
        Set<Object> topRankedMovies = redisTemplate.opsForZSet().reverseRange(POPULAR_MOVIES_ZSET_KEY, 0, 199);
        if (topRankedMovies != null) {
            topRankedMovies.forEach(id -> movieIds.add(Integer.parseInt(id.toString())));
        }

        return movieIds;
    }

    /**
     * ZSET의 크기를 관리하기 위해 오래된 (순위가 낮은) 항목들을 제거합니다.
     */
    private void trimZSet() {
        // 최대 5000개의 영화만 랭킹에 유지하고, 그보다 순위가 낮은 영화는 제거
        long maxRank = 5000;
        redisTemplate.opsForZSet().removeRange(POPULAR_MOVIES_ZSET_KEY, 0, - (maxRank + 1));
        log.info("[Scheduler] Trimmed popular_movies ZSET to max {} entries.", maxRank);
    }

    // calculateDecayedScore 메서드는 이전과 동일
    private double calculateDecayedScore(double baseScore, String releaseDateStr) {
        if (releaseDateStr == null || releaseDateStr.isBlank()) {
            return baseScore;
        }
        try {
            LocalDate releaseDate = LocalDate.parse(releaseDateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            long daysSinceRelease = ChronoUnit.DAYS.between(releaseDate, LocalDate.now());
            if (daysSinceRelease < 0) daysSinceRelease = 0;
            return baseScore / Math.pow(daysSinceRelease + 2, GRAVITY);
        } catch (DateTimeParseException e) {
            return baseScore;
        }
    }
}