// src/pages/profile/FriendList.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function FriendList() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialTab = state?.tab === 'following' ? 'following' : 'followers';
  const [tab, setTab] = useState(initialTab);

  // 팔로워 상태
  const [followers, setFollowers] = useState([]);
  const [followersPage, setFollowersPage] = useState(0);
  const [followersHasMore, setFollowersHasMore] = useState(true);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [errorFollowers, setErrorFollowers] = useState(null);

  // 팔로잉 상태
  const [following, setFollowing] = useState([]);
  const [followingPage, setFollowingPage] = useState(0);
  const [followingHasMore, setFollowingHasMore] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [errorFollowing, setErrorFollowing] = useState(null);

  // 언팔로우 모달 상태 추가
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [unfollowTarget, setUnfollowTarget] = useState(null);
  const [unfollowLoading, setUnfollowLoading] = useState(false);

  // 토큰 가져오기 함수
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ authToken이 없습니다.');
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  // 팔로워 목록 조회
  const fetchFollowers = async (pageNum = 0, isRefresh = false) => {
    try {
      setLoadingFollowers(true);
      if (isRefresh) {
        setErrorFollowers(null);
      }

      const authToken = getAuthToken();
      if (!authToken) {
        setErrorFollowers('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(
        `https://i13d208.p.ssafy.io/api/v1/users/me/followers?page=${pageNum}&size=30`,
        {
          method: 'GET',
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: 팔로워 목록을 불러올 수 없습니다.`);
      }

      const data = await response.json();
      const userList = data.users || [];

      if (isRefresh || pageNum === 0) {
        setFollowers(userList);
        setFollowersPage(0);
      } else {
        setFollowers(prev => [...prev, ...userList]);
      }

      setFollowersHasMore(data.hasNext || false);
      setFollowersPage(pageNum);

    } catch (error) {
      console.error('팔로워 목록 조회 실패:', error);
      setErrorFollowers(error.message);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // 팔로잉 목록 조회
  const fetchFollowing = async (pageNum = 0, isRefresh = false) => {
    try {
      setLoadingFollowing(true);
      if (isRefresh) {
        setErrorFollowing(null);
      }

      const authToken = getAuthToken();
      if (!authToken) {
        setErrorFollowing('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(
        `https://i13d208.p.ssafy.io/api/v1/users/me/following?page=${pageNum}&size=30`,
        {
          method: 'GET',
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: 팔로잉 목록을 불러올 수 없습니다.`);
      }

      const data = await response.json();
      const userList = data.users || [];

      if (isRefresh || pageNum === 0) {
        setFollowing(userList);
        setFollowingPage(0);
      } else {
        setFollowing(prev => [...prev, ...userList]);
      }

      setFollowingHasMore(data.hasNext || false);
      setFollowingPage(pageNum);

    } catch (error) {
      console.error('팔로잉 목록 조회 실패:', error);
      setErrorFollowing(error.message);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // 언팔로우 함수 추가
  const handleUnfollow = async () => {
    if (!unfollowTarget) return;

    setUnfollowLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${unfollowTarget.userId}/unfollow`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 팔로잉 목록에서 해당 사용자 제거
        setFollowing(prev => prev.filter(user => user.userId !== unfollowTarget.userId));
        setShowUnfollowModal(false);
        setUnfollowTarget(null);
      } else {
        alert('언팔로우에 실패했습니다.');
      }
    } catch (err) {
      console.error('언팔로우 오류:', err);
      alert('언팔로우에 실패했습니다.');
    } finally {
      setUnfollowLoading(false);
    }
  };

  // 언팔로우 모달 열기
  const openUnfollowModal = (user) => {
    setUnfollowTarget(user);
    setShowUnfollowModal(true);
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (tab === 'followers') {
      fetchFollowers(0, true);
    } else {
      fetchFollowing(0, true);
    }
  }, [tab]);

  // 더 불러오기 함수들
  const loadMoreFollowers = () => {
    if (!loadingFollowers && followersHasMore) {
      fetchFollowers(followersPage + 1);
    }
  };

  const loadMoreFollowing = () => {
    if (!loadingFollowing && followingHasMore) {
      fetchFollowing(followingPage + 1);
    }
  };

  // 현재 탭에 따른 데이터
  const listData = tab === 'followers' ? followers : following;
  const isLoading = tab === 'followers' ? loadingFollowers : loadingFollowing;
  const errorMsg = tab === 'followers' ? errorFollowers : errorFollowing;
  const hasMore = tab === 'followers' ? followersHasMore : followingHasMore;
  const loadMore = tab === 'followers' ? loadMoreFollowers : loadMoreFollowing;

  return (
    <main className="page-friend-list">
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
      {/* 언팔로우 확인 모달 */}
      {showUnfollowModal && unfollowTarget && (
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
              {unfollowTarget.nickname}님의 팔로우를 정말 취소하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowUnfollowModal(false);
                  setUnfollowTarget(null);
                }}
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
                disabled={unfollowLoading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: unfollowLoading ? 'not-allowed' : 'pointer',
                  opacity: unfollowLoading ? 0.7 : 1
                }}
              >
                {unfollowLoading ? '처리중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상단 내비게이션 */}
      <header style={headerStyle}>
        <button onClick={() => navigate('/profile')} style={plainButton} aria-label="뒤로가기">
          <ArrowLeft size={24} />
        </button>
        <h1 style={titleStyle}>
          {tab === 'followers' ? '팔로워' : '팔로잉'}
        </h1>
      </header>

      {/* 탭 */}
      <div style={tabContainerStyle}>
        <button onClick={() => setTab('followers')} style={tabButton(tab === 'followers')}>
          팔로워
        </button>
        <button onClick={() => setTab('following')} style={tabButton(tab === 'following')}>
          팔로잉
        </button>
      </div>

      {/* 리스트 */}
      {isLoading && listData.length === 0 && <p style={{ padding: '1rem' }}>불러오는 중…</p>}
      {errorMsg && <p style={{ padding: '1rem', color: 'red' }}>{errorMsg}</p>}

      {listData.length === 0 && !isLoading && !errorMsg && (
        <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
          {tab === 'followers' ? '팔로워가 없습니다.' : '팔로잉이 없습니다.'}
        </p>
      )}

      <ul style={listStyle}>
        {listData.map(user => (
          <li key={user.userId} style={itemStyle}>
            <div
              style={avatarStyle}
              onClick={() => navigate(`/profile/${user.userId}`)}
            >
              {user.profileImageUrl
                ? <img src={user.profileImageUrl} alt={user.nickname} style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }} />
                : <span style={{ color: '#6b7280', cursor: 'pointer' }}>{user.nickname.charAt(0)}</span>}
            </div>
            <div
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${user.userId}`)}
            >
              <div style={{ fontWeight: 'bold' }}>{user.nickname}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>@{user.username}</div>
            </div>
            {/* 팔로잉 탭에서만 취소 버튼 표시 */}
            {tab === 'following' && (
              <button
                onClick={() => openUnfollowModal(user)}
                style={actionButton}
              >
                취소
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* 더 불러오기 버튼 */}
      {hasMore && !isLoading && (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <button onClick={loadMore} style={loadMoreButton}>
            더 불러오기
          </button>
        </div>
      )}

      {/* 로딩 표시 */}
      {isLoading && listData.length > 0 && (
        <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
          불러오는 중...
        </p>
      )}
    </main>
  );
}

// 스타일 재사용
const plainButton = { background: 'none', border: 'none', cursor: 'pointer' };
const headerStyle = { display: 'flex', alignItems: 'center', padding: '1rem' };
const titleStyle = { margin: 0, fontSize: '1.25rem', fontWeight: 'bold' };
const tabContainerStyle = { display: 'flex', borderBottom: '1px solid #e5e7eb' };
const tabButton = isActive => ({
  flex: 1,
  padding: '0.75rem 0',
  border: 'none',
  borderBottom: isActive ? '2px solid #111827' : '2px solid transparent',
  background: 'none',
  cursor: 'pointer',
  fontWeight: isActive ? 'bold' : 'normal'
});
const listStyle = { listStyle: 'none', margin: 0, padding: 0 };
const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  borderBottom: '1px solid #f3f4f6'
};
const avatarStyle = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: '#e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '0.75rem'
};
const actionButton = {
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  padding: '0.25rem 0.75rem',
  cursor: 'pointer'
};
const loadMoreButton = {
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '0.75rem 1.5rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500'
};