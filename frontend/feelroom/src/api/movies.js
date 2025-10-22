// src/api/movies.js (수정)
import { apiClient } from './client.js';

export const moviesAPI = {
  // 통합 검색 (영화 제목, 배우명, 키워드) - 83행
  searchMovies: async (query, page = 0, type = 'movie') => {
    try {
      // console.log(`🔍 통합 검색: "${query}", 타입: ${type}, 페이지: ${page}`);
      
      const response = await apiClient.get('/search', {
        params: { 
          query: query,
          type: type, // movie/actor/keyword/all
          page: page,
          size: 20 
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 영화 검색 실패:', error);
      
      // 개발 중 목업 데이터 (API 명세서 기반)
      return {
        success: false,
        error: error.message,
        mockData: {
          movies: [
            {
              movie_id: 101,
              title: `${query}와 관련된 영화 1`,
              poster_url: 'https://via.placeholder.com/150x220?text=Search1',
              genres: ['액션', '드라마'],
              runtime: 120,
              release_date: '2023-01-01',
              vote_average: 8.2
            },
            {
              movie_id: 102,
              title: `${query}와 관련된 영화 2`,
              poster_url: 'https://via.placeholder.com/150x220?text=Search2',
              genres: ['로맨스', '코미디'],
              runtime: 105,
              release_date: '2022-12-15',
              vote_average: 7.8
            }
          ],
          actors: [],
          keywords: []
        }
      };
    }
  },

  // 모든 영화 목록 조회 (추천용) - 45행
  getAllMovies: async (page = 0, sortBy = 'popularity') => {
    try {
      // console.log(`🎬 영화 목록 조회: ${sortBy}, 페이지: ${page}`);
      
      const response = await apiClient.get('/movies', {
        params: { 
          sort_by: sortBy, // rating/popularity/latest
          page: page,
          size: 20 
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 영화 목록 조회 실패:', error);
      
      return {
        success: false,
        error: error.message,
        mockData: [
          {
            movie_id: 1,
            title: 'F1 더 무비',
            poster_url: 'https://via.placeholder.com/150x220?text=F1+더+무비',
            genres: ['액션', '드라마'],
            runtime: 132,
            release_date: '2025-06-25',
            vote_average: 8.5
          },
          {
            movie_id: 2,
            title: '인셉션',
            poster_url: 'https://via.placeholder.com/150x220?text=Inception',
            genres: ['SF', '액션', '스릴러'],
            runtime: 148,
            release_date: '2010-07-16',
            vote_average: 8.8
          },
          {
            movie_id: 3,
            title: '인터스텔라',
            poster_url: 'https://via.placeholder.com/150x220?text=Interstellar',
            genres: ['SF', '드라마'],
            runtime: 169,
            release_date: '2014-11-07',
            vote_average: 8.6
          },
          {
            movie_id: 4,
            title: '기생충',
            poster_url: 'https://via.placeholder.com/150x220?text=Parasite',
            genres: ['드라마', '스릴러', '코미디'],
            runtime: 132,
            release_date: '2019-05-30',
            vote_average: 8.5
          },
          {
            movie_id: 5,
            title: '어벤져스: 엔드게임',
            poster_url: 'https://via.placeholder.com/150x220?text=Avengers',
            genres: ['액션', '어드벤처', 'SF'],
            runtime: 181,
            release_date: '2019-04-24',
            vote_average: 8.4
          },
          {
            movie_id: 6,
            title: '라라랜드',
            poster_url: 'https://via.placeholder.com/150x220?text=LaLaLand',
            genres: ['로맨스', '뮤지컬', '드라마'],
            runtime: 128,
            release_date: '2016-12-07',
            vote_average: 8.0
          }
        ]
      };
    }
  },

  // 현재 상영작 영화 목록 조회 - 44행
  getNowPlayingMovies: async () => {
    try {
      // console.log('🎭 현재 상영작 조회');
      
      const response = await apiClient.get('/movies/now');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 현재 상영작 조회 실패:', error);
      
      return {
        success: false,
        error: error.message,
        mockData: [
          {
            movie_id: 201,
            title: '현재 상영작 1',
            ranking: 1,
            poster_url: 'https://via.placeholder.com/150x220?text=Now1',
            release_date: '2025-01-01',
            audience: 1500000,
            vote_average: 8.3
          },
          {
            movie_id: 202,
            title: '현재 상영작 2',
            ranking: 2,
            poster_url: 'https://via.placeholder.com/150x220?text=Now2',
            release_date: '2025-01-10',
            audience: 1200000,
            vote_average: 7.9
          }
        ]
      };
    }
  },

  // 영화 상세 정보 조회 - 47행 (구현 완료)
  getMovieDetail: async (movieId) => {
    try {
      // console.log(`🎬 영화 상세 정보: ${movieId}`);
      
      const response = await apiClient.get(`/movies/${movieId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 영화 상세 조회 실패:', error);
      
      return {
        success: false,
        error: error.message,
        mockData: {
          movie_id: movieId,
          title: "F1 더 무비",
          genre: ["액션", "드라마"],
          poster_url: 'https://via.placeholder.com/150x220?text=F1+더+무비',
          keyword: ["포뮬러원", "레이싱", "스포츠"],
          actors: ["크리스 헴스워스", "다니엘 브륄", "올리비아 와일드"],
          directors: ["론 하워드"],
          release_date: "2025-06-25",
          audience: 1920000,
          vote_average: 8.5
        }
      };
    }
  }
};
