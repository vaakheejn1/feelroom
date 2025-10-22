import ItemComment from '../../components/notification/ItemComment';
import ItemFollow from '../../components/notification/ItemFollow';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 이미지 import 추가(일단 둘다 no로 임시 설정)
import notificationYesImage from '../../assets/title_notification_no.png';
import notificationNoImage from '../../assets/title_notification_no.png';
import ItemBadge from '../../components/notification/ItemBadge';

const badgeInfoMap = {
    1: { name: '새로운 여정의 시작', description: '회원가입을 축하드립니다!' },
    2: { name: '첫 번째 감상평', description: '첫 리뷰 작성 완료' },
    3: { name: '첫 마디', description: '첫 댓글 작성 완료' },
    4: { name: '성실한 기록가', description: '리뷰 10개 작성 완료' },
    5: { name: '취향 탐색가', description: '영화 좋아요 20개 달성' },
    6: { name: '첫 팔로우', description: '첫 팔로우 시작' },
    7: { name: '모두의 공감', description: '리뷰 좋아요 10개 받음' },
    8: { name: '첫 번째 팔로워', description: '첫 팔로워 획득' }
};

const Notifications = () => {
    const navigate = useNavigate();
    const [isNotificationOn, setIsNotificationOn] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [userProfiles, setUserProfiles] = useState({}); // 사용자 프로필 캐시

    // 토큰 가져오기 함수
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    // 알림 읽음 처리 API 호출
    const markNotificationsAsRead = async (notificationIds) => {
        try {
            const authToken = getAuthToken();
            if (!authToken) return;

            const response = await fetch(
                'https://i13d208.p.ssafy.io/api/v1/users/me/notifications/read',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        notification_ids: notificationIds
                    })
                }
            );

            if (response.ok) {
                // 성공적으로 읽음 처리된 알림들을 상태에서 업데이트
                setNotifications(prev =>
                    prev.map(notification =>
                        notificationIds.includes(notification.notification_id)
                            ? { ...notification, is_read: true }
                            : notification
                    )
                );
            }
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
        }
    };

    // 3. 뱃지 클릭 핸들러 함수 추가
    const handleBadgeClick = async (badgeId, notification) => {
        // console.log('뱃지 클릭:', badgeId);

        // 안읽은 알림인 경우 읽음 처리
        if (!notification.is_read) {
            await markNotificationsAsRead([notification.notification_id]);
        }

        // 프로필 페이지로 이동하면서 뱃지 ID 전달
        navigate('/profile', {
            state: {
                openBadgeModal: true,
                badgeId: badgeId,
                badgeInfo: badgeInfoMap[badgeId]
            }
        });
    };

    // 사용자 프로필 조회 함수
    const fetchUserProfile = async (userId) => {
        // 이미 캐시된 프로필이 있으면 반환
        if (userProfiles[userId]) {
            return userProfiles[userId];
        }

        try {
            const authToken = getAuthToken();
            if (!authToken) return null;

            const response = await fetch(
                `https://i13d208.p.ssafy.io/api/v1/users/${userId}/profile`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                console.warn(`사용자 ${userId} 프로필 조회 실패:`, response.status);
                return null;
            }

            const profileData = await response.json();

            // 캐시에 저장
            setUserProfiles(prev => ({
                ...prev,
                [userId]: profileData
            }));

            return profileData;
        } catch (error) {
            console.error(`사용자 ${userId} 프로필 조회 오류:`, error);
            return null;
        }
    };

    // 알림 목록 가져오기
    const fetchNotifications = async (pageNum = 0, isRefresh = false) => {
        try {
            // console.log(`📖 알림 목록 조회 - 페이지: ${pageNum}`);

            if (isRefresh || pageNum === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            if (isRefresh) {
                setError(null);
            }

            const authToken = getAuthToken();
            if (!authToken) {
                setError('로그인이 필요합니다.');
                return;
            }

            const response = await fetch(
                `https://i13d208.p.ssafy.io/api/v1/users/me/notifications?page=${pageNum}&size=15`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // console.log('📡 API 응답 상태:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API 에러 응답:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}: 알림을 불러올 수 없습니다.`);
            }

            const data = await response.json();
            // console.log('✅ 알림 목록 조회 성공:', data);

            const notificationList = data.notifications || [];

            // 각 알림의 sender 프로필 정보를 미리 가져오기
            const profilePromises = notificationList
                .filter(notification => notification.sender?.user_id)
                .map(notification => fetchUserProfile(notification.sender.user_id));

            // 모든 프로필 정보를 병렬로 가져오기
            await Promise.allSettled(profilePromises);

            if (isRefresh || pageNum === 0) {
                setNotifications(notificationList);
                setPage(0);
            } else {
                setNotifications(prev => [...prev, ...notificationList]);
            }

            setHasMore(data.hasNext || false);
            setPage(pageNum);

        } catch (err) {
            console.error('❌ 알림 목록 조회 실패:', err);
            setError(err.message || '알림을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        fetchNotifications(0, true);
    }, []);

    // 더 불러오기 함수
    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchNotifications(page + 1);
        }
    };

    const handleImageClick = () => {
        setIsNotificationOn(!isNotificationOn);
    };

    // 시간 포맷 함수 개선
    const formatTime = (createdAt) => {
        const now = new Date();
        const notificationTime = new Date(createdAt);
        const diffInMs = now - notificationTime;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        // 24시간 이내면 시간으로 표시
        if (diffInHours < 24) {
            if (diffInHours === 0) {
                const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
                return diffInMinutes <= 0 ? '방금 전' : `${diffInMinutes}분 전`;
            }
            return `${diffInHours}시간 전`;
        }
        // 1~6일 전까지는 일수로 표시
        else if (diffInDays >= 1 && diffInDays <= 6) {
            return `${diffInDays}일 전`;
        }
        // 7일 이후는 날짜 표시 (YYYY.MM.DD 형식)
        else {
            const year = notificationTime.getFullYear();
            const month = String(notificationTime.getMonth() + 1).padStart(2, '0');
            const day = String(notificationTime.getDate()).padStart(2, '0');
            return `${year}.${month}.${day}`;
        }
    };

    // 사용자 프로필로 이동
    const handleUserClick = async (userId, notification) => {
        // 안읽은 알림인 경우 읽음 처리
        if (!notification.is_read) {
            await markNotificationsAsRead([notification.notification_id]);
        }

        if (userId) {
            navigate(`/profile/${userId}`);
        }
    };

    // 리뷰 클릭 핸들러
    const handleReviewClick = async (reviewId, notification) => {
        // 안읽은 알림인 경우 읽음 처리
        if (!notification.is_read) {
            await markNotificationsAsRead([notification.notification_id]);
        }

        if (reviewId) {
            navigate(`/review/${reviewId}`);
        }
    };

    const renderNotificationItem = (notification) => {
        const time = formatTime(notification.created_at);
        const senderProfile = notification.sender ? userProfiles[notification.sender.user_id] : null;

        // 읽지 않은 알림은 빨간색 배경
        const itemStyle = {
            backgroundColor: notification.is_read ? 'white' : '#ffebee', // 더 선명한 빨간색 배경
            borderLeft: notification.is_read ? 'none' : '4px solid #f44336', // 왼쪽 빨간색 선 추가
        };

        if (notification.type === 'FOLLOW') {
            return (
                <div key={notification.notification_id} style={itemStyle}>
                    <ItemFollow
                        text={notification.content}
                        time={time}
                        userProfile={senderProfile}
                        onUserClick={() => handleUserClick(notification.sender?.user_id, notification)}
                    />
                </div>
            );
        } else if (notification.type === 'COMMENT' || notification.type === 'REPLY') {
            return (
                <div key={notification.notification_id} style={itemStyle}>
                    <ItemComment
                        text={notification.content}
                        time={time}
                        userProfile={senderProfile}
                        reviewId={notification.target?.review_id}
                        onUserClick={() => handleUserClick(notification.sender?.user_id, notification)}
                        onReviewClick={(reviewId) => handleReviewClick(reviewId, notification)}
                    />
                </div>
            );
        } else if (notification.type === 'BADGE') {
            return (
                <div key={notification.notification_id} style={itemStyle}>
                    <ItemBadge
                        text={notification.content}
                        time={time}
                        badgeId={notification.target?.badge_id}
                        onBadgeClick={(badgeId) => handleBadgeClick(badgeId, notification)}
                    />
                </div>
            );
        }
        return null;
    };

    // ON 상태 스타일
    const onImageStyle = {
        width: '60px',
        height: '40px',
        objectFit: 'contain',
        borderRadius: '8px',
        cursor: 'pointer'
    };

    // OFF 상태 스타일
    const offImageStyle = {
        width: '60px',
        height: '40px',
        objectFit: 'contain',
        borderRadius: '8px',
        cursor: 'pointer',
    };

    return (
        <div style={{
            padding: '1rem',
            maxWidth: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '0.3rem'
            }}>
                <img
                    src={isNotificationOn ? notificationYesImage : notificationNoImage}
                    alt="상단 이미지"
                    onClick={handleImageClick}
                    style={isNotificationOn ? onImageStyle : offImageStyle}
                />
            </div>

            {/* 로딩 및 에러 처리 */}
            {loading && notifications.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    fontSize: 'clamp(14px, 4vw, 16px)' // 반응형 글자 크기
                }}>
                    알림을 불러오는 중...
                </div>
            )}
            {/* CSS 애니메이션 */}
            <style jsx>{`
       

        /* 가로 스크롤바 완전 제거 */
        * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden !important;
        }
      `}</style>

            {error && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'red',
                    fontSize: 'clamp(14px, 4vw, 16px)' // 반응형 글자 크기
                }}>
                    {error}
                    <br />
                    <button
                        onClick={() => fetchNotifications(0, true)}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: 'clamp(12px, 3vw, 14px)' // 반응형 글자 크기
                        }}
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* 알림이 없는 경우 */}
            {!loading && !error && notifications.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280',
                    fontSize: 'clamp(14px, 4vw, 16px)' // 반응형 글자 크기
                }}>
                    알림이 없습니다.
                </div>
            )}

            {/* 알림 목록 */}
            {notifications.length > 0 && (
                <div style={{
                    marginTop: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {notifications.map(notification => renderNotificationItem(notification))}
                </div>
            )}

            {/* 더 불러오기 버튼 - 개선된 디자인 */}
            {hasMore && !loading && notifications.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        style={{
                            padding: '0.375rem 1rem',
                            background: loadingMore ? '#f9fafb' : 'linear-gradient(135deg, #a30e0eff 0%, #a30e0eff 100%)',
                            border: 'none',
                            borderRadius: '25px',
                            cursor: loadingMore ? 'not-allowed' : 'pointer',
                            fontSize: 'clamp(14px, 3.5vw, 16px)', // 반응형 글자 크기
                            fontWeight: '400',
                            color: loadingMore ? '#6b7280' : 'white',

                            transition: 'all 0.3s ease',
                            transform: loadingMore ? 'none' : 'translateY(0)',
                        }}
                        onMouseEnter={(e) => {
                            if (!loadingMore) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loadingMore) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                    >
                        {loadingMore ? '불러오는 중...' : '더 보기'}
                    </button>
                </div>
            )}

            {/* 모든 알림을 불러온 경우 */}
            {!hasMore && !loading && notifications.length > 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#817f7fff',
                    fontSize: 'clamp(14px, 3.5vw, 16px)', // 반응형 글자 크기
                    fontWeight: '500',

                }}>
                    더 이상 알림이 존재하지 않습니다.
                </div>
            )}

            {/* 추가 로딩 표시 */}
            {loadingMore && (
                <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    color: '#6b7280',
                    fontSize: 'clamp(12px, 3vw, 14px)' // 반응형 글자 크기
                }}>
                    불러오는 중...
                </div>
            )}
        </div>
    );
};

export default Notifications;