import React from 'react';
import { useNavigate } from 'react-router-dom';

const FindAccount = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '480px',
      padding: '40px',
      textAlign: 'center'
    },
    header: {
      marginBottom: '40px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.5'
    },
    optionSection: {
      marginBottom: '30px'
    },
    optionButton: {
      width: '100%',
      padding: '24px',
      marginBottom: '16px',
      background: 'white',
      border: '2px solid #e9ecef',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'left'
    },
    optionButtonHover: {
      borderColor: '#007bff',
      boxShadow: '0 4px 12px rgba(0, 123, 255, 0.15)',
      transform: 'translateY(-2px)'
    },
    optionIcon: {
      width: '48px',
      height: '48px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
      fontSize: '24px'
    },
    optionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px'
    },
    optionDescription: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.4',
      margin: 0
    },
    backButton: {
      padding: '12px 24px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8f9fa',
      color: '#6c757d',
      width: '100%'
    }
  };

  const handleOptionClick = (path) => {
    navigate(path);
  };

  const handleBack = () => {
    navigate('/'); // 로그인 페이지로 이동
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>계정 찾기</h1>
          <p style={styles.subtitle}>
            아이디를 잊으셨나요? 비밀번호를 재설정하고 싶으신가요?<br />
            원하시는 서비스를 선택해주세요.
          </p>
        </div>

        <div style={styles.optionSection}>
          <button 
            style={styles.optionButton}
            onClick={() => handleOptionClick('/find-id')}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.optionButtonHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'none';
            }}
          >
            <div style={styles.optionIcon}>
              👤
            </div>
            <h3 style={styles.optionTitle}>아이디 찾기</h3>
            <p style={styles.optionDescription}>
              가입할 때 사용한 이메일 주소로<br />
              아이디를 확인할 수 있습니다.
            </p>
          </button>

          <button 
            style={styles.optionButton}
            onClick={() => handleOptionClick('/reset-password')}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.optionButtonHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'none';
            }}
          >
            <div style={styles.optionIcon}>
              🔒
            </div>
            <h3 style={styles.optionTitle}>비밀번호 재설정</h3>
            <p style={styles.optionDescription}>
              새로운 비밀번호로 변경하여<br />
              계정에 다시 접근할 수 있습니다.
            </p>
          </button>
        </div>

        <button 
          style={styles.backButton}
          onClick={handleBack}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e9ecef';
            e.target.style.color = '#495057';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.color = '#6c757d';
          }}
        >
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default FindAccount;