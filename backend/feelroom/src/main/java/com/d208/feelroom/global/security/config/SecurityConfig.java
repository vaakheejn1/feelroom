package com.d208.feelroom.global.security.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.d208.feelroom.global.security.filter.JwtAuthenticationFilter;
import com.d208.feelroom.global.security.service.UserDetailsServiceImpl;
import com.d208.feelroom.global.security.util.JwtUtil;
import com.d208.feelroom.user.service.TokenBlacklistService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtUtil jwtUtil;
	private final UserDetailsServiceImpl userDetailsService;
	private final TokenBlacklistService tokenBlacklistService;
	private final PasswordEncoder passwordEncoder;

	// Swagger UI 접근을 위한 경로 목록
	private static final String[] SWAGGER_URL_ARRAY = { "/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**",
			"/webjars/**", "/actuator/**" };

	// 필터를 Bean으로 등록하면 다른 곳에서도 주입받아 사용할 수 있습니다.
	@Bean
	public JwtAuthenticationFilter jwtAuthenticationFilter() {
		return new JwtAuthenticationFilter(jwtUtil, userDetailsService, tokenBlacklistService);
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		// 1. CSRF, 세션 관리 설정 (람다 스타일로 변경하여 더 간결하게)
		http.csrf(AbstractHttpConfigurer::disable);
		http.sessionManagement(configurer -> configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		// 2. 경로별 인가(Authorization) 설정 (동일)
		http.authorizeHttpRequests(authz -> authz.requestMatchers(SWAGGER_URL_ARRAY).permitAll()
				.requestMatchers("/api/v1/auth/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/v1/movies/**").permitAll()
				.requestMatchers("/api/v1/batch/recommend/movies/run").permitAll() // temp
				// 회원가입 시 아이디 및 이메일 사용 가능 여부를 확인하기 위해 추가
				.requestMatchers("/api/v1/users/check-login-id").permitAll()
				.requestMatchers("/api/v1/users/check-email").permitAll()
				.anyRequest().authenticated());

		// 3. [핵심 수정] 예외 처리 핸들러 직접 설정
		http.exceptionHandling(exceptionHandling -> exceptionHandling
				// (인가 실패) 권한이 없는 사용자가 접근했을 때의 처리
				.accessDeniedHandler((request, response, accessDeniedException) -> response
						.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied"))

				// (인증 실패) 인증되지 않은 사용자가 접근했을 때의 처리 (로그인 실패 포함)
				.authenticationEntryPoint((request, response, authException) -> response
						.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")));

		// 4. 커스텀 필터 등록 (동일)
		http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		// 구체적인 포트로 수정
		configuration.setAllowedOrigins(List.of("http://localhost:3000", // 프론트엔드 포트 (정적 배포)
				"http://localhost:8081", // 백엔드 포트 (개발용)
				"https://i13d208.p.ssafy.io", // 실제 HTTPS 도메인
				"http://i13d208.p.ssafy.io" // HTTP 도메인 (리다이렉트용)
		));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setMaxAge(3600L);
		configuration.setExposedHeaders(List.of("Authorization", "SET_COOKIE"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}
