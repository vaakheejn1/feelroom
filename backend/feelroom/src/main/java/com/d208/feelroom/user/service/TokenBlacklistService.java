package com.d208.feelroom.user.service;

import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

//@Slf4j(topic = "TokenBlacklistService")
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

	private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);

	private final RedisTemplate<String, Object> redisTemplate;
	private static final String BLACKLIST_PREFIX = "blacklist:";

	public void blacklistToken(String token, long expirationMillis) {
		String key = BLACKLIST_PREFIX + token;
		redisTemplate.opsForValue().set(key, "logout", expirationMillis, TimeUnit.MILLISECONDS);
	}

	public boolean isTokenBlacklisted(String token) {
		String key = BLACKLIST_PREFIX + token;

		boolean result = false;
		try {
			result = Boolean.TRUE.equals(redisTemplate.hasKey(key));
		} catch (Exception e) {
			log.error("############# Redis error in hasKey: {}", e.getMessage(), e);
		}

		return result;
	}
}
