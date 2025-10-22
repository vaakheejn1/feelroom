import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithUsername } from '../../../api/auth.js';

export const useLoginLogic = (formData, setError) => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 사용자 프로필 정보 조회 함수
    const fetchUserProfile = async (token) => {
        try {
            const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/profile', {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const profileData = await response.json();
                // console.log('✅ 프로필 정보 조회 성공:', profileData);

                // nickname을 로컬스토리지에 저장 (username도 함께 저장)
                if (profileData.nickname) {
                    localStorage.setItem('nickname', profileData.nickname);
                }
                if (profileData.username) {
                    localStorage.setItem('username', profileData.username);
                }
                if (profileData.profileImageUrl) {
                    localStorage.setItem('profileImageUrl', profileData.profileImageUrl);
                }

                // nickname을 로컬스토리지에 저장 (username도 함께 저장)
                if (profileData.nickname) {
                    localStorage.setItem('nickname', profileData.nickname);
                }
                if (profileData.username) {
                    localStorage.setItem('username', profileData.username);
                }
                if (profileData.profileImageUrl) {
                    localStorage.setItem('profileImageUrl', profileData.profileImageUrl);
                }

                return profileData;
            } else {
                console.warn('⚠️ 프로필 정보 조회 실패:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ 프로필 정보 조회 중 오류:', error);
            return null;
        }
    };

    // 임의의 JWT 토큰 생성 함수
    const generateMockJWT = (userId) => {
        // JWT Header (Base64 encoded)
        const header = {
            "alg": "HS256",
            "typ": "JWT"
        };

        // JWT Payload (Base64 encoded)
        const payload = {
            "sub": userId,
            "name": userId,
            "iat": Math.floor(Date.now() / 1000),
            "exp": Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24시간 후 만료
            "iss": "test-app",
            "user_id": Math.floor(Math.random() * 10000)
        };

        // Base64 인코딩 (실제로는 URL-safe base64를 사용해야 하지만 간단히 구현)
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');

        // 시그니처 부분 (실제로는 HMAC-SHA256으로 생성해야 하지만 랜덤 문자열로 대체)
        const signature = Array.from({ length: 43 }, () =>
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
                .charAt(Math.floor(Math.random() * 64))
        ).join('');

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    };

    // API 연동 모드 설정 (테스트 시 false, 실제 연동 시 true)
    const USE_REAL_API = true; // true로 변경하여 실제 API 사용

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (USE_REAL_API) {
                // 실제 API 연동 코드 - loginWithUsername 함수 사용
                const result = await loginWithUsername(formData.userId, formData.password);

                // ✅ 토큰 저장 (API 응답에 따라 access_token 사용)
                if (result.access_token) {
                    // Bearer 접두사가 이미 있는지 확인하고 저장
                    const token = result.access_token.startsWith('Bearer ')
                        ? result.access_token
                        : `Bearer ${result.access_token}`;

                    localStorage.setItem('authToken', token);
                    // console.log('JWT 토큰 저장 완료:', token.substring(0, 20) + '...');

                    // ✅ 프로필 정보 조회 및 저장
                    await fetchUserProfile(token);

                } else {
                    throw new Error('서버에서 토큰을 받지 못했습니다.');
                }

                // ✅ 유저 정보 저장
                if (result.user_id) {
                    localStorage.setItem('userId', result.user_id.toString());
                }

                // ✅ 리프레시 토큰도 있다면 저장
                if (result.refreshToken || result.refresh_token) {
                    localStorage.setItem('refreshToken', result.refreshToken || result.refresh_token);
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.removeItem('aiRecommendedMovies');
                navigate('/home');

            } else {
                // 임시 로그인 처리 (기존 코드)
                if (formData.userId && formData.password) {
                    // 실제와 유사한 JWT 토큰 생성
                    const mockJWT = generateMockJWT(formData.userId);
                    const tokenWithBearer = `Bearer ${mockJWT}`;

                    localStorage.setItem('authToken', tokenWithBearer);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('aiRecommendedMovies');
                    localStorage.setItem('userId', formData.userId);
                    localStorage.setItem('nickname', formData.userId);

                    // console.log('임시 로그인 완료 - 생성된 Mock JWT:', mockJWT.substring(0, 50) + '...');
                    navigate('/home');
                } else {
                    setError('아이디와 비밀번호를 입력해주세요.');
                }
            }
        } catch (err) {
            console.error('로그인 오류:', err);
            setError(err.message || '로그인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 테스트 계정으로 자동 로그인 함수
    const handleTestLogin = async () => {
        setIsLoading(true);
        setError('');

        // 테스트 계정 정보를 폼에 자동 입력
        const testCredentials = {
            userId: 'admin',
            password: 'password'
        };

        try {
            if (USE_REAL_API) {
                // 실제 API로 테스트 계정 로그인
                const result = await loginWithUsername(testCredentials.userId, testCredentials.password);

                // ✅ 토큰 저장 (API 응답에 따라 access_token 사용)
                if (result.access_token) {
                    // Bearer 접두사가 이미 있는지 확인하고 저장
                    const token = result.access_token.startsWith('Bearer ')
                        ? result.access_token
                        : `Bearer ${result.access_token}`;

                    localStorage.setItem('authToken', token);
                    // console.log('테스트 계정 JWT 토큰 저장 완료:', token.substring(0, 20) + '...');

                    // ✅ 프로필 정보 조회 및 저장
                    await fetchUserProfile(token);

                } else {
                    throw new Error('서버에서 토큰을 받지 못했습니다.');
                }

                // ✅ 유저 정보 저장
                if (result.user_id) {
                    localStorage.setItem('userId', result.user_id.toString());
                }

                // ✅ 리프레시 토큰도 있다면 저장
                if (result.refreshToken || result.refresh_token) {
                    localStorage.setItem('refreshToken', result.refreshToken || result.refresh_token);
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.removeItem('aiRecommendedMovies');
                // console.log('테스트 계정 로그인 완료:', testCredentials.userId);
                navigate('/home');

            } else {
                // 임시 로그인 처리 - 실제와 유사한 JWT 토큰 생성
                const mockJWT = generateMockJWT(testCredentials.userId);
                const tokenWithBearer = `Bearer ${mockJWT}`;

                localStorage.setItem('authToken', tokenWithBearer);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', testCredentials.userId);
                localStorage.setItem('nickname', testCredentials.userId);

                // console.log('테스트 계정 임시 로그인 완료:', testCredentials.userId);
                // console.log('생성된 Mock JWT:', mockJWT.substring(0, 50) + '...');
                navigate('/home');
            }
        } catch (err) {
            console.error('테스트 로그인 오류:', err);
            setError(err.message || '테스트 계정 로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 사이드 버튼용 테스트 로그인 함수들
    const handleSideTestLogin1 = async () => {
        setIsLoading(true);
        setError('');

        const testCredentials = {
            userId: 'test1',
            password: 'aaaaaaaa55'
        };

        try {
            if (USE_REAL_API) {
                const result = await loginWithUsername(testCredentials.userId, testCredentials.password);

                if (result.access_token) {
                    const token = result.access_token.startsWith('Bearer ')
                        ? result.access_token
                        : `Bearer ${result.access_token}`;

                    localStorage.setItem('authToken', token);
                    // console.log('사이드 버튼1 JWT 토큰 저장 완료:', token.substring(0, 20) + '...');

                    // ✅ 프로필 정보 조회 및 저장
                    await fetchUserProfile(token);
                } else {
                    throw new Error('서버에서 토큰을 받지 못했습니다.');
                }

                if (result.user_id) {
                    localStorage.setItem('userId', result.user_id.toString());
                }

                if (result.refreshToken || result.refresh_token) {
                    localStorage.setItem('refreshToken', result.refreshToken || result.refresh_token);
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.removeItem('aiRecommendedMovies');
                // console.log('사이드 버튼1 로그인 완료:', testCredentials.userId);
                navigate('/home');

            } else {
                const mockJWT = generateMockJWT(testCredentials.userId);
                const tokenWithBearer = `Bearer ${mockJWT}`;

                localStorage.setItem('authToken', tokenWithBearer);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', testCredentials.userId);
                localStorage.setItem('nickname', testCredentials.userId);

                // console.log('사이드 버튼1 임시 로그인 완료:', testCredentials.userId);
                // console.log('생성된 Mock JWT:', mockJWT.substring(0, 50) + '...');
                navigate('/home');
            }
        } catch (err) {
            console.error('사이드 버튼1 로그인 오류:', err);
            setError(err.message || '사이드 버튼1 로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSideTestLogin2 = async () => {
        setIsLoading(true);
        setError('');

        const testCredentials = {
            userId: 'test2',
            password: 'aaaaaaaa55'
        };

        try {
            if (USE_REAL_API) {
                const result = await loginWithUsername(testCredentials.userId, testCredentials.password);

                if (result.access_token) {
                    const token = result.access_token.startsWith('Bearer ')
                        ? result.access_token
                        : `Bearer ${result.access_token}`;

                    localStorage.setItem('authToken', token);
                    // console.log('사이드 버튼2 JWT 토큰 저장 완료:', token.substring(0, 20) + '...');

                    // ✅ 프로필 정보 조회 및 저장
                    await fetchUserProfile(token);
                } else {
                    throw new Error('서버에서 토큰을 받지 못했습니다.');
                }

                if (result.user_id) {
                    localStorage.setItem('userId', result.user_id.toString());
                }

                if (result.refreshToken || result.refresh_token) {
                    localStorage.setItem('refreshToken', result.refreshToken || result.refresh_token);
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.removeItem('aiRecommendedMovies');
                // console.log('사이드 버튼2 로그인 완료:', testCredentials.userId);
                navigate('/home');

            } else {
                const mockJWT = generateMockJWT(testCredentials.userId);
                const tokenWithBearer = `Bearer ${mockJWT}`;

                localStorage.setItem('authToken', tokenWithBearer);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', testCredentials.userId);
                localStorage.setItem('nickname', testCredentials.userId);

                // console.log('사이드 버튼2 임시 로그인 완료:', testCredentials.userId);
                // console.log('생성된 Mock JWT:', mockJWT.substring(0, 50) + '...');
                navigate('/home');
            }
        } catch (err) {
            console.error('사이드 버튼2 로그인 오류:', err);
            setError(err.message || '사이드 버튼2 로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSideTestLogin3 = async () => {
        setIsLoading(true);
        setError('');

        const testCredentials = {
            userId: 'test3',
            password: 'aaaaaaaa55'
        };

        try {
            if (USE_REAL_API) {
                const result = await loginWithUsername(testCredentials.userId, testCredentials.password);

                if (result.access_token) {
                    const token = result.access_token.startsWith('Bearer ')
                        ? result.access_token
                        : `Bearer ${result.access_token}`;

                    localStorage.setItem('authToken', token);
                    // console.log('사이드 버튼3 JWT 토큰 저장 완료:', token.substring(0, 20) + '...');

                    // ✅ 프로필 정보 조회 및 저장
                    await fetchUserProfile(token);
                } else {
                    throw new Error('서버에서 토큰을 받지 못했습니다.');
                }

                if (result.user_id) {
                    localStorage.setItem('userId', result.user_id.toString());
                }

                if (result.refreshToken || result.refresh_token) {
                    localStorage.setItem('refreshToken', result.refreshToken || result.refresh_token);
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.removeItem('aiRecommendedMovies');
                // console.log('사이드 버튼3 로그인 완료:', testCredentials.userId);
                navigate('/home');

            } else {
                const mockJWT = generateMockJWT(testCredentials.userId);
                const tokenWithBearer = `Bearer ${mockJWT}`;

                localStorage.setItem('authToken', tokenWithBearer);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', testCredentials.userId);
                localStorage.setItem('nickname', testCredentials.userId);

                // console.log('사이드 버튼3 임시 로그인 완료:', testCredentials.userId);
                // console.log('생성된 Mock JWT:', mockJWT.substring(0, 50) + '...');
                navigate('/home');
            }
        } catch (err) {
            console.error('사이드 버튼3 로그인 오류:', err);
            setError(err.message || '사이드 버튼3 로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSideTestLogin4 = async () => {
        setIsLoading(true);
        setError('');

        const testCredentials = {
            userId: 'test4',
            password: 'aaaaaaaa55'
        };

        try {
            if (USE_REAL_API) {
                const result = await loginWithUsername(testCredentials.userId, testCredentials.password);

                if (result.access_token) {
                    const token = result.access_token.startsWith('Bearer ')
                        ? result.access_token
                        : `Bearer ${result.access_token}`;

                    localStorage.setItem('authToken', token);
                    // console.log('사이드 버튼4 JWT 토큰 저장 완료:', token.substring(0, 20) + '...');

                    // ✅ 프로필 정보 조회 및 저장
                    await fetchUserProfile(token);
                } else {
                    throw new Error('서버에서 토큰을 받지 못했습니다.');
                }

                if (result.user_id) {
                    localStorage.setItem('userId', result.user_id.toString());
                }

                if (result.refreshToken || result.refresh_token) {
                    localStorage.setItem('refreshToken', result.refreshToken || result.refresh_token);
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.removeItem('aiRecommendedMovies');
                // console.log('사이드 버튼4 로그인 완료:', testCredentials.userId);
                navigate('/home');

            } else {
                const mockJWT = generateMockJWT(testCredentials.userId);
                const tokenWithBearer = `Bearer ${mockJWT}`;

                localStorage.setItem('authToken', tokenWithBearer);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', testCredentials.userId);
                localStorage.setItem('nickname', testCredentials.userId);

                // console.log('사이드 버튼4 임시 로그인 완료:', testCredentials.userId);
                // console.log('생성된 Mock JWT:', mockJWT.substring(0, 50) + '...');
                navigate('/home');
            }
        } catch (err) {
            console.error('사이드 버튼4 로그인 오류:', err);
            setError(err.message || '사이드 버튼4 로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        handleLogin,
        handleTestLogin,
        handleSideTestLogin1,
        handleSideTestLogin2,
        handleSideTestLogin3,
        handleSideTestLogin4
    };
};