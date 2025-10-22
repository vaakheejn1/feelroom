import React, { useState, useEffect } from 'react';
import notificationOnIcon from '../../assets/notification_on.png';
import notificationOffIcon from '../../assets/notification_on.png';
import settingicon from '../../assets/settingicon.png';

const SearchHeader = ({
    logo,
    onLogoClick,
    onNotificationClick,
    onSettingsClick
}) => {
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const isMobile = window.innerWidth < 1200;

    // 알림 상태 확인 API 호출
    const checkUnreadNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/users/me/notifications/exists-unread', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // console.log('알림 상태 API 응답:', data);
                // console.log('알림 존재 여부:', data.exists);
                setHasUnreadNotifications(data.exists);
            } else {
                console.error('알림 상태 API 호출 실패:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('알림 상태 확인 실패:', error);
        }
    };

    useEffect(() => {
        checkUnreadNotifications();
    }, []);

    const handleNotificationClick = () => {
        if (onNotificationClick) {
            onNotificationClick();
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 2rem',
            marginTop: '0rem',
            marginBottom: '0rem'
        }}>
            {/* 왼쪽: 로고 */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'left' }}>
                <img
                    src={logo}
                    alt="FeelRoom Logo"
                    onClick={onLogoClick}
                    style={{
                        height: isMobile ? '3.0rem' : '3.5rem',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                    }}
                />
            </div>

            {/* 오른쪽: 알림, 설정 아이콘 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>

                {/* 알림 아이콘 */}
                <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    minHeight: '32px',
                    marginTop: isMobile ? '-6px' : '-1px',
                    minWidth: '34px'
                }}>
                    {hasUnreadNotifications && !isMobile && (
                        <div style={{
                            position: 'absolute',
                            top: '-35px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#007bff',
                            marginTop: '0.7rem',
                            color: 'white',
                            padding: '2px 5px',
                            borderRadius: '8px',
                            fontSize: 'clamp(10px, 2.5vw, 12px)',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            zIndex: 10
                        }}>
                            새 알림이 도착했어요!
                        </div>
                    )}

                    <img
                        src={hasUnreadNotifications ? notificationOnIcon : notificationOffIcon}
                        alt="알림"
                        onClick={handleNotificationClick}
                        style={{
                            width: isMobile ? '30px' : '34px',
                            height: isMobile ? '30px' : '34px',
                            marginTop: '6px',
                            cursor: 'pointer',
                            marginLeft: isMobile ? '4px' : '-5px',
                            transition: 'opacity 0.2s ease',
                            filter: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                        }}
                    />
                </div>

                {/* 설정 아이콘 */}
                <img
                    src={settingicon}
                    alt="설정"
                    onClick={onSettingsClick}
                    style={{
                        width: isMobile ? '30px' : '34px',
                        height: isMobile ? '30px' : '34px',
                        cursor: 'pointer',
                        marginLeft: isMobile ? '2px' : '-10px',
                        marginRight: isMobile ? '-12px' : '5px',
                        marginTop: isMobile ? '-4px' : '0px',
                        transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                />
            </div>
        </div>
    );
};

export default SearchHeader;