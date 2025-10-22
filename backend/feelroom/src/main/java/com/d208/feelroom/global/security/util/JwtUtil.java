package com.d208.feelroom.global.security.util;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.d208.feelroom.user.domain.UserRole; // UserRole Enum 경로

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "JwtUtil")
@Component
public class JwtUtil {
	// 헤더 값, 접두사 등 상수 정의
	public static final String AUTHORIZATION_HEADER = "Authorization";
	public static final String AUTHORIZATION_KEY = "auth"; // 사용자 권한 Claim Key
	public static final String BEARER_PREFIX = "Bearer ";

	// application.yml에서 설정값 주입
	@Value("${jwt.secret.key}")
	private String secretKey;
	@Value("${jwt.token.access-expiration-time}")
	private long accessTokenExpirationTime;

	private Key key;
	private final SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

	@PostConstruct
	public void init() {
		byte[] bytes = Base64.getDecoder().decode(secretKey);
		key = Keys.hmacShaKeyFor(bytes);
	}

	/**
	 * Access Token 생성
	 * 
	 * @param username 사용자 이름 (토큰의 주체)
	 * @param role     사용자 권한
	 * @return 생성된 JWT 문자열 (Bearer 접두어 포함)
	 */
	public String createAccessToken(String username, UserRole role) {
		Date now = new Date();
		return BEARER_PREFIX + Jwts.builder().setSubject(username) // Subject에 username 저장
				.claim(AUTHORIZATION_KEY, role.name()) // Claim에 권한 정보 저장
				.setExpiration(new Date(now.getTime() + accessTokenExpirationTime)).setIssuedAt(now)
				.signWith(key, signatureAlgorithm).compact();
	}

	/**
	 * HttpServletRequest의 헤더에서 JWT 토큰을 추출합니다.
	 * 
	 * @param request HttpServletRequest 객체
	 * @return 추출된 토큰 문자열 (Bearer 접두어 제거됨), 없으면 null
	 */
	public String getJwtFromHeader(HttpServletRequest request) {
		String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
			return bearerToken.substring(7);
		}
		return null;
	}

	/**
	 * 토큰의 유효성을 검증합니다.
	 * 
	 * @param token 검증할 JWT 토큰
	 * @return 유효하면 true, 아니면 false
	 */
	public boolean validateToken(String token) {
		try {
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
			return true;
		} catch (SecurityException | MalformedJwtException | SignatureException e) {
			log.error("Invalid JWT signature, 유효하지 않은 JWT 서명입니다.");
		} catch (ExpiredJwtException e) {
			log.error("Expired JWT token, 만료된 JWT 토큰입니다.");
		} catch (UnsupportedJwtException e) {
			log.error("Unsupported JWT token, 지원되지 않는 JWT 토큰입니다.");
		} catch (IllegalArgumentException e) {
			log.error("JWT claims is empty, 잘못된 JWT 토큰입니다.");
		}
		return false;
	}

	/**
	 * 토큰에서 사용자 정보(Claims)를 추출합니다.
	 * 
	 * @param token Claims를 추출할 JWT 토큰
	 * @return 토큰에 담긴 Claims 정보
	 */
	public Claims getUserInfoFromToken(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
	}

	/**
	 * 
	 * @param
	 * @return
	 */
	public Date getExpiration(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getExpiration();
	}

}