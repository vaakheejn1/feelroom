import React, { useState, useEffect } from 'react';
import { X, Sparkles, Film, RefreshCw } from 'lucide-react';

const AI_Modal = ({ isOpen, onClose, onMovieClick }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [movies, setMovies] = useState([]);
    const [displayedMovies, setDisplayedMovies] = useState([]);
    const [hasRecommendation, setHasRecommendation] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // 더미 데이터 (API가 안될 때 사용)
    const dummyMovies = [
        {
            movie_id: 1865,
            title: "광해, 왕이 된 남자",
            poster_url: "https://image.tmdb.org/t/p/w500/6Pg5AwsJUqeGanGOWcaljQXGe5g.jpg"
        },
        {
            movie_id: 675,
            title: "괴물",
            poster_url: "https://image.tmdb.org/t/p/w500/tqDQzYGi1EWHgUZY91YRSJLDJVf.jpg"
        },
        {
            movie_id: 224669,
            title: "글래디에이터",
            poster_url: "https://image.tmdb.org/t/p/w500/yemF0xxGU56Pf3JXxVr4C6kuKng.jpg"
        },
        {
            movie_id: 434,
            title: "내 머리 속의 지우개",
            poster_url: "https://image.tmdb.org/t/p/w500/AdLj0jeRbQjMyzVn1w3hQqAb8iZ.jpg"
        },
        {
            movie_id: 236013,
            title: "노인을 위한 나라는 없다",
            poster_url: "https://image.tmdb.org/t/p/w500/2SU078qZf8ZTNfl6XlqgYiQohhG.jpg"
        },
        {
            movie_id: 232419,
            title: "노트북",
            poster_url: "https://image.tmdb.org/t/p/w500/ntdgcdsmMuHd9s4oEKTvWDiUyU7.jpg"
        },
        {
            movie_id: 256852,
            title: "로마",
            poster_url: "https://image.tmdb.org/t/p/w500/6TLjpyINLAL7gwlU4mZeoEPcX4c.jpg"
        },
        {
            movie_id: 1184,
            title: "마더",
            poster_url: "https://image.tmdb.org/t/p/w500/lhxVHEkaOH51oazowpdCHJNLIBE.jpg"
        },
        {
            movie_id: 263248,
            title: "스파이더맨: 노 웨이 홈",
            poster_url: "https://image.tmdb.org/t/p/w500/fvqoI9r1GU2EFkc0xjZ6dKCuDVR.jpg"
        }
    ];

    // 토큰 가져오기 함수
    const getAuthToken = () => {
        const token = localStorage?.getItem('authToken');
        if (!token) {
            console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    // 더미 데이터로 추천 표시
    const fetchAIRecommendation = () => {
        setIsLoading(true);
        setError(null);
        setShowResults(false);

        // 더미 데이터 설정
        setMovies(dummyMovies);
        setDisplayedMovies(dummyMovies); // 9개 모두 표시
        setCurrentIndex(9);
        setHasRecommendation(true);

        // localStorage에 더미 데이터 저장
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('aiRecommendedMovies', JSON.stringify(dummyMovies));
        }

        // 3초 로딩 후 결과 표시
        setTimeout(() => {
            setIsLoading(false);
            setShowResults(true);
        }, 3000);
    };

    // 더 많은 영화 로드
    const loadMoreMovies = () => {
        if (currentIndex >= movies.length) return;

        setIsLoadingMore(true);

        setTimeout(() => {
            const nextBatch = movies.slice(currentIndex, currentIndex + 15);
            setDisplayedMovies(prev => [...prev, ...nextBatch]);
            setCurrentIndex(prev => prev + 15);
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
        onClose();

        // localStorage에서 추천 데이터 제거
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('aiRecommendedMovies');
        }

        if (onMovieClick) {
            onMovieClick(movieId);
        } else {
            // 기본 동작
            window.location.href = `/movieDetail/${movieId}`;
        }
    };

    // 모달이 열릴 때 localStorage에서 기존 추천 확인
    useEffect(() => {
        if (isOpen && typeof localStorage !== 'undefined') {
            const savedMovies = localStorage.getItem('aiRecommendedMovies');
            if (savedMovies) {
                const parsedMovies = JSON.parse(savedMovies);
                setMovies(parsedMovies);
                setDisplayedMovies(parsedMovies); // 저장된 데이터 모두 표시
                setCurrentIndex(parsedMovies.length);
                setHasRecommendation(true);
                setShowResults(true);
            }
        }
    }, [isOpen]);

    // 모달이 열려있지 않으면 렌더링하지 않음
    if (!isOpen) return null;

    // 새로운 추천 요청
    const handleRegenerate = () => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('aiRecommendedMovies');
        }
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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1300,
                display: 'flex',
                alignItems: 'flex-end',
                animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out',
            }}
        >
            <div
                style={{
                    width: '100%',
                    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    borderRadius: '24px 24px 0 0',
                    padding: '24px',
                    paddingBottom: '100px',
                    height: '90vh',
                    maxHeight: '90vh',
                    animation: isOpen ? 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'slideDown 0.3s ease-out',
                    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
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
                        height: '100px',
                        background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* 헤더 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        position: 'relative',
                        zIndex: 2,
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                borderRadius: '12px',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Sparkles size={24} color="#1a1a2e" />
                        </div>
                        <div>
                            <h2 style={{
                                color: '#FFD700',
                                fontSize: '24px',
                                fontWeight: '700',
                                margin: 0,
                                textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                            }}>
                                AI 영화 추천
                            </h2>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '14px',
                                margin: 0,
                                marginTop: '4px',
                            }}>
                                삘룸이 추천하는 맞춤 영화
                            </p>
                        </div>
                    </div>

                    {/* X 버튼 */}
                    {hasRecommendation && showResults && (
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            <X size={20} color="white" />
                        </button>
                    )}
                </div>

                {/* 중앙 컨텐츠 영역 */}
                <div
                    style={{
                        flex: 1,
                        position: 'relative',
                        zIndex: 2,
                        paddingBottom: '40px',
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
                            height: '100%',
                            minHeight: '200px'
                        }}>
                            <div
                                onClick={fetchAIRecommendation}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%',
                                    width: '200px',
                                    height: '200px',
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
                                        width: '120px',
                                        height: '120px',
                                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                                        borderRadius: '50%',
                                    }}
                                />

                                {/* 아이콘 */}
                                <div style={{
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                }}>
                                    <Film size={32} color="white" />
                                </div>

                                {/* 텍스트 */}
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{
                                        color: 'white',
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        margin: 0,
                                        marginBottom: '8px',
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                                    }}>
                                        영화 추천
                                    </h3>
                                    <p style={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '13px',
                                        margin: 0,
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                                        lineHeight: '1.3',
                                        maxWidth: '140px',
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
                            height: '100%',
                            minHeight: '200px'
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
                            height: '100%',
                            minHeight: '200px',
                            gap: '1rem'
                        }}>
                            <div style={{ color: '#ff6b6b', fontSize: '16px', textAlign: 'center' }}>
                                {error}
                            </div>
                            <button
                                onClick={fetchAIRecommendation}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {/* 영화 목록 */}
                    {hasRecommendation && showResults && displayedMovies.length > 0 && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '12px',
                                    padding: '0 0px'
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
                                            //boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                                            animation: `fadeInSlide 0.4s ease-out ${index * 0.1}s both`,
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
                                                height: '160px',
                                                objectFit: 'cover',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                display: 'block'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />


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
                                    fontSize: '14px'
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
                        position: 'absolute',
                        bottom: '24px',
                        left: '24px',
                        right: '24px',
                        zIndex: 2,
                    }}
                >
                    <button
                        onClick={hasRecommendation && showResults ? handleRegenerate : onClose}
                        style={{
                            width: '100%',
                            background: hasRecommendation && showResults
                                ? 'linear-gradient(135deg, #4ecdc4, #44a08d)'
                                : 'linear-gradient(135deg, #ff7e7eff, #ff0000ff)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: hasRecommendation && showResults
                                ? '0 4px 15px rgba(78, 205, 196, 0.4)'
                                : '0 4px 15px rgba(255, 0, 0, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = hasRecommendation && showResults
                                ? '0 6px 20px rgba(78, 205, 196, 0.5)'
                                : '0 6px 20px rgba(255, 0, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = hasRecommendation && showResults
                                ? '0 4px 15px rgba(78, 205, 196, 0.4)'
                                : '0 4px 15px rgba(255, 0, 0, 0.4)';
                        }}
                    >
                        {hasRecommendation && showResults && <RefreshCw size={18} />}
                        {hasRecommendation && showResults ? '새로운 추천 받기' : '닫기'}
                    </button>
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
                    
                    @keyframes slideUp {
                      from {
                        transform: translateY(100%);
                        opacity: 0;
                      }
                      to {
                        transform: translateY(0);
                        opacity: 1;
                      }
                    }
                    
                    @keyframes slideDown {
                      from {
                        transform: translateY(0);
                        opacity: 1;
                      }
                      to {
                        transform: translateY(100%);
                        opacity: 0;
                      }
                    }
                    
                    @keyframes scaleIn {
                      from {
                        transform: scale(0.8);
                        opacity: 0;
                      }
                      to {
                        transform: scale(1);
                        opacity: 1;
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
                    `}
                </style>
            </div>
        </div>
    );
};

export default AI_Modal;