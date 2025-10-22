// src/pages/WrittenReviews.jsx
// 다른 사용자가 쓴 리뷰????를 위해 남겨두는 파일..
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * WrittenReviews 페이지
 * - 사용자가 작성한 리뷰의 제목 목록을 보여줍니다.
 * - 클릭 시 해당 리뷰 상세로 이동합니다.
 */
export default function WrittenReviews() {
  const navigate = useNavigate();
  const [writtenReviews, setWrittenReviews] = useState([]);

  useEffect(() => {
    // TODO: 실제 API 호출로 교체
    setWrittenReviews([
      { id: 1, title: 'Movie A 리뷰' },
      { id: 2, title: 'Movie B 리뷰' },
      { id: 8, title: 'Movie H 리뷰' },
      // …더미 데이터 추가…
    ]);
  }, []);

  return (
    <main className="page-written-reviews" style={{ padding: '1rem' }}>
      {/* 뒤로가기 + 제목 */}
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>작성한 리뷰</h1>
      </header>

      {/* 리뷰 제목 리스트 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {writtenReviews.map(r => (
          <li
            key={r.id}
            onClick={() => navigate(`/review/${r.id}`)}
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid #e5e7eb',
              cursor: 'pointer',
            }}
          >
            {r.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
