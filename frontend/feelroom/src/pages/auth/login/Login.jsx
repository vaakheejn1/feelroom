import { useState, useEffect } from 'react';
import logo from '../../../assets/logo4.png'
import logo_img from '../../../assets/logo7.png'
import title_feel from '../../../assets/title_feel.png'
import title_room from '../../../assets/title_room.png'
import { Link } from 'react-router-dom';
import { useLoginLogic } from './loginLogic';
import BackgroundComponent from '../../../BackgroundComponent';
import AnimationComponent from '../../../AnimationComponent';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const {
    isLoading,
    handleLogin,
    handleTestLogin,
    handleSideTestLogin1,
    handleSideTestLogin2,
    handleSideTestLogin3,
    handleSideTestLogin4
  } = useLoginLogic(formData, setError);

  useEffect(() => {
    // 뷰포트 메타태그 동적 조정
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // 모바일에서 스크롤 완전 차단
    if (isMobile) {
      // body 스크롤 방지
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      // html 스크롤 방지
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';

      // 터치 이벤트로 인한 스크롤 방지
      const preventScroll = (e) => {
        e.preventDefault();
      };

      const preventTouchMove = (e) => {
        // input 요소가 아닌 경우에만 터치 이동 방지
        if (!e.target.closest('input')) {
          e.preventDefault();
        }
      };

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      document.addEventListener('scroll', preventScroll, { passive: false });

      // 뷰포트 높이 업데이트 함수
      const updateViewportHeight = () => {
        setViewportHeight(window.innerHeight);
        setIsMobile(window.innerWidth < 1200);
      };

      // 리사이즈 이벤트 리스너 추가
      window.addEventListener('resize', updateViewportHeight);
      window.addEventListener('orientationchange', updateViewportHeight);

      return () => {
        // 정리: 스크롤 복원
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';

        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventTouchMove);
        document.removeEventListener('scroll', preventScroll);
        window.removeEventListener('resize', updateViewportHeight);
        window.removeEventListener('orientationchange', updateViewportHeight);
      };
    } else {
      // 데스크톱에서는 일반적인 리사이즈 이벤트만 처리
      const updateViewportHeight = () => {
        setViewportHeight(window.innerHeight);
        setIsMobile(window.innerWidth < 1200);
      };

      window.addEventListener('resize', updateViewportHeight);
      window.addEventListener('orientationchange', updateViewportHeight);

      return () => {
        window.removeEventListener('resize', updateViewportHeight);
        window.removeEventListener('orientationchange', updateViewportHeight);
      };
    }
  }, [isMobile]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: isMobile ? `${viewportHeight}px` : '100vh',
      width: '100vw',
      position: isMobile ? 'fixed' : 'relative',
      top: 0,
      left: 0,
      overflow: 'hidden',
      zIndex: 10
    }}>
      {/* 배경 컴포넌트 */}
      <BackgroundComponent />

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

      {/* 애니메이션 컴포넌트 */}
      <AnimationComponent />


      <div style={{
        background: 'white',
        padding: isMobile ? '25px 20px' : '40px',
        borderRadius: isMobile ? '20px' : '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: isMobile ? '320px' : '400px',
        margin: isMobile ? '20px' : '0',
        position: 'relative',
        zIndex: 100,
        animation: 'fadeInUp 1s ease-out'
      }}>
        <style>
          {`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    input::placeholder {
      color: #d18e8eff !important;
    }
  `}
        </style>

        <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '30px' }}>
          <img
            src={logo}
            alt="logo"
            style={{
              height: isMobile ? '50px' : '80px',
              filter: 'drop-shadow(2px 3px 6px rgba(255,0,0,0.4))'
            }}
          />
          <p style={{ fontSize: isMobile ? '14px' : '18px', color: '#971313', marginTop: '8px' }}>
            당신의 영화취향을 위한 소통공간
          </p>
        </div>

        <form onSubmit={(e) => handleLogin(e)}>
          <div style={{ marginBottom: isMobile ? '12px' : '20px' }}>
            <input
              type="text"
              name="userId"
              placeholder="아이디"
              value={formData.userId}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: isMobile ? '12px 16px' : '16px 20px',
                border: '0.5px solid #d18ea7ff',
                borderRadius: '10px',
                fontSize: '16px',
                color: '#333333',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '20px' }}>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: isMobile ? '12px 16px' : '16px 20px',
                border: '0.5px solid #d18e8eff',
                borderRadius: '10px',
                fontSize: '16px',
                color: '#333333',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: isMobile ? '12px' : '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* 테스트 계정 자동 로그인 버튼 */}
          {/* <button
            type="button"
            onClick={handleTestLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: isMobile ? '10px' : '12px',
              backgroundColor: '#575a57ff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: isLoading ? 0.6 : 1,
              marginBottom: isMobile ? '8px' : '10px'
            }}
          >
            {isLoading ? '로그인 중...' : '임시 로그인 (admin)'}
          </button> */}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: isMobile ? '10px' : '12px',
              background: 'linear-gradient(135deg, #971313 0%, #6b0e0e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: isMobile ? '12px' : '20px',
          paddingTop: isMobile ? '12px' : '20px',
          borderTop: '1px solid #eee'
        }}>
          <Link to="/find-account" style={{
            color: '#61646B',
            textDecoration: 'none',
            fontSize: isMobile ? '12px' : '14px',
            marginBottom: '9px',
            display: 'block'
          }}>
            아이디/비밀번호를 잊어버리셨나요?
          </Link>

          <span style={{ color: 'gray', textDecoration: 'none', fontSize: isMobile ? '12px' : '14px' }}>
            계정이 없으신가요?
          </span>
          &nbsp;
          <Link to="/signup" style={{
            textDecoration: 'none',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: 600,
            color: '#971313'
          }}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;