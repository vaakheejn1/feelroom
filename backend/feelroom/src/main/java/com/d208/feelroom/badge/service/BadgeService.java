package com.d208.feelroom.badge.service;

import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.badge.domain.entity.UserBadge;
import com.d208.feelroom.badge.domain.repository.BadgeRepository;
import com.d208.feelroom.comment.domain.repository.CommentRepository;
import com.d208.feelroom.movie.domain.repository.MovieLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.FollowRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.badge.dto.UserBadgeResponseDto;
import com.d208.feelroom.badge.domain.repository.UserBadgeRepository;
import com.d208.feelroom.badge.event.EventPublisher;
import com.d208.feelroom.user.event.FollowEvent;
import com.d208.feelroom.user.event.UserActivityEvent;
import com.d208.feelroom.user.event.UserActivityEvent.ActivityType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true) // 조회 기능이므로 readOnly=true로 성능 최적화
public class BadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;
    private final EventPublisher eventPublisher;

    private final ReviewRepository reviewRepository;
    private final FollowRepository followRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final MovieLikeRepository movieLikeRepository;
    private final CommentRepository commentRepository;

    public List<UserBadgeResponseDto> findMyBadges(Long userId) {
        return userBadgeRepository.findByUserIdWithBadge(userId)
                .stream()
                .map(UserBadgeResponseDto::from)
                .toList();
    }

    public List<UserBadgeResponseDto> findUserBadges(Long targetUserId) {
        return userBadgeRepository.findByUserIdWithBadge(targetUserId)
                .stream()
                .map(UserBadgeResponseDto::from)
                .toList();
    }
    /**
     * 사용자 활동 이벤트를 수신하여 관련 뱃지 획득 조건을 확인합니다.
     */
    @TransactionalEventListener // 트랜잭션 커밋 후에 실행되도록 설정
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleUserActivity(UserActivityEvent event) {
        log.info("Handling user activity event: userId={}, type={}", event.getUserId(), event.getType());

        // 활동 타입에 따라 체크해야 할 뱃지 조건 코드를 매핑
        Map<ActivityType, List<String>> conditionMap = Map.of(
                ActivityType.USER_SIGNUP, List.of("USER_SIGNUP"),
                ActivityType.REVIEW_WRITE, List.of("REVIEW_WRITE_COUNT_1", "REVIEW_WRITE_COUNT_10"),
                ActivityType.COMMENT_WRITE, List.of("COMMENT_WRITE_COUNT_1"),
                ActivityType.MOVIE_LIKE, List.of("MOVIE_LIKE_COUNT_20"),
                ActivityType.REVIEW_LIKE_RECEIVED, List.of("REVIEW_LIKE_RECEIVED_COUNT_10")
        );

        // 현재 이벤트 타입에 해당하는 뱃지 조건들을 가져옴
        List<String> conditionsToCheck = conditionMap.get(event.getType());
        if (conditionsToCheck == null) {
            return; // 확인할 뱃지가 없으면 종료
        }

        // 각 뱃지 조건에 대해 자격 검증 및 수여 로직 실행
        checkAndAwardBadges(event.getUserId(), conditionsToCheck);
    }

    /**
     * 사용자 팔로우/팔로잉 이벤트를 수신하여 관련 뱃지 획득 조건을 확인합니다.
     */
    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleFollowForBadges(FollowEvent event) {
        // 1. 'follower'를 기준으로 "첫 팔로우" 뱃지 조건 확인 및 수여
        checkAndAwardFirstFollowingBadge(event.follower());

        // 2. 'followee'를 기준으로 "첫 번째 팔로워" 뱃지 조건 확인 및 수여
        checkAndAwardFirstFollowerBadge(event.followee());
    }

    private void checkAndAwardBadges(Long userId, List<String> conditionCodes) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        for (String code : conditionCodes) {
            // condition_code로 Badge 엔티티 조회
            badgeRepository.findByConditionCode(code).ifPresent(badge -> {
                // 이미 뱃지를 가지고 있는지 확인
                if (userBadgeRepository.existsByUser_UserIdAndBadge_BadgeId(userId, badge.getBadgeId())) {
                    return; // 이미 있으면 건너뛰기
                }

                // 뱃지 획득 조건을 만족하는지 확인
                boolean achieved = switch (code) {
                    case "USER_SIGNUP" -> true; // 회원가입 이벤트 자체가 조건 만족
                    case "REVIEW_WRITE_COUNT_1" -> reviewRepository.countByUser_UserId(userId) >= 1;
                    case "REVIEW_WRITE_COUNT_10" -> reviewRepository.countByUser_UserId(userId) >= 10;
                    case "COMMENT_WRITE_COUNT_1" -> commentRepository.countByUser_UserId(userId) >= 1;
                    case "MOVIE_LIKE_COUNT_20" -> movieLikeRepository.countByUser_UserId(userId) >= 20;
                    case "REVIEW_LIKE_RECEIVED_COUNT_10" -> reviewLikeRepository.countLikesReceivedOnUserReviews(userId) >= 10;
                    default -> false;
                };

                // 조건을 만족했다면 뱃지 수여
                if (achieved) {
                    awardBadgeToUser(user, badge);
                }
            });
        }
    }

    private void awardBadgeToUser(User user, Badge badge) {
        try {
            // UserBadge 엔티티 생성 및 저장
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge);

            // 뱃지 획득 이벤트 발행 -> 알림 시스템으로 연결
            eventPublisher.publishBadgeAchieved(user, badge);

            log.info("Awarded badge '{}' to user '{}'", badge.getName(), user.getNickname());

        } catch (DataIntegrityViolationException e) {
            // DB의 Primary Key (또는 Unique) 제약 조건 덕분에 중복 INSERT가 실패한 경우.
            // 경쟁 상태(Race Condition)에서 발생할 수 있는 정상적인 상황이므로,
            // 에러 로그 대신 경고(WARN) 로그만 남기고 예외를 무시한다.
            log.warn("배지 '{}'를 사용자 '{}'에게 수여하는 중 경쟁 조건이 감지되었습니다." +
                            "배지는 다른 스레드에 의해 이미 수여되었을 가능성이 있습니다. 예외 처리 로직입니다.",
                    badge.getName(), user.getNickname());
        }
    }

    private void checkAndAwardFirstFollowingBadge(User user) {
        String conditionCode = "USER_FOLLOWING_COUNT_1";
        // 1. 해당 뱃지 정보 가져오기
        badgeRepository.findByConditionCode(conditionCode).ifPresent(badge -> {
            // 2. 이미 이 뱃지를 가지고 있다면 return
            if (userBadgeRepository.existsByUser_UserIdAndBadge_BadgeId(user.getUserId(), badge.getBadgeId())) {
                return;
            }

            // 3. 내가 팔로우하는 사람 수 확인
            if (followRepository.countByFollower_UserId(user.getUserId()) >= 1) {
                awardBadgeToUser(user, badge);
            }
        });
    }

    private void checkAndAwardFirstFollowerBadge(User user) {
        String conditionCode = "USER_FOLLOWER_COUNT_1";
        // 1. 해당 뱃지 정보를 먼저 가져오기
        badgeRepository.findByConditionCode(conditionCode).ifPresent(badge -> {
            // 2. 이 뱃지를 가지고 있는지 확인
            if (userBadgeRepository.existsByUser_UserIdAndBadge_BadgeId(user.getUserId(), badge.getBadgeId())) {
                return;
            }

            // 3. 나를 팔로우하는 사람 수 1인지 확인
            if (followRepository.countByFollowee_UserId(user.getUserId()) >= 1) {
                awardBadgeToUser(user, badge);
            }
        });
    }
}