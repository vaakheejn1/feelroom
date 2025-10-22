// ReviewItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Heart, MessageCircle } from 'lucide-react';
import { formatTimeAgo } from '../../utils/helpers';

// 기본 이미지 import
import defaultPosterImage from '../../assets/img1.png';
import title_logo from '../../assets/logo4.png';

const ReviewItem = ({
  movie,
  user,
  userRating,
  title,
  content,
  likeCount,
  commentCount,
  createdAt,
  onClick,
  isMobile,
  tags = [],
  topRightImage = null,
  topRightIcon = null,
  topRightText = null,
  topRightColor = "#666",
}) => {
  const excerpt = content.length > 60
    ? `${content.slice(0, 60)}…`
    : content;
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '알 수 없음';

  // 기본 프로필 이미지 SVG
  const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMzAgMzJjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTIiIGZpbGw9IiM2Yzc1N2QiLz48L3N2Zz4=';

  // renderStars 함수 삭제 (더이상 필요없음)

  // 태그 렌더링 함수
  const renderTags = () => {
    if (!tags || tags.length === 0) {
      return null;
    }

    return (
      <div style={{
        marginBottom: 'clamp(8px, 2vw, 12px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'clamp(4px, 1vw, 6px)',
        alignItems: 'center',
        marginLeft: isMobile ? '-0.2rem' : '-0.4rem'
      }}>
        {tags.map((tag, index) => (
          <span
            key={index}
            style={{
              display: 'inline-block',
              backgroundColor: '#238dffff',
              color: 'white',
              padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
              borderRadius: '20px',
              fontSize: 'clamp(11px, 2.5vw, 13px)',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              border: 'none',
              boxShadow: '0 1px 3px rgba(52, 152, 219, 0.3)',
              transition: 'transform 0.1s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              //e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              //e.target.style.transform = 'scale(1)';
            }}
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        border: isMobile ? '0px solid #000000ff' : '0px solid #919090ff',
        borderRadius: '18px',
        padding: 'clamp(12px, 3vw, 16px)',
        marginRight: '20px',
        marginLeft: '20px',
        cursor: 'pointer',
        backgroundColor: '#ffffffff',
        boxShadow: '0 1px 3px rgba(43, 42, 42, 0.1)',
        transition: 'box-shadow 0.2s ease',
        maxWidth: '920px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      {/* 오른쪽 상단 요소 */}
      {(topRightImage || topRightIcon || topRightText) && (
        <div style={{
          position: 'absolute',
          top: 'clamp(8px, 2vw, 12px)',
          right: 'clamp(8px, 2vw, 12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(4px, 1vw, 6px)',
          backgroundColor: 'white',
          border: `2px solid ${topRightColor}`,
          color: topRightColor,
          padding: isMobile ? '2px' : 'clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 10px)',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          zIndex: 1,
          maxWidth: '150px',
        }}>
          {topRightImage && (
            <img
              src={topRightImage}
              alt="상단 아이콘"
              style={{
                width: isMobile ? '8px' : 'clamp(16px, 4vw, 20px)',
                height: isMobile ? '8px' : 'clamp(16px, 4vw, 20px)',
                objectFit: 'cover',
                borderRadius: '3px',
                flexShrink: 0
              }}
            />
          )}

          {topRightIcon && React.cloneElement(topRightIcon, {
            size: isMobile ? 14 : 16,
            color: topRightColor,
            style: {
              flexShrink: 0,
              ...topRightIcon.props?.style
            }
          })}

          {topRightText && (
            <span style={{
              fontSize: 'clamp(11px, 2.5vw, 13px)',
              fontWeight: '600',
              color: topRightColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {topRightText}
            </span>
          )}
        </div>
      )}

      {/* 사용자 프로필과 날짜 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(8px, 2vw, 12px)',
        marginBottom: 'clamp(8px, 2vw, 10px)',
        marginLeft: 'px',
        flexWrap: 'wrap'
      }}>
        <img
          src={user.avatarUrl || user.profileImageUrl || defaultProfileImage}
          alt={user.nickname}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultProfileImage;
          }}
          style={{
            width: 'clamp(32px, 8vw, 40px)',
            height: 'clamp(32px, 8vw, 40px)',
            borderRadius: '12px',
            objectFit: 'cover',
            border: '1px solid #6b6b6bff',
            flexShrink: 0
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 3vw, 16px)',
          flex: 1,
          minWidth: 0,
          flexWrap: 'wrap'
        }}>
          <div style={{
            fontSize: 'clamp(14px, 4vw, 18px)',
            fontWeight: '600',
            color: '#000000ff',
            minWidth: 0
          }}>
            {user.nickname}
          </div>
          <div style={{
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: '#888',
            marginTop: '4px',
            flexShrink: 0
          }}>
            {formatTimeAgo(createdAt)}
          </div>
        </div>
      </div>

      {/* 영화 정보 섹션 */}
      <div style={{
        display: 'flex',
        gap: 'clamp(8px, 2vw, 12px)',
        marginBottom: '-12px',
        border: '1px solid #e5e5e5',
        borderRadius: '6px',
        padding: 'clamp(6px, 2vw, 8px)',
        backgroundColor: '#f7f7f9ff'
      }}>
        <img
          src={movie.posterUrl || defaultPosterImage}
          alt={movie.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultPosterImage;
          }}
          style={{
            width: 'clamp(35px, 10vw, 45px)',
            height: 'clamp(52px, 15vw, 67px)',
            objectFit: 'cover',
            flexShrink: 0,
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: isMobile ? '0 0 2px 0' : '0 0 2px 0',
            marginTop: isMobile ? '6px' : '0px',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: 'bold',
            color: '#333',
            wordBreak: 'break-word'
          }}>
            {movie.title} ({year})
          </h3>
          <p style={{
            margin: '0 0 2px 0',
            color: '#666',
            fontSize: 'clamp(12px, 3vw, 14px)',
            wordBreak: 'break-word'
          }}>
            {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : '장르 정보 없음'}
          </p>
          <p style={{
            margin: '0',
            color: '#666',
            fontSize: 'clamp(12px, 3vw, 14px)'
          }}>
            {movie.runtime ? `${movie.runtime}분` : '상영시간 정보 없음'}
          </p>
        </div>
      </div>

      {/* 리뷰 내용 섹션 */}
      <div>
        <h4 style={{
          marginBottom: 'clamp(-8px, -1.5vw, -9px)',
          fontSize: 'clamp(16px, 4vw, 18px)',
          fontWeight: '600',
          color: '#333',
          wordBreak: 'break-word'
        }}>
          {title}
        </h4>

        <pre style={{
          marginBottom: 'clamp(8px, 2vw, 12px)',
          color: '#555',
          lineHeight: '1.5',
          fontFamily: `'Malgun Gothic', 'Gulim', sans-serif`,
          fontSize: 'clamp(14px, 3.5vw, 16px)',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {excerpt}
        </pre>

        {/* 태그 섹션 */}
        {renderTags()}

        {/* 별점 표시 */}
        <div style={{
          marginBottom: 'clamp(8px, 2vw, 12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(2px, 1vw, 4px)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.1rem' }}>
            {[0, 1, 2, 3, 4].map((starIndex) => (
              <div key={starIndex} style={{ position: 'relative', display: 'inline-block' }}>
                {/* 별 모양 */}
                <div style={{
                  fontSize: '1.1rem',
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
                    fontSize: '1.1rem',
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
          <span style={{
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: '#323232ff',
            marginLeft: '4px'
          }}>
            {userRating}점 / 10점
          </span>
        </div>

        {/* 좋아요, 댓글 수 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(16px, 4vw, 20px)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#323232ff',
            fontSize: 'clamp(12px, 4vw, 14px)',
            fontWeight: '600'
          }}>
            <Heart
              size={18}
              style={{ color: likeCount > 0 ? '#e74c3c' : '#666' }}
            />
            <span>{likeCount}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#323232ff',
            fontSize: 'clamp(12px, 4vw, 14px)',
            fontWeight: '600'
          }}>
            <MessageCircle
              size={18}
              style={{ color: commentCount > 0 ? '#3498db' : '#666' }}
            />
            <span>{commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

ReviewItem.propTypes = {
  movie: PropTypes.shape({
    title: PropTypes.string,
    releaseDate: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    runtime: PropTypes.number,
    posterUrl: PropTypes.string,
    isMobile: PropTypes.bool,
  }).isRequired,
  user: PropTypes.shape({
    nickname: PropTypes.string,
    avatarUrl: PropTypes.string,
    profileImageUrl: PropTypes.string,
  }).isRequired,
  userRating: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  likeCount: PropTypes.number.isRequired,
  commentCount: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  topRightImage: PropTypes.string,
  topRightIcon: PropTypes.element,
  topRightText: PropTypes.string,
  topRightColor: PropTypes.string,
};

export default ReviewItem;