package com.d208.feelroom.review.service;

import com.d208.feelroom.review.dto.ReviewTagRecommendRequestDto;
import com.d208.feelroom.review.dto.ReviewTagRecommendResponseDto;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ReviewTagService {
    public ReviewTagRecommendResponseDto recommendTagsFromContent(ReviewTagRecommendRequestDto requestDto) {
        // 나중에 실제 로직에서 사용할 데이터들입니다.
        // 지금은 사용하지 않지만, 정상적으로 받아지는지 확인용으로 로그를 찍어볼 수 있습니다.
        Integer movieId = requestDto.getMovieId();
        Integer rating = requestDto.getRating();
        String content = requestDto.getReviewContent();

        System.out.printf("Tag recommendation request received: movieId=%d, rating=%d, content='%s'\n",
                movieId, rating, content);

        // TODO: [실제 로직 구현]
        // 1. movieId로 영화 정보(장르, 키워드 등)를 DB에서 조회 (RAG)
        // 2. 조회된 영화 정보, rating, content를 조합하여 LLM에 전달할 프롬프트 생성
        // 3. LLM API 호출 및 결과 파싱

        // 현재는 하드코딩된 임시 데이터를 반환합니다.
        List<String> hardcodedTags = Arrays.asList(
                "감동적인",
                "가족",
                "드라마",
                "연기력 폭발",
                "따뜻한",
                "인생영화",
                "여운이 남는"
        );

        return ReviewTagRecommendResponseDto.builder()
                .tags(hardcodedTags)
                .build();
    }
}
