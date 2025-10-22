import { useState, useEffect } from 'react';
import logo from '../../assets/logo4.png';
import button_skip from '../../assets/button_skip.png'

const Onboarding = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  const fetchPopularMovies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/movies/onboarding?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('영화 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      // 특별한 순서로 배열 재정렬
      const reorderedMovies = reorderMovies(data);
      setMovies(reorderedMovies);

    } catch (err) {
      console.error('영화 목록 로딩 오류:', err);
      setError('영화 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 특별한 순서로 영화 배열 재정렬 함수
  const reorderMovies = (originalMovies) => {
    const reordered = [];
    let frontIndex = 0;
    let backIndex = originalMovies.length - 1;
    let useFront = true;

    for (let i = 0; i < originalMovies.length; i++) {
      if (useFront) {
        reordered.push({
          ...originalMovies[frontIndex],
          displayIndex: i,
          animationDelay: calculateAnimationDelay(i)
        });
        frontIndex++;
      } else {
        reordered.push({
          ...originalMovies[backIndex],
          displayIndex: i,
          animationDelay: calculateAnimationDelay(i)
        });
        backIndex--;
      }
      useFront = !useFront;
    }

    return reordered;
  };

  // 대각선 파도타기 애니메이션 지연시간 계산
  const calculateAnimationDelay = (index) => {
    const cols = window.innerWidth >= 1200 ? 8 : (window.innerWidth >= 768 ? 6 : 4); // 모바일 4열로 변경
    const row = Math.floor(index / cols);
    const col = index % cols;

    // 대각선 기준으로 지연시간 계산 (왼쪽 위에서 오른쪽 아래로)
    return (row + col) * 0.08 + 0.5; // 0.08초씩 지연, 0.5초 후 시작
  };

  // 토큰 가져오기 함수
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ authToken이 없습니다.');
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  // 영화 선택/해제 토글 함수
  const toggleMovieSelection = (movieId) => {
    setSelectedMovies(prev => {
      if (prev.includes(movieId)) {
        return prev.filter(id => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };

  const handleCompleteClick = () => {
    if (selectedMovies.length === 0) {
      return;
    }
    setShowConfirmModal(true);
    setError('');
  };

  // 스킵 버튼 클릭 핸들러
  const handleSkipClick = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users/onboarding-skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboardingCompleted: true,
          skipped: true
        })
      });

      if (!response.ok) {
        throw new Error('온보딩 스킵 처리에 실패했습니다.');
      }

      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.removeItem('needsOnboarding');
      }

      // 홈 화면으로 이동
      window.location.href = '/home';

    } catch (err) {
      console.error('온보딩 스킵 오류:', err);
      // 에러 발생해도 홈으로 이동
      window.location.href = '/home';
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 (계속 선택)
  const handleContinueSelection = () => {
    setShowConfirmModal(false);
  };

  // 최종 완료 (홈으로 이동)
  const handleFinalComplete = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const authToken = getAuthToken();

      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/onboarding', {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieIds: selectedMovies
        })
      });

      if (!response.ok) {
        throw new Error('온보딩 완료 처리에 실패했습니다.');
      }

      const result = await response.json();
      // console.log('온보딩 완료:', result);

      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.removeItem('needsOnboarding');
      }

      // 환영 모달 표시
      setShowWelcomeModal(true);

      // 3초 후 홈으로 이동
      setTimeout(() => {
        window.location.href = '/home';
      }, 3000);

    } catch (err) {
      console.error('온보딩 완료 오류:', err);
      // 에러 발생해도 환영 모달 표시 후 홈으로 이동
      setShowWelcomeModal(true);
      setTimeout(() => {
        window.location.href = '/home';
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const response = await fetch('/api/users/onboarding-skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboardingCompleted: true,
          skipped: true
        })
      });

      if (!response.ok) {
        throw new Error('온보딩 스킵 처리에 실패했습니다.');
      }

      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.removeItem('needsOnboarding');
      }

      // 홈 화면으로 이동
      window.location.href = '/home';

    } catch (err) {
      console.error('온보딩 스킵 오류:', err);
      // 에러 발생해도 홈으로 이동
      window.location.href = '/home';
    } finally {
      setIsSubmitting(false);
    }
  };

  // 에러 상태일 때 화면
  if (error && movies.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#1a1a1a',
          color: 'white',
          flexDirection: 'column'
        }}
      >
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={fetchPopularMovies}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="main-container" style={{
      height: '120vh',
      width: '100%',
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      <style>
        {`
            /* 전체 페이지 배경을 검은색으로 설정 */
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #1a1a1a !important;
              overflow-x: hidden !important;
              width: 100% !important;
              max-width: 100% !important;
            }

            /* 펄스 애니메이션 */
            @keyframes pulse {
              0% { opacity: 0.7; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.02); }
              100% { opacity: 0.7; transform: scale(1); }
            }
            
            * {
              box-sizing: border-box;
            }
            
            /* 컨테이너 오버플로우 방지 */
            .main-container {
              max-width: 100vw;
              overflow-x: hidden;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            /* 애니메이션 */
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes bounceIn {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(40px) scale(0.7);
                filter: blur(4px);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0px);
              }
            }
            
            /* 스크롤바 숨기기 */
            .movie-scroll::-webkit-scrollbar {
              display: none;
            }
            .movie-scroll {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            
            /* 반응형 그리드 */
            .movie-grid {
              display: grid;
              gap: 8px;
              padding: 10px;
              width: 100%;
              max-width: 100%;
            }
            
            /* 데스크톱: 8열 */
            @media (min-width: 1200px) {
              .movie-grid {
                grid-template-columns: repeat(8, 1fr);
                gap: 12px;
                padding: 15px;
                max-width: 100%;
              }
            }
            
            /* 태블릿: 6열 */
            @media (min-width: 768px) and (max-width: 1199px) {
              .movie-grid {
                grid-template-columns: repeat(6, 1fr);
                gap: 10px;
                padding: 12px;
                max-width: 100%;
              }
            }
            
            /* 모바일: 4열로 변경 */
            @media (max-width: 767px) {
              .movie-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                padding: 15px 15px 120px 15px; /* 하단에 버튼을 위한 패딩 추가 */
                max-width: 100%;
              }
              
              .movie-container {
                height: calc(100vh - 70px); /* 메시지 공간만 제외 */
              }
              
              .bottom-fixed-area {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, #1a1a1a 20%, #1a1a1a);
                padding: 15px 20px 20px 20px;
                z-index: 100;
              }
            }
            
            /* 데스크톱에서는 기본 레이아웃 */
            @media (min-width: 768px) {
              .bottom-fixed-area {
                position: static;
                background: none;
                padding: 10px 20px 20px 20px;
              }
            }
            
            /* 영화 카드 */
            .movie-card {
              aspect-ratio: 2/3;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              border-radius: 8px;
              overflow: hidden;
              background-color: #333;
              opacity: 0;
              transform: translateY(40px) scale(0.7);
              filter: blur(4px);
              animation: fadeInUp 0.8s ease-out forwards;
              animation-fill-mode: both;
            }
            
            @media (max-width: 767px) {
              .movie-card {
                border-radius: 8px;
              }
            }
            
            .movie-card:hover {
              transform: translateY(-5px) scale(1.05);
              box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
            }
          `}
      </style>

      {/* 가운데 로고 */}
      <img
        src={logo}
        alt="FeelRoom Logo"
        style={{
          marginTop: '0.5rem',
          height: window.innerWidth >= 1200 ? '4rem' : '3rem',
          objectFit: 'contain',
          marginBottom: '-1rem'
        }}
      />

      {/* Skip 버튼 - 우상단 고정 위치 */}
      <img
        src={button_skip}
        alt="건너뛰기"
        onClick={handleSkipClick}
        style={{
          position: 'fixed',
          top: window.innerWidth >= 1200 ? '50px' : '35px',
          right: window.innerWidth >= 1200 ? '30px' : '15px',
          width: window.innerWidth >= 1200 ? 'auto' : '40px',
          height: window.innerWidth >= 1200 ? '30px' : '20px',
          //marginBottom: window.innerWidth >= 1200 ? '20px' : '40px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.6 : 1,
          transition: 'all 0.3s ease',
          filter: isSubmitting ? 'grayscale(50%)' : 'none',
          zIndex: 100
        }}
      />

      {/* 영화 목록 - 메인 화면 */}
      <div className="movie-container" style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: '100px',
        marginTop: '30px',
        maxWidth: '100%'
      }}>
        <div className="movie-scroll" style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%'
        }}>
          {/* 메시지를 스크롤 영역 안으로 이동 */}
          <div style={{
            padding: '0 20px 15px 20px',
            flexShrink: 0,
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: window.innerWidth >= 1200 ? '1.8rem' : '1.0rem',
              color: '#fff',
              margin: 0,
              fontWeight: '500',
              lineHeight: '1.3',
              marginBottom: window.innerWidth >= 1200 ? '-1.4rem' : '-1.25rem',
            }}>
              선택하신 영화를 바탕으로 맞춤 추천을 해드릴게요!
            </p>
          </div>

          <div className="movie-grid">
            {movies.map(movie => (
              <div
                key={movie.movieId}
                onClick={() => toggleMovieSelection(movie.movieId)}
                className="movie-card"
                style={{
                  transform: selectedMovies.includes(movie.movieId) ? 'scale(0.92)' : 'scale(1)',
                  border: selectedMovies.includes(movie.movieId) ? '4px solid #007bff' : '4px solid transparent',
                  boxShadow: selectedMovies.includes(movie.movieId)
                    ? '0 0 20px rgba(0, 123, 255, 0.6)'
                    : '0 3px 10px rgba(0,0,0,0.4)',
                  animationDelay: `${movie.animationDelay}s`,
                  '--animation-delay': `${movie.animationDelay}s`
                }}
              >
                {/* 선택 표시 */}
                {selectedMovies.includes(movie.movieId) && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: 'clamp(20px, 5vw, 28px)',
                    height: 'clamp(20px, 5vw, 28px)',
                    backgroundColor: '#007bff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    fontSize: 'clamp(12px, 3vw, 16px)',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}

                {/* 포스터 이미지 */}
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    // 대체 이미지나 플레이스홀더 표시
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 0.8rem;
                        text-align: center;
                        padding: 10px;
                      `;
                    placeholder.textContent = movie.title;
                    e.target.parentNode.appendChild(placeholder);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* 제목 오버레이 */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  padding: '20px 8px 8px 8px',
                  fontSize: 'clamp(0.6rem, 2.5vw, 0.8rem)',
                  fontWeight: '500',
                  textAlign: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}>
                  {movie.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#1a1a1a',
          padding: '10px 0',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center', // 중앙 정렬 추가
          // 간격 추가
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '44px' }}>
          {/* 진행률 바 */}
          <div
            style={{
              position: 'absolute',
              left: '54%',
              transform: 'translateX(-50%)',
              backgroundColor: '#333',
              borderRadius: '20px',
              padding: '3px',
              width: 'clamp(250px, 70vw, 300px)',
              height: 'clamp(36px, 9vw, 44px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: '3px',
                height: 'calc(100% - 6px)',
                width: `${Math.min((selectedMovies.length / 10) * 100, 100)}%`,
                backgroundColor: '#ff69b4',
                borderRadius: '17px',
                transition: 'width 0.5s ease-in-out',
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
                fontWeight: '600',
                color: 'white',
              }}
            >
              {selectedMovies.length} / 10
            </div>
          </div>

          {/* 추가 선택 가능 메시지 */}
          <div
            style={{
              position: 'absolute',
              left: '65%',
              top: '18%',
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              color: '#ff69b4',
              fontWeight: '500',
              paddingLeft: '0.5em',
              opacity: selectedMovies.length > 9 ? 1 : 0,
              transition: 'opacity 0.3s ease',
              animation: selectedMovies.length > 9 ? 'pulse 2s infinite' : 'none',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {'     추가 선택이 가능합니다! ✨'}
          </div>
        </div>

        {/* 완료 버튼 */}
        <div style={{ textAlign: 'center', marginBottom: 0 }}>
          <button
            onClick={handleCompleteClick}
            disabled={isSubmitting || selectedMovies.length === 0}
            style={{
              backgroundColor: selectedMovies.length > 0 ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: window.innerWidth >= 1200
                ? 'clamp(8px, 2.5vw, 10px) clamp(20px, 6vw, 28px)'
                : '4px 4px', // 모바일: 상하 8px, 좌우 8px
              fontSize: 'clamp(0.95rem, 4vw, 1.1rem)',
              fontWeight: '600',
              cursor: selectedMovies.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: isSubmitting ? 0.6 : 1,
              width: window.innerWidth >= 1200 ? 'clamp(80px, 40vw, 100px)' : '60px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              marginBottom: '6px',
              marginTop: '3px',
              marginRight: '14px'
            }}
          >
            완료
          </button>
        </div>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              marginBottom: '15px',
              color: 'white'
            }}>
              {selectedMovies.length < 5
                ? '영화를 더 많이 선택하면 사용자에게 더 도움을 드릴 수 있어요'
                : '선택이 완료되었습니다!'}
            </h3>
            <p style={{
              color: '#ccc',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              현재 {selectedMovies.length}개의 영화를 선택하셨습니다.
              {selectedMovies.length < 5 && ' 더 정확한 추천을 위해 추가 선택을 권장합니다.'}
            </p>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              {/* 1개 미만일 때: 스킵/확인 버튼 */}
              {selectedMovies.length < 1 ? (
                <>
                  <button
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    스킵
                  </button>
                  <button
                    onClick={handleContinueSelection}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    확인
                  </button>
                </>
              ) : (
                /* 1개 이상일 때: 추가 선택/확인 버튼 */
                <>
                  <button
                    onClick={handleContinueSelection}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    추가 선택
                  </button>
                  <button
                    onClick={handleFinalComplete}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? '저장 중...' : '확인'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 환영 모달 */}
      {showWelcomeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '20px',
            padding: '50px 40px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            animation: 'bounceIn 0.8s ease-out'
          }}>
            {/* 환영 이모티콘 */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>
              🎉
            </div>

            {/* 환영 메시지 */}
            <h2 style={{
              fontSize: '2rem',
              marginBottom: '20px',
              color: '#ff69b4',
              fontWeight: 'bold'
            }}>
              삘룸에 오신 걸 환영합니다!!
            </h2>

            <p style={{
              fontSize: '1.2rem',
              color: '#ccc',
              lineHeight: '1.5',
              marginBottom: '30px'
            }}>
              선택해주신 {selectedMovies.length}개의 영화를 바탕으로<br />
              맞춤형 추천을 준비하고 있어요! ✨
            </p>

            {/* 로딩 애니메이션 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '5px',
              marginTop: '20px'
            }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#ff69b4',
                    borderRadius: '50%',
                    animation: `pulse 1.5s infinite ${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default Onboarding;