// src/api/client.js - 인터셉터 없는 간단한 버전
import axios from 'axios';

const API_BASE_URL = 'https://i13d208.p.ssafy.io/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰을 포함한 헤더 생성 함수
export const getAuthHeaders = () => {
  // console.log('🔍 토큰 검색 시작...');

  // 정확한 키로 토큰 가져오기
  const token = localStorage.getItem('authToken');

  // console.log('📋 localStorage.getItem("authToken"):', token);
  // console.log('📋 토큰 존재 여부:', !!token);
  // console.log('📋 토큰 타입:', typeof token);
  // console.log('📋 토큰 길이:', token?.length);

  if (!token) {
    // console.warn('⚠️ authToken이 없습니다.');

    // 디버깅: 모든 localStorage 항목 출력
    // console.log('🔍 전체 localStorage 내용:');
    // for (let i = 0; i < localStorage.length; i++) {
    //   const key = localStorage.key(i);
    //   const value = localStorage.getItem(key);
    //   console.log(`  - "${key}": "${value?.substring(0, 50)}..."`);
    // }

    return {};
  }

  const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  // console.log('🔐 최종 Authorization 헤더:', authToken.substring(0, 50) + '...');
  // console.log('직접 확인:', localStorage.getItem('authToken'));

  return {
    'Authorization': authToken,
    'Content-Type': 'application/json'
  };
};

// src/api/reviews.js - 토큰 직접 포함 버전
export const reviewsAPI = {
  // 리뷰 생성
  createReview: async (reviewData) => {
    try {
      // console.log('📝 리뷰 작성:', reviewData);

      const headers = getAuthHeaders();
      // console.log('📋 요청 헤더:', headers);

      const response = await axios.post(
        `${API_BASE_URL}/v1/reviews`,
        reviewData,
        { headers }
      );

      // console.log('✅ 리뷰 작성 성공:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 리뷰 작성 실패:', error);
      console.error('  - Status:', error.response?.status);
      console.error('  - Data:', error.response?.data);

      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },

  // 리뷰 상세 조회
  getReviewDetail: async (reviewId) => {
    try {
      // console.log(`📖 리뷰 상세 조회: ${reviewId}`);

      const headers = getAuthHeaders();

      const response = await axios.get(
        `${API_BASE_URL}/v1/reviews/${reviewId}`,
        { headers }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ 리뷰 상세 조회 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },

  // 리뷰 수정
  updateReview: async (reviewId, updateData) => {
    try {
      // console.log(`✏️ 리뷰 수정: ${reviewId}`, updateData);

      const headers = getAuthHeaders();

      const response = await axios.patch(
        `${API_BASE_URL}/v1/reviews/${reviewId}`,
        updateData,
        { headers }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ 리뷰 수정 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },

  // 리뷰 삭제
  deleteReview: async (reviewId) => {
    try {
      // console.log(`🗑️ 리뷰 삭제: ${reviewId}`);

      const headers = getAuthHeaders();

      const response = await axios.delete(
        `${API_BASE_URL}/v1/reviews/${reviewId}`,
        { headers }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ 리뷰 삭제 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },

  // 리뷰 좋아요 상태 확인
  getReviewLikeStatus: async (reviewId) => {
    try {
      // console.log(`💖 리뷰 좋아요 상태 확인: ${reviewId}`);

      const headers = getAuthHeaders();

      const response = await axios.get(
        `${API_BASE_URL}/v1/reviews/${reviewId}/my-status`,
        { headers }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 리뷰 좋아요 상태 확인 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },

  // 리뷰 좋아요 토글
  toggleReviewLike: async (reviewId) => {
    try {
      // console.log(`💖 리뷰 좋아요 토글: ${reviewId}`);

      const headers = getAuthHeaders();

      const response = await axios.post(
        `${API_BASE_URL}/v1/reviews/${reviewId}/like`,
        {},
        { headers }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 리뷰 좋아요 토글 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  }
};