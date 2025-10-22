// HomeHeader.jsx
import React from 'react';
import { Search } from 'lucide-react';
import logo from '../../assets/logo4.png';
import settingicon from '../../assets/settingicon.png';
import notificationOnIcon from '../../assets/notification_on.png';
import notificationOffIcon from '../../assets/notification_off.png';
import searchBar from '../../assets/search_bar.png'
import OnboardingButton from './OnboardingButton';
import subtitle from '../../assets/home_feed_2_3.png';

export const HomeHeader = ({
    isMobile,
    handleLogoClick,
    showProfileDropdown,
    setShowProfileDropdown,
    navigate,
    hasUnreadNotifications,
    handleNotificationClick
}) => {
    // 1100px 이하에서는 검색창 완전히 숨김
    const isNarrowScreen = window.innerWidth < 1100;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '0.5rem 2rem',
            marginBottom: '0rem',
        }}>
            {/* 왼쪽: 로고와 환영 메시지 */}
            <div style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.5rem' : '1rem',
                marginTop: isMobile ? '-0.5rem' : '0',
                marginLeft: isNarrowScreen ? '-1rem' : (isMobile ? '-0.5rem' : '0'),
                flex: 1, // 남은 공간을 차지하도록 설정
                minWidth: 0 // flexbox 축소 허용
            }}>
                <img
                    src={logo}
                    alt="FeelRoom Logo"
                    onClick={handleLogoClick}
                    style={{
                        height: isNarrowScreen ? '3.2rem' : '5rem',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease, height 0.3s ease',
                        marginTop: isMobile ? '12px' : '15px',
                        flexShrink: 0 // 로고 크기 고정
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                    }}
                />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 'clamp(16px, 4vw, 20px)',
                    color: '#666',
                    fontWeight: 'normal',
                    marginTop: isMobile ? '-1px' : '40px', // 모바일이 아닐 때 더 아래로
                    marginLeft: isMobile ? '12px' : '0',
                    marginRight: '-60px',
                    flexWrap: 'nowrap', // 줄바꿈 방지
                    minWidth: 0 // 축소 가능하도록 설정
                }}>
                    <span style={{
                        whiteSpace: 'nowrap', // 닉네임 줄바꿈 방지
                        overflow: 'hidden',
                        textOverflow: 'ellipsis' // 너무 길면 ... 처리
                    }}>
                        <strong style={{ color: '#007bff' }}>{localStorage.getItem('nickname') || '사용자'}</strong>
                    </span>
                    <img
                        src={subtitle}
                        alt="subtitle"
                        style={{
                            height: isMobile ? '16px' : '21px',
                            marginBottom: isMobile ? '0px' : '-3px',
                            //objectFit: 'contain',
                            //flexShrink: 0 // 서브타이틀 이미지 크기 고정
                        }}
                    />
                </div>
            </div>



            {/* 오른쪽: 설정 아이콘과 알림 아이콘 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isNarrowScreen ? '0.3rem' : '1rem',
                cursor: 'pointer',
                marginRight: isNarrowScreen ? '-0.5rem' : '-0rem',
                marginTop: isMobile ? '0' : '22px',
                flexShrink: 0 // 아이콘들 크기 고정
            }}>
                {/* 검색창 이미지 - 1100px 이하에서는 완전히 숨김 */}
                {!isNarrowScreen && (
                    <div
                        style={{
                            position: 'relative',
                            display: 'inline-block',
                            marginTop: '2px',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/search')}
                    >
                        <img
                            src={searchBar}
                            alt="검색"
                            style={{
                                width: 'clamp(140px, 20vw, 180px)',
                                height: '2.25rem',

                            }}
                        />
                    </div>
                )}

                {/* 프로필 이미지와 드롭다운 */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '2px' }}>
                    <img
                        src={localStorage.getItem('profileImageUrl') || localStorage.getItem('profileImage') || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNCAzNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNyIgY3k9IjE3IiByPSIxNyIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjE3IiBjeT0iMTQiIHI9IjUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMjYgMjhjMC01LjUyNC00LjQ3Ni0xMC0xMC0xMHMtMTAgNC40NzYtMTAgMTAiIGZpbGw9IiM2Yzc1N2QiLz48L3N2Zz4='}
                        alt="프로필"
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNCAzNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNyIgY3k9IjE3IiByPSIxNyIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjE3IiBjeT0iMTQiIHI9IjUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMjYgMjhjMC01LjUyNC00LjQ3Ni0xMC0xMC0xMHMtMTAgNC40NzYtMTAgMTAiIGZpbGw9IiM2Yzc1N2QiLz48L3N2Zz4=';
                        }}
                        style={{
                            width: isMobile ? '28px' : '34px',
                            height: isMobile ? '28px' : '34px',
                            marginTop: isMobile ? '0px' : '0px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: isMobile ? '1px solid #191919ff' : '2.3px solid #333333ff',
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

                    {/* 드롭다운 메뉴 */}
                    {showProfileDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: '-70px',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            zIndex: 1000,
                            minWidth: '100px',
                            marginTop: '5px',
                        }} data-profile-dropdown>
                            <div
                                onClick={() => {
                                    navigate('/profile');
                                    setShowProfileDropdown(false);
                                }}
                                style={{
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    paddingLeft: '10px',
                                    color: '#6b6a6aff',
                                    borderBottom: '1px solid #f0f0f0',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                }}
                            >
                                내 프로필
                            </div>
                            <div
                                onClick={() => {
                                    navigate('/user-activity');
                                    setShowProfileDropdown(false);
                                }}
                                style={{
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#6b6a6aff',
                                    paddingLeft: '10px',
                                    borderBottom: isMobile ? '1px solid #f0f0f0' : 'none',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                }}
                            >
                                내 활동
                            </div>
                            {isMobile && (<div
                                onClick={() => {
                                    navigate('/onboarding');
                                    setShowProfileDropdown(false);
                                }}
                                style={{
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    paddingLeft: '10px',
                                    color: '#6b6a6aff',
                                    borderBottom: '1px solid #f0f0f0',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                }}
                            >
                                테스트온보딩
                            </div>)}

                            {isMobile && (
                                <div
                                    onClick={() => {
                                        localStorage.clear();
                                        navigate('/');
                                        setShowProfileDropdown(false);
                                    }}
                                    style={{
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#d32f2f',
                                        paddingLeft: '10px',
                                        borderRadius: '0 0 8px 8px',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#ffebee';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'white';
                                    }}
                                >
                                    로그아웃
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 알림 아이콘 */}
                <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    minHeight: '32px',
                    marginTop: isMobile ? '-3px' : '-1px',
                    minWidth: '34px'
                }}>
                    {hasUnreadNotifications && !isMobile && (
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#007bff',
                            marginTop: '-1.4rem',
                            color: 'white',
                            padding: '2px 5px',
                            borderRadius: '8px',
                            fontSize: 'clamp(10px, 2.5vw, 12px)',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                            display: 'inline-block',  // 🔥 추가: 배경색이 글자 영역만 차지하게
                            maxWidth: '90vw',        // 🔥 추가: 화면 밖으로 나가지 않게
                            textAlign: 'center'
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
                            marginTop: '5px',
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
                    size={28}
                    color="#666"
                    onClick={() => navigate('/profile/settings')}
                    style={{
                        transition: 'color 0.2s ease',
                        cursor: 'pointer',
                        width: isMobile ? '30px' : '34px',
                        height: isMobile ? '30px' : '34px',
                        marginTop: isMobile ? '-4px' : '0px',
                        marginLeft: isMobile ? '2px' : '-15px',
                        marginRight: isMobile ? '-12px' : '30px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                />
            </div>
        </div>
    );
};