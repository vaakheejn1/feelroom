// src/pages/review/MovieSelection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import { moviesAPI } from '../../api/movies';
import img2 from '../../assets/img2.png';
import logo from '../../assets/logo4.png';

export default function MovieSelection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchMovies, setSearchMovies] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [movieCount, setMovieCount] = useState(0);
  const [currentMovies, setCurrentMovies] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [errorCurrent, setErrorCurrent] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // 토큰 가져오기 함수
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ authToken이 없습니다.');
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  // 영화 검색 함수
  const searchMoviesAPI = async (title) => {
    if (!title.trim()) {
      setSearchMovies([]);
      setIsSearchMode(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setIsSearchMode(true);

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const url = `https://i13d208.p.ssafy.io/api/v1/search/movies?title=${encodeURIComponent(title)}&page=0&size=15`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('영화 검색에 실패했습니다.');
      }

      const data = await response.json();

      // voteAverage 기준 내림차순 정렬
      const sortedMovies = data.movies.sort((a, b) => b.voteAverage - a.voteAverage);

      // 기존 형식에 맞게 변환
      const transformedMovies = sortedMovies.map(movie => ({
        movie_id: movie.movieId,
        title: movie.title,
        poster_url: movie.posterUrl,
        ranking: 0,
        audience: 0,
        vote_average: movie.voteAverage,
        release_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : '2024-01-01',
        genres: movie.genres || [],
        runtime: movie.runtime || 0
      }));

      setSearchMovies(transformedMovies);
      setSearchQuery(data.searchQuery);
      setMovieCount(data.movieCount);
    } catch (err) {
      setSearchError(err.message);
      console.error('영화 검색 에러:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // 디바운싱을 위한 useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMoviesAPI(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 현재 상영작 영화 목록 가져오기
  const fetchCurrentMovies = async () => {
    setLoadingCurrent(true);
    setErrorCurrent(null);
    try {
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/movies/now');
      if (!response.ok) {
        throw new Error('현재 상영작을 불러오는데 실패했습니다.');
      }
      const data = await response.json();

      // API 응답을 기존 형식에 맞게 변환
      const transformedMovies = data.map(movie => ({
        movie_id: movie.movieId,
        title: movie.title,
        poster_url: movie.posterUrl,
        ranking: movie.ranking,
        audience: movie.audience,
        vote_average: movie.voteAverage,
        release_date: movie.releaseDate,
        genres: [],
        runtime: 0
      }));

      setCurrentMovies(transformedMovies);
    } catch (err) {
      setErrorCurrent(err.message);
      console.error('현재 상영작 조회 에러:', err);
    } finally {
      setLoadingCurrent(false);
    }
  };

  // 컴포넌트 마운트 시 현재 상영작 불러오기
  useEffect(() => {
    fetchCurrentMovies();
  }, []);

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  const renderStars = (vote) => {
    const rating = Math.round(vote) / 2;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half">☆</span>);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`}>✩</span>);
    }

    return stars;
  };

  const handleSelectMovie = async (movie) => {
    try {
      const response = await moviesAPI.getMovieDetail(movie.movie_id);

      let detailData;
      if (response.success) {
        detailData = response.data;
      } else {
        console.warn('영화 상세 정보 조회 실패, 기본 정보 사용:', response.error);
        detailData = response.mockData || {};
      }

      const transformedMovieData = {
        id: movie.movie_id,
        rank: movie.ranking || 1,
        movieImage: movie.poster_url || detailData.poster_url,
        movieTitle: movie.title || detailData.title,
        releaseDate: movie.release_date || detailData.release_date || '2024-01-01',
        genres: movie.genres || detailData.genre || [],
        runtime: movie.runtime || 0,
        audienceCount: movie.audience ? `${movie.audience}명` : (detailData.audience ? `${detailData.audience}명` : "관람객수 정보 없음"),
        userRating: movie.vote_average || detailData.vote_average || 0,
        appRating: movie.vote_average || detailData.vote_average || 0,
        director: detailData.directors?.[0] || "감독 정보 없음",
        cast: detailData.actors || [],
        plot: detailData.plot_summary || "줄거리 정보가 없습니다."
      };

      // console.log('선택된 영화 (변환됨):', transformedMovieData);

      navigate('/review-create', { state: { movie: transformedMovieData } });
    } catch (err) {
      console.error('영화 선택 처리 에러:', err);

      const fallbackData = {
        id: movie.movie_id,
        movieTitle: movie.title,
        releaseDate: movie.release_date || '2024-01-01',
        genres: movie.genres || [],
        runtime: movie.runtime || 0,
        movieImage: movie.poster_url,
        plot: "영화 정보를 불러오는데 실패했습니다.",
        userRating: movie.vote_average || 0,
        appRating: movie.vote_average || 0
      };

      navigate('/review-create', {
        state: { movie: fallbackData }
      });
    }
  };

  // 표시할 영화 목록 결정
  const displayMovies = isSearchMode ? searchMovies : currentMovies;
  const displayLoading = isSearchMode ? searchLoading : loadingCurrent;
  const displayError = isSearchMode ? searchError : errorCurrent;

  const handleRefresh = () => {
    if (isSearchMode) {
      searchMoviesAPI(query);
    } else {
      fetchCurrentMovies();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeInSlide {
            0% {
              opacity: 0;
              transform: translateX(-20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .responsive-logo {
            height: 50px;
            width: auto;
          }
          
          @media (max-width: 1200px) {
            .responsive-logo {
              height: 30px;
              
            }
          }
        `}
      </style>
      <main className="page-movie-selection" style={{ padding: '1rem', marginTop: '4rem' }}>

        {/* 상단 중앙 로고 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2rem',
          marginTop: '-4rem'
        }}>
          <img
            src={logo}
            alt="로고"
            className="responsive-logo"
          />
        </div>


        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          marginTop: '-2rem',
          marginLeft: '0rem'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>
            {isSearchMode ? `"${searchQuery}" 검색 결과` : '영화 검색'}
          </h1>

        </div>



        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="작성하실 리뷰의 영화를 검색하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box'
            }}
          />
          {isSearchMode && (
            <div style={{
              fontSize: '0.9rem',
              color: '#666',
              marginTop: '0.5rem'
            }}>
              검색 결과 총 {movieCount}건
            </div>
          )}
          {!isSearchMode && (
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#070707ff',
              marginTop: '1rem',
              marginLeft: '1rem',
              marginBottom: '-1rem'
            }}>
              현재 인기 상영작입니다
            </div>
          )}
        </div>

        {displayLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '1.1rem'
          }}>
            {isSearchMode ? '검색 중...' : '현재 상영작을 불러오는 중...'}
          </div>
        )}

        {displayError && displayMovies.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            gap: '1rem'
          }}>
            <div style={{ color: '#dc3545', fontSize: '1.1rem' }}>
              에러: {displayError}
            </div>
            <button
              onClick={handleRefresh}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {displayMovies.length > 0 && !displayLoading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            {displayMovies.map((movie, index) => (
              <div
                key={movie.movie_id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectMovie(movie)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSelectMovie(movie);
                }}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.3s ease-out',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  animation: isSearchMode ? `fadeInSlide 0.4s ease-out ${index * 0.1}s both` : 'none'
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
                <img
                  src={movie.poster_url || img2}
                  alt={movie.title}
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    backgroundColor: '#f8f9fa'
                  }}
                  onError={(e) => {
                    e.target.src = img2;
                  }}
                />
                <div style={{ padding: '0.75rem' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    textAlign: 'center',
                    marginBottom: '0.25rem',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {movie.title}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    {isSearchMode && movie.runtime > 0 && (
                      <>
                        <span style={{ color: '#007bff', margin: '0 4px' }}>•</span>
                        <span>{movie.runtime}분</span>
                      </>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#FFD700', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      {renderStars(movie.vote_average)}
                      {isSearchMode && <span style={{ color: '#000', fontSize: '0.8rem' }}>{movie.vote_average.toFixed(1)}</span>}
                    </div>
                  </div>
                  {!isSearchMode && movie.audience && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#888',
                      textAlign: 'center',
                      marginTop: '0.25rem'
                    }}>
                      관객수: {movie.audience.toLocaleString()}명
                    </div>
                  )}
                  {movie.genres && movie.genres.length > 0 && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#888',
                      textAlign: 'center',
                      marginTop: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {movie.genres.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {displayMovies.length === 0 && !displayLoading && !displayError && isSearchMode && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>
              "{query}"에 대한 검색 결과가 없습니다.
            </div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
              다른 검색어를 시도해보세요.
            </div>
          </div>
        )}

        {displayMovies.length === 0 && !displayLoading && !displayError && !isSearchMode && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>
              현재 상영작 정보가 없습니다.
            </div>
            <button
              onClick={fetchCurrentMovies}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              다시 불러오기
            </button>
          </div>
        )}

        {/* {displayMovies.length > 0 && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#666'
          }}>
            💡 <strong>개발 정보:</strong>
            {isSearchMode ? (
              <>검색 API (/search/movies) 사용 중. 평점 높은 순으로 정렬하여 영화 {displayMovies.length}개 표시됨.</>
            ) : (
              <>현재 상영작 API (/movies/now) 사용 중. 총 {displayMovies.length}개 영화 표시됨.</>
            )}
          </div>
        )} */}
      </main>
    </>
  );
}