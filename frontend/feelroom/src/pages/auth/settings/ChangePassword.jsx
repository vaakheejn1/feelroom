import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../../api/auth.js';

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);

    // 실시간 검증
    if (name === 'newPassword' && value && !validatePassword(value)) {
      setFieldError('newPassword', '비밀번호는 8자 이상, 영문/숫자/특수문자 중 2종류 이상을 포함해야 합니다.');
    }

    if (name === 'confirmPassword' && value && formData.newPassword && value !== formData.newPassword) {
      setFieldError('confirmPassword', '새 비밀번호가 일치하지 않습니다.');
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setFieldError('general', '모든 필드를 입력해주세요.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFieldError('confirmPassword', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setFieldError('newPassword', '비밀번호 형식이 올바르지 않습니다.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setFieldError('newPassword', '현재 비밀번호와 새 비밀번호가 같습니다.');
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // auth.js의 changePassword 함수 사용
      const result = await changePassword(formData.currentPassword, formData.newPassword);
      // console.log('비밀번호 변경 성공:', result.message);
      
      // 성공 메시지 표시
      setFieldError('success', '비밀번호가 성공적으로 변경되었습니다!');
      
      // 2초 후 이전 페이지로 이동
      setTimeout(() => {
        navigate(-1);
      }, 2000);
      
    } catch (err) {
      console.error('비밀번호 변경 오류:', err);
      
      if (err.message.includes('현재 비밀번호')) {
        setFieldError('currentPassword', err.message);
      } else if (err.message.includes('로그인')) {
        setFieldError('general', err.message);
      } else {
        setFieldError('general', err.message || '비밀번호 변경 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 테스트용 자동 입력 함수
  const handleTestFill = () => {
    setFormData({
      currentPassword: 'test1234!',
      newPassword: 'newtest1234!',
      confirmPassword: 'newtest1234!'
    });
    // console.log('테스트용 비밀번호 자동 입력 완료');
  };

  // 에러 메시지 렌더링 컴포넌트
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return (
      <div style={{
        backgroundColor: field === 'success' ? '#d4edda' : '#f8d7da',
        color: field === 'success' ? '#155724' : '#721c24',
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

  return (
    <main style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '480px',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '8px'
          }}>
            비밀번호 변경
          </h2>
          <p style={{ 
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            보안을 위해 현재 비밀번호를 입력한 후 새 비밀번호를 설정해주세요.
          </p>
        </div>

        {/* 전체 에러/성공 메시지 */}
        <ErrorMessage field="general" />
        <ErrorMessage field="success" />

        <form onSubmit={handleChangePassword}>
          {/* 현재 비밀번호 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              현재 비밀번호 *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="현재 비밀번호를 입력하세요"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${errors.currentPassword ? '#dc3545' : '#ddd'}`,
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: isLoading ? '#f8f9fa' : 'white'
              }}
            />
            <ErrorMessage field="currentPassword" />
          </div>

          {/* 새 비밀번호 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              새 비밀번호 *
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="새 비밀번호를 입력하세요"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${errors.newPassword ? '#dc3545' : '#ddd'}`,
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: isLoading ? '#f8f9fa' : 'white'
              }}
            />
            <ErrorMessage field="newPassword" />
            {!errors.newPassword && (
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '4px'
              }}>
                영문/숫자/특수문자 중 2가지 이상을 포함한 8자리 이상으로 입력해주세요
              </div>
            )}
          </div>

          {/* 새 비밀번호 확인 */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              새 비밀번호 확인 *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="새 비밀번호를 다시 입력하세요"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${errors.confirmPassword ? '#dc3545' : '#ddd'}`,
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: isLoading ? '#f8f9fa' : 'white'
              }}
            />
            <ErrorMessage field="confirmPassword" />
          </div>

          {/* 테스트용 자동 입력 버튼 */}
          <button
            type="button"
            onClick={handleTestFill}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            🚀 테스트용 자동 입력
          </button>

          {/* 비밀번호 변경 버튼 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backgroundColor: isLoading ? '#6c757d' : '#007bff',
                color: 'white',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? '변경중...' : '비밀번호 변경'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ChangePassword;