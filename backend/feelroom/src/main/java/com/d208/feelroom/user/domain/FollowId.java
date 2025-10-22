package com.d208.feelroom.user.domain;

import java.io.Serializable;
import java.util.Objects;

// composite key

public class FollowId implements Serializable {
	private Long follower;
	private Long followee;

	// equals(), hashCode(), default constructor
	public FollowId() {
	} // Default constructor

	public FollowId(Long follower, Long followee) {
		this.follower = follower;
		this.followee = followee;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (!(o instanceof FollowId))
			return false;
		FollowId that = (FollowId) o;
		return Objects.equals(follower, that.follower) && Objects.equals(followee, that.followee);
	}

	@Override
	public int hashCode() {
		return Objects.hash(follower, followee);
	}
}