// src/components/review/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import RatingStars from './RatingStars';
import HashtagList from './HashtagList';
/**
 * ReviewForm 컴포넌트
 */
export default function ReviewForm({
  movie,
  initialData = { title: '', content: '', userRating: 0, tags: [] },
  onSubmit,
  onCancel,
  submitLabel,
  // AI 태그 추천 관련 props 추가
  recommendedTags = [],
  selectedTags = [],
  loadingTags = false,
  tagError = null,
  onToggleTag = () => { },
  onGenerateTags = () => { }, // 해시태그 생성 함수
  LoadingDots = null, // 로딩 컴포넌트
}) {

  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [userRating, setUserRating] = useState(initialData.userRating);
  const [tags, setTags] = useState(initialData.tags);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [validationError, setValidationError] = useState(''); // 유효성 검사 에러 상태 추가

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ title, content, userRating, tags });
  };

  // 해시태그 생성 버튼 핸들러
  const handleGenerateTags = () => {
    // 유효성 검사 에러 초기화
    setValidationError('');

    // 제목과 내용이 모두 비어있는 경우
    if (!title.trim() && !content.trim()) {
      setValidationError('모든 작성을 완료해주세요!');
      return;
    }

    // 제목만 비어있는 경우
    if (!title.trim()) {
      setValidationError('모든 작성을 완료해주세요!');
      return;
    }

    // 내용만 비어있는 경우
    if (!content.trim()) {
      setValidationError('모든 작성을 완료해주세요!');
      return;
    }

    // 내용이 10자 미만인 경우
    if (content.trim().length < 10) {
      setValidationError('내용을 10자 이상 입력해주세요!');
      return;
    }

    // 모든 조건을 만족하면 해시태그 생성
    onGenerateTags(title, content);
  };

  // 입력값이 변경될 때 유효성 검사 에러 초기화
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      {/* 영화 요약 */}
      <section className="movie-summary" style={{ display: 'flex', marginBottom: '1rem', marginLeft: isMobile ? '0.4rem' : '0rem' }}>
        <img src={movie.posterUrl} alt={movie.title} width={80} height={120} style={{ borderRadius: 4, marginRight: '1rem' }} />
        <div>
          <h2 style={{ margin: 0 }}>{movie.title} ({new Date(movie.releaseDate).getFullYear()})</h2>
          <p style={{ color: '#6b7280' }}>{movie.genres.join(', ')} · {movie.runtime}분</p>
        </div>
      </section>

      {/* 제목 */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="review-title"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}
        >
          Title
        </label>
        <input
          id="review-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="이 영화에 대한 나만의 제목을 입력해주세요"
          required
          style={{
            width: isMobile ? '100%' : '100%',

            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        />
      </div>
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

      {/* 본문 */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="review-content"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}
        >
          Content
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={handleContentChange}
          placeholder="영화에 대한 솔직한 생각과 느낌을 자유롭게 작성해주세요. 스포일러는 주의해주세요!"
          required
          style={{

            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '2px solid #e5e7eb',
            width: isMobile ? '100%' : '100%',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            minHeight: '120px',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: '1.5'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        />
      </div>

      {/* 별점 */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}
        >
          별점 평가
        </label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: isMobile ? '0.4rem' : '0rem',
          paddingLeft: '1.0rem',
          paddingBottom: isMobile ? '0.2rem' : '0.3rem',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', gap: '0.1rem' }}>
            {[0, 1, 2, 3, 4].map((starIndex) => (
              <div key={starIndex} style={{ position: 'relative', display: 'inline-block' }}>
                {/* 왼쪽 반 */}
                <button
                  type="button"
                  onClick={() => setUserRating((starIndex * 2) + 1)}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '50%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />
                {/* 오른쪽 반 */}
                <button
                  type="button"
                  onClick={() => setUserRating((starIndex * 2) + 2)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: '50%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />
                {/* 별 모양 */}
                <div style={{
                  fontSize: '2.8rem',
                  color: '#d1d5db',
                  position: 'relative',
                  display: 'inline-block'
                }}>
                  ★
                  {/* 채워진 별 오버레이 */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    fontSize: '2.8rem',
                    color: '#fbbf24',
                    overflow: 'hidden',
                    width: userRating > starIndex * 2 + 1 ? '100%' :
                      userRating === starIndex * 2 + 1 ? '50%' : '0%',
                    transition: 'width 0.2s ease'
                  }}>
                    ★
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1f2937',
            marginTop: isMobile ? '0rem' : '0.8rem',
            minWidth: '60px'
          }}>
            {userRating > 0 ? (
              <span style={{
                padding: '0.25rem 0.75rem',

                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                {userRating}점 / 10점
              </span>
            ) : (
              <span style={{ color: '#9ca3af' }}>미평가</span>
            )}
          </div>
        </div>
      </div>

      {/* 해시태그 */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <HashtagList tags={tags} onChange={setTags} />
      </div>

      {/* AI 해시태그 추천 섹션 */}
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            margin: 0,
            color: '#333',
            fontWeight: '600'
          }}>
            🏷️ AI 추천 해시태그
          </h3>

          {/* 해시태그 생성 버튼 */}
          <button
            type="button"
            onClick={handleGenerateTags}
            disabled={loadingTags}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loadingTags ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loadingTags ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: loadingTags ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loadingTags) {
                e.target.style.backgroundColor = '#218838';
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingTags) {
                e.target.style.backgroundColor = '#28a745';
              }
            }}
          >
            {loadingTags ? '생성 중...' : '해시태그 생성'}
          </button>
        </div>

        {/* 유효성 검사 에러 메시지 */}
        {validationError && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            ⚠️ {validationError}
          </div>
        )}

        {/* 해시태그 로딩 상태 */}
        {loadingTags && LoadingDots && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <LoadingDots />
          </div>
        )}

        {/* 해시태그 에러 상태 */}
        {tagError && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            ⚠️ {tagError}
            <button
              onClick={handleGenerateTags}
              type="button"
              style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#856404',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 해시태그 버튼들 */}
        {!loadingTags && !tagError && recommendedTags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {recommendedTags.map((tag, index) => {
              const isSelected = selectedTags.some(t => t.id === tag.id);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: isSelected ? '#007bff' : '#f8f9fa',
                    color: isSelected ? 'white' : '#495057',
                    border: isSelected ? '1px solid #007bff' : '1px solid #dee2e6',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,123,255,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        )}

        {/* 선택된 해시태그 표시 */}
        {selectedTags.length > 0 && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '0.5rem'
            }}>
              선택된 해시태그 ({selectedTags.length}개):
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem'
            }}>
              {selectedTags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 해시태그가 없는 경우 */}
        {!loadingTags && !tagError && recommendedTags.length === 0 && (!title.trim() || !content.trim() || content.trim().length < 10) && !validationError && (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            내용을 10자 이상 입력 후 해시태그를 생성해주세요.
          </div>
        )}

        {/* 제목과 내용은 있지만 해시태그가 없는 경우 */}
        {!loadingTags && !tagError && recommendedTags.length === 0 && title.trim() && content.trim() && content.trim().length >= 10 && !validationError && (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            추천할 해시태그가 없습니다. 해시태그 생성 버튼을 눌러보세요.
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          취소
        </button>
      </div>
    </form>
  );
}

ReviewForm.propTypes = {
  movie: PropTypes.shape({
    posterUrl: PropTypes.string,
    title: PropTypes.string,
    releaseDate: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    runtime: PropTypes.number,
  }).isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
    userRating: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  // AI 태그 추천 관련 propTypes 수정
  recommendedTags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  })),
  selectedTags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  })),
  loadingTags: PropTypes.bool,
  tagError: PropTypes.string,
  onToggleTag: PropTypes.func,
  onGenerateTags: PropTypes.func, // 추가
  LoadingDots: PropTypes.elementType, // 추가
};