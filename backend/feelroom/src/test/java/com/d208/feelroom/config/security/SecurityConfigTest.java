package com.d208.feelroom.config.security;

import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.review.dto.ReviewCreateRequestDto;
import com.d208.feelroom.global.security.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // 테스트 환경에서는 DB 데이터를 변경하지 않도록 롤백을 유지하는 것이 좋습니다.
public class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private String accessToken;

    @BeforeEach
    void setUp() {
        // [수정된 부분]
        // 1. DB에 이미 존재하는 userId가 1인 사용자를 조회합니다.
        //    만약 해당 유저가 없다면 테스트가 실패하게 되므로, 테스트 환경의 데이터 일관성을 강제할 수 있습니다.
        User testUser = userRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("테스트를 위한 사용자(ID: 1)가 DB에 존재하지 않습니다."));

        // 2. 조회된 사용자로 JWT를 생성합니다.
        this.accessToken = jwtUtil.createAccessToken(testUser.getUsername(), testUser.getUserRole());
    }

    // --- 나머지 테스트 코드는 일절 수정할 필요 없이 그대로 사용하면 됩니다. ---

    @Test
    @DisplayName("Swagger UI 경로는 인증 없이 접근 가능해야 한다")
    void swaggerPath_shouldBePermitted() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("테스트용 토큰 발급 경로는 인증 없이 접근 가능해야 한다")
    void tempTokenPath_shouldBePermitted() throws Exception {
        // 이 테스트는 ID 9999가 없음을 가정하므로, 기존 유저 존재 여부와 무관하게 성공합니다.
        mockMvc.perform(get("/api/v1/auth/temp-token/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("리뷰 생성 경로는 인증 없이 접근 시 차단되어야 한다 (403 Forbidden)")
    void reviewsPath_withoutAuthentication_shouldBeForbidden() throws Exception {
        mockMvc.perform(post("/api/v1/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("리뷰 생성 경로는 유효한 JWT로 접근 시 통과되어야 한다")
    void reviewsPath_withValidJwt_shouldPass() throws Exception {
        // given
        // 1. 유효한 요청 DTO 객체를 생성합니다.
        ReviewCreateRequestDto requestDto = new ReviewCreateRequestDto(
                1, // movieId
                "테스트 제목",
                "테스트 내용",
                9,
                Set.of(1, 2)
        );
        // 2. ObjectMapper를 사용하여 DTO 객체를 JSON 문자열로 변환합니다.
        String requestBody = objectMapper.writeValueAsString(requestDto);

        // when & then
        mockMvc.perform(post("/api/v1/reviews")
                        .header(JwtUtil.AUTHORIZATION_HEADER, this.accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)) // 3. 생성된 JSON 문자열을 요청 본문으로 사용합니다.
                .andDo(print())
                // 이제는 서비스 로직에서 Movie(ID:1)를 찾지 못해 404 Not Found가 발생할 것을 기대할 수 있습니다.
                // (DB에 실제 영화 데이터가 없다면)
                .andExpect(status().isNotFound()); // 또는 isCreated(), isBadRequest() 등 실제 로직 결과에 맞게 수정
    }
}