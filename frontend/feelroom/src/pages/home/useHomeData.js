// useHomeData.js - 피드 타입별 개수 조정된 로직
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHomeData = ({
    setHasUnreadNotifications,
    setReviews,
    setError,
    setLoading,
    setLoadingMore,
    setHasMore,
    setPage
}) => {
    const navigate = useNavigate();

    // ⭐ 수정된 피드 타입별 개수 계산 함수
    const getPageSizeForFeedType = (feedTypes, feedType) => {
        if (feedTypes.length === 3) {
            // 3개 선택: 인기 4개, AI 추천 3개, 팔로우 3개 (총 10개)
            switch (feedType) {
                case 'popular': return 4;
                case 'ai': return 3;
                case 'following': return 3;
                default: return 3;
            }
        } else if (feedTypes.length === 2) {
            // 2개 선택 시
            if (feedTypes.includes('popular') && feedTypes.includes('ai')) {
                // 인기 + AI: 각 4개씩 (총 8개)
                return 4;
            } else if (feedTypes.includes('following') && feedTypes.includes('ai')) {
                // 팔로우 + AI: AI 6개, 팔로우 3개 (총 9개)
                return feedType === 'ai' ? 6 : 3;
            } else if (feedTypes.includes('following') && feedTypes.includes('popular')) {
                // 팔로우 + 인기: 인기 6개, 팔로우 3개 (총 9개)
                return feedType === 'popular' ? 6 : 3;
            }
            return 4; // 기본값
        } else if (feedTypes.length === 1) {
            // 1개 선택: 9개
            return 9;
        }
        return 3; // 기본값
    };

    // ⭐ 수정된 목표 개수 계산 함수
    const calculateTargetCount = (feedTypesCount, feedTypes = []) => {
        if (feedTypesCount === 3) return 10; // 3개 선택 시 목표 10개

        if (feedTypesCount === 2) {
            if (feedTypes.includes('popular') && feedTypes.includes('ai')) {
                return 8; // 인기 + AI: 총 8개
            } else {
                return 9; // 팔로우 포함된 조합: 총 9개
            }
        }

        if (feedTypesCount === 1) return 9; // 1개 선택 시 목표 9개

        return 9; // 기본값
    };

    // 세션 만료 체크 및 리다이렉트 함수
    const checkSessionAndRedirect = (response) => {
        if (response.status === 401 || response.status === 403) {
            //console.warn('⚠️ 로그인 세션이 만료되었습니다. 로그인 페이지로 이동합니다.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('nickname');
            localStorage.removeItem('profileImageUrl');
            navigate('/');
            return true;
        }
        return false;
    };

    // 로컬스토리지에서 사용자 정보 가져오기
    const getUserInfo = () => {
        try {
            const nickname = localStorage.getItem('nickname') || '사용자';
            const profileImageUrl = localStorage.getItem('profileImageUrl') || '';
            return { nickname, profileImageUrl };
        } catch (error) {
            //console.warn('⚠️ 사용자 정보를 가져오는 중 오류:', error);
            return { nickname: '사용자', profileImageUrl: '' };
        }
    };

    // 토큰 가져오기 함수
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            //console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    // 안읽은 알림 존재 여부 확인 함수
    const checkUnreadNotifications = async () => {
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                //console.warn('⚠️ authToken이 없어서 알림 상태를 확인할 수 없습니다.');
                return;
            }

            const response = await fetch(
                'https://i13d208.p.ssafy.io/api/v1/users/me/notifications/exists-unread',
                {
                    method: 'GET',
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (checkSessionAndRedirect(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                //console.log('✅ 알림 상태 확인 성공:', data);
                setHasUnreadNotifications(data.exists || false);
            } else {
                //console.warn('⚠️ 알림 상태 확인 실패:', response.status);
                setHasUnreadNotifications(false);
            }
        } catch (error) {
            //console.error('❌ 알림 상태 확인 중 오류:', error);
            setHasUnreadNotifications(false);
        }
    };

    // 영화 상세 정보 가져오기 함수
    const fetchMovieDetails = async (movieId) => {
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                //console.warn('⚠️ authToken이 없어서 영화 상세 정보를 가져올 수 없습니다.');
                return null;
            }

            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${movieId}`, {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (checkSessionAndRedirect(response)) {
                return null;
            }

            if (!response.ok) {
                //console.warn(`⚠️ 영화 ${movieId} 상세 정보 조회 실패: ${response.status}`);
                return null;
            }

            const data = await response.json();
            //console.log(`✅ 영화 ${movieId} 상세 정보 조회 성공:`, data);
            return data.details;
        } catch (error) {
            //console.warn(`⚠️ 영화 ${movieId} 상세 정보 조회 중 오류:`, error);
            return null;
        }
    };

    // 팔로잉 리뷰 가져오기 함수
    const fetchFollowingReviews = async (page = 0, pageSize = 3) => {
        try {
            //console.log('👥 팔로잉 리뷰 조회 시작', { page, pageSize });

            const authToken = getAuthToken();
            if (!authToken) {
                //console.warn('⚠️ authToken이 없어서 팔로잉 리뷰를 가져올 수 없습니다.');
                return { reviews: [], hasNext: false };
            }

            const url = `https://i13d208.p.ssafy.io/api/v1/reviews/feed/following?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (checkSessionAndRedirect(response)) {
                return { reviews: [], hasNext: false };
            }

            if (!response.ok) {
                //console.warn(`⚠️ 팔로잉 리뷰 조회 실패: ${response.status}`);
                return { reviews: [], hasNext: false };
            }

            const data = await response.json();
            //console.log('✅ 팔로잉 리뷰 조회 성공:', data);

            const reviewsWithType = (data.reviews || []).map(review => ({
                ...review,
                feedType: 'following'
            }));

            return {
                reviews: reviewsWithType,
                hasNext: data.hasNext || false
            };
        } catch (error) {
            //console.warn('⚠️ 팔로잉 리뷰 조회 중 오류:', error);
            return { reviews: [], hasNext: false };
        }
    };

    // 인기 리뷰 가져오기 함수
    const fetchPopularReviews = async (page = 0, pageSize = 3) => {
        try {
            //console.log('🔥 인기 리뷰 조회 시작', { page, pageSize });

            const authToken = getAuthToken();
            if (!authToken) {
                //console.warn('⚠️ authToken이 없어서 인기 리뷰를 가져올 수 없습니다.');
                return { reviews: [], hasNext: false };
            }

            const url = `https://i13d208.p.ssafy.io/api/v1/reviews/feed/popular?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (checkSessionAndRedirect(response)) {
                return { reviews: [], hasNext: false };
            }

            if (!response.ok) {
                //console.warn(`⚠️ 인기 리뷰 조회 실패: ${response.status}`);
                return { reviews: [], hasNext: false };
            }

            const data = await response.json();
            //console.log('✅ 인기 리뷰 조회 성공:', data);

            const reviewsWithType = (data.reviews || []).map(review => ({
                ...review,
                feedType: 'popular'
            }));

            return {
                reviews: reviewsWithType,
                hasNext: data.hasNext || false
            };
        } catch (error) {
            //console.warn('⚠️ 인기 리뷰 조회 중 오류:', error);
            return { reviews: [], hasNext: false };
        }
    };

    // AI 추천 리뷰 가져오기 함수
    const fetchAIRecommendedReviews = async (page = 0, pageSize = 3) => {
        try {
            //console.log('🤖 AI 추천 리뷰 조회 시작', { page, pageSize });

            const authToken = getAuthToken();
            if (!authToken) {
                //console.warn('⚠️ authToken이 없어서 AI 추천 리뷰를 가져올 수 없습니다.');
                return { reviews: [], hasNext: false };
            }

            const url = `https://i13d208.p.ssafy.io/api/v1/reviews/feed/ai-recommended?page=${page}&size=${pageSize}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (checkSessionAndRedirect(response)) {
                return { reviews: [], hasNext: false };
            }

            if (!response.ok) {
                //console.warn(`⚠️ AI 추천 리뷰 조회 실패: ${response.status}`);
                return { reviews: [], hasNext: false };
            }

            const data = await response.json();
            //console.log('✅ AI 추천 리뷰 조회 성공:', data);

            const reviewsWithType = (data.reviews || []).map(review => ({
                ...review,
                feedType: 'ai'
            }));

            return {
                reviews: reviewsWithType,
                hasNext: data.hasNext || false
            };
        } catch (error) {
            //console.warn('⚠️ AI 추천 리뷰 조회 중 오류:', error);
            return { reviews: [], hasNext: false };
        }
    };

    // ⭐ 수정된 특정 타입의 리뷰를 추가로 가져오는 함수
    const fetchMoreReviewsForType = async (feedType, feedTypes, existingReviews, targetCountForType, maxAttempts = 3) => {
        //console.log(`🔄 ${feedType} 타입 추가 리뷰 조회 시작 (목표: ${targetCountForType}개)`);

        const existingIds = new Set(existingReviews.map(r => r.reviewId || r.id));
        let allNewReviews = [];
        let hasNextPage = true;
        let currentPage = 1; // 0페이지는 이미 호출했으므로 1부터 시작
        let attempts = 0;

        while (allNewReviews.length < targetCountForType && hasNextPage && attempts < maxAttempts) {
            attempts++;
            //console.log(`📖 ${feedType} 추가 조회 시도 ${attempts}번째 (페이지: ${currentPage})`);

            let result = { reviews: [], hasNext: false };

            try {
                switch (feedType) {
                    case 'following':
                        result = await fetchFollowingReviews(currentPage, 5);
                        break;
                    case 'popular':
                        result = await fetchPopularReviews(currentPage, 5);
                        break;
                    case 'ai':
                        result = await fetchAIRecommendedReviews(currentPage, 5);
                        break;
                }

                // 기존에 없는 새로운 리뷰만 필터링
                const newReviews = result.reviews.filter(review => {
                    const reviewId = review.reviewId || review.id;
                    return reviewId && !existingIds.has(reviewId);
                });

                //console.log(`✅ ${feedType} 페이지 ${currentPage}: 전체 ${result.reviews.length}개 중 새로운 리뷰 ${newReviews.length}개`);

                // 새로운 리뷰 추가
                newReviews.forEach(review => {
                    const reviewId = review.reviewId || review.id;
                    if (!existingIds.has(reviewId) && allNewReviews.length < targetCountForType) {
                        allNewReviews.push(review);
                        existingIds.add(reviewId);
                    }
                });

                hasNextPage = result.hasNext;
                currentPage++;

                // 새로운 리뷰가 하나도 없으면서 hasNext가 false면 조기 종료
                if (newReviews.length === 0 && !hasNextPage) {
                    //console.log(`⚠️ ${feedType} 더 이상 데이터가 없음`);
                    break;
                }

            } catch (error) {
                //console.error(`❌ ${feedType} 추가 조회 중 오류:`, error);
                break;
            }
        }

        //console.log(`🎯 ${feedType} 추가 조회 완료: ${allNewReviews.length}개 획득 (목표: ${targetCountForType}개, 시도: ${attempts}회)`);
        return allNewReviews;
    };

    // 중복 제거 함수 (정렬 옵션 추가)
    const deduplicateReviews = (reviewsArray, shouldSort = true) => {
        //console.log('🔄 리뷰 중복 제거 시작, 총 리뷰 수:', reviewsArray.length);

        // feedType별 리뷰 수 확인
        const typeCount = reviewsArray.reduce((acc, review) => {
            acc[review.feedType || 'unknown'] = (acc[review.feedType || 'unknown'] || 0) + 1;
            return acc;
        }, {});
        //console.log('📊 타입별 리뷰 수 (중복 제거 전):', typeCount);

        const reviewMap = new Map();

        reviewsArray.forEach(review => {
            const reviewId = review.reviewId || review.id;
            if (reviewId && !reviewMap.has(reviewId)) {
                reviewMap.set(reviewId, review);
            }
        });

        const uniqueReviews = Array.from(reviewMap.values());

        // 최종 타입별 리뷰 수 확인
        const finalTypeCount = uniqueReviews.reduce((acc, review) => {
            acc[review.feedType || 'unknown'] = (acc[review.feedType || 'unknown'] || 0) + 1;
            return acc;
        }, {});
        //console.log('📊 타입별 리뷰 수 (중복 제거 후):', finalTypeCount);
        //console.log('✅ 중복 제거 완료, 유니크 리뷰 수:', uniqueReviews.length);

        if (shouldSort) {
            const sortedReviews = uniqueReviews.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA;
            });
            //console.log('✅ 시간순 정렬 완료');
            return sortedReviews;
        } else {
            //console.log('✅ 원본 순서 유지');
            return uniqueReviews;
        }
    };

    // 기존 함수와의 호환성을 위한 래퍼 함수
    const deduplicateAndSortReviews = (reviewsArray) => {
        return deduplicateReviews(reviewsArray, true);
    };

    // ⭐ 수정된 fetchReviews 함수 - 피드 타입별 목표 개수 적용
    const fetchReviews = useCallback(async (feedTypes, isRefresh = false, currentPage = 0) => {
        try {
            //console.log(`📖 리뷰 목록 조회 시작 - 선택된 타입: ${feedTypes.join(', ')}, 페이지: ${currentPage}`);

            if (currentPage === 0) {
                setLoading(true);
                setReviews([]);
            } else {
                setLoadingMore(true);
            }

            if (isRefresh) {
                setError(null);
            }

            const targetCount = calculateTargetCount(feedTypes.length, feedTypes);
            //console.log(`📊 총 목표 개수: ${targetCount}`);

            let allReviews = [];
            let hasNextResults = [];

            // 1단계: 각 피드 타입별로 지정된 개수만큼 기본 페이지 호출
            const apiPromises = [];

            if (feedTypes.includes('following')) {
                const pageSize = getPageSizeForFeedType(feedTypes, 'following');
                apiPromises.push({
                    type: 'following',
                    pageSize: pageSize,
                    promise: fetchFollowingReviews(currentPage, pageSize)
                });
            }

            if (feedTypes.includes('popular')) {
                const pageSize = getPageSizeForFeedType(feedTypes, 'popular');
                apiPromises.push({
                    type: 'popular',
                    pageSize: pageSize,
                    promise: fetchPopularReviews(currentPage, pageSize)
                });
            }

            if (feedTypes.includes('ai')) {
                const pageSize = getPageSizeForFeedType(feedTypes, 'ai');
                apiPromises.push({
                    type: 'ai',
                    pageSize: pageSize,
                    promise: fetchAIRecommendedReviews(currentPage, pageSize)
                });
            }

            if (apiPromises.length === 0) {
                //console.log('⚠️ 선택된 피드 타입이 없습니다.');
                setReviews([]);
                setLoading(false);
                setLoadingMore(false);
                setHasMore(false);
                return;
            }

            // 모든 API 호출 결과 기다리기
            const results = await Promise.all(apiPromises.map(item => item.promise));

            // 결과 처리
            results.forEach((result, index) => {
                const feedType = apiPromises[index].type;
                const requestedPageSize = apiPromises[index].pageSize;
                // console.log(`✅ ${feedType} API 결과:`, {
                //     reviewsCount: result.reviews.length,
                //     hasNext: result.hasNext,
                //     requestedPageSize: requestedPageSize
                // });

                if (Array.isArray(result.reviews)) {
                    allReviews.push(...result.reviews);
                }

                hasNextResults.push(result.hasNext);
            });

            // 2단계: 중복 제거 후 개수 확인 (첫 페이지만 시간순 정렬)
            let processedReviews = deduplicateReviews(allReviews, currentPage === 0);
            //console.log(`🔍 1단계 결과: ${processedReviews.length}개 (목표: ${targetCount}개)`);

            // ⭐ 3단계: 첫 페이지이고 각 타입별 목표 개수에 못 미치면 추가 호출
            if (currentPage === 0) {
                // 현재 타입별 개수 확인
                const currentTypeCount = processedReviews.reduce((acc, review) => {
                    acc[review.feedType] = (acc[review.feedType] || 0) + 1;
                    return acc;
                }, {});

                //console.log('📊 현재 타입별 개수:', currentTypeCount);

                // 각 타입별로 목표 개수 확인 및 추가 호출
                for (const feedType of feedTypes) {
                    const targetCountForType = getPageSizeForFeedType(feedTypes, feedType);
                    const currentCount = currentTypeCount[feedType] || 0;

                    if (currentCount < targetCountForType) {
                        const needed = targetCountForType - currentCount;
                        //console.log(`📈 ${feedType} 타입 ${needed}개 추가 필요 (현재: ${currentCount}개, 목표: ${targetCountForType}개)`);

                        const additionalReviews = await fetchMoreReviewsForType(
                            feedType,
                            feedTypes,
                            processedReviews,
                            needed,
                            3 // 최대 3번까지 시도
                        );

                        if (additionalReviews.length > 0) {
                            allReviews.push(...additionalReviews);
                            processedReviews = deduplicateReviews(allReviews, true); // 첫 페이지는 시간순 정렬
                            //console.log(`🎯 ${feedType} ${additionalReviews.length}개 추가 후 총 ${processedReviews.length}개`);
                        } else {
                            //console.log(`⚠️ ${feedType} 더 이상 가져올 데이터가 없습니다.`);
                        }
                    }
                }

                //console.log(`🏁 최종 결과: ${processedReviews.length}개 (목표: ${targetCount}개)`);
            }

            // hasNext 결정 - 하나라도 hasNext가 true이면 더 불러올 수 있음
            const anyHasNext = hasNextResults.some(hasNext => hasNext === true);

            // 각 리뷰의 영화 상세 정보 가져오기
            const reviewsWithMovieDetails = await Promise.all(
                processedReviews.map(async (review) => {
                    if (review.movie && review.movie.movieId) {
                        const movieDetails = await fetchMovieDetails(review.movie.movieId);
                        if (movieDetails) {
                            return {
                                ...review,
                                movie: {
                                    ...review.movie,
                                    releaseDate: movieDetails.releaseDate,
                                    genres: movieDetails.genres,
                                    runtime: movieDetails.runtime || review.movie.runtime
                                }
                            };
                        }
                    }
                    return review;
                })
            );

            if (currentPage === 0) {
                setReviews(reviewsWithMovieDetails);
            } else {
                setReviews(prevReviews => {
                    // 무한스크롤 시에는 단순히 이어붙이기만 하고 시간순 정렬 하지 않음
                    const combined = [...prevReviews, ...reviewsWithMovieDetails];
                    return deduplicateReviews(combined, false); // 정렬하지 않고 중복만 제거
                });
            }

            // console.log('🔍 HasNext 최종 판단:', {
            //     hasNextResults,
            //     anyHasNext,
            //     현재페이지: currentPage,
            //     '설정할 hasMore': anyHasNext
            // });

            setHasMore(Boolean(anyHasNext));
            setPage(currentPage);

        } catch (err) {
            //console.error('❌ 리뷰 목록 조회 실패:', err);
            setError(err.message || '리뷰를 불러오는 중 오류가 발생했습니다.');
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [navigate, setError, setLoading, setLoadingMore, setReviews, setHasMore, setPage]);

    // 데이터 변환 함수
    const transformReviewData = (review, globalUserInfo = null) => {
        const userInfo = review.author || globalUserInfo || {};

        return {
            movie: {
                posterUrl: review.movie?.posterUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+',
                title: review.movie?.title || '제목 없음',
                releaseDate: review.movie?.releaseDate || '2000-01-01',
                genres: review.movie?.genres || ['기타'],
                runtime: review.movie?.runtime || 0,
            },
            user: {
                nickname: userInfo.nickname || globalUserInfo?.userNickname || '익명',
                avatarUrl: userInfo.profileImageUrl || globalUserInfo?.userProfileImageUrl || '',
                profileImageUrl: userInfo.profileImageUrl || globalUserInfo?.userProfileImageUrl || '',
            },
            userRating: review.rating || 0,
            title: review.title || '제목 없음',
            content: review.content || '내용 없음',
            likeCount: review.likesCount || 0,
            commentCount: review.commentsCount || 0,
            createdAt: review.createdAt || new Date().toISOString(),
            feedType: review.feedType || 'unknown'
        };
    };

    return {
        getUserInfo,
        getAuthToken,
        checkUnreadNotifications,
        fetchMovieDetails,
        fetchFollowingReviews,
        fetchPopularReviews,
        fetchAIRecommendedReviews,
        deduplicateAndSortReviews,
        fetchReviews,
        transformReviewData,
        checkSessionAndRedirect
    };
};