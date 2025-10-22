import { useState } from 'react';
import logo from '../../../assets/logo4.png'
import {
    checkEmailAvailability,
    sendEmailVerificationCode,
    verifyEmailCode,
    validateEmail
} from '../../../api/auth.js';

const EmailVerification = ({
    formData,
    setFormData,
    errors,
    setFieldError,
    clearFieldError,
    isLoading,
    setIsLoading,
    isMobile = false, // 모바일 여부를 props로 받아오거나 기본값 설정
    isEmailVerified,
    setIsEmailVerified
}) => {
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [timer, setTimer] = useState(0);

    const handleInputChange = (e) => {
        const value = e.target.value;
        const fieldName = e.target.name;

        // 이메일 변경시 인증 상태 초기화
        if (fieldName === 'email') {
            setIsEmailVerified(false);
            setIsCodeSent(false);
            clearFieldError('email');
            if (value && !validateEmail(value)) {
                setFieldError('email', '올바른 이메일 형식을 입력해주세요.');
            }
        }

        setFormData({
            ...formData,
            [fieldName]: value
        });
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

    // 이메일 중복 확인 및 인증코드 발송
    const sendVerificationCode = async () => {
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
            // Step 1: 이메일 중복 확인
            const checkResult = await checkEmailAvailability(formData.email);

            if (!checkResult.available) {
                setFieldError('email', '이미 사용 중인 이메일입니다.');
                return;
            }

            // Step 2: 인증코드 발송
            const sendResult = await sendEmailVerificationCode(formData.email);

            setIsCodeSent(true);
            setTimer(300); // 5분 타이머
            startTimer();
            clearFieldError('email');

        } catch (error) {
            console.error('인증코드 발송 오류:', error);
            setFieldError('email', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 이메일 인증 확인
    const verifyCode = async () => {
        if (!formData.verificationCode) {
            setFieldError('verificationCode', '인증코드를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyEmailCode(formData.email, formData.verificationCode);

            setIsEmailVerified(true);
            clearFieldError('verificationCode');

        } catch (error) {
            console.error('인증 확인 오류:', error);
            setFieldError('verificationCode', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    // 입력 필드 공통 스타일
    const inputStyle = {
        padding: '10px 16px',
        border: '0.5px solid #d18e8eff',
        borderRadius: '10px',
        fontSize: '14px',
        color: '#333333',
        boxSizing: 'border-box'
    };

    // 버튼 공통 스타일
    const buttonStyle = {
        padding: '10px 16px',
        border: 'none',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.3s ease'
    };

    // 플레이스홀더 스타일
    const placeholderStyle = `
        input::placeholder {
            color: #d18e8eff !important;
        }
    `;

    return (
        <>
            <style>
                {placeholderStyle}
            </style>

            {/* 로고 섹션 */}
            <div style={{
                textAlign: 'left',
                marginBottom: isMobile ? '20px' : '20px',
                marginTop: isMobile ? '-10px' : '-20px'
            }}>
                <img
                    src={logo}
                    alt="logo"
                    style={{
                        height: isMobile ? '50px' : '50px',
                        filter: 'drop-shadow(2px 3px 6px rgba(255,0,0,0.4))'
                    }}
                />
            </div>

            {/* 이메일 */}
            <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    이메일 *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="email"
                        name="email"
                        placeholder="이메일을 입력하세요"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isEmailVerified}
                        style={{
                            ...inputStyle,
                            flex: 1,
                            backgroundColor: isEmailVerified ? '#f8f9fa' : 'white',
                            border: `0.5px solid ${errors.email ? '#dc3545' : '#d18e8eff'}`
                        }}
                    />
                    <button
                        type="button"
                        onClick={sendVerificationCode}
                        disabled={isLoading || isEmailVerified}
                        style={{
                            ...buttonStyle,
                            background: isEmailVerified ? 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)' : 'linear-gradient(135deg, #1d69e5ff 0%, #1d69e5ff 100%)',
                            color: 'white',
                            opacity: isLoading ? 0.6 : 1
                        }}
                    >
                        {isEmailVerified ? '인증완료' : isCodeSent ? '재발송' : '인증코드 발송'}
                    </button>
                </div>
                <ErrorMessage field="email" />
            </div>

            {/* 인증코드 */}
            {isCodeSent && !isEmailVerified && (
                <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                        인증코드 * {timer > 0 && <span style={{ color: '#dc3545' }}>({formatTime(timer)})</span>}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            name="verificationCode"
                            placeholder="인증코드 6자리"
                            value={formData.verificationCode}
                            onChange={handleInputChange}
                            maxLength="6"
                            style={{
                                ...inputStyle,
                                flex: 1,
                                border: `0.5px solid ${errors.verificationCode ? '#dc3545' : '#d18e8eff'}`
                            }}
                        />
                        <button
                            type="button"
                            onClick={verifyCode}
                            disabled={isLoading || timer === 0}
                            style={{
                                ...buttonStyle,
                                background: '#28a745 ',
                                color: 'white',
                                opacity: (isLoading || timer === 0) ? 0.6 : 1
                            }}
                        >
                            인증확인
                        </button>
                    </div>
                    <ErrorMessage field="verificationCode" />
                    {isCodeSent && !isEmailVerified && !errors.verificationCode && (
                        <div style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#d1ecf1',
                            color: '#0c5460',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            ✓ 인증코드가 이메일로 발송되었습니다.
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export { EmailVerification };