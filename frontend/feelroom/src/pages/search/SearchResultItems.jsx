import React from 'react';
import { Star } from 'lucide-react';

// 영화 검색 결과 아이템
export const MovieResultItem = ({ movieImage, movieTitle, releaseYear, genres, runtime, userRating, onClick, index }) => {
    return (
        <div
            style={{
                display: 'flex',
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                gap: '1rem',
                cursor: 'pointer',
                animation: `fadeInSlide 0.4s ease-out ${index * 0.1}s both`,
                opacity: 0,
                transition: 'all 0.3s ease',
                transform: 'translateY(0px)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onClick={onClick}
        >
            <div style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
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

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#111827'
                    }}>
                        {movieTitle}
                    </h3>
                    <span style={{
                        fontSize: '0.9rem',
                        color: '#6b7280'
                    }}>
                        {releaseYear}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.85rem',
                        color: '#374151'
                    }}>
                        {genres.join(', ')}
                    </span>
                    <span style={{
                        fontSize: '0.85rem',
                        color: '#6b7280'
                    }}>
                        {runtime}분
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                        {userRating}/10
                    </span>
                </div>
            </div>
        </div>
    );
};

// 유저 검색 결과 아이템
export const UserResultItem = ({ userImage, nickname, onClick }) => {
    return (
        <div
            style={{
                display: 'flex',
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                gap: '1rem',
                cursor: 'pointer',
                alignItems: 'center'
            }}
            onClick={onClick}
        >
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#f3f4f6'
            }}>
                {userImage ? (
                    <img
                        src={userImage}
                        alt={nickname}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280'
                    }}>
                        👤
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>
                    {nickname}
                </div>
            </div>
        </div>
    );
};

// 리뷰 검색 결과 아이템
export const ReviewResultItem = ({ movieTitle, userName, postDate, onClick }) => {
    return (
        <div
            style={{
                display: 'flex',
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer'
            }}
            onClick={onClick}
        >
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {movieTitle}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {userName} · {postDate}
                </div>
            </div>
        </div>
    );
};