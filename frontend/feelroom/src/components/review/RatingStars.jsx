// src/components/review/RatingStars.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

/**
 * RatingStars 컴포넌트 - 반별 지원
 * @param {{
 *   value: number,                    // 0~5 (0.5 단위)
 *   onClick?: (value: number) => void, // 클릭 콜백, 클릭한 별점 값 (0.5 단위)
 *   readOnly?: boolean                // true면 클릭 비활성
 * }} props
 */
export default function RatingStars({ value, onClick, readOnly = false }) {
  const stars = [];
  
  for (let i = 0; i < 5; i++) {
    const starValue = i + 1;
    const halfStarValue = i + 0.5;
    
    // 별의 채움 상태 결정
    const isFull = value >= starValue;
    const isHalf = value >= halfStarValue && value < starValue;
    
    stars.push(
      <div key={i} className="star-container" style={{ position: 'relative', display: 'inline-block', marginRight: 2 }}>
        {/* 배경 별 (빈 별) */}
        <Star
          size={16}
          color="#d1d5db"
          style={{ 
            cursor: !readOnly && onClick ? 'pointer' : 'default',
            display: 'block'
          }}
        />
        
        {/* 반별 클릭 영역 (왼쪽 절반) */}
        {!readOnly && onClick && (
          <div
            className="star-half-area"
            onClick={() => onClick(halfStarValue)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '50%',
              height: '100%',
              cursor: 'pointer',
              zIndex: 2
            }}
          />
        )}
        
        {/* 전별 클릭 영역 (오른쪽 절반) */}
        {!readOnly && onClick && (
          <div
            className="star-full-area"
            onClick={() => onClick(starValue)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '50%',
              height: '100%',
              cursor: 'pointer',
              zIndex: 2
            }}
          />
        )}
        
        {/* 채워진 별 (반별 또는 전별) */}
        {(isHalf || isFull) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: isHalf ? '50%' : '100%',
              height: '100%',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
          >
            <Star
              size={16}
              color="#facc15"
              fill="#facc15"
              style={{ display: 'block' }}
            />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="rating-stars" style={{ display: 'flex', gap: 4 }}>
      {stars}
    </div>
  );
}

RatingStars.propTypes = {
  value: PropTypes.number.isRequired,    // 0~5 (0.5 단위)
  onClick: PropTypes.func,
  readOnly: PropTypes.bool,
};