// src/api/user-activity.js
import { apiClient } from './client.js';

/** 로컬스토리지에서 authToken 꺼내서 "Bearer <토큰>" 형태로 반환 */
function getAuthToken() {
  const raw = localStorage.getItem('authToken');
  if (!raw) throw new Error('로그인이 필요합니다.');
  return raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
}

export const userActivityAPI = {
  // 내가 작성한 리뷰
  getMyReviews: async (page = 0) => {
    try {
      // console.log(`📝 내가 작성한 리뷰 조회: 페이지 ${page}`);
      const res = await apiClient.get('/users/me/reviews', {
        params: { page, size: 20 },
        headers: { Authorization: getAuthToken() }
      });
      return { success: true, data: res.data };
    } catch (err) {
      console.error('❌ 내 리뷰 조회 실패:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  // 내가 좋아요한 리뷰
  getLikedReviews: async (page = 0) => {
    try {
      // console.log(`💖 좋아요한 리뷰 조회: 페이지 ${page}`);
      const res = await apiClient.get('/users/me/liked-reviews', {
        params: { page, size: 20 },
        headers: { Authorization: getAuthToken() }
      });
      return { success: true, data: res.data };
    } catch (err) {
      console.error('❌ 좋아요한 리뷰 조회 실패:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  // // 내가 작성한 댓글
  // getMyComments: async (page = 0) => {
  //   try {
  //     console.log(`💬 내가 작성한 댓글 조회: 페이지 ${page}`);
  //     const res = await apiClient.get('/users/me/comments', {
  //       params: { page, size: 20 },
  //       headers: { Authorization: getAuthToken() }
  //     });
  //     return { success: true, data: res.data };
  //   } catch (err) {
  //     console.error('❌ 내 댓글 조회 실패:', err);
  //     return { success: false, error: err.response?.data?.message || err.message };
  //   }
  // },

  // …나머지 메서드에도 필요하다면 getAuthToken() 으로 헤더 붙여주세요…
};
