//package com.d208.feelroom.movie.controller;
//
//import com.d208.feelroom.movie.service.init.JsonMovieImportService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@Tag(name = "0.1 Admin - Movie", description = "영화 데이터 관리 API")
//@RestController
//@RequestMapping("/api/v1/admin/movie")
//@RequiredArgsConstructor
//@Slf4j
//public class MovieAdminController {
//
//    private final JsonMovieImportService jsonMovieImportService;
//
//    @PostMapping("/import-movies")
//    @Operation(summary = "영화 기본 정보 Import",
//            description = "JSON 파일에서 영화 기본 정보만 추출하여 저장")
//    public ResponseEntity<String> importMovies() {
//        try {
//            log.info("영화 기본 정보 import 요청");
//            jsonMovieImportService.importMoviesFromResources();
//            return ResponseEntity.ok("영화 기본 정보 import 성공");
//        } catch (Exception e) {
//            log.error("영화 기본 정보 import 실패", e);
//            return ResponseEntity.badRequest().body("Import 실패: " + e.getMessage());
//        }
//    }
//
//    @PostMapping("/import-entities")
//    @Operation(summary = "기본 엔티티 추출 및 저장",
//            description = "JSON에서 배우, 감독, 장르, 키워드를 추출해서 각 테이블에 저장")
//    public ResponseEntity<String> importEntities() {
//        try {
//            log.info("기본 엔티티 추출 및 저장 요청");
//            jsonMovieImportService.importEntitiesFromResources();
//            return ResponseEntity.ok("기본 엔티티 import 성공");
//        } catch (Exception e) {
//            log.error("기본 엔티티 import 실패", e);
//            return ResponseEntity.badRequest().body("Import 실패: " + e.getMessage());
//        }
//    }
//
//    @PostMapping("/import-relations")
//    @Operation(summary = "관계 데이터 Import",
//            description = "영화와 배우/감독/장르/키워드 간의 관계 데이터를 배치 처리로 저장")
//    public ResponseEntity<String> importRelations() {
//        try {
//            log.info("관계 데이터 import 요청");
//            jsonMovieImportService.importRelationsFromResources();
//            return ResponseEntity.ok("관계 데이터 import 성공");
//        } catch (Exception e) {
//            log.error("관계 데이터 import 실패", e);
//            return ResponseEntity.badRequest().body("Import 실패: " + e.getMessage());
//        }
//    }
//
//    @PostMapping("/import-all")
//    @Operation(summary = "전체 데이터 Import",
//            description = "영화, 엔티티, 관계 데이터를 순차적으로 모두 저장")
//    public ResponseEntity<String> importAll() {
//        try {
//            log.info("전체 데이터 import 요청");
//
//            // 1단계: 영화 기본 정보
//            jsonMovieImportService.importMoviesFromResources();
//            log.info("1단계: 영화 기본 정보 완료");
//
//            // 2단계: 기본 엔티티들
//            jsonMovieImportService.importEntitiesFromResources();
//            log.info("2단계: 기본 엔티티 완료");
//
//            // 3단계: 관계 데이터
//            jsonMovieImportService.importRelationsFromResources();
//            log.info("3단계: 관계 데이터 완료");
//
//            return ResponseEntity.ok("전체 데이터 import 성공");
//        } catch (Exception e) {
//            log.error("전체 데이터 import 실패", e);
//            return ResponseEntity.badRequest().body("Import 실패: " + e.getMessage());
//        }
//    }
//}