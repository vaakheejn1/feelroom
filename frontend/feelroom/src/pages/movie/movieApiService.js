// movieApiService.js - 영화 관련 API 호출을 담당하는 서비스

// 토큰 가져오기 함수 - 일관된 처리
export const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('⚠️ authToken이 없습니다.');
        return null;
    }
    // Bearer prefix가 이미 있으면 그대로 사용, 없으면 추가
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

// 영화 상세정보 API 호출
export const fetchMovieDetail = async (movieId) => {
    const authToken = getAuthToken();
    if (!authToken) {
        throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${movieId}`, {
        method: 'GET',
        headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
        }
    });

    // console.log('📡 영화 상세정보 API 응답 상태:', response.status);

    if (response.ok) {
        const data = await response.json();
        // console.log('✅ 영화 상세정보 조회 성공:', data);
        return data;
    } else if (response.status === 401) {
        throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
    } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ 영화 정보 조회 실패:', errorData);
        throw new Error(errorData.message || '영화 정보를 불러오는데 실패했습니다.');
    }
};

// 영화 좋아요 토글 API 호출
export const toggleMovieLike = async (movieId) => {
    const authToken = getAuthToken();
    if (!authToken) {
        throw new Error('로그인이 필요합니다.');
    }

    // console.log('💖 좋아요 토글 요청 시작:', { movieId });

    const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${movieId}/like`, {
        method: 'PUT',
        headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
        }
    });

    // console.log('📡 좋아요 토글 API 응답 상태:', response.status);

    if (response.ok) {
        const data = await response.json();
        // console.log('✅ 좋아요 토글 성공:', data);
        return data;
    } else if (response.status === 401) {
        throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
    } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ 좋아요 토글 실패:', errorData);
        throw new Error(errorData.message || '좋아요 처리에 실패했습니다.');
    }
};