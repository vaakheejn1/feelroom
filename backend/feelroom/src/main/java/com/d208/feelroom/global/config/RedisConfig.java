package com.d208.feelroom.global.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * [역할 1] TokenBlacklistService에서 직접 사용할 RedisTemplate 설정
     * - Key는 String, Value는 JSON으로 직렬화됩니다.
     * - 이 Bean은 Spring Caching과는 독립적으로 동작합니다.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        return template;
    }

    /**
     * [역할 2] @Cacheable, @CacheEvict 등 Spring Caching 추상화가 사용할 CacheManager 설정
     * - 캐시 이름별로 다른 유효 시간(TTL)을 적용합니다.
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // 모든 캐시에 공통으로 적용될 직렬화 설정
        RedisCacheConfiguration commonConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // 캐시 이름별로 개별 TTL 설정을 담을 Map
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // "movie-details" 캐시는 1일(24시간) 유효
        cacheConfigurations.put("movie-details", commonConfig.entryTtl(Duration.ofDays(1)));

        // "user-session" 또는 다른 짧은 유효시간이 필요한 캐시가 있다면 여기에 추가
        // cacheConfigurations.put("some-other-cache", commonConfig.entryTtl(Duration.ofMinutes(10)));

        // CacheManager 빌더를 사용하여 최종 설정 조합
        return RedisCacheManager.builder(connectionFactory)
                // 위 Map에 지정되지 않은 캐시의 기본 TTL은 30분으로 설정
                .cacheDefaults(commonConfig.entryTtl(Duration.ofMinutes(30)))

                // 캐시 이름별 개별 설정 적용
                .withInitialCacheConfigurations(cacheConfigurations)

                .build();
    }
}