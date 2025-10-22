// src/pages/AccountSettings.jsx
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth.js';

const AccountSettings = () => {
  const navigate = useNavigate();

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 에러가 발생해도 로그인 페이지로 이동 (보안상 안전)
      navigate('/');
    }
  };

  return (
    <main style={{ padding: '1rem' }}>
      {/* CSS 애니메이션 */}
      <style jsx>{`
       

        /* 가로 스크롤바 완전 제거 */
        * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden !important;
        }
      `}</style>
      <h2 style={{ marginBottom: '1rem' }}>계정 설정</h2>

      {/* 계정 관리 메뉴 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>

        <li
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/change-password')}
        >
          비밀번호 변경
        </li>

        <li
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
          }}
          onClick={handleLogout}
        >
          로그아웃
        </li>

        <li
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
            color: '#dc2626'
          }}
          onClick={() => navigate('/unregister')}
        >
          회원 탈퇴
        </li>
      </ul>
    </main>
  );
};

export default AccountSettings;