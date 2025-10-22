// ReviewItem_inProfile.jsx - Fixed Version
import React from 'react';
import PropTypes from 'prop-types';
import { Heart, MessageCircle, Star } from 'lucide-react';

const ReviewItem_inProfile = ({
    movieImage,
    movieTitle,
    releaseYear,
    reviewTitle,
    userImage,
    userName,
    postDate,
    onClick,
    isMobile,
    userRating = 0,
    likeCount = 0,
    commentCount = 0
}) => {
    // 기본 프로필 이미지 SVG
    const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMzAgMzJjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTIiIGZpbGw9IiM2Yzc1N2QiLz48L3N2Zz4=';

    // 기본 포스터 이미지
    const defaultPosterImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA2MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

    // 1~10점을 5개 별로 변환하는 함수 (1점당 별 반개)
    const renderStars = (rating) => {
        const stars = [];
        const maxStars = 5;
        const normalizedRating = rating / 2; // 10점 만점을 5점 만점으로 변환

        for (let i = 1; i <= maxStars; i++) {
            if (normalizedRating >= i) {
                // 완전한 별
                stars.push(
                    <Star
                        key={i}
                        size={16}
                        fill="#ffd700"
                        color="#ffd700"
                    />
                );
            } else if (normalizedRating >= i - 0.5) {
                // 반쪽 별
                stars.push(
                    <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                        <Star size={16} color="#ddd" fill="#ddd" />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '50%',
                            overflow: 'hidden'
                        }}>
                            <Star size={16} fill="#ffd700" color="#ffd700" />
                        </div>
                    </div>
                );
            } else {
                // 빈 별
                stars.push(
                    <Star
                        key={i}
                        size={16}
                        color="#ddd"
                        fill="none"
                    />
                );
            }
        }
        return stars;
    };

    return (
        <div
            onClick={onClick}
            style={{
                border: '2px solid #656565ff',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                marginBottom: '0', // 마진 제거해서 그리드 간격에 맡김
                cursor: 'pointer',
                backgroundColor: '#ffffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                width: '100%', // 그리드 컨테이너에서 할당된 공간 전체 사용
                maxWidth: isMobile ? '160px' : '230px', // 최대 크기 제한     &&&&
                // minWidth: isMobile ? '20px' : '220px', // 최소 크기 보장 (모바일 크기 줄임)
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '16px' : '20px',
                boxSizing: 'border-box' // 패딩과 보더를 포함한 전체 크기 계산
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* 상단 영역 - 영화 정보 카드 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px',
                marginTop: isMobile ? '18px' : '10px',
                backgroundColor: '#ffffffff',
                borderRadius: '10px',

            }}>
                {/* 영화 포스터 -  */}
                <img
                    src={movieImage || defaultPosterImage}
                    alt={movieTitle}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultPosterImage;
                    }}
                    style={{
                        width: '100%', // 부모 컨테이너에 맞춤
                        maxWidth: isMobile ? '140px' : '280px', // 최대 크기 제한 (모바일 크기 줄임)
                        height: 'auto', // 비율 유지
                        aspectRatio: '2/3', // 포스터 비율 고정
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginTop: isMobile ? '-16px' : '-12px',
                        border: '2px solid #ddd',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                />

                {/* 영화 제목 - 크기 증가 */}
                <div style={{
                    textAlign: 'center',
                    width: '100%'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: '700',
                        color: '#333',
                        wordBreak: 'break-word',
                        lineHeight: '1.2',
                        // display: '-webkit-box',  // 제거
                        // WebkitLineClamp: 2,      // 제거
                        // WebkitBoxOrient: 'vertical', // 제거
                        // overflow: 'hidden'       // 제거
                        whiteSpace: 'nowrap',      // 추가: 한 줄로 강제
                        overflow: 'hidden',        // 추가: 넘치는 부분 숨김
                        textOverflow: 'ellipsis'   // 추가: ... 표시
                    }}>
                        {movieTitle.length > 12 ? `${movieTitle.slice(0, 10)}...` : movieTitle}
                    </h3>
                    {releaseYear && releaseYear !== '알 수 없음' && (
                        <div style={{
                            fontSize: isMobile ? '14px' : '16px', // 크기 조정
                            color: '#666',
                            marginTop: '4px',
                            fontWeight: '500'
                        }}>
                            {releaseYear}
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 영역 - 리뷰 내용 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '12px' : '16px',
                padding: '0 4px'
            }}>
                {/* 리뷰 제목과 날짜 - 모든 모드에서 세로 배치 */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column', // 모든 모드에서 세로 배치로 통일
                    alignItems: 'flex-start',
                    gap: '8px'
                }}>

                    {/* 날짜 먼저 */}
                    <div style={{
                        fontSize: isMobile ? '12px' : '14px', // 크기 조정
                        color: '#888',
                        fontWeight: '500',
                        marginTop: '-6px',
                        marginBottom: isMobile ? '-4px' : '-4px'
                    }}>
                        {postDate}
                    </div>

                    {/* 리뷰 제목 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '12px',
                        marginLeft: isMobile ? '-8px' : '-8px',
                        width: '100%'
                    }}>
                        {/* TITLE 빨간색 버튼 */}
                        <div style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            padding: '1px',
                            borderRadius: '6px',
                            fontSize: isMobile ? '10px' : '12px',
                            fontWeight: '600',
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)',
                            flexShrink: 0
                        }}>
                            TITLE
                        </div>

                        <h4 style={{
                            margin: 0,
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '600',
                            color: '#333',
                            lineHeight: '1.3',
                            marginRight: '-8px',
                            flex: 1,
                            // display: '-webkit-box',     // 제거
                            // WebkitLineClamp: 2,         // 제거
                            // WebkitBoxOrient: 'vertical', // 제거
                            // overflow: 'hidden'          // 제거
                            whiteSpace: 'nowrap',          // 추가: 한 줄로 강제
                            overflow: 'hidden',            // 추가: 넘치는 부분 숨김
                            textOverflow: 'ellipsis'       // 추가: ... 표시
                        }}>
                            {(reviewTitle || '제목 없음').length > 14
                                ? `${(reviewTitle || '제목 없음').slice(0, 14)}...`
                                : (reviewTitle || '제목 없음')
                            }
                        </h4>
                    </div>
                </div>

                {/* 별점, 좋아요, 댓글 수 - 한 줄로 배치 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between', // 또는 'center'
                    gap: isMobile ? '4px' : '8px', // 간격 조정
                    marginLeft: isMobile ? '-8px' : '-10px',
                    flexWrap: 'wrap' // 공간이 부족하면 줄바꿈
                }}>
                    {/* 별점 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',

                        marginTop: isMobile ? '-6px' : '-2px',
                        gap: '4px' // 간격 줄임
                    }}>
                        <div style={{ display: 'flex', gap: '1px' }}> {/* 별 간격 줄임 */}
                            {renderStars(userRating)}
                        </div>
                        <span style={{
                            fontSize: isMobile ? '12px' : '14px', // 크기 조정
                            color: '#323232ff',
                            marginLeft: '4px', // 간격 줄임
                            fontWeight: '600'
                        }}>
                            {userRating}/10
                        </span>
                    </div>

                    {/* 좋아요, 댓글 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '12px', // 간격 조정
                        marginTop: isMobile ? '6px' : '6px',
                        marginLeft: isMobile ? '2px' : '0px',
                        marginBottom: isMobile ? '-6px' : '-4px'

                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px', // 간격 줄임
                            color: '#323232ff',
                            fontSize: isMobile ? '12px' : '14px', // 크기 조정
                            fontWeight: '500'
                        }}>
                            <Heart
                                size={14} // 아이콘 크기 조정
                                style={{
                                    color: likeCount > 0 ? '#e74c3c' : '#666',
                                    fill: likeCount > 0 ? '#e74c3c' : 'none'
                                }}
                            />
                            <span>{likeCount}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px', // 간격 줄임
                            color: '#323232ff',
                            fontSize: isMobile ? '12px' : '14px', // 크기 조정
                            fontWeight: '500'
                        }}>
                            <MessageCircle
                                size={14} // 아이콘 크기 조정
                                style={{
                                    color: commentCount > 0 ? '#3498db' : '#666',
                                    fill: commentCount > 0 ? '#3498db' : 'none'
                                }}
                            />
                            <span>{commentCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReviewItem_inProfile.propTypes = {
    movieImage: PropTypes.string,
    movieTitle: PropTypes.string.isRequired,
    releaseYear: PropTypes.string,
    reviewTitle: PropTypes.string,
    userImage: PropTypes.string,
    userName: PropTypes.string.isRequired,
    postDate: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
    userRating: PropTypes.number,
    likeCount: PropTypes.number,
    commentCount: PropTypes.number
};

ReviewItem_inProfile.defaultProps = {
    movieImage: null,
    releaseYear: '알 수 없음',
    reviewTitle: '',
    userImage: null,
    isMobile: false,
    userRating: 0,
    likeCount: 0,
    commentCount: 0
};

export default ReviewItem_inProfile;