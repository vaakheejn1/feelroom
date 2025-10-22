import { useState } from 'react';
import logo from '../../../assets/logo4.png'
import {
    checkUsernameAvailability,
    validatePassword
} from '../../../api/auth.js';

const UserInputFields = ({
    formData,
    setFormData,
    errors,
    setFieldError,
    clearFieldError,
    isLoading,
    setIsLoading,
    isMobile = false, // 모바일 여부를 props로 받아오거나 기본값 설정
    isUserIdChecked,
    setIsUserIdChecked
}) => {

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

    const handleInputChange = (e) => {
        let value = e.target.value;
        const fieldName = e.target.name;

        // 비밀번호 실시간 유효성 검사
        if (fieldName === 'password') {
            if (value && !validatePassword(value)) {
                setFieldError('password', '비밀번호는 8자 이상, 영문/숫자/특수문자 중 2종류 이상을 포함해야 합니다.');
            } else {
                clearFieldError('password');
            }
        }

        // 생년월일 포맷팅 및 검사
        if (fieldName === 'birthDate') {
            value = value.replace(/[^0-9]/g, '');
            if (value.length > 8) {
                value = value.slice(0, 8);
            }
            if (value.length >= 4) {
                value = value.slice(0, 4) + '-' +
                    (value.length >= 6 ? value.slice(4, 6) + '-' + value.slice(6, 8) : value.slice(4));
            }

            if (value.length === 10) {
                if (!validateBirthDate(value)) {
                    setFieldError('birthDate', '올바른 생년월일을 입력해주세요. (예: 1995-12-25)');
                } else {
                    clearFieldError('birthDate');
                }
            } else {
                clearFieldError('birthDate');
            }
        }

        // 아이디 변경시 중복확인 상태 초기화
        if (fieldName === 'userId') {
            setIsUserIdChecked(false);
            clearFieldError('userId');
        }

        // 비밀번호 확인 실시간 검사
        if (fieldName === 'confirmPassword' || (fieldName === 'password' && formData.confirmPassword)) {
            const password = fieldName === 'password' ? value : formData.password;
            const confirmPassword = fieldName === 'confirmPassword' ? value : formData.confirmPassword;

            if (password && confirmPassword && password !== confirmPassword) {
                setFieldError('confirmPassword', '비밀번호가 일치하지 않습니다.');
            } else {
                clearFieldError('confirmPassword');
            }
        }

        setFormData({
            ...formData,
            [fieldName]: value
        });
    };

    // 아이디 중복 확인
    const checkUserId = async () => {
        if (!formData.userId) {
            setFieldError('userId', '아이디를 입력해주세요.');
            return;
        }

        if (formData.userId.length < 4) {
            setFieldError('userId', '아이디는 최소 4자 이상이어야 합니다.');
            return;
        }

        const idRegex = /^[a-zA-Z0-9_]+$/;
        if (!idRegex.test(formData.userId)) {
            setFieldError('userId', '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await checkUsernameAvailability(formData.userId);

            if (!result.available) {
                setFieldError('userId', '이미 사용중인 아이디입니다.');
                setIsUserIdChecked(false);
            } else {
                setIsUserIdChecked(true);
                clearFieldError('userId');
            }

        } catch (error) {
            console.error('아이디 중복 확인 오류:', error);
            setFieldError('userId', error.message);
            setIsUserIdChecked(false);
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

    // 입력 필드 공통 스타일
    const inputStyle = {
        width: '100%',
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
        <div>
            <style>
                {placeholderStyle}
            </style>

            {/* 아이디 */}
            <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    아이디 *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        name="userId"
                        placeholder="아이디 (4-20자, 영문/숫자/언더스코어)"
                        value={formData.userId}
                        onChange={handleInputChange}
                        required
                        minLength="4"
                        maxLength="20"
                        disabled={isUserIdChecked}
                        style={{
                            ...inputStyle,
                            flex: 1,
                            backgroundColor: isUserIdChecked ? '#f8f9fa' : 'white',
                            border: `0.5px solid ${errors.userId ? '#dc3545' : '#d18e8eff'}`
                        }}
                    />
                    <button
                        type="button"
                        onClick={checkUserId}
                        disabled={isLoading || isUserIdChecked || !formData.userId}
                        style={{
                            ...buttonStyle,
                            background: isUserIdChecked ? 'linear-gradient(135deg, #28a745 0%, #28a745 100%)' : 'linear-gradient(135deg, #1d69e5ff 0%, #1d69e5ff 100%)',
                            color: 'white',
                            opacity: (isLoading || !formData.userId) ? 0.6 : 1
                        }}
                    >
                        {isUserIdChecked ? '확인완료' : '중복확인'}
                    </button>
                </div>
                <ErrorMessage field="userId" />
                {isUserIdChecked && !errors.userId && (
                    <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>
                        ✓ 사용 가능한 아이디입니다.
                    </div>
                )}
            </div>

            {/* 비밀번호 */}
            <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    비밀번호 *
                </label>
                <input
                    type="password"
                    name="password"
                    placeholder="비밀번호 (8자 이상, 영문/숫자/특수문자 중 2종류 이상)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="8"
                    style={{
                        ...inputStyle,
                        border: `0.5px solid ${errors.password ? '#dc3545' : '#d18e8eff'}`
                    }}
                />
                <ErrorMessage field="password" />
            </div>

            {/* 비밀번호 확인 */}
            <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    비밀번호 확인 *
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    style={{
                        ...inputStyle,
                        border: `0.5px solid ${errors.confirmPassword ? '#dc3545' : '#d18e8eff'}`
                    }}
                />
                <ErrorMessage field="confirmPassword" />
            </div>

            {/* 닉네임 */}
            <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    닉네임 *
                </label>
                <input
                    type="text"
                    name="nickname"
                    placeholder="닉네임을 입력하세요"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    required
                    maxLength="20"
                    style={{
                        ...inputStyle,
                        border: `0.5px solid ${errors.nickname ? '#dc3545' : '#d18e8eff'}`
                    }}
                />
                <ErrorMessage field="nickname" />
            </div>

            {/* 생년월일 */}
            <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    생년월일 *
                </label>
                <input
                    type="text"
                    name="birthDate"
                    placeholder="YYYY-MM-DD (예: 1995-12-25)"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    style={{
                        ...inputStyle,
                        border: `0.5px solid ${errors.birthDate ? '#dc3545' : '#d18e8eff'}`
                    }}
                />
                <ErrorMessage field="birthDate" />
            </div>

            {/* 성별 */}
            <div style={{ marginBottom: isMobile ? '15px' : '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    성별 *
                </label>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-start' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#333333' }}>
                        <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={handleInputChange}
                            style={{ marginRight: '8px' }}
                        />
                        남성
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#333333' }}>
                        <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={handleInputChange}
                            style={{ marginRight: '8px' }}
                        />
                        여성
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#333333' }}>
                        <input
                            type="radio"
                            name="gender"
                            value="other"
                            checked={formData.gender === 'other'}
                            onChange={handleInputChange}
                            style={{ marginRight: '8px' }}
                        />
                        선택 안 함
                    </label>
                </div>
                <ErrorMessage field="gender" />
            </div>
        </div>
    );
};

export { UserInputFields };