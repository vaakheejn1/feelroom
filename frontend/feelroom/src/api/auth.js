// src/api/auth.js
import { apiClient } from './client.js';

// ===== 이메일 인증 관련 API =====

/**
 * 이메일 중복 확인
 * @param {string} email - 확인할 이메일
 * @returns {Promise<{available: boolean, email: string}>}
 */
export const checkEmailAvailability = async (email) => {
  try {
    const response = await apiClient.get('/users/check-email', {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('이메일 중복 확인 실패:', error);
    throw new Error(error.response?.data?.message || '이메일 사용 가능 여부 확인에 실패했습니다.');
  }
};

/**
 * 이메일 인증코드 발송
 * @param {string} email - 인증코드를 받을 이메일
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendEmailVerificationCode = async (email) => {
  try {
    const response = await apiClient.post('/auth/verify/email/send', null, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('인증코드 발송 실패:', error);
    throw new Error(error.response?.data?.message || '인증코드 발송에 실패했습니다.');
  }
};

/**
 * 이메일 인증코드 확인
 * @param {string} email - 이메일
 * @param {string} code - 인증코드
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyEmailCode = async (email, code) => {
  try {
    // console.log('🔍 이메일 인증 시도:', { email, code });
    
    const response = await apiClient.post('/auth/verify/email/confirm', null, {
      params: { email, code }
    });
    
    // console.log('✅ 이메일 인증 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 이메일 인증 실패 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    });
    
    if (error.response?.status === 400) {
      throw new Error('인증코드가 올바르지 않거나 만료되었습니다. 다시 확인해주세요.');
    } else if (error.response?.status === 404) {
      throw new Error('해당 이메일로 발송된 인증코드를 찾을 수 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw new Error(error.response?.data?.message || '인증코드 확인에 실패했습니다.');
  }
};

/**
 * 아이디 중복 확인
 * @param {string} username - 확인할 아이디
 * @returns {Promise<{available: boolean, username: string}>}
 */
export const checkUsernameAvailability = async (username) => {
  try {
    const response = await apiClient.get('/users/check-login-id', {
      params: { username }
    });
    return response.data;
  } catch (error) {
    console.error('아이디 중복 확인 실패:', error);
    throw new Error(error.response?.data?.message || '아이디 중복 확인에 실패했습니다.');
  }
};

/**
 * 이메일 회원가입
 * @param {Object} signupData - 회원가입 데이터
 * @returns {Promise<{user_id: number, message: string}>}
 */
export const signupWithEmail = async (signupData) => {
  try {
    const response = await apiClient.post('/auth/signup/email', signupData);
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.');
  }
};

/**
 * 로그인
 * @param {string} username - 사용자명
 * @param {string} password - 비밀번호
 * @returns {Promise<{access_token: string, user_id: number}>}
 */
export const loginWithUsername = async (username, password) => {
  try {
    // console.log('🚀 로그인 시도:', { username, password: '***' });
    // console.log('🌐 API Base URL:', apiClient.defaults.baseURL);
    // console.log('🔗 Full URL will be:', `${apiClient.defaults.baseURL}/auth/login`);
    
    const response = await apiClient.post('/auth/login', {
      username,
      password
    });
    
    // console.log('✅ 로그인 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 로그인 실패 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`
    });
    
    // 더 구체적인 에러 메시지 제공
    if (error.response?.status === 401) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    } else if (error.response?.status === 404) {
      throw new Error('존재하지 않는 사용자입니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
  }
};

/**
 * 아이디 찾기
 * @param {string} email - 이메일
 * @returns {Promise<{username: string}>}
 */
export const findUserId = async (email) => {
  try {
    const response = await apiClient.post('/auth/find-username', null, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('아이디 찾기 실패:', error);
    throw new Error(error.response?.data?.message || '아이디를 찾을 수 없습니다.');
  }
};

/**
 * 비밀번호 재설정
 * @param {string} email - 이메일
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await apiClient.post('/auth/password/reset', {
      email,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('비밀번호 재설정 실패:', error);
    throw new Error(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
  }
};

/**
 * 로그인된 사용자 비밀번호 변경
 * @param {string} currentPassword - 현재 비밀번호
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    // 토큰 확인
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    }

    // console.log('🔑 비밀번호 변경 시도:', { currentPassword: '***', newPassword: '***' });
    
    const response = await apiClient.put('/users/me/password', {
      currentPassword,
      newPassword
    }, {
      headers: {
        'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
      }
    });
    
    // console.log('✅ 비밀번호 변경 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 비밀번호 변경 실패 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      throw new Error('현재 비밀번호가 올바르지 않습니다.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다. 다시 로그인해주세요.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
  }
};

/**
 * 로그아웃
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const logout = async () => {
  try {
    // 토큰 확인
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      // 토큰이 없어도 로컬 스토리지는 정리
      clearAuthData();
      return { success: true, message: '로그아웃되었습니다.' };
    }

    // console.log('🚪 로그아웃 시도');
    
    const response = await apiClient.post('/auth/logout', {}, {
      headers: {
        'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
      }
    });
    
    // console.log('✅ 로그아웃 성공:', response.data);
    
    // 로컬 스토리지에서 인증 정보 제거
    clearAuthData();
    
    return response.data;
  } catch (error) {
    console.error('❌ 로그아웃 실패 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // 로그아웃 실패해도 로컬 데이터는 정리
    clearAuthData();
    
    if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했지만 로그아웃 처리되었습니다.');
    }
    
    // 401, 403 등은 이미 토큰이 무효한 상태이므로 성공으로 처리
    return { success: true, message: '로그아웃되었습니다.' };
  }
};

/**
 * 인증 관련 로컬 스토리지 데이터 정리
 */
export const clearAuthData = () => {
  // console.log('🧹 인증 데이터 정리 중...');
  
  // 인증 관련 데이터 제거
  const keysToRemove = [
    'authToken',
    'refreshToken', 
    'isLoggedIn',
    'userId',
    'username',
    'nickname',
    'userInfo',
    'email'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // console.log('✅ 인증 데이터 정리 완료');
};

// ===== 유틸리티 함수 =====

/**
 * 생년월일 포맷 변환 (YYYY-MM-DD → YYYYMMDD)
 * @param {string} birthDate - YYYY-MM-DD 형식의 생년월일
 * @returns {string} YYYYMMDD 형식의 생년월일
 */
export const formatBirthDate = (birthDate) => {
  return birthDate.replace(/-/g, '');
};

/**
 * 이메일 형식 검증
 * @param {string} email - 이메일
 * @returns {boolean} 유효한 이메일 형식인지 여부
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 강도 검증
 * @param {string} password - 비밀번호
 * @returns {boolean} 유효한 비밀번호인지 여부
 */
export const validatePassword = (password) => {
  const lengthValid = password.length >= 8;
  const hasTwoTypes = [
    /[a-zA-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password)
  ].filter(Boolean).length >= 2;

  return lengthValid && hasTwoTypes;
};