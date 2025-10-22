package com.d208.feelroom.user.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "local_accounts")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA는 기본 생성자를 필요로 합니다.
@AllArgsConstructor
@Builder
public class LocalAccount {

	@Id
	@Column(name = "user_id")
	private Long userId;

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId // User의 PK를 LocalAccount의 PK이자 FK로 사용하도록 매핑
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	// 서비스 로직에서 User와 password를 받아 LocalAccount를 생성하기 위한 생성자
	// @Builder
	public LocalAccount(User user, String passwordHash) {
		this.user = user;
		this.passwordHash = passwordHash;
	}
}