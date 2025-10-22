package com.d208.feelroom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing
@EnableCaching
@SpringBootApplication
@EnableScheduling // 스케줄링 활성화 (프로덕션 환경을 위해 남겨둠)
@EnableAsync
public class FeelroomApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(FeelroomApplication.class, args);
	}
}