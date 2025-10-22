// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';  

/**
 * useAuth 훅
 * - AuthContext 에서 로그인된 사용자 정보와 토큰 등을 꺼내 옵니다.
 * - ReviewDetail 등에서 currentUser를 가져올 때 사용하세요.
 *
 * 예시:
 *   const { user, token, login, logout } = useAuth();
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
