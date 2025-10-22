package com.d208.feelroom.user.domain.entity;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.hibernate.annotations.SQLRestriction;

import com.d208.feelroom.user.domain.UserRole;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
// @EntityListeners(AuditingEntityListener.class)
@EntityListeners(User.AuditListener.class)
@SQLRestriction("deleted_at IS NULL")
public class User {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(length = 50)
    private String nickname;

    @Column(length = 255)
    private String description;

    @ManyToOne
    @JoinColumn(name = "gender_id", foreignKey = @ForeignKey(name = "fk_user_gender"))
    private Gender gender;

    @Column(name = "birth_date", length = 10)
    private String birthDate;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "profile_image_updated_at")
    private LocalDateTime profileImageUpdatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private UserRole userRole;

    @ManyToOne
    @JoinColumn(name = "signup_type_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_signup_type"))
    private SignupType signupType;

    @Column(name = "created_at", nullable = false, length = 30)
    private String createdAt; // "yyyy-MM-dd HH:mm:ss"

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_at", nullable = false, length = 30)
    private String updatedAt; // "yyyy-MM-dd HH:mm:ss"

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // User와 LocalAccount는 1:1 관계
    // mappedBy: 연관관계의 주인이 LocalAccount의 'user' 필드임을 명시
    // cascade: User가 저장/삭제될 때 LocalAccount도 함께 처리
    // orphanRemoval: User와의 관계가 끊어진 LocalAccount는 자동으로 삭제
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private LocalAccount localAccount;

    public void setLocalAccount(LocalAccount localAccount) {
        this.localAccount = localAccount;
    }

    // created_at, updated_at 값을 stringify 시키는 로직 (Entity lifecycle callbacks)
    public static class AuditListener {
        @PrePersist
        public void setCreatedAt(User user) {
            String now = LocalDateTime.now().format(formatter);
            user.createdAt = now;
            user.updatedAt = now;
        }

        @PreUpdate
        public void setUpdatedAt(User user) {
            user.updatedAt = LocalDateTime.now().format(formatter);
        }
    }

    public void updateProfileImageUrl(String newProfileImageUrl) {
        this.profileImageUrl = newProfileImageUrl;
        this.profileImageUpdatedAt = LocalDateTime.now(); // 현재 시간으로 업데이트
    }
}