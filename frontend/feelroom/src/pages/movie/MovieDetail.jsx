import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetail } from './movieApiService';
import BackgroundImage from './BackgroudImage';
import MovieInfoSection from './MovieInfoSection';
import MovieReviewsSection from './MovieReviewsSection';

const MovieDetail = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movieData, setMovieData] = useState(null);
    const [moviePlot, setMoviePlot] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 영화 상세정보 API 호출
    useEffect(() => {
        const loadMovieData = async () => {
            if (!movieId) return;

            setLoading(true);
            try {
                const data = await fetchMovieDetail(movieId);
                setMovieData(data.details);
                setIsLiked(data.liked);
                // overview를 줄거리로 설정
                setMoviePlot(data.details.overview || '줄거리 정보가 없습니다.');
            } catch (err) {
                console.error('❌ 영화 정보 로드 에러:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadMovieData();
    }, [movieId]);

    useEffect(() => {
        // 페이지 진입 시 스크롤을 맨 위로
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        } else {
            window.scrollTo(0, 0);
        }
    }, []);

    // 좋아요 상태 변경 핸들러
    const handleLikeChange = (newLikedState) => {
        setIsLiked(newLikedState);
    };

    // 로딩 상태 처리
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '1.2rem'
            }}>
                영화 정보를 불러오는 중...
            </div>
        );
    }

    // 에러 상태 처리
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '1.2rem',
                color: '#dc2626'
            }}>
                {error}
            </div>
        );
    }

    // 영화 데이터가 없는 경우
    if (!movieData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '1.2rem'
            }}>
                영화를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
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
            {/* 배경 이미지 컴포넌트 */}
            <BackgroundImage
                movieTitle={movieData.title}
                directors={movieData.directors || []}
            />

            {/* 메인 콘텐츠 */}
            <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>

                {/* 뒤로가기 */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#000000ff',
                        fontSize: 16,
                        fontWeight: 500,
                        marginBottom: 8,
                        cursor: 'pointer'
                    }}
                >
                    ← 뒤로가기
                </button>

                {/* 영화 정보 섹션 */}
                <MovieInfoSection
                    movieData={movieData}
                    moviePlot={moviePlot}
                    isLiked={isLiked}
                    onLikeChange={handleLikeChange}
                    movieId={movieId}

                />

                {/* 리뷰 섹션 */}
                <MovieReviewsSection
                    movieId={movieId}
                    movieData={movieData}
                />
            </div>
        </div>
    );
};

export default MovieDetail;