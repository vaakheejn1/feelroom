// import React from 'react';
// import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
// import { MovieResultItem, UserResultItem, ReviewResultItem } from './SearchResultItems';

// const SearchModal = ({
//     searchTerm,
//     onInputChange,
//     onBackToMain,
//     activeTab,
//     onTabChange,
//     searchResults,
//     userResults,
//     priorityMovie,
//     searchLoading,
//     userLoading,
//     searchError,
//     userError,
//     recommendedKeywords,
//     onRecommendedClick,
//     onMovieClick,
//     onUserClick,
//     onReviewClick,
//     isRecommendedSearch,
//     renderStars,
//     img2
// }) => {
//     const tabs = ['MOVIE', 'REVIEW', 'USER'];

//     // 더미 데이터 (REVIEW용)
//     const reviews = [
//         {
//             id: 1,
//             movieImage: "https://via.placeholder.com/60x80?text=R1",
//             movieTitle: "인터스텔라",
//             releaseYear: "2014",
//             userImage: "https://via.placeholder.com/32?text=U",
//             userName: "김철수",
//             postDate: "2시간 전"
//         },
//         {
//             id: 2,
//             movieImage: "https://via.placeholder.com/60x80?text=R2",
//             movieTitle: "인셉션",
//             releaseYear: "2010",
//             userImage: "https://via.placeholder.com/32?text=U",
//             userName: "이영희",
//             postDate: "1일 전"
//         }
//     ];

//     const renderTabContent = () => {
//         if (!searchTerm) {
//             const emptyContent = {
//                 MOVIE: '검색어를 입력하면 영화 결과를 볼 수 있습니다',
//                 REVIEW: '검색어를 입력하면 리뷰 결과를 볼 수 있습니다',
//                 USER: '검색어를 입력하면 유저 결과를 볼 수 있습니다',
//             };

//             return (
//                 <div style={{
//                     padding: '2rem',
//                     textAlign: 'center',
//                     color: '#9ca3af',
//                 }}>
//                     {emptyContent[activeTab]}
//                 </div>
//             );
//         }

//         // 로딩 상태
//         if ((searchLoading && activeTab === 'MOVIE') ||
//             (userLoading && activeTab === 'USER')) {
//             return (
//                 <div style={{
//                     display: 'flex',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     height: '200px',
//                     fontSize: '1.1rem'
//                 }}>
//                     검색 중...
//                 </div>
//             );
//         }

//         // 에러 상태
//         if ((searchError && activeTab === 'MOVIE') ||
//             (userError && activeTab === 'USER')) {
//             return (
//                 <div style={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     height: '200px',
//                     gap: '1rem'
//                 }}>
//                     <div style={{ color: '#dc3545', fontSize: '1.1rem' }}>
//                         에러: {searchError || userError}
//                     </div>
//                 </div>
//             );
//         }

//         // 우선 영화가 있는 경우 중복 제거한 검색 결과 (추천 검색어 모드에서만)
//         const filteredResults = (isRecommendedSearch && priorityMovie)
//             ? searchResults.filter(movie => movie.id !== priorityMovie.id)
//             : searchResults;

//         // 탭별 컨텐츠 렌더링
//         switch (activeTab) {
//             case 'MOVIE':
//                 if (searchResults.length === 0 && !priorityMovie && !searchLoading) {
//                     return (
//                         <div style={{
//                             display: 'flex',
//                             flexDirection: 'column',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             height: '200px',
//                             gap: '1rem'
//                         }}>
//                             <div style={{ fontSize: '1.1rem', color: '#666' }}>
//                                 "{searchTerm}"에 대한 영화 검색 결과가 없습니다.
//                             </div>
//                             <div style={{ fontSize: '0.9rem', color: '#888' }}>
//                                 다른 검색어를 시도해보세요.
//                             </div>
//                         </div>
//                     );
//                 }

//                 // 추천 검색어 모드인 경우 기존 리스트 레이아웃 사용
//                 if (isRecommendedSearch) {
//                     return (
//                         <div>
//                             {priorityMovie && (
//                                 <MovieResultItem
//                                     key={`priority-${priorityMovie.id}`}
//                                     {...priorityMovie}
//                                     index={0}
//                                     onClick={() => onMovieClick(priorityMovie)}
//                                 />
//                             )}

//                             {filteredResults.map((movie, index) => (
//                                 <MovieResultItem
//                                     key={movie.id}
//                                     {...movie}
//                                     index={priorityMovie ? index + 1 : index}
//                                     onClick={() => onMovieClick(movie)}
//                                 />
//                             ))}
//                         </div>
//                     );
//                 }

//                 // 일반 검색 모드인 경우 MovieSelection과 완전히 동일한 그리드 스타일 사용
//                 return (
//                     <div
//                         style={{
//                             display: 'grid',
//                             gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
//                             gap: '1rem',
//                         }}
//                     >
//                         {searchResults.map((movie, index) => (
//                             <div
//                                 key={movie.movie_id}
//                                 role="button"
//                                 tabIndex={0}
//                                 onClick={() => onMovieClick(movie)}
//                                 onKeyPress={(e) => {
//                                     if (e.key === 'Enter') onMovieClick(movie);
//                                 }}
//                                 style={{
//                                     border: '1px solid #e5e7eb',
//                                     borderRadius: '8px',
//                                     overflow: 'hidden',
//                                     backgroundColor: '#fff',
//                                     cursor: 'pointer',
//                                     transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.3s ease-out',
//                                     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                                     animation: `fadeInSlide 0.4s ease-out ${index * 0.1}s both`
//                                 }}
//                                 onMouseEnter={(e) => {
//                                     e.currentTarget.style.transform = 'translateY(-2px)';
//                                     e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
//                                 }}
//                                 onMouseLeave={(e) => {
//                                     e.currentTarget.style.transform = 'translateY(0)';
//                                     e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
//                                 }}
//                             >
//                                 <img
//                                     src={movie.poster_url || img2}
//                                     alt={movie.title}
//                                     style={{
//                                         width: '100%',
//                                         height: '220px',
//                                         objectFit: 'cover',
//                                         backgroundColor: '#f8f9fa'
//                                     }}
//                                     onError={(e) => {
//                                         e.target.src = img2;
//                                     }}
//                                 />
//                                 <div style={{ padding: '0.75rem' }}>
//                                     <div style={{
//                                         fontSize: '0.95rem',
//                                         fontWeight: '500',
//                                         textAlign: 'center',
//                                         marginBottom: '0.25rem',
//                                         lineHeight: '1.3',
//                                         overflow: 'hidden',
//                                         textOverflow: 'ellipsis',
//                                         whiteSpace: 'nowrap'
//                                     }}>
//                                         {movie.title}
//                                     </div>
//                                     <div style={{
//                                         fontSize: '0.8rem',
//                                         color: '#666',
//                                         textAlign: 'center',
//                                         marginBottom: '0.25rem'
//                                     }}>
//                                         {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
//                                         {movie.runtime > 0 && (
//                                             <>
//                                                 <span style={{ color: '#007bff', margin: '0 4px' }}>•</span>
//                                                 <span>{movie.runtime}분</span>
//                                             </>
//                                         )}
//                                     </div>
//                                     <div style={{
//                                         fontSize: '0.8rem',
//                                         color: '#666',
//                                         textAlign: 'center'
//                                     }}>
//                                         <div style={{ color: '#FFD700', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
//                                             {renderStars(movie.vote_average)}
//                                             <span style={{ color: '#000', fontSize: '0.8rem' }}>{movie.vote_average.toFixed(1)}</span>
//                                         </div>
//                                     </div>
//                                     {movie.genres && movie.genres.length > 0 && (
//                                         <div style={{
//                                             fontSize: '0.7rem',
//                                             color: '#888',
//                                             textAlign: 'center',
//                                             marginTop: '0.25rem',
//                                             overflow: 'hidden',
//                                             textOverflow: 'ellipsis',
//                                             whiteSpace: 'nowrap'
//                                         }}>
//                                             {movie.genres.slice(0, 2).join(', ')}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 );

//             case 'USER':
//                 if (userResults.length === 0 && !userLoading) {
//                     return (
//                         <div style={{
//                             display: 'flex',
//                             flexDirection: 'column',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             height: '200px',
//                             gap: '1rem'
//                         }}>
//                             <div style={{ fontSize: '1.1rem', color: '#666' }}>
//                                 "{searchTerm}"에 대한 유저 검색 결과가 없습니다.
//                             </div>
//                             <div style={{ fontSize: '0.9rem', color: '#888' }}>
//                                 다른 검색어를 시도해보세요.
//                             </div>
//                         </div>
//                     );
//                 }
//                 return (
//                     <div>
//                         {userResults.map(user => (
//                             <UserResultItem
//                                 key={user.id}
//                                 {...user}
//                                 onClick={() => onUserClick(user)}
//                             />
//                         ))}
//                     </div>
//                 );

//             case 'REVIEW':
//                 return (
//                     <div>
//                         {reviews.map(review => (
//                             <ReviewResultItem
//                                 key={review.id}
//                                 {...review}
//                                 onClick={() => onReviewClick(review)}
//                             />
//                         ))}
//                     </div>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <div>
//             {/* 검색 헤더 */}
//             <div style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '1rem',
//                 marginBottom: '1rem'
//             }}>
//                 <ArrowLeft
//                     size={24}
//                     style={{ cursor: 'pointer', color: '#374151' }}
//                     onClick={onBackToMain}
//                 />
//                 <div style={{
//                     position: 'relative',
//                     flex: 1,
//                     display: 'flex',
//                     alignItems: 'center'
//                 }}>
//                     <SearchIcon
//                         size={20}
//                         style={{
//                             position: 'absolute',
//                             left: '12px',
//                             color: '#6b7280',
//                             zIndex: 1
//                         }}
//                     />
//                     <input
//                         type="text"
//                         placeholder="영화, 키워드, 유저를 검색해보세요"
//                         value={searchTerm}
//                         onChange={onInputChange}
//                         autoFocus
//                         style={{
//                             width: '100%',
//                             padding: '12px 12px 12px 44px',
//                             fontSize: '16px',
//                             border: '2px solid #3b82f6',
//                             borderRadius: '12px',
//                             outline: 'none',
//                             boxSizing: 'border-box'
//                         }}
//                     />
//                 </div>
//             </div>

//             {/* 탭 네비게이션 */}
//             <div style={{
//                 display: 'flex',
//                 borderBottom: '1px solid #e5e7eb',
//                 marginBottom: '1rem'
//             }}>
//                 {tabs.map((tab) => (
//                     <button
//                         key={tab}
//                         onClick={() => onTabChange(tab)}
//                         style={{
//                             flex: 1,
//                             padding: '0.75rem 1rem',
//                             background: 'none',
//                             border: 'none',
//                             borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
//                             color: activeTab === tab ? '#3b82f6' : '#6b7280',
//                             fontWeight: activeTab === tab ? 'bold' : 'normal',
//                             cursor: 'pointer',
//                             fontSize: '0.9rem',
//                             transition: 'all 0.2s'
//                         }}
//                     >
//                         {tab}
//                     </button>
//                 ))}
//             </div>

//             {/* 탭 컨텐츠 */}
//             <div>
//                 {searchTerm ? (
//                     <div>
//                         <p style={{
//                             color: '#6b7280',
//                             fontSize: '14px',
//                             margin: '0 0 1rem 0'
//                         }}>
//                             '{searchTerm}' 검색 결과
//                             {activeTab === 'MOVIE' && searchResults.length > 0 &&
//                                 ` (${isRecommendedSearch ? (priorityMovie ? 1 : 0) + searchResults.length : searchResults.length}건)`
//                             }
//                             {activeTab === 'USER' && userResults.length > 0 &&
//                                 ` (${userResults.length}건)`
//                             }
//                         </p>
//                         {renderTabContent()}
//                     </div>
//                 ) : (
//                     <div>
//                         <p style={{
//                             fontWeight: 'bold',
//                             fontSize: '1rem',
//                             margin: '0 0 1rem 0',
//                             color: '#374151'
//                         }}>
//                             추천 검색어
//                         </p>
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//                             {recommendedKeywords.length > 0 ? (
//                                 recommendedKeywords.map((keyword, idx) => (
//                                     <div
//                                         key={idx}
//                                         style={{
//                                             padding: '0.75rem',
//                                             backgroundColor: '#f9fafb',
//                                             borderRadius: '8px',
//                                             cursor: 'pointer'
//                                         }}
//                                         onClick={() => onRecommendedClick(keyword)}
//                                     >
//                                         <span style={{ color: '#374151' }}>{keyword}</span>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div style={{
//                                     padding: '0.75rem',
//                                     backgroundColor: '#f9fafb',
//                                     borderRadius: '8px',
//                                     textAlign: 'center',
//                                     color: '#9ca3af'
//                                 }}>
//                                     추천 검색어를 불러오는 중...
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SearchModal;