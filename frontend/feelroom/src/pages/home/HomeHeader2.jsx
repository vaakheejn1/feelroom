// HomeHeader2.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/title_header.png';
import logo_white from '../../assets/title_header_white.png';
import logo_white_wide from '../../assets/title_header_white_wide.png';
import settingicon from '../../assets/settingicon.png';
import notificationOnIcon from '../../assets/notification_on.png';
import notificationOffIcon from '../../assets/notification_on.png';
import settingicon_white from '../../assets/settingicon_white.png';
import notificationOnIcon_white from '../../assets/notification_on_white.png';
import notificationOffIcon_white from '../../assets/notification_on_white.png';

const HomeHeader2 = ({ scrollY }) => {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 1200);
    const [hasUnreadNotifications] = useState(false);

    // 화면 리사이즈 시 반응
    useEffect(() => {
        const handleResize = () => setIsNarrowScreen(window.innerWidth < 1200);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const headerHeight = scrollY > 50 ? isNarrowScreen ? '2.8rem' : '3rem' : '4rem';
    const logoHeight = scrollY > 50 ? isNarrowScreen ? '1.7rem' : '2rem' : '3rem';

    const handleLogoClick = () => navigate('/home');
    const handleNotificationClick = () => navigate('/notifications');

    return (
        <header
            style={{
                position: 'fixed',

                left: isNarrowScreen ? 0 : '8px', // 데스크톱에서만 왼쪽 여백
                right: isNarrowScreen ? 0 : '10px', // 데스크톱에서만 오른쪽 여백
                width: isNarrowScreen ? '100%' : 'calc(100% - 16px)', // 데스크톱에서 양옆 여백만큼 빼기
                height: headerHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 1rem',
                background: isNarrowScreen
                    ? 'linear-gradient(to left, #c31b1bff, #971313ff 100%, rgba(134, 23, 23, 0.3))'
                    : 'linear-gradient(to right, #5c0b0bff 0%,  #780f0fff 10%, #8f1313ff 20%, #a51818ff 30%, #c21818ff 100%, rgba(255,255,255,0.3))',
                borderRadius: isNarrowScreen ? '0' : '18px', // 데스크톱에서만 border-radius 적용
                boxShadow: isNarrowScreen ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.15)', // 데스크톱에서만 그림자 효과
                zIndex: 1000,
                transition: 'height 0.3s ease, top 0.3s ease', // top 변화도 부드럽게
            }}
        >
            <img
                src={isNarrowScreen ? logo_white : logo_white_wide}
                alt="FeelRoom Logo"
                onClick={handleLogoClick}
                style={{
                    height: logoHeight,
                    objectFit: 'contain',
                    cursor: 'pointer',
                    transition: 'height 0.3s ease, opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
            />

            {/* 오른쪽: 알림, 프로필, 설정 */}
            <div
                style={{
                    position: 'absolute',
                    right: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                }}
            >
                {/* 프로필 이미지는 항상 보여줌 */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={localStorage.getItem('profileImageUrl') || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNCAzNCI+PHJlY3Qgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0IiBmaWxsPSIjZGRkZGRkIi8+PC9zdmc+'}
                        alt="프로필"
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        style={{
                            width: isNarrowScreen ? '30px' : '34px',
                            height: isNarrowScreen ? '30px' : '34px',
                            marginTop: isNarrowScreen ? '6px' : '3px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: isNarrowScreen ? '0.5px solid #000000ff' : '0.5px solid #ffffffff',
                            transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    />

                    {showProfileDropdown && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                zIndex: 1000,
                                marginTop: '5px',
                                minWidth: '120px'
                            }}
                        >
                            <div
                                onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}
                                style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                내 프로필
                            </div>
                            <div
                                onClick={() => { navigate('/user-activity'); setShowProfileDropdown(false); }}
                                style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '14px' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                내 활동
                            </div>
                        </div>
                    )}
                </div>

                {/* 알림 & 설정 아이콘은 1200 이상에서만 보여줌 */}
                {!isNarrowScreen && (
                    <>
                        <img
                            src={hasUnreadNotifications ? notificationOnIcon_white : notificationOffIcon_white}
                            alt="Notifications"
                            onClick={handleNotificationClick}
                            style={{
                                width: '34px',
                                height: '34px',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        />

                        <img
                            src={settingicon_white}
                            alt="설정"
                            onClick={() => navigate('/profile/settings')}
                            style={{
                                marginTop: isNarrowScreen ? '0px' : '-2px',
                                width: '34px',
                                height: '34px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        />
                    </>
                )}
            </div>
        </header>
    );
};

export default HomeHeader2;