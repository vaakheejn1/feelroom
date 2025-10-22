// src/pages/settings/UserActivity.jsx
import React from 'react';
import { useNavigate }   from 'react-router-dom';
import { Heart }         from 'lucide-react';
import { formatTimeAgo } from '../../utils/helpers';

import { useMyReviews }    from '../../hooks/useMyReviews';
import { useLikedReviews } from '../../hooks/useLikedReviews';
import { useMyComments }   from '../../hooks/useMyComments';

export default function UserActivity() {
  const navigate = useNavigate();

  const {
    reviews: writtenReviews,
    loading: loadingReviews,
    error: errorReviews,
    hasMore,
    loadMore
  } = useMyReviews();

  const {
    reviews: likedReviews,
    loading: loadingLikes,
    error: errorLikes,
    refresh: refreshLikes
  } = useLikedReviews();

  const {
    comments,
    loading: loadingComments,
    error: errorComments,
    refresh: refreshComments
  } = useMyComments();

  return (
    <main className="page-user-activity" style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>내 활동</h2>

      {/* 1) 작성한 리뷰 */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={headerStyle}>
          <h3>작성한 리뷰</h3>
          <button onClick={() => navigate('/myReview')} style={plainButton}>
            전체보기
          </button>
        </div>
        {loadingReviews && <p>불러오는 중…</p>}
        {errorReviews && <p style={{ color: 'red' }}>{errorReviews}</p>}
        <ul style={listStyle}>
          {writtenReviews.slice(0, 5).map(r => (
            <li key={r.id} style={itemStyle} onClick={() => navigate(`/review/${r.id}`)}>
              {r.title}
            </li>
          ))}
        </ul>
        {hasMore && !loadingReviews && (
          <button onClick={loadMore} style={{ ...plainButton, marginTop: '0.5rem' }}>
            더 불러오기
          </button>
        )}
      </section>

      {/* 2) 좋아요한 리뷰 */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={headerStyle}>
          <h3>좋아요한 리뷰</h3>
          <button onClick={() => navigate('/liked-review')} style={plainButton}>
            전체보기
          </button>
        </div>
        {loadingLikes && <p>불러오는 중…</p>}
        {errorLikes && <p style={{ color: 'red' }}>{errorLikes}</p>}
        <ul style={listStyle}>
          {likedReviews.slice(0, 5).map(r => (
            <li key={r.id} style={itemStyle} onClick={() => navigate(`/review/${r.id}`)}>
              <Heart size={16} style={{ marginRight: 8, color: '#f87171' }} />
              <span>{r.title}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3) 작성한 댓글
      <section>
        <div style={headerStyle}>
          <h3>작성한 댓글</h3>
          <button onClick={() => navigate('/comment-history')} style={plainButton}>
            전체보기
          </button>
        </div>
        {loadingComments && <p>불러오는 중…</p>}
        {errorComments && <p style={{ color: 'red' }}>{errorComments}</p>}
        <ul style={listStyle}>
          {comments.slice(0, 5).map(c => (
            <li key={c.id} style={commentItemStyle} onClick={() => navigate(`/review/${c.reviewId}`)}>
              <span>{c.reviewTitle}</span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {formatTimeAgo(c.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section> */}
    </main>
  );
}

// 재사용 스타일
const plainButton = {
  background: 'none',
  border: 'none',
  color: '#3b82f6',
  cursor: 'pointer'
};
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};
const listStyle = { listStyle: 'none', padding: 0 };
const itemStyle = {
  padding: '0.75rem 0',
  borderBottom: '1px solid #e5e7eb',
  cursor: 'pointer'
};
const commentItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.75rem 0',
  borderBottom: '1px solid #e5e7eb',
  cursor: 'pointer'
};
