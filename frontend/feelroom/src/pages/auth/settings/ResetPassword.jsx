import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerificationCode, verifyEmailCode, resetPassword } from '../../../api/auth.js';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
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

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const hasTwoTypes = [
      /[a-zA-Z]/.test(password),
      /[0-9]/.test(password),
      /[^a-zA-Z0-9]/.test(password)
    ].filter(Boolean).length >= 2;

    return lengthValid && hasTwoTypes;
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

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);

    // 실시간 검증
    if (name === 'email' && value && !validateEmail(value)) {
      setFieldError('email', '올바른 이메일 형식을 입력해주세요.');
    }

    if (name === 'newPassword' && value && !validatePassword(value)) {
      setFieldError('newPassword', '비밀번호는 8자 이상, 영문/숫자/특수문자 중 2종류 이상을 포함해야 합니다.');
    }

    if (name === 'confirmPassword' && value && formData.newPassword && value !== formData.newPassword) {
      setFieldError('confirmPassword', '비밀번호가 일치하지 않습니다.');
    }
  };

  // 이메일 인증번호 발송
  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setFieldError('email', '이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setFieldError('email', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // auth.js의 함수 사용
      const result = await sendEmailVerificationCode(formData.email);
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
    if (!formData.verificationCode) {
      setFieldError('verificationCode', '인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      // auth.js의 함수 사용
      const result = await verifyEmailCode(formData.email, formData.verificationCode);
      // console.log('이메일 인증 성공:', result.message);
      
      setCodeVerified(true);
      clearFieldError('verificationCode');
      
    } catch (err) {
      console.error('인증 확인 오류:', err);
      setFieldError('verificationCode', err.message || '인증 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정
  const handleResetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setFieldError('general', '새 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFieldError('confirmPassword', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setFieldError('newPassword', '비밀번호 형식이 올바르지 않습니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      // auth.js의 resetPassword 함수 사용
      const result = await resetPassword(formData.email, formData.newPassword);
      // console.log('비밀번호 재설정 성공:', result.message);
      setPasswordReset(true);
      
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err);
      setFieldError('general', err.message || '비밀번호 재설정 중 오류가 발생했습니다.');
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
        marginBottom: '15px',
        fontSize: '12px'
      }}>
        {errors[field]}
      </div>
    );
  };

  // 스타일 객체
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
      padding: '40px'
    },
    stepHeader: {
      textAlign: 'center',
      marginBottom: '30px'
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
    inputSection: {},
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
    passwordSection: {
      padding: '20px',
      backgroundColor: '#f0f8ff',
      borderRadius: '8px',
      border: '1px solid #cce7ff',
      marginBottom: '20px'
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
    successSection: {
      textAlign: 'center',
      padding: '40px 20px'
    },
    successIcon: {
      fontSize: '48px',
      marginBottom: '20px'
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
    successNotice: {
      marginTop: '8px',
      marginBottom: '15px',
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

  // 완료 화면
  if (passwordReset) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successSection}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successMessage}>
              비밀번호가 성공적으로 변경되었습니다!<br />
              새 비밀번호로 로그인해주세요.
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
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.stepHeader}>
          <h2 style={styles.title}>비밀번호 재설정</h2>
          <p style={styles.subtitle}>
            {!emailSent
              ? '가입하신 이메일을 입력해 주세요.'
              : codeVerified
                ? '새로운 비밀번호를 설정해주세요.'
                : '이메일로 발송된 인증번호를 입력해주세요.'
            }
          </p>
        </div>

        {/* 전체 에러 메시지 */}
        {errors.general && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '25px',
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
            name="email"
            value={formData.email}
            onChange={handleInputChange}
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
        {emailSent && !codeVerified && (
          <div style={styles.verificationSection}>
            <label htmlFor="verification-code" style={styles.inputLabel}>
              인증번호 {timer > 0 && <span style={styles.timerText}>({formatTime(timer)})</span>}
            </label>
            <input
              id="verification-code"
              type="text"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleInputChange}
              placeholder="인증코드 6자리"
              maxLength={6}
              style={styles.input(false, errors.verificationCode)}
            />
            <ErrorMessage field="verificationCode" />

            {emailSent && !codeVerified && !errors.verificationCode && (
              <div style={styles.successNotice}>
                ✓ 인증코드가 이메일로 발송되었습니다.
              </div>
            )}

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
          </div>
        )}

        {/* 새 비밀번호 입력 섹션 */}
        {codeVerified && (
          <div style={styles.passwordSection}>
            <label htmlFor="new-password" style={styles.inputLabel}>새 비밀번호</label>
            <input
              id="new-password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="새 비밀번호를 입력하세요"
              disabled={isLoading}
              style={styles.input(isLoading, errors.newPassword)}
            />
            <ErrorMessage field="newPassword" />

            <label htmlFor="confirm-password" style={styles.inputLabel}>새 비밀번호 확인</label>
            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="새 비밀번호를 다시 입력하세요"
              disabled={isLoading}
              style={styles.input(isLoading, errors.confirmPassword)}
            />
            <ErrorMessage field="confirmPassword" />

            {!errors.newPassword && (
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '-12px',
                marginBottom: '20px'
              }}>
                영문/숫자/특수문자 중 2가지 이상을 포함한 8자리 이상으로 입력해주세요
              </div>
            )}

            <div style={styles.buttonSection}>
              <button
                style={styles.primaryButton(isLoading)}
                onClick={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? '변경중...' : '비밀번호 변경'}
              </button>
              <button
                style={styles.cancelButton}
                onClick={() => navigate('/find-account')}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;