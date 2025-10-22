import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock, Film } from 'lucide-react';
import boxOffice_title from '../../assets/boxoffice_title.png';
import Gold from '../../assets/medal_gold.png';
import Silver from '../../assets/medal_silver.png';
import Bronze from '../../assets/medal_bronze.png';
import logo from '../../assets/logo4.png';
import BackgroundComponent from '../../BackgroundComponent2.jsx';

const BoxOffice = () => {
  const navigate = useNavigate();
  const [boxOfficeData, setBoxOfficeData] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankingDate, setRankingDate] = useState('');
  const [detailsLoading, setDetailsLoading] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

  // 화면 크기 변화 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);


  }, []);
  // 페이지 진입 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  // 메달 이미지 가져오기 함수
  const getMedalImage = (ranking) => {
    switch (ranking) {
      case 1:
        return Gold;
      case 2:
        return Silver;
      case 3:
        return Bronze;
      default:
        return null;
    }
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

  // 영화 상세 정보 가져오기
  const fetchMovieDetails = async (movieId) => {
    if (detailsLoading[movieId] || movieDetails[movieId]) return;

    setDetailsLoading(prev => ({ ...prev, [movieId]: true }));

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        console.warn('⚠️ authToken이 없어서 상세 정보를 가져올 수 없습니다.');
        return;
      }

      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${movieId}`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        setMovieDetails(prev => ({
          ...prev,
          [movieId]: data.details
        }));
      } else {
        console.warn(`⚠️ 영화 ${movieId} 상세정보 조회 실패:`, response.status);
      }
    } catch (error) {
      console.error(`❌ 영화 ${movieId} 상세정보 로드 에러:`, error);
    } finally {
      setDetailsLoading(prev => ({ ...prev, [movieId]: false }));
    }
  };

  // 박스오피스 데이터 가져오기
  const fetchBoxOfficeData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 현재 상영작 API 호출 시작');

      const response = await fetch(
        `https://i13d208.p.ssafy.io/api/v1/movies/now`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        }
      );

      console.log('📡 현재 상영작 API 응답 상태:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: 현재 상영작 데이터를 불러올 수 없습니다.`;
        try {
          const errorText = await response.text();
          console.error('❌ 현재 상영작 API 에러 응답:', errorText);

          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
              console.warn('에러 응답이 JSON이 아님:', parseError);
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (textError) {
          console.error('에러 응답 읽기 실패:', textError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ 현재 상영작 데이터 조회 성공:', data);

      if (!Array.isArray(data)) {
        console.error('❌ 응답 데이터가 배열이 아닙니다:', data);
        throw new Error('올바르지 않은 데이터 형식입니다.');
      }

      if (data.length === 0) {
        console.warn('⚠️ 현재 상영작 데이터가 비어있습니다.');
        setBoxOfficeData([]);
        return;
      }

      // 랭킹 순으로 정렬하고 상위 10개만
      const sortedData = data.sort((a, b) => a.ranking - b.ranking).slice(0, 10);

      if (sortedData.length > 0) {
        setRankingDate(sortedData[0].rankingDate);
      }

      setBoxOfficeData(sortedData);

      // 각 영화의 상세 정보를 순차적으로 가져오기
      sortedData.forEach((movie, index) => {
        if (movie.movieId && movie.movieId !== 9999999) {
          // 애니메이션을 위해 순차적으로 호출
          setTimeout(() => {
            fetchMovieDetails(movie.movieId);
          }, index * 200);
        }
      });
    } catch (err) {
      console.error('❌ 현재 상영작 데이터 조회 실패:', err);
      setError(err.message || '현재 상영작 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxOfficeData();
  }, []);

  const handleMovieClick = (movie) => {
    console.log('영화 클릭:', movie.title, 'movieId:', movie.movieId);

    if (movie.movieId && movie.movieId !== 9999999) {
      navigate(`/movieDetail/${movie.movieId}`);
    } else {
      console.error('유효하지 않은 영화 ID:', movie);
      alert('해당 영화의 상세 정보를 찾을 수 없습니다.');
    }
  };

  // 관객수 포맷팅 함수
  const formatAudience = (audience) => {
    if (audience >= 10000) {
      return `${Math.floor(audience / 10000)}만${audience % 10000 > 0 ? Math.floor((audience % 10000) / 1000) + '천' : ''}명`;
    } else if (audience >= 1000) {
      return `${Math.floor(audience / 1000)}천명`;
    } else {
      return `${audience}명`;
    }
  };

  // 제목 말줄임 처리 함수 (모바일용)
  const truncateTitle = (title) => {
    if (isMobile && title.length > 7) {
      return title.substring(0, 7) + '...';
    }
    return title;
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>현재 상영작 데이터를 불러오는 중...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          오류가 발생했습니다: {error}
        </div>
        <button
          onClick={fetchBoxOfficeData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1rem',
      maxWidth: '1000px',
      margin: '0 auto',
      position: 'relative'
    }}>
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
      <BackgroundComponent />
      {/* 로고 섹션 - 맨 상단에 추가 */}
      <div style={{
        textAlign: 'center',
        marginBottom: isMobile ? '-1rem' : '-1.6rem',
        marginTop: isMobile ? '-1.6rem' : '-1rem',
        paddingTop: '1rem'
      }}>
        <img
          src={logo}
          alt="로고"
          style={{
            height: isMobile ? '40px' : '60px',
            width: 'auto'
          }}
        />
      </div>


      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .movie-item {
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }
        
        .shimmer-loading {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>



      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <img
            src={boxOffice_title}
            alt="박스오피스 순위"
            style={{
              height: isMobile ? '20px' : '30px',
              marginTop: isMobile ? '10px' : '20px',
              marginLeft: isMobile ? '12px' : '20px',
              marginBottom: isMobile ? '-36px' : '-40px',
              width: 'auto'
            }}
          />
        </div>
        {rankingDate && (
          <div style={{
            fontSize: isMobile ? '0.8rem' : '1rem',
            color: '#6b7280',
            marginTop: '0.5rem',
            marginBottom: isMobile ? '-1.8rem' : '-1.6rem',
            marginRight: isMobile ? '0.6rem' : '1rem',
            textAlign: 'right',
            fontWeight: '500'
          }}>
            {rankingDate.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1.$2.$3')} 24:00 기준
          </div>
        )}
      </div>

      {/* 세로 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {boxOfficeData.map((movie, index) => {
          const details = movieDetails[movie.movieId];
          const isLoading = detailsLoading[movie.movieId];
          const medalImage = getMedalImage(movie.ranking);

          return (
            <div
              key={movie.movieId}
              className="movie-item"
              onClick={() => handleMovieClick(movie)}
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                padding: isMobile ? '0.8rem' : '1rem',
                background: '#ffffff',
                //border: isMobile ? '2px solid #000000ff' : '3px solid #000000ff',
                borderTop: index < 3
                  ? (isMobile ? '6px solid #7e1717ff' : '8px solid #7e1717ff')
                  : (isMobile ? '6px solid #4c4b4bff' : '8px solid #4c4b4bff'),
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                gap: isMobile ? '0.8rem' : '1rem',
                animationDelay: `${index * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {/* 순위 - 메달 이미지 또는 숫자 */}
              <div style={{
                minWidth: isMobile ? '2.5rem' : '3rem',
                textAlign: 'center',
                marginLeft: isMobile ? '-0.8rem' : '0rem',
                marginRight: isMobile ? '-0.8rem' : '0rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {medalImage ? (
                  <img
                    src={medalImage}
                    alt={`${movie.ranking}등 메달`}
                    style={{
                      width: isMobile ? '54px' : '85px',
                      height: isMobile ? '54px' : '85px',
                      marginTop: isMobile ? '-0.9rem' : '-8rem',
                      marginRight: isMobile ? '-1rem' : '-4rem',
                      marginLeft: isMobile ? '-1rem' : '-4rem',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: isMobile ? '1.3rem' : '1.8rem',
                    marginTop: isMobile ? '0rem' : '-8.5rem',
                    fontWeight: 'bold',
                    color: '#000000ff'
                  }}>
                    {movie.ranking}
                  </div>
                )}
              </div>

              {/* 모바일일 때: 포스터와 제목을 세로로 배치 */}
              {isMobile ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {/* 포스터 이미지 */}
                  <div style={{
                    width: '90px',
                    height: '135px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
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
                    <div style={{
                      display: movie.posterUrl ? 'none' : 'flex',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#e5e7eb',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
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
                  </div>

                </div>
              ) : (
                /* 일반 모드일 때: 기존 포스터만 */
                <div style={{
                  width: '120px',
                  height: '180px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
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
                  <div style={{
                    display: movie.posterUrl ? 'none' : 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#e5e7eb',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
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
                </div>
              )}

              {/* 영화 정보 */}
              <div style={{ flex: 1 }}>
                {/* 모바일일 때: 제목을 맨 위에 표시 */}
                {isMobile && (
                  <h3 style={{
                    margin: '0',
                    marginTop: isMobile ? '0.4rem' : '0rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#000000ff',
                    lineHeight: '1.2',
                    marginBottom: '0.3rem'
                  }}>
                    {movie.title.length > 13 ? movie.title.substring(0, 13) + '...' : movie.title}
                  </h3>
                )}

                {/* 제목과 개봉일 (일반 모드에서만 표시) */}
                {!isMobile && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.8rem',
                    marginTop: '-0.7rem'
                  }}>
                    <h3 style={{
                      margin: '0',
                      fontSize: '1.6rem',
                      fontWeight: 'bold',
                      color: '#374151',
                      lineHeight: '1.2'
                    }}>
                      {movie.title}
                    </h3>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      marginTop: '0.6rem'
                    }}>
                      {movie.releaseDate + ' 개봉'}
                    </div>
                  </div>
                )}

                {/* 누적관객수 */}
                <div style={{
                  marginBottom: isMobile ? '0.3rem' : '0.5rem',
                  marginTop: isMobile ? '0rem' : '0rem',
                  color: '#374151',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Users size={isMobile ? 14 : 16} />
                  <span><strong>누적관객수:</strong> {formatAudience(movie.audience)}</span>
                </div>

                {/* 장르, 평점, 상영시간 */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '0.2rem' : '1.5rem',
                  marginBottom: isMobile ? '0.2rem' : '0.5rem',
                  fontSize: isMobile ? '0.8rem' : '0.85rem',
                  color: '#6b7280',
                  flexWrap: 'wrap'
                }}>
                  {/* 모바일일 때: 평점과 개봉일을 같은 줄에 */}
                  {isMobile ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginTop: '0rem'
                    }}>
                      {/* 평점 (평점 정보가 있을 때만 표시) */}
                      {movie.voteAverage > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <Star size={12} fill="currentColor" />
                          <span>{movie.voteAverage}/10.0</span>
                        </div>
                      )}

                      {/* 개봉일 */}
                      <div style={{
                        color: '#6b7280',
                        fontSize: '0.8rem'
                      }}>
                        {movie.releaseDate.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1.$2.$3')} 개봉
                      </div>
                    </div>
                  ) : (
                    /* 일반 모드일 때: 기존 평점 */
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Star size={14} fill="currentColor" />
                      <span>{movie.voteAverage > 0 ? `${movie.voteAverage}/10.0` : '평점 정보 없음'}</span>
                    </div>
                  )}

                  {/* 상세 정보가 로딩 중이면 스켈레톤, 아니면 실제 정보 */}
                  {isLoading ? (
                    <>
                      <div className="shimmer-loading" style={{
                        width: isMobile ? '60px' : '80px',
                        height: isMobile ? '12px' : '14px',
                        borderRadius: '2px'
                      }}></div>
                      <div className="shimmer-loading" style={{
                        width: isMobile ? '45px' : '60px',
                        height: isMobile ? '12px' : '14px',
                        borderRadius: '2px'
                      }}></div>
                    </>
                  ) : details ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'row' : 'row',
                      gap: isMobile ? '1rem' : '1.5rem',
                      alignItems: isMobile ? 'center' : 'flex-start'
                    }}>
                      {/* 장르 */}
                      {details.genres && details.genres.length > 0 && (
                        <div>
                          <strong>장르:</strong> {details.genres.slice(0, 2).join(', ')}
                        </div>
                      )}

                      {/* 상영시간 */}
                      {details.runtime > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={isMobile ? 12 : 14} />
                          <span>{details.runtime}분</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* 감독, 출연 */}
                {!isLoading && details && (
                  <div style={{
                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                    color: '#6b7280',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '0.1rem' : '0.25rem'
                  }}>
                    {details.directors && details.directors.length > 0 && (
                      <div>
                        <strong>감독:</strong> {details.directors.slice(0, 2).join(', ')}
                      </div>
                    )}

                    {details.actors && details.actors.length > 0 && (
                      <div>
                        <strong>출연:</strong> {details.actors.slice(0, isMobile ? 2 : 3).join(', ')}
                        {details.actors.length > (isMobile ? 2 : 3) && ' 외'}
                      </div>
                    )}
                  </div>
                )}

                {/* 로딩 중일 때 */}
                {isLoading && (
                  <div style={{
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontStyle: 'italic',
                    opacity: 0.7,
                    color: '#6b7280'
                  }}>
                    상세 정보 로드 중...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {boxOfficeData.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: isMobile ? '1rem' : '1.2rem',
          padding: isMobile ? '2rem' : '3rem',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}>
          현재 상영작 데이터가 없습니다.
        </div>
      )}
    </div>
  );
};

export default BoxOffice;