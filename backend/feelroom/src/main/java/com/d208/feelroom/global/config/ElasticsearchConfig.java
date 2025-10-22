//package com.d208.feelroom.config;
//
//import co.elastic.clients.elasticsearch.ElasticsearchClient;
//import co.elastic.clients.elasticsearch.indices.CreateIndexRequest;
//import co.elastic.clients.elasticsearch.indices.ExistsRequest;
//import co.elastic.clients.json.jackson.JacksonJsonpMapper;
//import co.elastic.clients.transport.ElasticsearchTransport;
//import co.elastic.clients.transport.rest_client.RestClientTransport;
//import lombok.extern.slf4j.Slf4j;
//import org.apache.http.HttpHost;
//import org.elasticsearch.client.RestClient;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.event.ContextRefreshedEvent;
//import org.springframework.context.event.EventListener;
//
//import java.io.StringReader;
//
//@Configuration
//@Slf4j
//public class ElasticsearchConfig {
//
//    @Value("${spring.elasticsearch.uris:http://localhost:9200}")
//    private String elasticsearchUri;
//
//    @Value("${elasticsearch.index.movie:movie_index}")
//    private String movieIndexName;
//
//    @Bean
//    public RestClient elasticsearchClient() {
//        log.info("Elasticsearch URI: {}", elasticsearchUri);
//        return RestClient.builder(HttpHost.create(elasticsearchUri)).build();
//    }
//
//    @Bean
//    public ElasticsearchClient elasticsearchJavaClient() {
//        RestClient restClient = elasticsearchClient();
//        ElasticsearchTransport transport = new RestClientTransport(
//                restClient, new JacksonJsonpMapper());
//        return new ElasticsearchClient(transport);
//    }
//
//    // @PostConstruct 대신 @EventListener 사용하여 순환 참조 해결
//    @EventListener(ContextRefreshedEvent.class)
//    public void createIndices() {
//        try {
//            ElasticsearchClient client = elasticsearchJavaClient();
//
//            // 영화 인덱스만 생성
//            createMovieIndexIfNotExists(client);
//
//        } catch (Exception e) {
//            log.error("영화 인덱스 생성 중 오류 발생", e);
//        }
//    }
//
//    /**
//     * 영화 인덱스 생성
//     */
//    private void createMovieIndexIfNotExists(ElasticsearchClient client) throws Exception {
//        ExistsRequest existsRequest = ExistsRequest.of(e -> e.index(movieIndexName));
//        boolean indexExists = client.indices().exists(existsRequest).value();
//
//        if (!indexExists) {
//            log.info("영화 인덱스 생성 시작: {}", movieIndexName);
//            createMovieIndexWithNoriAnalyzer(client);
//            log.info("영화 인덱스 생성 완료: {}", movieIndexName);
//        } else {
//            log.info("영화 인덱스가 이미 존재합니다: {}", movieIndexName);
//        }
//    }
//
//    /**
//     * 영화 인덱스 생성 (Nori 분석기 포함)
//     */
//    private void createMovieIndexWithNoriAnalyzer(ElasticsearchClient client) throws Exception {
//        // Nori 설정을 포함한 인덱스 설정 JSON
//        String indexSettings = """
//            {
//              "settings": {
//                "analysis": {
//                  "analyzer": {
//                    "nori_analyzer": {
//                      "type": "custom",
//                      "tokenizer": "nori_tokenizer",
//                      "filter": ["lowercase", "nori_part_of_speech"]
//                    }
//                  },
//                  "tokenizer": {
//                    "nori_tokenizer": {
//                      "type": "nori_tokenizer",
//                      "decompound_mode": "mixed"
//                    }
//                  }
//                }
//              },
//              "mappings": {
//                "properties": {
//                  "movieId": {
//                    "type": "integer"
//                  },
//                  "title": {
//                    "type": "text",
//                    "analyzer": "nori_analyzer",
//                    "search_analyzer": "nori_analyzer",
//                    "fields": {
//                      "ngram": {
//                         "type": "text",
//                         "analyzer": "ngram_analyzer"
//                      }
//                    }
//                  },
//                  "originalTitle": {
//                    "type": "text",
//                    "analyzer": "standard",
//                    "fields": {
//                      "keyword": {
//                        "type": "keyword"
//                      }
//                    }
//                  },
//                  "releaseDate": {
//                    "type": "keyword"
//                  },
//                  "tmdbId": {
//                    "type": "integer"
//                  },
//                  "voteAverage": {
//                    "type": "double"
//                  },
//                  "voteCount": {
//                    "type": "integer"
//                  },
//                  "overview": {
//                    "type": "text",
//                    "analyzer": "nori_analyzer"
//                  },
//                  "posterUrl": {
//                    "type": "keyword"
//                  }
//                }
//              }
//            }
//            """;
//
//        // Raw JSON을 사용하여 인덱스 생성
//        CreateIndexRequest request = CreateIndexRequest.of(builder -> builder
//                .index(movieIndexName)
//                .withJson(new StringReader(indexSettings))
//        );
//
//        client.indices().create(request);
//        log.info("Nori 분석기가 포함된 영화 인덱스 생성 완료: {}", movieIndexName);
//    }
//}