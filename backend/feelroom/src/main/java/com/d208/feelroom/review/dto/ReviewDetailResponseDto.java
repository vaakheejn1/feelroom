package com.d208.feelroom.review.dto;

import com.d208.feelroom.movie.domain.entity.Movie;
import com.d208.feelroom.review.domain.entity.Review;
import com.d208.feelroom.user.domain.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
public class ReviewDetailResponseDto {

    // 리뷰 정보
    private final UUID reviewId;
    private final String title;
    private final String content;
    private final int rating;
    private final LocalDateTime createdAt;

    // 작성자 정보
    private final UserInfo author;

    // 영화 정보
    private final MovieInfo movie;

    // 태그 정보
    private final List<String> tags;

    // 통계 정보
    private final long likeCount;
    private final long commentCount;

    private final boolean isLiked;

    // == 생성자: Entity -> DTO 변환 로직 ==
    public ReviewDetailResponseDto(Review review, int totalLikes, int totalComments, boolean isLiked)  {
        this.reviewId = review.getReviewId();
        this.title = review.getTitle();
        this.content = review.getContent();
        this.rating = review.getRating();
        this.createdAt = review.getCreatedAt();

        this.author = new UserInfo(review.getUser());
        this.movie = new MovieInfo(review.getMovie());

        this.tags = review.getReviewTags().stream()
                .map(reviewTag -> reviewTag.getTag().getName())
                .collect(Collectors.toList());

        this.likeCount = totalLikes;
        this.commentCount = totalComments;
        this.isLiked = isLiked;
    }

    // -- 내부 DTO들 --
    @Getter
    private static class UserInfo {
        private final Long userId;
        private final String nickname;
        private final String profileImageUrl;

        public UserInfo(User user) {
            this.userId = user.getUserId();
            this.nickname = user.getNickname();
            this.profileImageUrl = user.getProfileImageUrl();
        }
    }

    @Getter
    private static class MovieInfo {
        private final Integer movieId;
        private final String title;
        private final String posterUrl;

        public MovieInfo(Movie movie) {
            this.movieId = movie.getMovieId();
            this.title = movie.getTitle();
            this.posterUrl = movie.getPosterUrl();
        }
    }
}