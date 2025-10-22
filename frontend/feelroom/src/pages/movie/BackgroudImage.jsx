import { useState, useEffect } from 'react';

const BackgroundImage = ({ movieTitle, directors = [] }) => {
    const [backgroundImage, setBackgroundImage] = useState('');
    const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);

    // TMDB API 설정
    const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NDBjZDgwZTU5Y2M2NjM1MjQ1NDNjMjM5ZjdhNzU1YSIsIm5iZiI6MTc0NzgxNDExNy43MjYsInN1YiI6IjY4MmQ4NmU1OWQ1NzJlZmVjNjBiZTJlMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vvKLAC9jY5P-piU1Pprp5gwsKrR7bsQQWrhlzRMlULg';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

    // 영화 제목으로 스틸컷 이미지 가져오기 - 감독명 길이에 따른 필터링
    const fetchBackgroundImage = async (title, directors = []) => {
        try {
            // 감독 배열의 첫 번째 요소로 영화 구분 판단
            const firstDirector = directors.length > 0 ? directors[0] : '';
            const isForeignMovie = directors.length > 0 && firstDirector.length >= 4;

            // 감독명 길이 판단 결과 출력
            if (firstDirector) {
                console.log(`👨‍🎬 감독명 길이 판단: "${firstDirector}" (${firstDirector.length}글자) → ${isForeignMovie ? '외국 영화' : '한국 영화'}`);
            } else {
                console.log('👨‍🎬 감독 정보 없음 → 전체 영화에서 검색');
            }

            console.log('🎬 배경 이미지 검색 시작:', {
                title,
                firstDirector,
                directorLength: firstDirector.length,
                isForeignMovie,
                searchStrategy: isForeignMovie ? '외국 영화만 검색' : '한국 영화만 검색'
            });

            const searchResponse = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(title)}&language=ko-KR&page=1`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (searchResponse.ok) {
                const searchData = await searchResponse.json();

                if (searchData.results && searchData.results.length > 0) {
                    let filteredMovies;

                    if (isForeignMovie) {
                        // 외국 영화인 경우: 한국 영화 제외
                        filteredMovies = searchData.results.filter(movie => movie.original_language !== 'ko');
                        console.log('🌍 외국 영화 필터링 완료:', `${filteredMovies.length}개 발견`);
                        if (filteredMovies.length > 0) {
                            console.log('✅ 외국 영화 포스터를 사용합니다');
                        }
                    } else {
                        // 한국 영화인 경우: 한국 영화만 필터링
                        filteredMovies = searchData.results.filter(movie => movie.original_language === 'ko');
                        console.log('🇰🇷 한국 영화 필터링 완료:', `${filteredMovies.length}개 발견`);
                        if (filteredMovies.length > 0) {
                            console.log('✅ 한국 영화 포스터를 사용합니다');
                        }
                    }

                    // 필터링된 결과가 없으면 전체 결과 사용 (fallback)
                    const moviesToSearch = filteredMovies.length > 0 ? filteredMovies : searchData.results;

                    if (filteredMovies.length === 0) {
                        console.log('⚠️ 필터링 결과 없음 → 전체 검색 결과에서 선택');
                    }

                    // 인기도(popularity) 순으로 정렬해서 가장 유명한 영화 선택
                    const sortedMovies = moviesToSearch.sort((a, b) => b.popularity - a.popularity);
                    const movie = sortedMovies[0];

                    console.log('🎯 최종 선택된 영화:', {
                        title: movie.title,
                        original_language: movie.original_language,
                        popularity: movie.popularity,
                        posterSource: movie.original_language === 'ko' ? '한국 영화' : '외국 영화'
                    });

                    // 선택된 포스터 출처 명확히 표시
                    if (movie.original_language === 'ko') {
                        console.log('🇰🇷 한국 영화 포스터 선택됨:', movie.title);
                    } else {
                        console.log('🌍 외국 영화 포스터 선택됨:', `${movie.title} (${movie.original_language})`);
                    }

                    const imagesResponse = await fetch(`${BASE_URL}/movie/${movie.id}/images`, {
                        headers: {
                            'Authorization': `Bearer ${API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (imagesResponse.ok) {
                        const imagesData = await imagesResponse.json();
                        let imageUrl = null;

                        // 먼저 스틸컷(backdrop) 이미지 시도
                        if (imagesData.backdrops && imagesData.backdrops.length > 0) {
                            // 평점 순으로 정렬해서 가장 유명한 스틸컷 선택
                            const sortedBackdrops = imagesData.backdrops.sort((a, b) => b.vote_average - a.vote_average);
                            const bestBackdrop = sortedBackdrops[0];
                            imageUrl = `${BACKDROP_BASE_URL}${bestBackdrop.file_path}`;
                            console.log('🖼️ 스틸컷 이미지 선택:', imageUrl);
                        }
                        // 스틸컷이 없으면 포스터 이미지 사용
                        else if (imagesData.posters && imagesData.posters.length > 0) {
                            // 평점 순으로 정렬해서 가장 유명한 포스터 선택
                            const sortedPosters = imagesData.posters.sort((a, b) => b.vote_average - a.vote_average);
                            const bestPoster = sortedPosters[0];
                            imageUrl = `${BACKDROP_BASE_URL}${bestPoster.file_path}`;
                            console.log('🎨 포스터 이미지 선택:', imageUrl);
                        }
                        // 둘 다 없으면 검색 결과의 기본 backdrop_path나 poster_path 사용
                        else if (movie.backdrop_path) {
                            imageUrl = `${BACKDROP_BASE_URL}${movie.backdrop_path}`;
                            console.log('📸 기본 스틸컷 선택:', imageUrl);
                        }
                        else if (movie.poster_path) {
                            imageUrl = `${BACKDROP_BASE_URL}${movie.poster_path}`;
                            console.log('🖼️ 기본 포스터 선택:', imageUrl);
                        }

                        // 이미지 URL이 있으면 프리로드
                        if (imageUrl) {
                            const img = new Image();
                            img.onload = () => {
                                setBackgroundImage(imageUrl);
                                setTimeout(() => {
                                    setBackgroundImageLoaded(true);
                                }, 50);
                                console.log('✅ 배경 이미지 로드 완료:', imageUrl);
                            };
                            img.onerror = () => {
                                console.warn('⚠️ 배경 이미지 로드 실패:', imageUrl);
                            };
                            img.src = imageUrl;
                        } else {
                            console.warn('⚠️ 사용 가능한 이미지가 없습니다.');
                        }
                    }
                } else {
                    console.warn('⚠️ 검색 결과가 없습니다:', title);
                }
            }
        } catch (error) {
            console.error('❌ 배경 이미지 가져오기 실패:', error);
        }
    };

    useEffect(() => {
        if (movieTitle) {
            fetchBackgroundImage(movieTitle, directors);
        }
    }, [movieTitle, directors]);

    if (!backgroundImage) {
        return null;
    }

    return (
        <>
            {/* 배경 이미지 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -3,
                opacity: backgroundImageLoaded ? 1 : 0,
                transition: 'opacity 1s ease-in-out'
            }}>
                <img
                    src={backgroundImage}
                    alt="Movie Backdrop"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </div>

            {/* 그라데이션 오버레이 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.95) 60%, rgba(255, 255, 255, 1) 80%)',
                zIndex: -1
            }} />
        </>
    );
};

export default BackgroundImage;