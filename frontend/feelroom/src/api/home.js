// ===== 2. 홈 피드 API =====
// src/api/home.js (새로 생성)
import { apiClient } from './client.js';

export const homeAPI = {
  // 홈 피드 조회 (리뷰 목록)
  getFeed: async (feedType = 'popular', page = 0) => {
    try {
      // console.log(`📱 홈 피드 요청: ${feedType}, 페이지: ${page}`);
      
      // 실제 API 엔드포인트 (Swagger 확인 후 수정 필요)
      const response = await apiClient.get('/reviews', {
        params: { 
          page, 
          size: 20,
          sort: feedType === 'latest' ? 'createdAt,desc' : 'likeCount,desc',
          feedType // following, popular, recommended 등
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 피드 조회 실패:', error);
      
      // 개발 중 임시 목업 데이터 (실제 API 연동 후 제거)
      return {
        success: false,
        error: error.message,
        mockData: {
          content: [
            {
              reviewId: 'mock-1',
              title: '어벤져스: 엔드게임 완전 최고!',
              content: 'MCU의 집대성이라고 할 수 있는 작품입니다. 감동적인 스토리와...',
              rating: 9, // userRating 대신 rating 사용
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
              likeCount: 42,
              commentCount: 8,
              user: {
                userId: 1,
                username: 'moviefan',
                nickname: '영화광',
                profileImageUrl: 'https://via.placeholder.com/24?text=U'
              },
              movie: {
                movieId: 1,
                title: '어벤져스: 엔드게임',
                releaseYear: 2019,
                posterUrl: 'https://via.placeholder.com/80x120?text=Avengers',
                genres: ['액션', '어드벤처', 'SF'],
                runtime: 181
              }
            },
            {
              reviewId: 'mock-2',
              title: '기생충 - 한국 영화의 자랑',
              content: '봉준호 감독의 역작! 계급 사회에 대한 날카로운 시선이...',
              rating: 10,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
              likeCount: 67,
              commentCount: 15,
              user: {
                userId: 2,
                username: 'cinephile',
                nickname: '시네마러버',
                profileImageUrl: 'https://via.placeholder.com/24?text=C'
              },
              movie: {
                movieId: 2,
                title: '기생충',
                releaseYear: 2019,
                posterUrl: 'https://via.placeholder.com/80x120?text=Parasite',
                genres: ['드라마', '스릴러', '코미디'],
                runtime: 132
              }
            },
            {
              reviewId: 'mock-3',
              title: '인터스텔라 재관람 후기',
              content: '볼 때마다 새로운 감동을 주는 SF 걸작. 과학적 고증도 훌륭하고...',
              rating: 8,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5시간 전
              likeCount: 23,
              commentCount: 4,
              user: {
                userId: 3,
                username: 'scifan',
                nickname: 'SF매니아',
                profileImageUrl: 'https://via.placeholder.com/24?text=S'
              },
              movie: {
                movieId: 3,
                title: '인터스텔라',
                releaseYear: 2014,
                posterUrl: 'https://via.placeholder.com/80x120?text=Interstellar',
                genres: ['SF', '드라마'],
                runtime: 169
              }
            }
          ],
          totalElements: 50,
          totalPages: 3,
          number: page,
          last: page >= 2
        }
      };
    }
  }
};