import React, { useState, useEffect } from 'react';
import { X, Sparkles, Film, RefreshCw } from 'lucide-react';

const AI_PCmodal = ({ isOpen, onClose, onMovieClick }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [movies, setMovies] = useState([]);
    const [displayedMovies, setDisplayedMovies] = useState([]);
    const [hasRecommendation, setHasRecommendation] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // 토큰 가져오기 함수
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    // AI 영화 추천 API 호출
    const fetchAIRecommendation = async () => {
        setIsLoading(true);
        setError(null);
        setShowResults(false);

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch('https://i13d208.p.ssafy.io/api/v1/ai/recommendation/movies', {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                    'accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('AI 추천을 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            setMovies(data);

            // 처음 18개 표시 (6x3 그리드)
            const firstBatch = data.slice(0, 18);
            setDisplayedMovies(firstBatch);
            setCurrentIndex(18);
            setHasRecommendation(true);

            // localStorage에 저장
            localStorage.setItem('aiRecommendedMovies', JSON.stringify(data));

        } catch (err) {
            setError(err.message);
            console.error('AI 추천 에러:', err);
        } finally {
            // 최소 3초 로딩 후 결과 표시
            setTimeout(() => {
                setIsLoading(false);
                setShowResults(true);
            }, 3000);
        }
    };

    // 더 많은 영화 로드
    const loadMoreMovies = () => {
        if (currentIndex >= movies.length) return;

        setIsLoadingMore(true);

        setTimeout(() => {
            const nextBatch = movies.slice(currentIndex, currentIndex + 18);
            setDisplayedMovies(prev => [...prev, ...nextBatch]);
            setCurrentIndex(prev => prev + 18);
            setIsLoadingMore(false);
        }, 500);
    };

    // 스크롤 이벤트 처리
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !isLoadingMore && currentIndex < movies.length) {
            loadMoreMovies();
        }
    };

    // 영화 클릭 핸들러
    const handleMovieClick = (movieId) => {
        // 모달 닫기
        onClose();

        // localStorage에서 추천 데이터 제거
        localStorage.removeItem('aiRecommendedMovies');

        if (onMovieClick) {
            onMovieClick(movieId);
        } else {
            // 기본 동작
            window.location.href = `/movieDetail/${movieId}`;
        }
    };

    // 모달이 열릴 때 localStorage에서 기존 추천 확인
    useEffect(() => {
        if (isOpen) {
            const savedMovies = localStorage.getItem('aiRecommendedMovies');
            if (savedMovies) {
                const parsedMovies = JSON.parse(savedMovies);
                setMovies(parsedMovies);
                setDisplayedMovies(parsedMovies.slice(0, 18));
                setCurrentIndex(18);
                setHasRecommendation(true);
                setShowResults(true);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 새로운 추천 요청
    const handleRegenerate = () => {
        localStorage.removeItem('aiRecommendedMovies');
        setMovies([]);
        setDisplayedMovies([]);
        setCurrentIndex(0);
        setHasRecommendation(false);
        setShowResults(false);
        setError(null);
        fetchAIRecommendation();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // 로딩 애니메이션 컴포넌트
    const LoadingDots = () => (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            padding: '2rem',
            flexDirection: 'column'
        }}>
            <div style={{
                display: 'flex',
                gap: '8px'
            }}>
                {[0, 1, 2].map((index) => (
                    <div
                        key={index}
                        style={{
                            width: '12px',
                            height: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            animation: `bounce 1.4s infinite ease-in-out ${index * 0.16}s`
                        }}
                    />
                ))}
            </div>
            <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '16px',
                margin: '1rem 0 0 0',
                textAlign: 'center'
            }}>
                AI가 당신을 위한 영화를 찾고 있습니다...
            </p>
        </div>
    );

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 1300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out',
            }}
        >
            <div
                style={{
                    width: '90%',
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    borderRadius: '24px',
                    padding: '32px',
                    animation: isOpen ? 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'scaleOut 0.3s ease-out',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 배경 그라데이션 효과 */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '150px',
                        background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.15) 0%, transparent 100%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* 헤더 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        position: 'relative',
                        zIndex: 2,
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                borderRadius: '16px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Sparkles size={32} color="#1a1a2e" />
                        </div>
                        <div>
                            <h2 style={{
                                color: '#FFD700',
                                fontSize: '32px',
                                fontWeight: '700',
                                margin: 0,
                                textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                            }}>
                                AI 영화 추천
                            </h2>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '16px',
                                margin: 0,
                                marginTop: '8px',
                            }}>
                                삘룸이 추천하는 맞춤 영화
                            </p>
                        </div>
                    </div>

                    {/* X 버튼 */}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backdropFilter: 'blur(10px)',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        <X size={24} color="white" />
                    </button>
                </div>

                {/* 중앙 컨텐츠 영역 */}
                <div
                    style={{
                        flex: 1,
                        position: 'relative',
                        zIndex: 2,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        minHeight: 0,
                    }}
                    onScroll={handleScroll}
                >
                    {/* 초기 상태 - 영화 추천 버튼 */}
                    {!hasRecommendation && !isLoading && !error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '400px',
                            minHeight: '300px'
                        }}>
                            <div
                                onClick={fetchAIRecommendation}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%',
                                    width: '250px',
                                    height: '250px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    animation: 'scaleIn 0.6s ease-out',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                                }}
                            >
                                {/* 배경 글로우 효과 */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-30%',
                                        right: '-30%',
                                        width: '150px',
                                        height: '150px',
                                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                                        borderRadius: '50%',
                                    }}
                                />

                                {/* 아이콘 */}
                                <div style={{
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    width: '80px',
                                    height: '80px',
                                }}>
                                    <Film size={40} color="white" />
                                </div>

                                {/* 텍스트 */}
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{
                                        color: 'white',
                                        fontSize: '22px',
                                        fontWeight: '700',
                                        margin: 0,
                                        marginBottom: '12px',
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                                    }}>
                                        영화 추천
                                    </h3>
                                    <p style={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '16px',
                                        margin: 0,
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                                        lineHeight: '1.3',
                                        maxWidth: '180px',
                                    }}>
                                        활동 기반 맞춤 영화 추천
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 로딩 상태 */}
                    {isLoading && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '400px',
                            minHeight: '300px'
                        }}>
                            <LoadingDots />
                        </div>
                    )}

                    {/* 에러 상태 */}
                    {error && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '400px',
                            minHeight: '300px',
                            gap: '1rem'
                        }}>
                            <div style={{ color: '#ff6b6b', fontSize: '18px', textAlign: 'center' }}>
                                {error}
                            </div>
                            <button
                                onClick={fetchAIRecommendation}
                                style={{
                                    padding: '16px 32px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {/* 영화 목록 - showResults가 true일 때만 표시 */}
                    {hasRecommendation && showResults && displayedMovies.length > 0 && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(6, 1fr)',
                                    gap: '16px',
                                    padding: '0 16px',
                                    marginBottom: '24px'
                                }}
                            >
                                {displayedMovies.map((movie, index) => (
                                    <div
                                        key={movie.movie_id}
                                        onClick={() => handleMovieClick(movie.movie_id)}
                                        style={{
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                                            animation: `fadeInSlide 0.4s ease-out ${index * 0.05}s both`,
                                            backdropFilter: 'blur(10px)',
                                            position: 'relative',
                                            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                        }}
                                    >
                                        <img
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <div style={{
                                            padding: '12px',
                                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)'
                                        }}>
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                color: 'white',
                                                lineHeight: '1.3',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                minHeight: '36px',
                                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                                            }}>
                                                {movie.title}
                                            </div>
                                        </div>

                                        {/* 로딩 그라데이션 효과 */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                                animation: 'shimmer 2s infinite',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* 더보기 로딩 */}
                            {isLoadingMore && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '20px'
                                }}>
                                    <LoadingDots />
                                </div>
                            )}

                            {/* 더 이상 영화가 없을 때 */}
                            {currentIndex >= movies.length && movies.length > 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '16px'
                                }}>
                                    모든 추천 영화를 확인하셨습니다 ✨
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 하단 버튼 */}
                <div
                    style={{
                        display: 'flex',
                        gap: '16px',
                        position: 'relative',
                        zIndex: 2,
                        marginTop: '24px',
                        flexShrink: 0,
                    }}
                >
                    {hasRecommendation && showResults ? (
                        <button
                            onClick={handleRegenerate}
                            style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '20px',
                                fontSize: '18px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 8px 24px rgba(78, 205, 196, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 12px 32px rgba(78, 205, 196, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 8px 24px rgba(78, 205, 196, 0.3)';
                            }}
                        >
                            <RefreshCw size={20} />
                            새로운 추천 받기
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={fetchAIRecommendation}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                    color: '#1a1a2e',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 12px 32px rgba(255, 215, 0, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.3)';
                                }}
                            >
                                지금 추천받기
                            </button>

                            <button
                                onClick={onClose}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '16px',
                                    padding: '20px 32px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backdropFilter: 'blur(10px)',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                나중에
                            </button>
                        </>
                    )}
                </div>

                <style>
                    {`
                    @keyframes fadeIn {
                      from { opacity: 0; }
                      to { opacity: 1; }
                    }
                    
                    @keyframes fadeOut {
                      from { opacity: 1; }
                      to { opacity: 0; }
                    }
                    
                    @keyframes scaleIn {
                      from {
                        transform: scale(0.7);
                        opacity: 0;
                      }
                      to {
                        transform: scale(1);
                        opacity: 1;
                      }
                    }
                    
                    @keyframes scaleOut {
                      from {
                        transform: scale(1);
                        opacity: 1;
                      }
                      to {
                        transform: scale(0.7);
                        opacity: 0;
                      }
                    }
                    
                    @keyframes bounce {
                      0%, 80%, 100% {
                        transform: translateY(0);
                      }
                      40% {
                        transform: translateY(-10px);
                      }
                    }
                    
                    @keyframes fadeInSlide {
                      0% {
                        opacity: 0;
                        transform: translateY(20px);
                      }
                      100% {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                    
                    @keyframes shimmer {
                      0% {
                        left: -100%;
                      }
                      100% {
                        left: 100%;
                      }
                    }
                    
                    @media (max-width: 1400px) {
                      .modal-grid {
                        grid-template-columns: repeat(5, 1fr);
                      }
                    }
                    
                    @media (max-width: 1200px) {
                      .modal-grid {
                        grid-template-columns: repeat(4, 1fr);
                      }
                    }
                    
                    @media (max-width: 768px) {
                      .modal-container {
                        width: 95%;
                        padding: 24px;
                      }
                      
                      .modal-grid {
                        grid-template-columns: repeat(3, 1fr);
                      }
                    }
                  `}
                </style>
            </div>
        </div>
    );
};

export default AI_PCmodal;