import { Star } from 'lucide-react';

const BoxOfficeItem = ({ rank, movieImage, movieTitle, releaseDate, audienceCount, rating, onClick }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                position: 'relative',
                minWidth: '180px'
            }}
            onClick={onClick}
        >
            {/* 순위 */}
            <div style={{
                position: 'absolute',
                top: '8px',
                left: '16px', // 기존보다 살짝 우측
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#1f2937',
                zIndex: 2
            }}>
                {rank}.
            </div>

            {/* 영화 포스터 */}
            <div style={{
                width: '100%',
                aspectRatio: '3/4',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                overflow: 'hidden',
                marginTop: '16px', // 겹치지 않게 약간 내려줌
                marginBottom: '1rem',
                position: 'relative'
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
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        {/* X 표시 */}
                        <div style={{
                            position: 'absolute',
                            width: '60%',
                            height: '60%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '2px',
                                backgroundColor: '#9ca3af',
                                transform: 'rotate(45deg)',
                                position: 'absolute'
                            }}></div>
                            <div style={{
                                width: '100%',
                                height: '2px',
                                backgroundColor: '#9ca3af',
                                transform: 'rotate(-45deg)',
                                position: 'absolute'
                            }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 영화 제목 */}
            <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                lineHeight: '1.2'
            }}>
                {movieTitle}
            </h3>

            {/* 개봉일자 */}
            <p style={{
                margin: '0 0 0.25rem 0',
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center'
            }}>
                개봉일자 : {releaseDate}
            </p>

            {/* 누적관객수 */}
            <p style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center'
            }}>
                누적관객수 : {audienceCount}
            </p>

            {/* 별점 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
            }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span style={{
                    fontSize: '0.75rem',
                    color: '#111827',
                    fontWeight: '500'
                }}>
                    {rating}
                </span>
            </div>
        </div>
    );
};

export default BoxOfficeItem;
