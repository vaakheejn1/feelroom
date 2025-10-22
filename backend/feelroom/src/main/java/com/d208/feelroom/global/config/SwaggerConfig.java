// config 패키지에 생성
package com.d208.feelroom.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // API 정보 설정
        Info info = new Info()
                .title("FeelRoom API Documentation")
                .version("v1.0.0")
                .description("영화 추천 및 리뷰 서비스 FeelRoom의 API 명세서입니다.");

        // SecurityScheme 이름은 자유롭게 지정
        String securitySchemeName = "bearerAuth";

        // API 요청 헤더에 인증 정보 추가
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(securitySchemeName);

        // SecuritySchemes 설정
        Components components = new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP) // HTTP 방식
                        .scheme("bearer")
                        .bearerFormat("JWT")); // 토큰 형식 지정

        return new OpenAPI()
                .info(info)
                .addSecurityItem(securityRequirement)
                .components(components);
    }
}