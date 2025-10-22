package com.d208.feelroom.user.domain.entity;

import java.time.LocalDateTime;

import com.d208.feelroom.user.domain.FollowId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "follows")
@Getter
@Setter
@IdClass(FollowId.class)
@NoArgsConstructor
public class Follow {

	@Id
	@ManyToOne
	@JoinColumn(name = "follower_id", nullable = false)
	private User follower;

	@Id
	@ManyToOne
	@JoinColumn(name = "followee_id", nullable = false)
	private User followee;

	@Column(name = "followed_at", nullable = false, updatable = false, insertable = false)
	private LocalDateTime followedAt;
//	private LocalDateTime followedAt = LocalDateTime.now();

	// Getters, setters, constructors...
	// Optional constructor for convenience
	public Follow(User follower, User followee) {
		this.follower = follower;
		this.followee = followee;
	}
}
