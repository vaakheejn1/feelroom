// src/components/review/HashtagList.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * 해시태그 리스트 - 태그 선택/추가 기능
 * @param {{
 *   tags: string[],                    // 선택된 태그 목록
 *   onChange?: (tags: string[]) => void, // 태그 변경 콜백 (편집 모드용)
 *   availableTags?: string[],          // API에서 받은 추천 태그 목록
 *   disabled?: boolean,                // 비활성화 상태
 *   readOnly?: boolean                 // 읽기 전용 모드 (기존 동작)
 * }} props
 */
export default function HashtagList({
  tags,
  onChange,
  availableTags = [],
  disabled = false,
  readOnly = false
}) {
  const [customTag, setCustomTag] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 읽기 전용 모드 (기존 동작)
  if (readOnly || !onChange) {
    return (
      <div className="hashtag-list">
        {tags.map((t, i) => (
          <span key={i} className="hashtag">
            {t}
          </span>
        ))}
      </div>
    );
  }

  // 편집 모드
  const addTag = (tag) => {
    if (!tag.trim() || tags.includes(tag.trim())) return;
    onChange([...tags, tag.trim()]);
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCustomTagSubmit = (e) => {
    e.preventDefault();
    if (customTag.trim()) {
      addTag(customTag);
      setCustomTag('');
      setShowCustomInput(false);
    }
  };

  const unselectedRecommendedTags = availableTags.filter(tag => !tags.includes(tag));

  return (
    <div className="hashtag-list">
      {/* 선택된 태그들 */}
      {tags.length > 0 && (
        <div className="selected-tags" style={{ marginBottom: '0.5rem' }}>
          {tags.map((t, i) => (
            <span
              key={i}
              className="hashtag selected"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                margin: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '1rem',
                fontSize: '0.875rem'
              }}
            >
              #{t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                disabled={disabled}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  padding: '0 0 0 0.25rem',
                  fontSize: '1rem'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 추천 태그들 */}
      {unselectedRecommendedTags.length > 0 && (
        <div className="recommended-tags" style={{ marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
            추천된 태그를 선택하세요:
          </p>
          {unselectedRecommendedTags.map((tag, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(tag)}
              disabled={disabled}
              className="hashtag recommended"
              style={{
                margin: '0.25rem',
                padding: '0.25rem 0.75rem',
                backgroundColor: disabled ? '#f3f4f6' : '#e0f2fe',
                color: disabled ? '#9ca3af' : '#0369a1',
                border: '1px solid #0ea5e9',
                borderRadius: '1.5rem',
                fontSize: '0.875rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.target.style.backgroundColor = '#bae6fd';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.target.style.backgroundColor = '#e0f2fe';
                }
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}


    </div>
  );
}

HashtagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func,              // 편집 모드용
  availableTags: PropTypes.arrayOf(PropTypes.string),  // 추천 태그
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,              // 기존 동작 유지용
};