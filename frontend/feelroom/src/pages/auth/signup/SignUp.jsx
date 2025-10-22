import { useState, useEffect } from 'react';
import {
  signupWithEmail,
  formatBirthDate,
  validateEmail,
  validatePassword
} from '../../../api/auth.js';
import { EmailVerification } from './EmailVerification.jsx';
import { UserInputFields } from './UserInputFields.jsx';
import BackgroundComponent from '../../../BackgroundComponent';
import AnimationComponent from '../../../AnimationComponent';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    userId: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    birthDate: '',
    gender: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // 인증 상태 관리
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);

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

  const handleNavigation = () => {
    // 회원가입 완료 후 온보딩 페이지로 이동
    try {
      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('needsOnboarding', 'true');
        localStorage.setItem('isLoggedIn', 'true');
      }
      window.location.href = '/onboarding';
    } catch (error) {
      console.error('Navigation error:', error);
      // localStorage 실패 시에도 페이지 이동
      window.location.href = '/onboarding';
    }
  };

  const handleLoginNavigation = () => {
    // 시작페이지로 이동하면서 모든 상태 완전 초기화
    try {
      if (typeof (Storage) !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
    window.location.replace('/');
  };

  // 에러 관리 헬퍼 함수
  const setFieldError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // 생년월일 유효성 검사
  const validateBirthDate = (birthDate) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return false;
    }

    const [year, month, day] = birthDate.split('-').map(Number);
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();

    if (year < 1900 || year > currentYear) {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (day < 1 || day > daysInMonth[month - 1]) {
      return false;
    }

    const inputDate = new Date(year, month - 1, day);
    if (inputDate > currentDate) {
      return false;
    }

    const minDate = new Date();
    minDate.setFullYear(currentYear - 130);
    if (inputDate < minDate) {
      return false;
    }

    return true;
  };

  // 테스트용 자동 입력 함수
  const handleAutoFill = () => {
    const autoData = {
      email: 'test' + Math.floor(Math.random() * 1000) + '@example.com',
      verificationCode: '', // 자동 입력하지 않음 - 실제 이메일에서 받은 코드 입력 필요
      userId: 'testuser' + Math.floor(Math.random() * 1000),
      password: 'test1234!',
      confirmPassword: 'test1234!',
      nickname: '테스트유저' + Math.floor(Math.random() * 100),
      birthDate: '1995-05-15',
      gender: 'male'
    };

    setFormData(autoData);
    // 인증 상태는 초기화
    setIsEmailVerified(false);
    setIsUserIdChecked(false);
  };

  // 회원가입 처리
  const handleSignUp = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors({});

    // 필수 필드 검증
    if (!formData.email || !formData.password || !formData.userId ||
      !formData.nickname || !formData.birthDate || !formData.gender) {
      setFieldError('general', '모든 필수 항목을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    // 이메일 인증 확인
    if (!isEmailVerified) {
      setFieldError('general', '이메일 인증을 완료해주세요.');
      setIsLoading(false);
      return;
    }

    // 아이디 중복확인 확인
    if (!isUserIdChecked) {
      setFieldError('general', '아이디 중복확인을 완료해주세요.');
      setIsLoading(false);
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setFieldError('confirmPassword', '비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    // 비밀번호 유효성 검사
    if (!validatePassword(formData.password)) {
      setFieldError('password', '비밀번호 형식이 올바르지 않습니다.');
      setIsLoading(false);
      return;
    }

    // 생년월일 유효성 검사
    if (!validateBirthDate(formData.birthDate)) {
      setFieldError('birthDate', '올바른 생년월일을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        username: formData.userId,
        nickname: formData.nickname,
        birth_date: formatBirthDate(formData.birthDate), // YYYY-MM-DD → YYYYMMDD
        gender_value: formData.gender // male/female/other
      };

      const result = await signupWithEmail(signupData);

      // 로그인 상태로 설정
      try {
        if (typeof (Storage) !== "undefined") {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', result.user_id || '');
          localStorage.setItem('username', formData.userId);
          localStorage.setItem('nickname', formData.nickname);
        }
      } catch (storageError) {
        console.error('localStorage 설정 오류:', storageError);
        // localStorage 실패해도 계속 진행
      }

      handleNavigation();

    } catch (error) {
      console.error('회원가입 오류:', error);

      // 에러 메시지 처리
      if (error.message.includes('이메일') || error.message.includes('email')) {
        setFieldError('email', error.message);
      } else if (error.message.includes('아이디') || error.message.includes('username')) {
        setFieldError('userId', error.message);
      } else if (error.message.includes('비밀번호') || error.message.includes('password')) {
        setFieldError('password', error.message);
      } else {
        setFieldError('general', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 에러 메시지 렌더링 컴포넌트
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return (
      <div style={{
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '8px 12px',
        borderRadius: '4px',
        marginTop: '5px',
        fontSize: '12px'
      }}>
        {errors[field]}
      </div>
    );
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
        minWidth: '450px',
        maxWidth: isMobile ? '320px' : '500px',
        margin: isMobile ? '20px' : '0',
        position: 'relative',
        zIndex: 100,
        animation: 'fadeInUp 1s ease-out',
        maxHeight: isMobile ? `${viewportHeight - 40}px` : '90vh',
        overflowY: 'auto'
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

        <form onSubmit={handleSignUp}>
          {/* 이메일 인증 컴포넌트 */}
          <EmailVerification
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setFieldError={setFieldError}
            clearFieldError={clearFieldError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isMobile={isMobile}
            isEmailVerified={isEmailVerified}
            setIsEmailVerified={setIsEmailVerified}
          />

          {/* 사용자 입력 필드 컴포넌트 */}
          <UserInputFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setFieldError={setFieldError}
            clearFieldError={clearFieldError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isMobile={isMobile}
            isUserIdChecked={isUserIdChecked}
            setIsUserIdChecked={setIsUserIdChecked}
          />

          {/* 전체 에러 메시지 */}
          <ErrorMessage field="general" />

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
              transition: 'all 0.3s ease',
              marginTop: errors.general ? '10px' : '0'
            }}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: isMobile ? '12px' : '20px',
          paddingTop: isMobile ? '12px' : '20px',
          borderTop: '1px solid #eee'
        }}>
          <span style={{ color: 'gray', textDecoration: 'none', fontSize: isMobile ? '12px' : '14px' }}>
            이미 계정이 있으신가요?
          </span>
          &nbsp;
          <span
            onClick={handleLoginNavigation}
            style={{
              textDecoration: 'none',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 600,
              color: '#971313',
              cursor: 'pointer'
            }}
          >
            로그인
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignUp;