// src/pages/Settings.jsx
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

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
      <h2 style={{ marginBottom: '1rem' }}>설정</h2>

      {/* 메뉴 리스트 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/user-activity')}
        >
          내 활동
        </li>

        <li
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/account-settings')}
        >
          계정 설정
        </li>
      </ul>
    </main>
  );
};

export default Settings;