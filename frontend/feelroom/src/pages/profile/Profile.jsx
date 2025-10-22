// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { User, Pencil, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BadgeModal from './BadgeModal'; // BadgeModal 컴포넌트 import

// 헤더용 이미지들 import
import logo from '../../assets/logo4.png';
import notificationIcon from '../../assets/notification_on.png';
import settingIcon from '../../assets/settingicon.png';

// 뱃지 이미지들을 import
import badge1 from '../../assets/badge/1_USER_SIGNUP.png';
import badge2 from '../../assets/badge/2_REVIEW_WRITE_COUNT_1.png';
import badge3 from '../../assets/badge/3_COMMENT_WRITE_COUNT_1.png';
import badge4 from '../../assets/badge/4_REVIEW_WRITE_COUNT_10.png';
import badge5 from '../../assets/badge/5_MOVIE_LIKE_COUNT_20.png';
import badge6 from '../../assets/badge/6_USER_FOLLOWING_COUNT_1.png';
import badge7 from '../../assets/badge/7_REVIEW_LIKE_RECEIVED_COUNT_10.png';
import badge8 from '../../assets/badge/8_USER_FOLLOWER_COUNT_1.png';

import title_profile from '../../assets/title_myProfile.png';
import title_liked from '../../assets/title_profile_liked.png';
import title_badge from '../../assets/title_profile_badge.png';
import title_profile_liked from '../../assets/title_profile_liked.png'

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모바일 체크
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

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

  const badgeIdToInfoMap = {
    1: { name: '새로운 여정의 시작', description: '회원가입을 축하드립니다!' },
    2: { name: '첫 번째 감상평', description: '첫 리뷰 작성 완료' },
    3: { name: '첫 마디', description: '첫 댓글 작성 완료' },
    4: { name: '성실한 기록가', description: '리뷰 10개 작성 완료' },
    5: { name: '취향 탐색가', description: '영화 좋아요 20개 달성' },
    6: { name: '첫 팔로우', description: '첫 팔로우 시작' },
    7: { name: '모두의 공감', description: '리뷰 좋아요 10개 받음' },
    8: { name: '첫 번째 팔로워', description: '첫 팔로워 획득' }
  };

  // 뱃지 모달 관련 state 추가
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 창 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);


  }, []);

  useEffect(() => {
    // 페이지 진입 시 스크롤을 맨 위로
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, []);
  // 페이지 진입 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  // 뱃지 클릭 핸들러 추가
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBadge(null);
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ authToken이 없습니다.');
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const fetchProfile = async () => {
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

      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/profile', {
        method: 'GET',
        headers: headers
      });

      // console.log('📡 프로필 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ 프로필 API 에러 응답:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: 프로필을 불러올 수 없습니다.`);
      }

      const data = await response.json();
      // console.log('✅ 프로필 조회 성공:', data);
      setProfileData(data);
    } catch (err) {
      console.error('❌ 프로필 조회 실패:', err);
      setError(err.message || '프로필을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchReviews = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) return;

      const headers = {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      };

      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/reviews', {
        method: 'GET',
        headers: headers
      });

      // console.log('📡 리뷰 API 응답 상태:', response.status);

      if (!response.ok) {
        console.warn('리뷰 정보를 불러오는 데 실패했습니다.');
        return;
      }

      const data = await response.json();
      // console.log('✅ 리뷰 조회 성공:', data);
      const count = data.reviews ? data.reviews.length : 0;
      // console.log('🔢 내 리뷰 개수:', count);
      setReviewCount(count);
    } catch (err) {
      console.error('❌ 리뷰 조회 실패:', err);
    }
  };

  const fetchBadges = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) return;

      const headers = {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      };

      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/badges', {
        method: 'GET',
        headers: headers
      });

      console.log('📡 내 뱃지 API 응답 상태:', response.status);

      if (!response.ok) {
        console.warn('뱃지 정보를 불러오는 데 실패했습니다.');
        return;
      }

      const data = await response.json();
      console.log('✅ 내 뱃지 조회 성공:', data);
      setBadges(data || []);
    } catch (err) {
      console.error('❌ 내 뱃지 조회 실패:', err);
    }
  };

  // 추가 리뷰 개수 호출 함수
  const fetchReviewCountAgain = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) return;

      const headers = {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      };

      console.log('🔄 리뷰 개수 재호출 시작...');
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/reviews', {
        method: 'GET',
        headers: headers
      });

      console.log('📡 리뷰 재호출 API 응답 상태:', response.status);

      if (!response.ok) {
        console.warn('리뷰 재호출 실패');
        return;
      }

      const data = await response.json();
      console.log('✅ 리뷰 재호출 성공:', data);
      const count = data.reviews ? data.reviews.length : 0;
      console.log('🔢 리뷰 재호출 결과 - 내 리뷰 개수:', count);
      setReviewCount(count);

      // 추가 콘솔 출력
      console.log('📊 최종 리뷰 개수 확인:', count, '개');
    } catch (err) {
      console.error('❌ 리뷰 재호출 실패:', err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      // 첫 번째 호출
      await Promise.all([fetchProfile(), fetchReviews(), fetchBadges()]);

      // 두 번째 리뷰 호출 (1초 후)
      setTimeout(async () => {
        await fetchReviewCountAgain();
      }, 1000);

      setLoading(false);
    };
    fetchAll();


  }, []);

  useEffect(() => {
    if (location.state?.openBadgeModal && location.state?.badgeId) {
      const badgeId = location.state.badgeId;

      const foundBadge = badges.find(badge =>
        badge.badge_id === badgeId || badge.id === badgeId
      );

      if (foundBadge) {
        setSelectedBadge(foundBadge);
        setIsModalOpen(true);
      } else {
        const badgeInfo = badgeIdToInfoMap[badgeId];
        if (badgeInfo) {
          const tempBadge = {
            badge_id: badgeId,
            name: badgeInfo.name,
            description: badgeInfo.description,
            acquiredAt: new Date().toISOString()
          };
          setSelectedBadge(tempBadge);
          setIsModalOpen(true);
        }
      }

      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.state, badges]);

  const handleEditClick = () => navigate('/editProfile');
  const handleMyPickMovieClick = () => navigate('/myPickMovie');
  const handleMyReviewClick = () => navigate('/myReview');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fff'
      }}>
        {/* 상단 헤더 - 로딩 중에도 표시 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 2rem',
          marginTop: '0rem',
          marginBottom: '0rem'
        }}>
          {/* 오른쪽: 알림, 설정 아이콘 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>


            </div>


          </div>
        </div>

        <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          프로필을 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        marginTop: '2rem',
        minHeight: '100vh',
        backgroundColor: '#fff'
      }}>
        {/* 상단 헤더 - 에러 상태에서도 표시 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 2rem',
          marginTop: '2rem',
          marginBottom: '0rem'
        }}>
          {/* 오른쪽: 알림, 설정 아이콘 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>

            </div>

          </div>
        </div>

        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            오류가 발생했습니다: {error}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchProfile();
              fetchReviews();
              fetchBadges();
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
      </div>
    );
  }

  const stats = [
    {
      number: reviewCount,
      label: '리뷰',
      onClick: handleMyReviewClick,
    },
    {
      number: profileData?.followerCount || 0,
      label: '팔로워',
      onClick: () => navigate('/friends', { state: { tab: 'followers' } }),
    },
    {
      number: profileData?.followingCount || 0,
      label: '팔로잉',
      onClick: () => navigate('/friends', { state: { tab: 'following' } }),
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      marginTop: '2rem',
      backgroundColor: '#fff'
    }}>
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
      {/* 상단 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0.5rem 1rem' : '0.5rem 2rem',
        marginTop: '0rem',
        marginBottom: '0rem'
      }}>
        {/* 중앙: 타이틀 이미지 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center'
          }}
        >
          <img
            src={title_profile}
            alt="내 프로필"
            style={{
              height: isMobile ? '20px' : '24px',
              objectFit: 'contain',
              marginLeft: isMobile ? '8px' : '0px'
            }}
          />
        </div>

        {/* 오른쪽: 알림, 설정 아이콘 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.75rem' : '1rem'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* 말풍선 */}
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

            {/* 알림 아이콘 */}
            <img
              src={notificationIcon}
              alt="알림"
              onClick={() => navigate('/notifications')}
              style={{
                width: isMobile ? '28px' : '34px',
                height: isMobile ? '26px' : '32px',
                marginTop: '6px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                filter: 'none'
              }}
            />
          </div>

          {/* 설정 아이콘 */}
          <img
            src={settingIcon}
            alt="설정"
            onClick={() => navigate('/profile/settings')}
            style={{
              transition: 'color 0.2s ease',
              cursor: 'pointer',
              width: isMobile ? '28px' : '34px',
              height: isMobile ? '28px' : '34px',
            }}
          />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{ padding: isMobile ? '1rem' : '1.5rem', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box', position: 'relative' }}>
        <div style={{ position: 'absolute', top: isMobile ? '1rem' : '1.5rem', right: isMobile ? '1rem' : '3rem' }}>
          <button
            onClick={handleEditClick}
            style={{
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: isMobile ? '0.25rem 0.4rem' : '0.3rem 0.5rem',
              //marginRight: isMobile ? '0rem' : '4rem',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: isMobile ? '12px' : '14px'
            }}
          >
            <Pencil size={isMobile ? 14 : 16} style={{ marginRight: 4 }} />
            프로필 수정
          </button>
        </div>

        {/* 프로필 이미지 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
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

        {/* 사용자 이름 + 소개 */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: isMobile ? '1.1rem' : '1.2rem' }}>
            {profileData?.nickname || profileData?.username || '사용자'}
          </p>
          <p
            style={{
              margin: 0,
              marginTop: '0.45rem',
              color: '#666',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxWidth: isMobile ? '280px' : '300px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: isMobile ? '14px' : '16px'
            }}
          >
            {profileData?.description || '소개글이 없습니다.'}
          </p>
        </div>

        {/* 숫자 정보 */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem 0' }}>
          {stats.map((item, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={item.onClick}
              onKeyPress={(e) => e.key === 'Enter' && item.onClick()}
              style={{ cursor: 'pointer', textAlign: 'center', flex: '1 0 33%' }}
            >
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: isMobile ? '19px' : '18px' }}>{item.number}</p>
              <p style={{ margin: 0, color: '#666', fontSize: isMobile ? '14px' : '16px' }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* 나의 픽 영화 */}
        <div
          onClick={handleMyPickMovieClick}
          style={{
            margin: '3rem 0 0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <h3 style={{
            margin: 0,
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: '#333',
            cursor: 'pointer'
          }}>
            좋아요한 영화
          </h3>
        </div>


        {/* 감상 뱃지 */}
        <div style={{ margin: '2rem 0 0.5rem', display: 'flex', alignItems: 'center' }}>
          <h3 style={{
            margin: 0,
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: isMobile ? '8px' : '8px'
          }}>
            나의 감상 뱃지
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
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
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

        {/* 개발자 정보 */}
        {/* <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: isMobile ? '0.7rem' : '0.8rem',
          color: '#666'
        }}>
          💡 <strong>개발 정보:</strong>
          프로필 로딩 상태: {loading ? 'Loading' : 'Complete'},
          에러 상태: {error ? 'Error' : 'None'},
          프로필 데이터: {profileData ? 'Loaded' : 'Empty'},
          리뷰 수: {reviewCount},
          뱃지 수: {badges.length},
          모바일: {isMobile ? 'Yes' : 'No'}
        </div> */}
      </div>
    </div>
  );
};

export default Profile;