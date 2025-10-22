// src/api/client.js - 인터셉터 없는 간단한 버전
import axios from 'axios';

const API_BASE_URL = 'https://i13d208.p.ssafy.io/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰을 포함한 헤더 생성 함수 - authToken으로 통일
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken'); // accessToken에서 authToken으로 변경

  if (!token) {
    // console.warn('⚠️ 토큰이 없습니다.');
    return {};
  }

  const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  // console.log('🔐 토큰 설정:', authToken.substring(0, 30) + '...');

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

  // 리뷰 좋아요 상태 확인 - fetch로 변경
  getReviewLikeStatus: async (reviewId) => {
    try {
      // console.log(`💖 리뷰 좋아요 상태 확인: ${reviewId}`);

      // 토큰 직접 가져오기
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.3');
      }

      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const headers = {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/reviews/reviews/${reviewId}/my-status`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: 리뷰 좋아요 상태 확인 실패`);
      }

      const result = await response.json();
      // console.log('✅ 리뷰 좋아요 상태 확인 성공:', result);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ 리뷰 좋아요 상태 확인 실패:', error);
      return {
        success: false,
        error: error.message || '리뷰 좋아요 상태 확인 중 오류가 발생했습니다.',
        status: error.status
      };
    }
  },

  // 리뷰 좋아요 토글 - fetch로 변경
  toggleReviewLike: async (reviewId) => {
    try {
      // console.log(`💖 리뷰 좋아요 토글: ${reviewId}`);

      // 토큰 직접 가져오기
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.2');
      }

      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const headers = {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      };

      // console.log('📋 요청 헤더:', headers);
      // console.log('📋 요청 URL:', `https://i13d208.p.ssafy.io/api/v1/reviews/reviews/${reviewId}/like`);

      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/reviews/reviews/${reviewId}/like`, {
        method: 'PUT', // Swagger에 따라 PUT 사용
        headers: headers,
        body: JSON.stringify({})
      });

      // console.log('📡 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API 에러 응답:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: 리뷰 좋아요 실패`);
      }

      const result = await response.json();
      // console.log('✅ 리뷰 좋아요 토글 성공:', result);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ 리뷰 좋아요 토글 실패:', error);
      return {
        success: false,
        error: error.message || '리뷰 좋아요 중 오류가 발생했습니다.',
        status: error.status
      };
    }
  }
};