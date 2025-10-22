package com.d208.feelroom.review.domain.repository;

import com.d208.feelroom.review.domain.entity.tag.ReviewTag;
import com.d208.feelroom.review.domain.entity.tag.ReviewTagId; // 복합키 ID 클래스 import
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
// JpaRepository<엔티티 타입, ID 타입>
public interface ReviewTagRepository extends JpaRepository<ReviewTag, ReviewTagId> {

    // [참고] 필요하다면 복합키의 일부를 사용한 쿼리 메서드를 추가할 수 있습니다.

    /**
     * 특정 리뷰에 연결된 모든 ReviewTag를 조회합니다.
     * @param reviewId 리뷰의 UUID
     * @return List<ReviewTag>
     */
    // @EmbeddedId 방식에 맞는 쿼리 메서드 이름
    List<ReviewTag> findById_ReviewId(UUID reviewId);

    /**
     * 특정 태그가 사용된 모든 ReviewTag를 조회합니다.
     * @param tagId 태그의 ID
     * @return List<ReviewTag>
     */
    // @EmbeddedId 방식에 맞는 쿼리 메서드 이름
    List<ReviewTag> findById_TagId(Integer tagId);
}