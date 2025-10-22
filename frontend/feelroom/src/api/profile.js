// src/api/profile.js
import { apiClient, getAuthHeaders } from './client.js';
import axios from 'axios';

export const profileAPI = {
  /**
   * 팔로워 목록 조회
   * GET /users/me/followers
   * @param {number} page 페이지 번호 (기본: 0)
   * @param {number} size 페이지 당 항목 수 (기본: 20)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getFollowers: async (page = 0, size = 20) => {
    const headers = getAuthHeaders();
    try {
      const res = await apiClient.get('/users/me/followers', {
        headers,
        params: { page, size }
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 팔로워 조회 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * 팔로잉 목록 조회
   * GET /users/me/following
   * @param {number} page 페이지 번호 (기본: 0)
   * @param {number} size 페이지 당 항목 수 (기본: 20)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getFollowing: async (page = 0, size = 20) => {
    const headers = getAuthHeaders();
    try {
      const res = await apiClient.get('/users/me/following', {
        headers,
        params: { page, size }
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 팔로잉 조회 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
  /**
   * [S3] 프로필 이미지 업로드를 위한 Presigned PUT URL 발급
   * GET /profile/image/presigned-url
   * @param {string} fileName 업로드할 파일명 (확장자 포함)
   * @returns {Promise<{success: boolean, data?: {presignedUrl: string, objectKey: string}, error?: string}>}
   */
  getPresignedImageUrl: async (fileName) => {
    const headers = getAuthHeaders(); // 인증 헤더 가져오기
    try {
      const res = await apiClient.get(`/profile/image/presigned-url`, {
        headers,
        params: { fileName }
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ Presigned URL 발급 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * [S3] Presigned URL로 S3에 파일 직접 업로드 (PUT 요청)
   * 이 함수는 apiClient를 사용하지 않고, S3에서 발급받은 presignedUrl로 직접 요청합니다.
   * @param {string} presignedUrl S3에서 발급받은 PUT용 Presigned URL
   * @param {File} file 업로드할 파일 객체
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  uploadFileToS3: async (presignedUrl, file) => {
    try {
      // Content-Type은 파일의 MIME 타입으로 설정 (매우 중요!)
      // S3에 직접 업로드하는 것이므로 Authorization 헤더는 포함하지 않습니다.
      const response = await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
      // S3 put 요청 성공 시 응답 상태 코드가 200 OK 또는 200 No Content일 수 있습니다.
      // S3는 성공 시 응답 본문을 거의 반환하지 않으므로, status로 성공 여부 판단.
      if (response.status >= 200 && response.status < 300) {
        return { success: true };
      } else {
        return { success: false, error: `S3 업로드 실패: Status ${response.status}` };
      }
    } catch (error) {
      console.error('❌ S3 직접 업로드 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * [S3] S3 업로드 완료 후, 백엔드에 DB 업데이트 요청
   * PUT /profile/image/upload
   * @param {number} userId 사용자 ID
   * @param {string} objectKey S3에 저장된 객체 키 (profile_images/userId/UUID_filename.jpg)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  updateProfileImageUrlInDB: async (objectKey) => {
    try {
      const headers = getAuthHeaders(); // 인증 헤더 가져오기
      const response = await apiClient.put(`/profile/image/upload`, { objectKey }, { headers });
      return { success: true, data: response.data }; // data 반환 추가 (백엔드에서 데이터 반환 시)
    } catch (error) {
      console.error('❌ DB 프로필 이미지 URL 업데이트 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },
  /**
   * 로그인 된 사용자 프로필 정보 조회 (이미지 URL 포함)
   * GET /users/me/profile
   * @param {number} userId 조회할 사용자 ID
   * @returns {Promise<{success: boolean, data?: UserProfileResponseDto, error?: string}>}
   */
  getMyProfile: async () => {
    try {
      const headers = getAuthHeaders(); // 인증 헤더 가져오기
      // profileAPI 내부에 users 관련 경로가 이미 있으므로 /users/me/profile 경로를 그대로 사용
      const res = await apiClient.get(`/users/me/profile`, { headers });
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 사용자 프로필 조회 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },
  /**
   * 사용자 프로필 정보 조회 (이미지 URL 포함)
   * GET /users/{userId}/profile
   * @param {number} userId 조회할 사용자 ID
   * @returns {Promise<{success: boolean, data?: UserProfileResponseDto, error?: string}>}
   */
  getUserProfile: async (userId) => {
    try {
      const headers = getAuthHeaders(); // 인증 헤더 가져오기
      const res = await apiClient.get(`/users/${userId}/profile`, { headers });
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ 사용자 프로필 조회 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  },
};
