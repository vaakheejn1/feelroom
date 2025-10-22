import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerificationCode, verifyEmailCode, findUserId } from '../../../api/auth.js';

const FindID = () => {
  const navigate = useNavigate();

  // 테스트 모드 설정 (서버 500 에러로 인해 임시로 true로 설정)
  const TEST_MODE = true; // 서버 문제 해결 시 false로 변경

  // 스타일 객체
  const styles = {
    findIdContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    },
    findIdCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '480px',
      padding: '40px'
    },
    stepHeader: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    stepHeaderH2: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px'
    },
    stepHeaderP: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.5'
    },
    inputSection: {
    },
    inputLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '8px'
    },
    input: (disabled, hasError = false) => ({
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${hasError ? '#dc3545' : '#ddd'}`,
      borderRadius: '6px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      marginBottom: '16px',
      backgroundColor: disabled ? '#f8f9fa' : 'white',
      cursor: disabled ? 'not-allowed' : 'text',
      boxSizing: 'border-box'
    }),
    verificationSection: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    buttonSection: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px'
    },
    primaryButton: (disabled) => ({
      flex: 1,
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: disabled ? '#6c757d' : '#007bff',
      color: 'white',
      opacity: disabled ? 0.6 : 1
    }),
    cancelButton: {
      flex: 1,
      padding: '12px 24px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8f9fa',
      color: '#6c757d'
    },
    resultSection: {
      textAlign: 'center'
    },
    successMessage: {
      padding: '20px',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '24px'
    },
    successMessageStrong: {
      fontWeight: '600',
      color: '#0c5460'
    },
    message: (type) => ({
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
      backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
      color: type === 'success' ? '#155724' : '#721c24',
      border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
    }),
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '8px 12px',
      borderRadius: '4px',
      marginTop: '5px',
      marginBottom: '15px', // 버튼과의 간격 추가
      fontSize: '12px'
    },
    successNotice: {
      marginTop: '8px', 
      marginBottom: '15px', // 버튼과의 간격 추가
      padding: '8px 12px', 
      backgroundColor: '#d1ecf1', 
      color: '#0c5460', 
      borderRadius: '4px', 
      fontSize: '12px'
    },
    timerText: {
      color: '#dc3545',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [foundId, setFoundId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [timer, setTimer] = useState(0);

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

  // 이메일 형식 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 타이머 시작
  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 이메일 입력 핸들러
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    clearFieldError('email');
    
    if (value && !validateEmail(value)) {
      setFieldError('email', '올바른 이메일 형식을 입력해주세요.');
    }
  };

  // 인증코드 입력 핸들러
  const handleCodeChange = (e) => {
    setVerificationCode(e.target.value);
    clearFieldError('verificationCode');
  };

  // 이메일 인증번호 발송
  const handleSendVerificationCode = async () => {
    if (!email) {
      setFieldError('email', '이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setFieldError('email', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // auth.js의 함수 사용
      const result = await sendEmailVerificationCode(email);
      // console.log('인증코드 발송 성공:', result.message);
      
      setEmailSent(true);
      setTimer(300); // 5분 타이머
      startTimer();
      clearFieldError('email');
      
    } catch (err) {
      console.error('인증코드 발송 오류:', err);
      setFieldError('email', err.message || '인증코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setFieldError('verificationCode', '인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      // auth.js의 함수 사용
      const result = await verifyEmailCode(email, verificationCode);
      // console.log('이메일 인증 성공:', result.message);
      
      setCodeVerified(true);
      clearFieldError('verificationCode');
      
      // 인증 완료되면 바로 아이디 찾기 실행
      setTimeout(() => {
        handleFindId();
      }, 500);
      
    } catch (err) {
      console.error('인증 확인 오류:', err);
      setFieldError('verificationCode', err.message || '인증 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 아이디 찾기
  const handleFindId = async () => {
    setIsLoading(true);
    
    try {
      // auth.js의 함수 사용
      const result = await findUserId(email);
      setFoundId(result.username); // username 필드 사용
      
    } catch (err) {
      console.error('아이디 찾기 오류:', err);
      setFieldError('general', err.message || '아이디 찾기 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 에러 메시지 렌더링 컴포넌트
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return (
      <div style={styles.errorMessage}>
        {errors[field]}
      </div>
    );
  };

  return (
    <div style={styles.findIdContainer}>
      <div style={styles.findIdCard}>
        <div style={styles.stepHeader}>
          <h2 style={styles.stepHeaderH2}>아이디 찾기</h2>
          <p style={styles.stepHeaderP}>가입하신 이메일을 입력해 주세요.</p>
        </div>

        {/* 전체 에러 메시지 */}
        {errors.general && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '25px', // 더 큰 간격
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {errors.general}
          </div>
        )}

        {/* 이메일 입력 섹션 */}
        <div style={styles.inputSection}>
          <label htmlFor="email" style={styles.inputLabel}>이메일 주소</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="이메일을 입력하세요"
            disabled={emailSent}
            style={styles.input(emailSent, errors.email)}
          />
          <ErrorMessage field="email" />
          
          {!emailSent && (
            <div style={styles.buttonSection}>
              <button 
                style={styles.primaryButton(isLoading)}
                onClick={handleSendVerificationCode}
                disabled={isLoading}
              >
                {isLoading ? '발송중...' : '인증번호 발송'}
              </button>
              <button 
                style={styles.cancelButton}
                onClick={() => navigate('/find-account')}
              >
                취소
              </button>
            </div>
          )}
        </div>

        {/* 인증번호 입력 섹션 */}
        {emailSent && !foundId && (
          <div style={styles.verificationSection}>
            <label htmlFor="verification-code" style={styles.inputLabel}>
              인증번호 {timer > 0 && <span style={styles.timerText}>({formatTime(timer)})</span>}
            </label>
            <input
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="인증코드 6자리"
              disabled={codeVerified}
              maxLength={6}
              style={styles.input(codeVerified, errors.verificationCode)}
            />
            <ErrorMessage field="verificationCode" />
            
            {emailSent && !codeVerified && !errors.verificationCode && (
              <div style={styles.successNotice}>
                ✓ 인증코드가 이메일로 발송되었습니다.
              </div>
            )}
            
            {!codeVerified && (
              <div style={styles.buttonSection}>
                <button 
                  style={styles.primaryButton(isLoading || timer === 0)}
                  onClick={handleVerifyCode}
                  disabled={isLoading || timer === 0}
                >
                  {isLoading ? '확인중...' : '인증번호 확인'}
                </button>
                <button 
                  style={styles.cancelButton}
                  onClick={() => {
                    setEmailSent(false);
                    setErrors({});
                    setTimer(0);
                  }}
                >
                  다시입력
                </button>
              </div>
            )}
          </div>
        )}

        {/* 아이디 찾기 결과 */}
        {foundId && (
          <div style={styles.resultSection}>
            <div style={styles.successMessage}>
              회원님의 아이디는 <strong style={styles.successMessageStrong}>{foundId}</strong>입니다.
            </div>
            <div style={styles.buttonSection}>
              <button 
                style={styles.primaryButton(false)}
                onClick={() => navigate('/')}
              >
                로그인하러 가기
              </button>
              <button 
                style={styles.cancelButton}
                onClick={() => navigate('/find-account')}
              >
                뒤로가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindID;