package com.d208.feelroom.badge.service;

import com.d208.feelroom.badge.domain.entity.Badge;
import com.d208.feelroom.badge.domain.entity.UserBadge;
import com.d208.feelroom.badge.domain.repository.BadgeRepository;
import com.d208.feelroom.badge.domain.repository.UserBadgeRepository;
import com.d208.feelroom.comment.domain.repository.CommentRepository;
import com.d208.feelroom.movie.domain.repository.MovieLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewLikeRepository;
import com.d208.feelroom.review.domain.repository.ReviewRepository;
import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.FollowRepository;
import com.d208.feelroom.user.domain.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeBatchService {

    // BadgeService와 거의 동일한 의존성을 가집니다.
    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ReviewRepository reviewRepository;
    private final CommentRepository commentRepository;
    private final MovieLikeRepository movieLikeRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final FollowRepository followRepository;

    /**
     * 모든 사용자에 대해 획득 가능한 모든 뱃지를 재검사하고 소급 적용합니다.
     * (주의: 사용자 수가 매우 많을 경우 부하가 클 수 있으므로, 서버 트래픽이 적은 시간에 실행해야 합니다.)
     */
    @Transactional
    public void recheckAndAwardAllBadgesForAllUsers() {
        log.info("[BATCH] 전체 사용자 뱃지 소급 적용 시작");

        // 1. 모든 사용자를 조회합니다. (페이징 처리를 하면 더 안정적입니다)
        List<User> allUsers = userRepository.findAll();
        List<Badge> allBadges = badgeRepository.findAll();

        int awardedCount = 0;

        for (User user : allUsers) {
            // 2. 각 사용자가 현재 보유한 뱃지 ID 목록을 미리 조회 (성능 최적화)
            Set<Integer> userOwnedBadgeIds = userBadgeRepository.findBadgeIdsByUserId(user.getUserId());

            for (Badge badge : allBadges) {
                // 3. 이미 보유한 뱃지는 건너뛰기
                if (userOwnedBadgeIds.contains(badge.getBadgeId())) {
                    continue;
                }

                // 4. 뱃지 획득 조건 확인
                boolean achieved = checkBadgeCondition(user, badge);

                // 5. 조건 만족 시 뱃지 수여
                if (achieved) {
                    awardBadge(user, badge);
                    awardedCount++;
                }
            }
        }
        log.info("[BATCH] 전체 사용자 뱃지 소급 적용 완료. 새로 수여된 뱃지 수: {}", awardedCount);
    }

    /**
     * 뱃지 획득 조건을 확인하는 헬퍼 메서드
     */
    private boolean checkBadgeCondition(User user, Badge badge) {
        Long userId = user.getUserId();
        return switch (badge.getConditionCode()) {
            // 회원가입 뱃지는通常최초 생성 시점에만 부여되므로 배치에서는 true로 처리하거나,
            // 사용자의 생성 시간을 기준으로 조건을 둘 수 있습니다. 여기서는 가입자는 무조건 있는 것으로 간주.
            case "USER_SIGNUP" -> true;

            // 카운트 기반 뱃지들
            case "REVIEW_WRITE_COUNT_1" -> reviewRepository.countByUser_UserId(userId) >= 1;
            case "REVIEW_WRITE_COUNT_10" -> reviewRepository.countByUser_UserId(userId) >= 10;
            case "COMMENT_WRITE_COUNT_1" -> commentRepository.countByUser_UserId(userId) >= 1;
            case "MOVIE_LIKE_COUNT_20" -> movieLikeRepository.countByUser_UserId(userId) >= 20;
            case "REVIEW_LIKE_RECEIVED_COUNT_10" -> reviewLikeRepository.countLikesReceivedOnUserReviews(userId) >= 10;
            case "USER_FOLLOWING_COUNT_1" -> followRepository.countByFollower_UserId(userId) >= 1;
            case "USER_FOLLOWER_COUNT_1" -> followRepository.countByFollowee_UserId(userId) >= 1;

            default -> false;
        };
    }

    /**
     * 사용자에게 뱃지를 수여하는 헬퍼 메서드
     */
    private void awardBadge(User user, Badge badge) {
        UserBadge userBadge = new UserBadge(user, badge);
        userBadgeRepository.save(userBadge);
        log.info("[BATCH] 사용자 '{}'에게 '{}' 뱃지 소급 적용 완료.", user.getUsername(), badge.getName());
        // 배치 작업에서는 알림(이벤트 발행)을 보낼지 여부를 정책적으로 결정해야 합니다.
        // 대량 알림이 발생할 수 있으므로, 보통은 보내지 않습니다.
    }

    //@PostConstruct
    public void initBadgeSystem() {
        log.info("===== @PostConstruct: 뱃지 시스템 초기화 및 소급 적용 시작 =====");
        // 트랜잭션을 적용하기 위해 자기 자신의 public 메서드를 호출합니다.
        recheckAndAwardAllBadgesForAllUsers();
        log.info("===== @PostConstruct: 뱃지 시스템 초기화 완료 =====");
    }
}