// src/pages/settings/Unregister.jsx
import React, { useState } from 'react';
import { useNavigate }        from 'react-router-dom';
import { userActivityAPI }    from '../../api/user-activity.js';
import useAuth                from '../../hooks/useAuth.js'; // 토큰 삭제용

export default function Unregister() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const navigate                = useNavigate();
  const { logout }              = useAuth();  // AuthContext 에서 토큰 삭제 함수

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { success, error: errMsg } = await userActivityAPI.unregister(password);

    if (success) {
      alert('회원 탈퇴가 완료되었습니다.');
      logout();               // JWT 토큰 등 클라이언트 인증 정보 정리
      navigate('/login');     // 로그인 페이지로 이동
    } else {
      setError(errMsg);
    }
  };

  return (
    <main className="page-unregister" style={{ padding: '1rem', marginTop: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        회원 탈퇴
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="current-password"
            style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1rem' }}
          >
            현재 비밀번호를 입력해주세요.
          </label>
          <input
            id="current-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="현재 비밀번호"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
            }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>
            ❗ {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          확인
        </button>
      </form>
    </main>
  );
}
