// src/components/review/ReviewItem_liked.jsx
import { User, Heart } from 'lucide-react';

const ReviewItem_liked = ({ movieImage, movieTitle, releaseYear, userImage, userName, postDate, isLiked, onLikeToggle, onClick }) => {
    const handleLikeClick = (e) => {
        e.stopPropagation(); // 부모의 onClick 이벤트 방지
        onLikeToggle();
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white',
            gap: '0.75rem',
            cursor: 'pointer',
            position: 'relative'
        }}
            onClick={onClick}>
            {/* 영화 정보 섹션 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                {/* 영화 이미지 */}
                <div style={{
                    width: '60px',
                    height: '80px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    {movieImage ? (
                        <img
                            src={movieImage}
                            alt={movieTitle}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6b7280',
                            fontSize: '0.75rem'
                        }}>
                            NO IMAGE
                        </div>
                    )}
                </div>

                {/* 영화 정보 */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#111827'
                    }}>
                        {movieTitle}
                    </p>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>
                        {releaseYear}
                    </p>
                </div>
            </div>

            {/* 유저 정보 섹션 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
            }}>
                {/* 왼쪽: 유저 정보 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {/* 유저 이미지 */}
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {userImage ? (
                            <img
                                src={userImage}
                                alt={userName}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <User size={16} color="#6b7280" />
                        )}
                    </div>

                    {/* 유저 이름 */}
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151'
                    }}>
                        {userName}
                    </p>

                    {/* 게시일자 */}
                    <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                    }}>
                        {postDate}
                    </p>
                </div>

                {/* 오른쪽: 하트 버튼 */}
                <button
                    onClick={handleLikeClick}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    <Heart
                        size={20}
                        color={isLiked ? '#ef4444' : '#9ca3af'}
                        fill={isLiked ? '#ef4444' : 'none'}
                        style={{
                            transition: 'all 0.2s'
                        }}
                    />
                </button>
            </div>
        </div>
    );
};

export default ReviewItem_liked;