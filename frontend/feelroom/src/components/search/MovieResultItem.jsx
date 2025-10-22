import { Star } from 'lucide-react';

const MovieResultItem = ({ movieImage, movieTitle, releaseYear, genres, runtime, userRating, onClick, index }) => {
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
                opacity: 0
            }}
            onClick={onClick}
        >
            {/* 영화 이미지 */}
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

            {/* 영화 정보 */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {/* 제목과 개봉연도 */}
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

                {/* 장르와 런닝타임 */}
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

                {/* 사용자 평점만 표시 */}
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

export default MovieResultItem;