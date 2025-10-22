// // src/pages/settings/CommentHistory.jsx
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';
// import { formatTimeAgo } from '../../utils/helpers';
// import { useMyComments } from '../../hooks/useMyComments';

// export default function CommentHistory() {
//   const navigate = useNavigate();
//   const { comments, loading, error, refresh } = useMyComments();

//   // 로딩 상태
//   if (loading && comments.length === 0) {
//     return (
//       <main className="page-comment-history" style={{ padding: '1rem' }}>
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center',
//           height: '200px'
//         }}>
//           내 댓글을 불러오는 중...
//         </div>
//       </main>
//     );
//   }

//   // 에러 상태
//   if (error && comments.length === 0) {
//     return (
//       <main className="page-comment-history" style={{ padding: '1rem' }}>
//         <div style={{ 
//           display: 'flex', 
//           flexDirection: 'column',
//           justifyContent: 'center', 
//           alignItems: 'center',
//           height: '200px',
//           gap: '1rem'
//         }}>
//           <div style={{ color: '#dc3545' }}>{error}</div>
//           <button 
//             onClick={refresh}
//             style={{
//               padding: '0.75rem 1.5rem',
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             다시 시도
//           </button>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="page-comment-history" style={{ padding: '1rem' }}>
//       {/* 뒤로가기 + 제목 */}
//       <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
//         <button
//           onClick={() => navigate(-1)}
//           style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
//           aria-label="뒤로가기"
//         >
//           <ArrowLeft size={24} />
//         </button>
//         <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
//           작성한 댓글 ({comments.length})
//         </h1>
//       </header>

//       {/* 댓글 리스트 */}
//       {comments.length > 0 ? (
//         <ul style={{ listStyle: 'none', padding: 0 }}>
//           {comments.map(comment => (
//             <li
//               key={comment.comment_id || comment.id}
//               onClick={() => navigate(`/review/${comment.reviewId || comment.review?.reviewId}`)}
//               style={{
//                 padding: '0.75rem 0',
//                 borderBottom: '1px solid #e5e7eb',
//                 cursor: 'pointer',
//               }}
//             >
//               <strong style={{ display: 'block' }}>
//                 {comment.review?.title || '리뷰 제목'}
//               </strong>
//               <p style={{ margin: '0.25rem 0' }}>{comment.content}</p>
//               <small style={{ color: '#6b7280' }}>
//                 {formatTimeAgo(comment.created_at || comment.createdAt)}
//               </small>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <div style={{
//           padding: '2rem',
//           textAlign: 'center',
//           color: '#6b7280'
//         }}>
//           작성한 댓글이 없습니다.
//         </div>
//       )}
//     </main>
//   );
// }
