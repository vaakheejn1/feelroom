// src/api/comments.js

import { apiClient, getAuthHeaders } from './client.js';

export const commentsAPI = {
  getReviewComments: async (reviewId, page = 0, size = 20) => {
    try {
      const headers = getAuthHeaders();
      const res = await apiClient.get(
        `/reviews/${reviewId}/comments`,
        { params: { page, size }, headers }
      );
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 댓글 목록 조회 실패:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  createComment: async (reviewId, content, parentCommentId = null, mentionUserId = null) => {
    try {
      const body = { content };
      if (parentCommentId) body.parentCommentId = parentCommentId;
      if (mentionUserId) body.mentionUserId = mentionUserId;
      const headers = getAuthHeaders();
      const res = await apiClient.post(
        `/reviews/${reviewId}/comments`,
        body,
        { headers }
      );
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 댓글 작성 실패:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  getComment: async (commentId) => {
    try {
      const headers = getAuthHeaders();
      const res = await apiClient.get(
        `/comments/${commentId}`,
        { headers }
      );
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 댓글 단일 조회 실패:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  updateComment: async (commentId, content) => {
    try {
      const headers = getAuthHeaders();
      await apiClient.patch(
        `/comments/${commentId}`,
        { content },
        { headers }
      );
      return { success: true };
    } catch (error) {
      console.error('❌ 댓글 수정 실패:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // 🚀 변경: reviewId 추가, 경로 수정
  // src/api/comments.js
deleteComment: async (commentId) => {
  try {
    const headers = getAuthHeaders();
    const res = await apiClient.delete(
      `/comments/${commentId}`, // ✅ 수정된 경로
      { headers }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error('❌ 댓글 삭제 실패:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
},

  // 🔧 수정된 댓글 좋아요 토글 함수 - fetch 직접 사용
  toggleLikeComment: async (commentId) => {
    try {
      // console.log(`💖 댓글 좋아요 토글: ${commentId}`);

      // 토큰 직접 가져오기
      const token = localStorage.getItem('authToken'); // 필요시 'accessToken'으로 변경
      if (!token) {
        throw new Error('로그인이 필요합니다.2');
      }

      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const headers = {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      };

      // console.log('📋 요청 헤더:', headers);
      // console.log('📋 요청 URL:', `https://i13d208.p.ssafy.io/api/v1/comments/${commentId}/like`);

      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/comments/${commentId}/like`, {
        method: 'PUT', // POST에서 PUT으로 변경
        headers: headers,
        body: JSON.stringify({})
      });

      // console.log('📡 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API 에러 응답:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: 댓글 좋아요 실패`);
      }

      const result = await response.json();
      // console.log('✅ 댓글 좋아요 토글 성공:', result);

      // 실제 Swagger 응답 구조: { "likeCount": 1, "liked": true }
      return {
        success: true,
        data: {
          likeCount: result.likeCount, // likesCount가 아니라 likeCount
          liked: result.liked,
          commentId: commentId
        }
      };

    } catch (error) {
      console.error('❌ 댓글 좋아요 토글 실패:', error);
      return {
        success: false,
        error: error.message || '댓글 좋아요 중 오류가 발생했습니다.',
        status: error.status
      };
    }
  },

  // 기존 axios 방식 백업 (필요시 사용) - PUT으로 수정
  toggleLikeCommentAxios: async (commentId) => {
    try {
      const headers = getAuthHeaders();
      const res = await apiClient.put( // post에서 put으로 변경
        `/comments/${commentId}/like`,
        {},
        { headers }
      );
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 댓글 좋아요 토글 실패:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
};