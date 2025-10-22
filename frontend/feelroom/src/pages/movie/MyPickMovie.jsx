import { Heart, X, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundComponent from '../../BackgroundComponent2.jsx';

// 좋아요 확인 모달 컴포넌트
const LikeConfirmationModal = ({ isOpen, onClose, onConfirm, isLiked, movieTitle, isLoading }) => {
    if (!isOpen) return null;


    return (

        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                
                @keyframes slideUp {
                  from { 
                    opacity: 0; 
                    transform: translateY(30px) scale(0.95); 
                  }
                  to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                  }
                }
                
                .modal-content {
                  animation: slideUp 0.3s ease-out;
                }
                
                .heart-animation {
                  animation: heartBeat 0.6s ease-in-out;
                }
                
                @keyframes heartBeat {
                  0%, 100% { transform: scale(1); }
                  25% { transform: scale(1.1); }
                  50% { transform: scale(1.2); }
                  75% { transform: scale(1.1); }
                }
                
                .button-hover:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
            `}</style>

            <div
                className="modal-content"
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        color: '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                    }}
                >
                    <X size={20} />
                </button>

                {/* 아이콘 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div
                        className="heart-animation"
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: isLiked ? '#fef2f2' : '#f0fdf4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${isLiked ? '#fecaca' : '#bbf7d0'}`
                        }}
                    >
                        <Heart
                            size={32}
                            fill={isLiked ? "#ef4444" : "#22c55e"}
                            color={isLiked ? "#ef4444" : "#22c55e"}
                        />
                    </div>
                </div>

                {/* 제목 */}
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    color: '#111827',
                    lineHeight: '1.4'
                }}>
                    {isLiked ? '좋아요를 취소하시겠습니까?' : '이 영화에 좋아요를 하시겠습니까?'}
                </h3>

                {/* 영화 제목 */}
                {movieTitle && (
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        fontWeight: '500',
                        padding: '0.5rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        "{movieTitle}"
                    </p>
                )}

                {/* 설명 텍스트 */}
                <p style={{
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    lineHeight: '1.5'
                }}>
                    {isLiked
                        ? '좋아요한 영화 목록에서 제거됩니다.'
                        : '좋아요한 영화 목록에 추가됩니다.'}
                </p>

                {/* 버튼 그룹 */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center'
                }}>
                    {/* 취소 버튼 */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="button-hover"
                        style={{
                            flex: 1,
                            padding: '0.75rem 1.2rem',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#374151',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            opacity: isLoading ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = '#f9fafb';
                                e.target.style.borderColor = '#9ca3af';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        취소
                    </button>

                    {/* 확인 버튼 */}
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="button-hover"
                        style={{
                            flex: 1,
                            padding: '0.75rem 1.2rem',
                            border: 'none',
                            backgroundColor: isLiked ? '#ef4444' : '#22c55e',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            opacity: isLoading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = isLiked ? '#dc2626' : '#16a34a';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = isLiked ? '#ef4444' : '#22c55e';
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                처리 중...
                            </>
                        ) : (
                            <>
                                <Heart size={16} fill="currentColor" />
                                {isLiked ? '좋아요 취소' : '좋아요'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MyPickMovie = () => {
    const [likedMovies, setLikedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLikeModal, setShowLikeModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [likeLoading, setLikeLoading] = useState(false);
    const navigate = useNavigate(); // useNavigate hook 추가

    // 컴포넌트 상단에 추가
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1200);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 토큰 가져오기 함수
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    // 좋아요한 영화 목록 가져오기
    const fetchLikedMovies = async () => {
        setLoading(true);
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                setError('로그인이 필요합니다.');
                return;
            }

            console.log('💖 좋아요한 영화 목록 조회 시작');
            const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/liked-movies?page=0&size=20', {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 좋아요한 영화 목록 API 응답 상태:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ 좋아요한 영화 목록 조회 성공:', data);
                setLikedMovies(data.movies);
            } else if (response.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
                console.warn('⚠️ 인증 실패:', response.status);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ 좋아요한 영화 목록 조회 실패:', errorData);
                setError(errorData.message || '좋아요한 영화 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('❌ 좋아요한 영화 목록 로드 에러:', err);
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchLikedMovies();
    }, []);

    // 하트 클릭 핸들러 (모달 열기)
    const handleHeartClick = (movie, e) => {
        e.stopPropagation(); // 부모 클릭 이벤트 방지
        setSelectedMovie(movie);
        setShowLikeModal(true);
    };

    // 좋아요 토글 처리
    const handleLikeConfirm = async () => {
        if (!selectedMovie || likeLoading) return;

        const authToken = getAuthToken();
        if (!authToken) {
            alert('로그인이 필요합니다.');
            return;
        }

        setLikeLoading(true);
        try {
            console.log('💖 좋아요 토글 요청 시작:', selectedMovie.movie_id);

            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${selectedMovie.movie_id}/like`, {
                method: 'PUT',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 좋아요 토글 API 응답 상태:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ 좋아요 토글 성공:', data);

                // 좋아요가 취소되면 목록에서 제거
                if (!data.liked) {
                    setLikedMovies(prev => prev.filter(movie => movie.movie_id !== selectedMovie.movie_id));
                }

                // 성공 후 모달 닫기
                setShowLikeModal(false);
                setSelectedMovie(null);
            } else if (response.status === 401) {
                console.warn('⚠️ 좋아요 토글 인증 실패:', response.status);
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ 좋아요 토글 실패:', errorData);
                alert(errorData.message || '좋아요 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('❌ 좋아요 처리 에러:', error);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setLikeLoading(false);
        }
    };

    // 영화 포스터 클릭 핸들러
    const handleMovieClick = (movie) => {
        console.log('영화 클릭:', movie);
        console.log('이동할 경로:', `/movieDetail/${movie.movie_id}`);
        navigate(`/movieDetail/${movie.movie_id}`);
    };

    // 로딩 상태
    if (loading) {
        return (
            <div style={{ padding: '1rem' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '2rem 0 0.5rem 2.5rem',
                    marginBottom: '-1rem'
                }}>
                    좋아요한 영화
                </h2>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    fontSize: '1.1rem',
                    color: '#6b7280'
                }}>
                    좋아요한 영화를 불러오는 중...
                </div>
            </div>
        );
    };



    return (


        <div style={{ padding: '1rem' }}>
            <BackgroundComponent />
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                }}
            >
                <ArrowLeft size={20} />
                뒤로가기
            </button>
            {/* CSS 애니메이션 */}
            <style jsx>{`
       

        /* 가로 스크롤바 완전 제거 */
        * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden !important;
        }
      `}</style>

            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: isMobile ? '1rem' : '0rem',
                marginLeft: isMobile ? '0.4rem' : '0rem',
                marginBottom: '-1.6rem'
            }}>
                좋아요한 영화
            </h2>
            {likedMovies.length === 0 ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    fontSize: '1.1rem',
                    color: '#6b7280'
                }}>
                    아직 좋아요한 영화가 없습니다.
                </div>
            ) : (
                // 그리드 스타일 부분을 이렇게 변경
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                            ? 'repeat(3, minmax(100px, 1fr))'
                            : 'repeat(auto-fill, minmax(150px, 200px))',
                        gap: '16px',
                        marginBottom: '1rem',
                        marginTop: '2rem'
                    }}
                >
                    {likedMovies.map((movie) => (
                        <div
                            key={movie.movie_id}
                            onClick={() => handleMovieClick(movie)}
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                backgroundColor: '#f3f4f6',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {/* 영화 포스터 */}
                            <div style={{
                                width: '100%',
                                aspectRatio: '2/3',
                                backgroundColor: '#e5e7eb',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {movie.poster_url ? (
                                    <img
                                        src={movie.poster_url}
                                        alt={movie.title}
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

                                {/* 포스터 없을 때 기본 이미지 */}
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#e5e7eb',
                                    display: movie.poster_url ? 'none' : 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#9ca3af',
                                    fontSize: '0.8rem'
                                }}>
                                    포스터 없음
                                </div>

                                {/* 하트 버튼 */}
                                <button
                                    onClick={(e) => handleHeartClick(movie, e)}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'none',
                                        border: 'none',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        zIndex: 1,
                                        padding: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <Heart
                                        size={24}
                                        fill="#ef4444"
                                        stroke="white"
                                        strokeWidth={1}
                                    />
                                </button>
                            </div>

                            {/* 영화 제목 */}
                            <div style={{
                                padding: '0.45rem 0.5rem',
                                backgroundColor: 'white'
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#111827',
                                    lineHeight: '1.3',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {movie.title.length > 18 ? `${movie.title.slice(0, 18)}...` : movie.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 좋아요 확인 모달 */}
            <LikeConfirmationModal
                isOpen={showLikeModal}
                onClose={() => {
                    setShowLikeModal(false);
                    setSelectedMovie(null);
                }}
                onConfirm={handleLikeConfirm}
                isLiked={true} // 좋아요한 영화 목록이므로 항상 true
                movieTitle={selectedMovie?.title}
                isLoading={likeLoading}
            />
        </div>
    );
};

export default MyPickMovie;