package com.d208.feelroom.global.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class TmdbApiClientConfig {

	@Value("${tmdb.api.key}")
	private String tmdbApiKey;

	@Value("${tmdb.api.base-url}")
	private String tmdbApiBaseUrl;

	@Value("${tmdb.image.base-url}")
	private String tmdbImageBaseUrl;

	@Value("${tmdb.api.call-delay-ms:100}") // application.yml에 없는 경우 기본값 100ms
	private long tmdbCallDelayMs;

	@Bean
	public RestTemplate restTemplate(ObjectMapper objectMapper) {
		// RestTemplate 인스턴스 생성 (HTTP 통신을 위한 클라이언트)
		RestTemplate restTemplate = new RestTemplate();

		// 주입받은 ObjectMapper를 사용하는 Jackson 메시지 변환기 생성
		MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter(objectMapper);

		// 기존 메시지 변환기들을 제거하고, 커스텀 ObjectMapper를 사용하는 변환기로 대체
		restTemplate.setMessageConverters(List.of(jsonConverter));
		
		// 구성된 RestTemplate 반환
		return restTemplate;
	}

	public String getTmdbApiKey() {
		return tmdbApiKey;
	}

	public String getTmdbApiBaseUrl() {
		return tmdbApiBaseUrl;
	}

	public String getTmdbImageBaseUrl() {
		return tmdbImageBaseUrl;
	}

	public long getTmdbCallDelayMs() {
		return tmdbCallDelayMs;
	}
}
