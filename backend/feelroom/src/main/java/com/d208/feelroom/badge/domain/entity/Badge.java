package com.d208.feelroom.badge.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 획득할 수 있는 뱃지의 종류와 정보를 정의하는 엔티티입니다.
 * 이 테이블의 데이터는 주로 운영자가 직접 관리(CRUD)합니다.
 */
@Entity
@Table(name = "badges")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA는 기본 생성자를 필요로 합니다. protected로 안전하게 설정합니다.
public class Badge {

    /**
     * 뱃지 고유 ID (PK)
     * - AUTO_INCREMENT 전략을 사용합니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "badge_id")
    private Integer badgeId;

    /**
     * 뱃지 이름
     * - 예: "첫 번째 감상평", "성실한 기록가"
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * 뱃지에 대한 설명
     * - 예: "첫 영화 리뷰를 작성하셨군요! 당신의 소중한 감상을 공유해주셔서 감사합니다."
     */
    @Column(name = "description", length = 255)
    private String description;

    /**
     * 뱃지 획득 조건 코드 (비즈니스 로직의 핵심)
     * - 이 코드를 기반으로 이벤트 리스너에서 어떤 뱃지를 부여할지 결정합니다.
     * - 예: "REVIEW_WRITE_COUNT_1", "USER_FOLLOWING_COUNT_1"
     * - 애플리케이션 내에서 고유해야 하므로 unique = true 제약조건을 추가하는 것이 좋습니다.
     */
    @Column(name = "condition_code", nullable = false, length = 50, unique = true)
    private String conditionCode;

    /**
     * 뱃지 아이콘 이미지의 URL
     * - 프론트엔드에서 이 URL을 사용하여 뱃지 아이콘을 표시합니다.
     */
    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    /**
     * 빌더 패턴을 사용한 생성자
     * - 초기 데이터 삽입이나 테스트 코드 작성 시 가독성 좋게 객체를 생성할 수 있습니다.
     */
    @Builder
    public Badge(Integer badgeId, String name, String description, String conditionCode, String iconUrl) {
        this.badgeId = badgeId;
        this.name = name;
        this.description = description;
        this.conditionCode = conditionCode;
        this.iconUrl = iconUrl;
    }
}