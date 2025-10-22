-- 데이터베이스 생성 (기존 DB 삭제 후 새로 생성)
DROP DATABASE IF EXISTS movie_recommendation_db;
CREATE DATABASE IF NOT EXISTS movie_recommendation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movie_recommendation_db;

-- =================================================================================
-- 1. 참조 테이블들
-- =================================================================================

CREATE TABLE signup_types (
                              signup_type_id INT AUTO_INCREMENT PRIMARY KEY,
                              value VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE genders (
                         gender_id INT AUTO_INCREMENT PRIMARY KEY,
                         value VARCHAR(10) NOT NULL UNIQUE
);

INSERT INTO signup_types (value) VALUES ('email'), ('google'), ('kakao');
INSERT INTO genders (value) VALUES ('male'), ('female'), ('other');

CREATE TABLE badges (
                        badge_id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL,
                        description VARCHAR(255),
                        condition_code VARCHAR(50) NOT NULL,
                        icon_url VARCHAR(255)
);

CREATE TABLE movies (
                        movie_id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(500) NOT NULL,
                        release_date DATE,
                        overview TEXT,
                        vote_average DOUBLE,
                        vote_count INT DEFAULT 0,
                        runtime INT,
                        poster_url VARCHAR(500),
                        tmdb_id INT UNIQUE,

    -- 인덱스 추가: 영화 검색 및 정렬 효율성
                        INDEX idx_title (title),
                        INDEX idx_release_date (release_date),
                        INDEX idx_vote_average (vote_average DESC),
                        INDEX idx_tmdb_id (tmdb_id),
                        INDEX idx_release_rating (release_date, vote_average DESC) -- 개봉일 및 평점 기반 랭킹
);

CREATE TABLE actors (
                        actor_id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,

                        INDEX idx_actor_name (name) -- 배우 이름으로 검색 시
);

CREATE TABLE directors (
                           director_id INT AUTO_INCREMENT PRIMARY KEY,
                           name VARCHAR(100) NOT NULL,

                           INDEX idx_director_name (name) -- 감독 이름으로 검색 시
);

CREATE TABLE genres (
                        genre_id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE keywords (
                          keyword_id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,

                          INDEX idx_keyword_name (name) -- 키워드 이름으로 검색 시
);

CREATE TABLE tags (
                      tag_id INT AUTO_INCREMENT PRIMARY KEY,
                      name VARCHAR(100) NOT NULL UNIQUE
);


-- =================================================================================
-- 2. 핵심 엔티티 테이블
-- =================================================================================

CREATE TABLE users (
                       user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       nickname VARCHAR(50),
                       description VARCHAR(255),
                       gender_id INT,
                       birth_date DATE, -- birth_date로 컬럼명 통일
                       profile_image_url VARCHAR(500),
                       profile_image_updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), -- 자동 업데이트
                       user_role ENUM('USER', 'ADMIN') NOT NULL, -- ENUM 값 대문자로 통일
                       signup_type_id INT,
                       created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성
                       created_by BIGINT NULL, -- NULL 허용
                       updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), -- 자동 업데이트
                       updated_by BIGINT NULL, -- NULL 허용
                       deleted_at DATETIME(6), -- DATETIME(6)으로 통일

                       FOREIGN KEY (gender_id) REFERENCES genders(gender_id),
                       FOREIGN KEY (signup_type_id) REFERENCES signup_types(signup_type_id),
                       FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL, -- 사용자 삭제 시 NULL 처리
                       FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL, -- 사용자 삭제 시 NULL 처리

                       INDEX idx_email (email),
                       INDEX idx_username (username)
);

CREATE TABLE local_accounts (
                                user_id BIGINT PRIMARY KEY,
                                password_hash VARCHAR(255) NOT NULL,
                                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
                         review_id BINARY(16) PRIMARY KEY, -- UUID 저장을 위한 BINARY(16)
                         user_id BIGINT NOT NULL, -- **주의: 사용자 탈퇴 시 리뷰 물리 삭제됨 (ON DELETE CASCADE)**
                         movie_id INT NOT NULL,
                         title VARCHAR(500) NOT NULL,
                         content TEXT NOT NULL,
                         rating INT CHECK (rating >= 0 AND rating <= 10),
                         created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성
                         updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), -- 자동 업데이트
                         deleted_at DATETIME(6), -- 소프트 삭제 시각
                         deleted_by BIGINT NULL, -- 소프트 삭제를 수행한 사용자 ID (NULL 허용)

                         FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, -- **주의: CASCADE 유지**
                         FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
                         FOREIGN KEY (deleted_by) REFERENCES users(user_id) ON DELETE SET NULL, -- 삭제자 계정 삭제 시 NULL 처리

                         INDEX idx_movie_reviews (movie_id, created_at DESC), -- 영화별 최신 리뷰 조회
                         INDEX idx_user_reviews (user_id, created_at DESC), -- 사용자별 최신 리뷰 조회
                         INDEX idx_rating_reviews (rating DESC, created_at DESC) -- 평점 높은 리뷰 조회
);

CREATE TABLE comments (
                          comment_id BINARY(16) PRIMARY KEY, -- UUID 저장을 위한 BINARY(16)
                          user_id BIGINT NULL, -- 사용자 계정 삭제 시 NULL 처리 (익명화)
                          review_id BINARY(16) NOT NULL,
                          content TEXT NOT NULL,
                          parent_comment_id BINARY(16), -- 부모 댓글 ID (NULL이면 최상위 댓글)
                          reply_to_user_id BIGINT NULL, -- 이 댓글이 특정 사용자에게 답글/멘션하는 경우 (NULL 허용)
                          created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성
                          updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), -- 자동 업데이트
                          deleted_at DATETIME(6), -- 소프트 삭제 시각
                          deleted_by BIGINT NULL, -- 소프트 삭제를 수행한 사용자 ID (NULL 허용)

                          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL, -- 사용자 계정 삭제 시 NULL 처리
                          FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE, -- 리뷰 삭제 시 댓글도 삭제
                          FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE SET NULL, -- 부모 댓글 물리 삭제 시 NULL 처리 (소프트 삭제에는 영향 없음)
                          FOREIGN KEY (reply_to_user_id) REFERENCES users(user_id) ON DELETE SET NULL, -- 멘션 대상 사용자 계정 삭제 시 NULL 처리
                          FOREIGN KEY (deleted_by) REFERENCES users(user_id) ON DELETE SET NULL, -- 삭제자 계정 삭제 시 NULL 처리

                          INDEX idx_review_comments (review_id, created_at), -- 리뷰별 댓글 조회 (생성 시간 순)
                          INDEX idx_user_comments (user_id, created_at), -- 사용자별 댓글 조회
                          INDEX idx_parent_comments (parent_comment_id, created_at), -- 특정 댓글의 답글 조회
                          INDEX idx_reply_to_user_comments (reply_to_user_id, created_at) -- 특정 사용자에게 멘션된 댓글 조회
);


-- =================================================================================
-- 3. 관계 테이블
-- =================================================================================

CREATE TABLE follows (
                         follower_id BIGINT NOT NULL,
                         followee_id BIGINT NOT NULL,
                         followed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성

                         PRIMARY KEY (follower_id, followee_id),
                         FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
                         FOREIGN KEY (followee_id) REFERENCES users(user_id) ON DELETE CASCADE,
                         CHECK (follower_id != followee_id), -- 자기 자신 팔로우 방지

    INDEX idx_followee_follower (followee_id, followed_at) -- 나를 팔로우하는 사용자 목록 조회 시 (최신순)
);

CREATE TABLE user_badges (
                             user_id BIGINT NOT NULL,
                             badge_id INT NOT NULL,
                             acquired_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성

                             PRIMARY KEY (user_id, badge_id),
                             FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                             FOREIGN KEY (badge_id) REFERENCES badges(badge_id) ON DELETE CASCADE,

                             INDEX idx_badge_users (badge_id, acquired_at) -- 특정 배지를 획득한 사용자 목록 조회 시
);

CREATE TABLE user_onboarding_movies (
    user_id BIGINT NOT NULL,
    movie_id INT NOT NULL,

    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,

    INDEX idx_user_onboarding (user_id)
);


CREATE TABLE movie_likes (
                             user_id BIGINT NOT NULL,
                             movie_id INT NOT NULL,
                             created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성

                             PRIMARY KEY (user_id, movie_id),
                             FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                             FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,

                             INDEX idx_movie_likes (movie_id, created_at) -- 특정 영화의 좋아요 수 조회 또는 최신 좋아요 조회
);

-- 현재 상영작 정보
CREATE TABLE movie_now (
                           movie_id INT NOT NULL,
                           ranking_date DATE NOT NULL,
                           ranking INT NOT NULL,
                           audience INT NOT NULL,

                           PRIMARY KEY (movie_id, ranking_date),
                           FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,

                           INDEX idx_ranking_date (ranking_date, ranking) -- 특정 날짜의 영화 랭킹 조회 시
);

CREATE TABLE movie_actor (
                             movie_id INT NOT NULL,
                             actor_id INT NOT NULL,

                             PRIMARY KEY (movie_id, actor_id),
                             FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
                             FOREIGN KEY (actor_id) REFERENCES actors(actor_id) ON DELETE CASCADE,

                             INDEX idx_actor_movies (actor_id) -- 특정 배우가 출연한 영화 조회 시
);

CREATE TABLE movie_director (
                                movie_id INT NOT NULL,
                                director_id INT NOT NULL,

                                PRIMARY KEY (movie_id, director_id),
                                FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
                                FOREIGN KEY (director_id) REFERENCES directors(director_id) ON DELETE CASCADE,

                                INDEX idx_director_movies (director_id) -- 특정 감독이 만든 영화 조회 시
);

CREATE TABLE movie_genre (
                             movie_id INT NOT NULL,
                             genre_id INT NOT NULL,

                             PRIMARY KEY (movie_id, genre_id),
                             FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
                             FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE,

                             INDEX idx_genre_movies (genre_id) -- 특정 장르의 영화 조회 시
);

CREATE TABLE movie_keyword (
                               movie_id INT NOT NULL,
                               keyword_id INT NOT NULL,

                               PRIMARY KEY (movie_id, keyword_id),
                               FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
                               FOREIGN KEY (keyword_id) REFERENCES keywords(keyword_id) ON DELETE CASCADE,

                               INDEX idx_keyword_movies (keyword_id) -- 특정 키워드를 가진 영화 조회 시
);

CREATE TABLE review_likes (
                              user_id BIGINT NOT NULL,
                              review_id BINARY(16) NOT NULL,
                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성

                              PRIMARY KEY (user_id, review_id),
                              FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                              FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,

                              INDEX idx_review_likes (review_id, created_at) -- 특정 리뷰의 좋아요 수 조회 또는 최신 좋아요 조회
);

CREATE TABLE review_tag (
                            review_id BINARY(16) NOT NULL,
                            tag_id INT NOT NULL,

                            PRIMARY KEY (review_id, tag_id),
                            FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
                            FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,

                            INDEX idx_tag_reviews (tag_id) -- 특정 태그가 달린 리뷰 조회 시
);

CREATE TABLE comment_likes (
                               user_id BIGINT NOT NULL,
                               comment_id BINARY(16) NOT NULL,
                               created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성

                               PRIMARY KEY (user_id, comment_id),
                               FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                               FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,

                               INDEX idx_comment_likes (comment_id, created_at) -- 특정 댓글의 좋아요 수 조회 또는 최신 좋아요 조회
);


-- =================================================================================
-- 4. 집계(Summary) 및 총 개수(Total Count) 테이블들
-- =================================================================================

CREATE TABLE movie_summary (
    movie_id INT PRIMARY KEY,
    review_count INT NOT NULL DEFAULT 0,
    rating_sum BIGINT NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,

    INDEX idx_review_count (review_count DESC),
    INDEX idx_rating_sum (rating_sum DESC)
);

CREATE TABLE review_summary (
                                review_id BINARY(16) PRIMARY KEY,
                                review_like_count INT NOT NULL DEFAULT 0,
                                review_comment_count INT NOT NULL DEFAULT 0,
                                updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), -- 자동 업데이트

                                FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,

                                INDEX idx_like_count (review_like_count DESC) -- 좋아요 수 기반 리뷰 랭킹
);

CREATE TABLE comment_summary (
                                 comment_id BINARY(16) PRIMARY KEY,
                                 comment_like_count INT NOT NULL DEFAULT 0,
                                 updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), -- 자동 업데이트

                                 FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
    -- 댓글 좋아요 수에 대한 추가적인 인덱스는 필요 시 추가 (예: idx_comment_like_count (comment_like_count DESC))
);

CREATE TABLE movie_total_count (
                                   movie_total_count_id TINYINT PRIMARY KEY CHECK (movie_total_count_id = 1),
                                   total_movie_count INT NOT NULL,
                                   updated_at DATETIME(6) NOT NULL -- 업데이트는 애플리케이션/트리거/이벤트로 제어
);

CREATE TABLE review_total_count (
                                    review_total_count_id TINYINT PRIMARY KEY CHECK (review_total_count_id = 1),
                                    total_review_count INT NOT NULL,
                                    updated_at DATETIME(6) NOT NULL -- 업데이트는 애플리케이션/트리거/이벤트로 제어
);


-- =================================================================================
-- 5. 기타 테이블 (알림 등)
-- =================================================================================

CREATE TABLE notifications (
                               notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               type VARCHAR(50) NOT NULL, -- 알림 타입 (예: 'follow', 'review_comment', 'comment_reply', 'badge_acquired', 'mention')
                               receiver_id BIGINT NOT NULL,
                               sender_id BIGINT NULL, -- 알림을 보낸 사용자 (NULL 허용: 시스템 알림 등)
                               target_comment_id BINARY(16),
                               target_review_id BINARY(16),
                               target_badge_id INT,
                               is_read CHAR(1) NOT NULL DEFAULT 'N', -- Y/N (읽음/안 읽음)
                               created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), -- 자동 생성

                               FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
                               FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL,
                               FOREIGN KEY (target_comment_id) REFERENCES comments(comment_id) ON DELETE SET NULL,
                               FOREIGN KEY (target_review_id) REFERENCES reviews(review_id) ON DELETE SET NULL,
                               FOREIGN KEY (target_badge_id) REFERENCES badges(badge_id) ON DELETE SET NULL,

                               INDEX idx_receiver_notifications (receiver_id, created_at DESC), -- 특정 사용자의 알림 조회 (최신순)
                               INDEX idx_unread_notifications (receiver_id, is_read, created_at DESC) -- 특정 사용자의 읽지 않은 알림 조회
);


CREATE TABLE user_recommendations (
    user_id BIGINT NOT NULL,
    recommended_movie_ids JSON NOT NULL,  -- Example: [123, 456, 789]
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

RENAME TABLE user_recommendations TO user_movie_recommendations;

-- =================================================================================
-- 6. 샘플 데이터
-- =================================================================================

-- signup_types와 genders 데이터는 위에서 이미 추가됨

-- 시스템 최초 사용자(admin) - created_by가 NULL
INSERT INTO users (user_id, email, username, user_role, signup_type_id, created_at, updated_at, created_by, updated_by)
VALUES (1, 'admin@feelroom.com', 'admin', 'ADMIN', 1, NOW(), NOW(), NULL, NULL);

-- admin 유저의 로컬 계정
INSERT INTO local_accounts (user_id, password_hash)
VALUES (1, '$2a$10$6EQMh8pTRUGOHnsBERXarelmOWehqqKti2wQxhVaMfIPNHMhiCN9S'); -- pw: password

-- admin 유저의 created_by, updated_by를 자기 자신으로 업데이트 (초기 설정 후)
UPDATE users SET created_by = 1, updated_by = 1 WHERE user_id = 1;

INSERT INTO movies (
    title,
    release_date,
    overview,
    vote_average,
    vote_count,
    runtime,
    poster_url,
    tmdb_id
) VALUES (
             '인셉션',
             '2010-07-21',
             '꿈을 훔치고 심는 특수 요원들의 이야기를 다룬 SF 스릴러',
             8.3,
             31000,
             148,
             'https://image.tmdb.org/t/p/w500/inception_poster.jpg',
             27205
         );