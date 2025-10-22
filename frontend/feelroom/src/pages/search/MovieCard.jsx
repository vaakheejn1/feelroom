import React from 'react';

const MovieCard = ({ movie, index, loading, onMovieClick }) => {
    const truncateTitle = (title) => {
        return title.length > 10 ? title.slice(0, 10) + '...' : title;
    };

    const handleMovieClick = () => {
        onMovieClick(movie);
    };

    return (
        <div
            onClick={handleMovieClick}
            style={{
                minWidth: '120px',
                cursor: 'pointer',
                animation: !loading ? `fadeInSlide 0.4s ease-out ${index * 0.1}s both` : 'none',
                opacity: loading ? 0 : 1,
            }}
        >
            <div
                style={{
                    width: '120px',
                    height: '180px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    marginTop: '13px',
                    marginBottom: '5px',
                    background: '#f0f0f0',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
            >
                {movie.posterUrl ? (
                    <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3f4f6',
                        color: '#9ca3af'
                    }}>
                        이미지 없음
                    </div>
                )}
            </div>
            <p style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                textAlign: 'center',
                lineHeight: '1.2',
                height: '2.4em',
                overflow: 'hidden'
            }}>
                {truncateTitle(movie.title)}
            </p>
        </div>
    );
};

export default MovieCard;