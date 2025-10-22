// src/pages/OtherUserProfile.jsx
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BadgeModal from './BadgeModal';

// 뱃지 이미지들을 import
import badge1 from '../../assets/badge/1_USER_SIGNUP.png';
import badge2 from '../../assets/badge/2_REVIEW_WRITE_COUNT_1.png';
import badge3 from '../../assets/badge/3_COMMENT_WRITE_COUNT_1.png';
import badge4 from '../../assets/badge/4_REVIEW_WRITE_COUNT_10.png';
import badge5 from '../../assets/badge/5_MOVIE_LIKE_COUNT_20.png';
import badge6 from '../../assets/badge/6_USER_FOLLOWING_COUNT_1.png';
import badge7 from '../../assets/badge/7_REVIEW_LIKE_RECEIVED_COUNT_10.png';
import badge8 from '../../assets/badge/8_USER_FOLLOWER_COUNT_1.png';

import title_badge from '../../assets/title_badge.png';

const OtherUserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 모바일 체크
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

    // 창 크기 변경 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1200);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 팔로우 관련 state 추가
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [showUnfollowModal, setShowUnfollowModal] = useState(false);

    // 뱃지 모달 관련 state 추가
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 뱃지 클릭 핸들러 추가
    const handleBadgeClick = (badge) => {
        setSelectedBadge(badge);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBadge(null);
    };

    // 뱃지 이름과 이미지 매핑
    const badgeImageMap = {
        '새로운 여정의 시작': badge1,
        '첫 번째 감상평': badge2,
        '첫 마디': badge3,
        '성실한 기록가': badge4,
        '취향 탐색가': badge5,
        '첫 팔로우': badge6,
        '모두의 공감': badge7,
        '첫 번째 팔로워': badge8
    };

    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    const fetchOtherUserProfile = async () => {
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                setError('로그인이 필요합니다.');
                return;
            }

            const headers = {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${userId}/profile`, {
                method: 'GET',
                headers: headers
            });

            console.log('📡 다른 사용자 프로필 API 응답 상태:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ 다른 사용자 프로필 API 에러 응답:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}: 프로필을 불러올 수 없습니다.`);
            }

            const data = await response.json();
            console.log('✅ 다른 사용자 프로필 조회 성공:', data);
            setProfileData(data);

            // 팔로우 상태 설정
            if (data.followedByMe !== undefined) {
                setIsFollowing(data.followedByMe);
            }
        } catch (err) {
            console.error('❌ 다른 사용자 프로필 조회 실패:', err);
            setError(err.message || '프로필을 불러오는 중 오류가 발생했습니다.');
        }
    };

    const fetchOtherUserReviews = async () => {
        try {
            const authToken = getAuthToken();
            if (!authToken) return;

            const headers = {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${userId}/reviews`, {
                method: 'GET',
                headers: headers
            });

            console.log('📡 다른 사용자 리뷰 API 응답 상태:', response.status);

            if (!response.ok) {
                console.warn('다른 사용자 리뷰 정보를 불러오는 데 실패했습니다.');
                return;
            }

            const data = await response.json();
            console.log('✅ 다른 사용자 리뷰 조회 성공:', data);
            const count = data.reviews ? data.reviews.length : 0;
            console.log('🔢 다른 사용자 리뷰 개수:', count);
            setReviewCount(count);
        } catch (err) {
            console.error('❌ 다른 사용자 리뷰 조회 실패:', err);
        }
    };

    const fetchOtherUserBadges = async () => {
        try {
            const authToken = getAuthToken();
            if (!authToken) return;

            const headers = {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${userId}/badges`, {
                method: 'GET',
                headers: headers
            });

            console.log('📡 다른 사용자 뱃지 API 응답 상태:', response.status);

            if (!response.ok) {
                console.warn('다른 사용자 뱃지 정보를 불러오는 데 실패했습니다.');
                return;
            }

            const data = await response.json();
            console.log('✅ 다른 사용자 뱃지 조회 성공:', data);
            setBadges(data || []);
        } catch (err) {
            console.error('❌ 다른 사용자 뱃지 조회 실패:', err);
        }
    };

    // 팔로우 관련 함수들 추가
    const handleFollow = async () => {
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!userId) return;

        setFollowLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsFollowing(true);
                // 팔로워 수 업데이트
                setProfileData(prev => prev ? {
                    ...prev,
                    followerCount: (prev.followerCount || 0) + 1,
                    followedByMe: true
                } : null);
            } else {
                alert('팔로우에 실패했습니다.');
            }
        } catch (err) {
            console.error('팔로우 오류:', err);
            alert('팔로우에 실패했습니다.');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        if (!userId) return;

        setFollowLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${userId}/unfollow`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsFollowing(false);
                setShowUnfollowModal(false);
                // 팔로워 수 업데이트
                setProfileData(prev => prev ? {
                    ...prev,
                    followerCount: Math.max((prev.followerCount || 0) - 1, 0),
                    followedByMe: false
                } : null);
            } else {
                alert('언팔로우에 실패했습니다.');
            }
        } catch (err) {
            console.error('언팔로우 오류:', err);
            alert('언팔로우에 실패했습니다.');
        } finally {
            setFollowLoading(false);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchOtherUserProfile(), fetchOtherUserReviews(), fetchOtherUserBadges()]);
            setLoading(false);
        };

        if (userId) {
            fetchAll();
        }
    }, [userId]);

    const handleOtherUserReviewClick = () => {
        navigate(`/users/${userId}/reviews`, {
            state: {
                userNickname: profileData?.nickname || profileData?.username || '사용자',
                userProfileImageUrl: profileData?.profileImageUrl || ''
            }
        });
    };

    if (loading) {
        return (
            <div style={{ padding: isMobile ? '1rem' : '1.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                프로필을 불러오는 중...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: isMobile ? '1rem' : '1.5rem', textAlign: 'center' }}>
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    오류가 발생했습니다: {error}
                </div>
                <button
                    onClick={() => {
                        setLoading(true);
                        fetchOtherUserProfile();
                        fetchOtherUserReviews();
                        fetchOtherUserBadges();
                        setLoading(false);
                    }}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    다시 시도
                </button>
            </div>
        );
    }

    const stats = [
        {
            number: reviewCount,
            label: '리뷰',
            onClick: handleOtherUserReviewClick,
        },
        {
            number: profileData?.followerCount || 0,
            label: '팔로워',
            // onClick 제거됨
        },
        {
            number: profileData?.followingCount || 0,
            label: '팔로잉',
            // onClick 제거됨
        },
    ];

    return (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box', position: 'relative' }}>
            {/* 언팔로우 확인 모달 */}
            {showUnfollowModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>
                            팔로우 취소
                        </h3>
                        <p style={{ margin: '0 0 24px', color: '#666', lineHeight: '1.5' }}>
                            {profileData?.nickname || '사용자'}님의 팔로우를 정말 취소하시겠습니까?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowUnfollowModal(false)}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}



                            >
                                취소
                            </button>
                            <button
                                onClick={handleUnfollow}
                                disabled={followLoading}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    cursor: followLoading ? 'not-allowed' : 'pointer',
                                    opacity: followLoading ? 0.7 : 1
                                }}
                            >
                                {followLoading ? '처리중...' : '확인'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    position: 'absolute',
                    top: isMobile ? '1rem' : '1.5rem',
                    left: isMobile ? '1rem' : '1.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#555',
                    fontSize: isMobile ? '14px' : '16px',
                    cursor: 'pointer',
                    zIndex: 1
                }}
            >
                ← 뒤로가기
            </button>

            {/* 프로필 이미지 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '4rem' }}>
                <div style={{
                    width: isMobile ? 80 : 96,
                    height: isMobile ? 80 : 96,
                    backgroundColor: '#ccc',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}>
                    {profileData?.profileImageUrl ? (
                        <img
                            src={profileData.profileImageUrl}
                            alt="프로필 이미지"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : (
                        <User style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, color: '#666' }} />
                    )}
                    <div style={{ display: 'none', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <User style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, color: '#666' }} />
                    </div>
                </div>
            </div>

            {/* 사용자 이름 + 소개 + 팔로우 버튼 */}
            <div style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: isMobile ? '1.1rem' : '1.2rem' }}>
                    {profileData?.nickname || profileData?.username || '사용자'}
                </p>
                <p style={{
                    margin: 0,
                    marginTop: '0.45rem',
                    color: '#666',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: isMobile ? '280px' : '300px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    fontSize: isMobile ? '14px' : '16px'
                }}>
                    {profileData?.description || '소개글이 없습니다.'}
                </p>

                {/* 팔로우 버튼을 프로필 오른쪽에 위치 */}
                <div style={{
                    position: 'absolute',
                    right: '0',
                    top: '30%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={isFollowing ? () => setShowUnfollowModal(true) : handleFollow}
                        disabled={followLoading}
                        style={{
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            border: isFollowing ? '1px solid #ddd' : '1px solid #007bff',
                            borderRadius: '16px',
                            backgroundColor: isFollowing ? '#f8f9fa' : '#007bff',
                            color: isFollowing ? '#666' : 'white',
                            fontSize: isMobile ? '12px' : '14px',
                            marginTop: isMobile ? '-0.2em' : '-1rem',
                            marginRight: isMobile ? '1.8rem' : '11rem',
                            fontWeight: '500',
                            cursor: followLoading ? 'not-allowed' : 'pointer',
                            opacity: followLoading ? 0.7 : 1,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {followLoading ? '처리중...' : isFollowing ? '팔로잉' : '팔로우'}
                    </button>
                </div>
            </div>

            {/* 숫자 정보 */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem 0' }}>
                {stats.map((item, idx) => (
                    <div
                        key={idx}
                        role={item.onClick ? "button" : undefined}
                        tabIndex={item.onClick ? 0 : undefined}
                        onClick={item.onClick}
                        onKeyPress={item.onClick ? (e) => e.key === 'Enter' && item.onClick() : undefined}
                        style={{
                            cursor: item.onClick ? 'pointer' : 'default',
                            textAlign: 'center',
                            flex: '1 0 33%'
                        }}
                    >
                        <p style={{ margin: 0, color: idx === 0 ? '#000' : '#666', fontWeight: 'bold', fontSize: isMobile ? '19px' : '18px' }}>{item.number}</p>
                        <p style={{ margin: 0, color: idx === 0 ? '#666' : '#666', fontSize: isMobile ? '14px' : '16px' }}>{item.label}</p>
                    </div>
                ))}
            </div>

            {/* 감상 뱃지 */}
            <div style={{ margin: '2rem 0 0.5rem', display: 'flex', alignItems: 'center' }}>
                <h3 style={{
                    margin: 0,
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: isMobile ? '8px' : '8px',
                    marginTop: '2rem',

                }}>
                    보유 감상 뱃지
                </h3>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(5, 1fr)' : 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: isMobile ? '8px' : '12px',
                marginBottom: '1rem',
            }}>
                {badges.length > 0 ? (
                    badges.map((badge, idx) => {
                        const badgeImage = badgeImageMap[badge.name];
                        return (
                            <div
                                key={idx}
                                onClick={() => handleBadgeClick(badge)}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    minWidth: isMobile ? '50px' : '80px'
                                }}
                                title={`${badge.name} - ${badge.description}`}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                {badgeImage ? (
                                    <img
                                        src={badgeImage}
                                        alt={badge.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#e0e0e0',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: isMobile ? '10px' : '12px',
                                        color: '#666'
                                    }}>
                                        {badge.name.slice(0, 2)}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: isMobile ? '1.5rem' : '2rem', fontSize: isMobile ? '14px' : '16px' }}>
                        획득한 뱃지가 없습니다.
                    </div>
                )}
            </div>

            {/* 뱃지 모달 추가 */}
            <BadgeModal
                badge={selectedBadge}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            {/* 개발자 정보
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                color: '#666'
            }}>
                💡 <strong>개발 정보:</strong>
                사용자 ID: {userId},
                프로필 로딩 상태: {loading ? 'Loading' : 'Complete'},
                에러 상태: {error ? 'Error' : 'None'},
                프로필 데이터: {profileData ? 'Loaded' : 'Empty'},
                리뷰 수: {reviewCount},
                팔로우 상태: {isFollowing ? 'Following' : 'Not Following'},
                뱃지 수: {badges.length},
                모바일: {isMobile ? 'Yes' : 'No'}
            </div> */}
        </div>
    );
};

export default OtherUserProfile;