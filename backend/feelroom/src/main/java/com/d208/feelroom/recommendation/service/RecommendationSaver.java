package com.d208.feelroom.recommendation.service;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.d208.feelroom.recommendation.dto.MovieRecommendationResultDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "RecommendationSaver")
@Service
public class RecommendationSaver {

	private final JdbcTemplate jdbcTemplate;
	private final ObjectMapper objectMapper;

	public RecommendationSaver(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
		this.jdbcTemplate = jdbcTemplate;
		this.objectMapper = objectMapper;
	}

	// 이 코드는 다음과 같은 역할을 합니다:
	// 동일한 user_id가 존재하지 않으면 새 레코드를 삽입합니다.
	// 동일한 user_id가 이미 존재하면 해당 레코드를 업데이트합니다.
	// updated_at 타임스탬프도 함께 갱신됩니다.
	// 추천 결과를 user_movie_recommendations 테이블에 저장 (있으면 갱신)
	public void saveMovieRecommendations(List<MovieRecommendationResultDto> results) {
		for (MovieRecommendationResultDto result : results) {
			try {
				String json = objectMapper.writeValueAsString(result.getRecommendedMovieIds());

				jdbcTemplate.update("""
						    INSERT INTO user_movie_recommendations (user_id, recommended_movie_ids, updated_at)
						    VALUES (?, ?, NOW())
						    ON DUPLICATE KEY UPDATE recommended_movie_ids = VALUES(recommended_movie_ids)
						""", result.getUserId(), json);

			} catch (JsonProcessingException e) {
				log.error("추천 영화 ID 직렬화 실패", e);
			}
		}
	}
}
