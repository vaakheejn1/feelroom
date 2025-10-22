package com.d208.feelroom.global.security.filter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

import com.d208.feelroom.global.security.service.UserDetailsServiceImpl;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.d208.feelroom.user.service.TokenBlacklistService;
import com.d208.feelroom.global.security.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "JWT 검증 및 인가")
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;
	private final UserDetailsServiceImpl userDetailsService;
	private final TokenBlacklistService tokenBlacklistService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String tokenValue = jwtUtil.getJwtFromHeader(request);

		if (tokenValue != null) {
			boolean isBlacklistedToken = tokenBlacklistService.isTokenBlacklisted(tokenValue);
			boolean isValidToken = jwtUtil.validateToken(tokenValue);

			if (isBlacklistedToken) {
				response.setContentType("application/json");
				response.setCharacterEncoding("UTF-8");
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

				Map<String, Object> errorResponse = Map.of("status", HttpServletResponse.SC_UNAUTHORIZED, "message",
						"해당 토큰은 블랙리스트에 등록되어 있습니다.", "timestamp", LocalDateTime.now().toString());

				ObjectMapper objectMapper = new ObjectMapper();
				response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
				// response.getWriter().write("해당 토큰은 블랙리스트에 등록되어 있습니다.");

				return; // Stop filter chain, block request
			}
			if (isValidToken) {
				Claims info = jwtUtil.getUserInfoFromToken(tokenValue);
				try {
					setAuthentication(info.getSubject()); // subject에 username 저장
				} catch (Exception e) {
					log.error("Authentication Error: {}", e.getMessage());
					// 여기서 response에 에러를 직접 작성할 수도 있습니다.
				}
			}
		}

		filterChain.doFilter(request, response);
	}

	// 인증 처리 메서드
	private void setAuthentication(String username) {
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		UserDetails userDetails = userDetailsService.loadUserByUsername(username);
		Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
				userDetails.getAuthorities());
		context.setAuthentication(authentication);
		SecurityContextHolder.setContext(context);
	}
}