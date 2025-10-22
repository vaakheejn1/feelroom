package com.d208.feelroom.user.controller;

import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.user.exception.UserNotFoundException;
import com.d208.feelroom.global.security.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "1.1 Authentication (Test)", description = "테스트용 임시 인증 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class TempAuthController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Operation(
            summary = "테스트용 임시 JWT 발급",
            description = "사용자 ID를 기반으로 테스트용 JWT를 발급합니다. 로그인/회원가입 기능 구현 전까지 사용합니다."
    )
    @ApiResponse(responseCode = "200", description = "JWT 발급 성공 (토큰은 Bearer 접두어를 포함합니다)")
    @ApiResponse(responseCode = "404", description = "해당 ID의 사용자를 찾을 수 없음")
    @GetMapping("/temp-token/{userId}")
    public ResponseEntity<String> issueTempToken(
            @Parameter(description = "토큰을 발급받을 사용자의 ID", example = "1")
            @PathVariable Long userId) {

        // 1. DB에서 실제 사용자를 조회합니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 2. 조회된 사용자의 username과 role으로 JWT를 생성합니다.
        String token = jwtUtil.createAccessToken(user.getUsername(), user.getUserRole());

        // 3. 생성된 토큰을 200 OK 응답과 함께 반환합니다.
        return ResponseEntity.ok(token);
    }
}