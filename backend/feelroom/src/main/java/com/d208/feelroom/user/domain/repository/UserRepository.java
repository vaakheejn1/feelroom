package com.d208.feelroom.user.domain.repository;

import com.d208.feelroom.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.localAccount WHERE u.username = :username")
    Optional<User> findByUsernameWithLocalAccount(@Param("username") String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.userId = :userId AND r.deletedAt IS NULL")
    int countReviewsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(ml) FROM MovieLike ml WHERE ml.user.userId = :userId")
    int countMovieLikesByUserId(@Param("userId") Long userId);

    // =============== 통합 사용자 검색 (username + nickname) ===============

    /**
     * username 또는 nickname으로 통합 검색
     * 정확도 기준으로 정렬하여 최적의 검색 결과 제공
     */
    @Query("""
        SELECT u FROM User u 
        WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) 
           OR (u.nickname IS NOT NULL AND LOWER(u.nickname) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY 
            CASE 
                WHEN LOWER(u.username) = LOWER(:query) THEN 1
                WHEN LOWER(u.nickname) = LOWER(:query) THEN 2
                WHEN LOWER(u.username) LIKE LOWER(CONCAT(:query, '%')) THEN 3
                WHEN LOWER(u.nickname) LIKE LOWER(CONCAT(:query, '%')) THEN 4
                ELSE 5
            END,
            u.username ASC
        """)
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);
}