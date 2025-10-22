package com.d208.feelroom.notification.domain.repository;

import com.d208.feelroom.notification.domain.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * [API 1] 특정 사용자에게 안 읽은 알림이 하나 이상 존재하는지 확인합니다.
     */
    boolean existsByReceiver_UserIdAndIsRead(Long receiverId, char isRead);

    /**
     * [API 2] 특정 사용자의 전체 알림 목록을 조회합니다.
     * sender의 닉네임을 가져오기 위해 LEFT JOIN을 사용합니다.
     */
    @Query(value = """
        SELECT n.notification_id, n.type, n.is_read, n.created_at,
               n.target_review_id, n.target_comment_id, n.target_badge_id,
               n.sender_id, u.nickname as sender_nickname
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.user_id
        WHERE n.receiver_id = :receiverId
        ORDER BY n.created_at DESC
        """, nativeQuery = true)
    Slice<Object[]> findNotificationsByReceiverId(@Param("receiverId") Long receiverId, Pageable pageable);

    /**
     * [API 3] 특정 사용자의 특정 알림들을 '읽음' 상태로 일괄 변경합니다.
     * 엔티티를 조회하지 않고 바로 UPDATE 쿼리를 실행하여 효율적입니다.
     */
    @Modifying
    @Query(
            value = "UPDATE notifications n SET n.is_read = 'Y' WHERE n.receiver_id = :userId AND n.notification_id IN :notificationIds",
            nativeQuery = true // Native Query로 실행하도록 설정
    )
    void markAsReadByIds(@Param("userId") Long userId, @Param("notificationIds") List<Long> notificationIds);
}