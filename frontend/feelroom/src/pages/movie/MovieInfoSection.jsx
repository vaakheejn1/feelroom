import { useState, useEffect } from 'react';
import { Star, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { toggleMovieLike } from './movieApiService';

const MovieInfoSection = ({ movieData, moviePlot, isLiked, onLikeChange, movieId }) => {
    const [isInfoExpanded, setIsInfoExpanded] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

    useEffect(() => {
        const onResize = () => {
            setIsMobile(window.innerWidth < 1200);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // 좋아요 버튼 클릭 핸들러
    const handleLikeClick = async () => {
        if (likeLoading) return;

        setLikeLoading(true);
        try {
            const result = await toggleMovieLike(movieId);
            onLikeChange(result.liked);
        } catch (error) {
            console.error('❌ 좋아요 처리 에러:', error);
            alert(error.message || '네트워크 오류가 발생했습니다.');
        } finally {
            setLikeLoading(false);
        }
    };

    const toggleInfo = () => {
        setIsInfoExpanded(!isInfoExpanded);
    };

    if (!movieData) return null;

    // 장르 문자열 생성
    const genresString = movieData.genres && movieData.genres.length > 0
        ? movieData.genres.join(', ')
        : '장르 정보 없음';

    // 런타임 처리 (API에서 런타임이 없을 수 있음)
    const runtimeText = movieData.runtime && movieData.runtime > 0
        ? `${movieData.runtime}분`
        : '';

    return (
        <>
            {/* 영화 정보 섹션 */}
            <div style={{
                display: 'flex',
                gap: '1.5rem',
                marginBottom: '2rem',
                padding: '1.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
            }}>
                {/* 포스터 */}
                <div style={{
                    width: '130px',
                    height: '200px',
                    backgroundColor: '#f3f4f6',
                    marginLeft: '-0.8rem',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    {movieData.posterUrl ? (
                        <img
                            src={movieData.posterUrl}
                            alt={movieData.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#e5e7eb',
                        display: movieData.posterUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        {/* X 표시 */}
                        <div style={{
                            position: 'absolute',
                            width: '60%',
                            height: '60%'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '2px',
                                backgroundColor: '#9ca3af',
                                transform: 'rotate(45deg)',
                                position: 'absolute',
                                top: '50%'
                            }}></div>
                            <div style={{
                                width: '100%',
                                height: '2px',
                                backgroundColor: '#9ca3af',
                                transform: 'rotate(-45deg)',
                                position: 'absolute',
                                top: '50%'
                            }}></div>
                        </div>
                    </div>
                </div>

                {/* 영화 정보 */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                    }}>
                        <div>
                            <h1 style={{
                                margin: '0 0 0.5rem 0',
                                marginLeft: isMobile ? '-0.4rem' : '0rem',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#111827'
                            }}>
                                {movieData.title}
                            </h1>
                            <p style={{
                                margin: '0 0 0.5rem 0',
                                marginLeft: isMobile ? '-0.4rem' : '0rem',
                                fontSize: '0.9rem',
                                color: '#6b7280'
                            }}>
                                개봉일자: {movieData.releaseDate || '미정'}
                            </p>
                            <p style={{
                                margin: '0 0 0.5rem 0',
                                marginLeft: isMobile ? '-0.4rem' : '0rem',
                                fontSize: '0.9rem',
                                color: '#6b7280'
                            }}>
                                장르: {genresString}
                            </p>
                            {runtimeText && (
                                <p style={{
                                    margin: '0 0 1rem 0',
                                    marginLeft: isMobile ? '-0.4rem' : '0rem',
                                    fontSize: '0.9rem',
                                    color: '#6b7280'
                                }}>
                                    러닝타임: {runtimeText}
                                </p>
                            )}
                        </div>

                        {/* 하트 버튼 - 로딩 상태 추가 */}
                        <button
                            onClick={handleLikeClick}
                            disabled={likeLoading}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: likeLoading ? 'default' : 'pointer',
                                //padding: '0.5rem',
                                marginRight: isMobile ? '0.4rem' : '0rem',
                                opacity: likeLoading ? 0.6 : 1,
                                transition: 'all 0.2s ease'
                            }}
                            title={isLiked ? '좋아요 취소' : '좋아요'}
                        >
                            <Heart
                                size={24}
                                fill={isLiked ? "#ef4444" : "none"}
                                color={isLiked ? "#ef4444" : "#6b7280"}
                                style={{
                                    transition: 'all 0.2s ease',
                                    transform: likeLoading ? 'scale(0.9)' : 'scale(1)'
                                }}
                            />
                        </button>
                    </div>

                    {/* 별점 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '0.5rem' : '1rem',
                        marginBottom: '1rem',
                        marginLeft: isMobile ? '-0.5rem' : '0rem',
                        marginTop: isMobile ? '-0.8rem' : '0rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: isMobile ? '-7px' : '0px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'gray', minWidth: isMobile ? '60px' : 'auto' }}>
                                {isMobile ? '삘룸평점:' : '사용자:'}
                            </span>
                            {isMobile ? (
                                // 모바일에서 5개 별 표시
                                <div style={{
                                    display: 'flex',
                                    gap: '2px',
                                    marginLeft: isMobile ? '-10px' : '0px'
                                }}>
                                    {[1, 2, 3, 4, 5].map(starIndex => (
                                        <Star
                                            key={starIndex}
                                            size={16}
                                            fill={starIndex <= Math.round(movieData.userRatingAverage / 2) ? "#fbbf24" : "none"}
                                            color="#fbbf24"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'gray', marginLeft: isMobile ? '-0.2rem' : '0rem' }}>
                                {movieData.userRatingAverage > 0 ? `${movieData.userRatingAverage.toFixed(1)}/10.0` : '0.0/10.0'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: isMobile ? '-7px' : '0px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'gray', minWidth: isMobile ? '60px' : 'auto' }}>
                                {isMobile ? 'TMDB:' : 'TMDB:'}
                            </span>
                            {isMobile ? (
                                // 모바일에서 5개 별 표시
                                <div style={{ display: 'flex', gap: '2px', marginLeft: isMobile ? '-10px' : '0px' }}>
                                    {[1, 2, 3, 4, 5].map(starIndex => (
                                        <Star
                                            key={starIndex}
                                            size={16}
                                            fill={starIndex <= Math.round(movieData.voteAverage / 2) ? "#f59e0b" : "none"}
                                            color="#f59e0b"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'gray', marginLeft: isMobile ? '-0.2rem' : '0rem' }}>
                                {movieData.voteAverage > 0 ? `${movieData.voteAverage.toFixed(1)}/10.0` : '평가 없음'}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* 상세 정보 (접기/펼치기) */}
            <div style={{
                marginBottom: '2rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <button
                    onClick={toggleInfo}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'rgba(249, 250, 251, 0.75)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    상세 정보
                    {isInfoExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {isInfoExpanded && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'white',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>줄거리</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
                                {moviePlot}
                            </p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>감독</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                                {movieData.directors && movieData.directors.length > 0
                                    ? movieData.directors.join(', ')
                                    : '정보 없음'}
                            </p>
                        </div>

                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>출연진</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                                {movieData.actors && movieData.actors.length > 0
                                    ? movieData.actors.join(', ')
                                    : '정보 없음'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MovieInfoSection;