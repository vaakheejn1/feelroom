// useHomeEffects.js
import { useEffect } from 'react';

export const useHomeEffects = ({
    getUserInfo,
    checkUnreadNotifications,
    setUserNickname,
    setUserProfileImageUrl,
    showProfileDropdown,
    setShowProfileDropdown,
    setIsMobile,
    fetchReviews,
    selectedFeedTypes
}) => {
    // 컴포넌트 마운트 시 사용자 정보 설정 및 알림 상태 확인
    useEffect(() => {
        const userInfo = getUserInfo();
        setUserNickname(userInfo.nickname);
        setUserProfileImageUrl(userInfo.profileImageUrl);

        // 알림 상태 확인
        checkUnreadNotifications();
    }, []);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileDropdown && !event.target.closest('[data-profile-dropdown]')) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileDropdown]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1200);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 컴포넌트 마운트 시 첫 페이지 로드
    useEffect(() => {
        fetchReviews(selectedFeedTypes, true);
    }, []); // selectedFeedTypes 의존성 제거

    // 컴포넌트 마운트 시 body와 html의 기본 여백 제거
    useEffect(() => {
        // 모든 기본 여백과 패딩 제거
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.body.style.backgroundColor = '#ffffffff';

        // 상위 컨테이너들의 여백도 제거
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.style.margin = '0';
            rootElement.style.padding = '0';
        }

        return () => {
            // 컴포넌트 언마운트 시 원복하지 않음 (다른 페이지에서도 여백 없이 시작)
        };
    }, []);
};