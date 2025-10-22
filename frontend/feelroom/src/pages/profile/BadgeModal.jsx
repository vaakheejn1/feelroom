// src/components/BadgeModal.jsx
import React from 'react';
import { X, Award } from 'lucide-react';

// 뱃지 이미지들을 import
import badge1 from '../../assets/badge/1_USER_SIGNUP.png';
import badge2 from '../../assets/badge/2_REVIEW_WRITE_COUNT_1.png';
import badge3 from '../../assets/badge/3_COMMENT_WRITE_COUNT_1.png';
import badge4 from '../../assets/badge/4_REVIEW_WRITE_COUNT_10.png';
import badge5 from '../../assets/badge/5_MOVIE_LIKE_COUNT_20.png';
import badge6 from '../../assets/badge/6_USER_FOLLOWING_COUNT_1.png';
import badge7 from '../../assets/badge/7_REVIEW_LIKE_RECEIVED_COUNT_10.png';
import badge8 from '../../assets/badge/8_USER_FOLLOWER_COUNT_1.png';

const BadgeModal = ({ badge, isOpen, onClose }) => {
    if (!isOpen || !badge) return null;

    // 뱃지 이름과 이미지 매핑
    const badgeImageMap = {
        '새로운 여정의 시작': badge1,
        '첫 번째 감상평': badge2,
        '첫 마디': badge3,
        '성실한 기록가': badge4,
        '취향 탐색가': badge5,
        '첫 팔로우': badge6,
        '모두의 공감': badge7,
        '첫 번째 팔로워': badge8
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const badgeImage = badgeImageMap[badge.name];

    return (
        <>
            {/* 모달 스타일 */}
            <style>{`
        @keyframes badgeModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes badgeModalScaleUp {
          from { 
            opacity: 0;
            transform: scale(0.7) translateY(30px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes badgeBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }
        
        @keyframes badgeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .badge-modal-overlay {
          animation: badgeModalFadeIn 0.3s ease-out;
        }
        
        .badge-modal-content {
          animation: badgeModalScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .badge-bounce {
          animation: badgeBounce 2s infinite;
        }
        
        .badge-slide-up {
          animation: badgeSlideUp 0.5s ease-out 0.2s both;
        }
        
        .badge-slide-up-1 {
          animation: badgeSlideUp 0.5s ease-out 0.3s both;
        }
        
        .badge-slide-up-2 {
          animation: badgeSlideUp 0.5s ease-out 0.4s both;
        }
        
        .badge-slide-up-3 {
          animation: badgeSlideUp 0.5s ease-out 0.5s both;
        }
      `}</style>

            {/* 모달 오버레이 */}
            <div
                className="badge-modal-overlay"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}
                onClick={onClose}
            >
                {/* 모달 컨텐츠 */}
                <div
                    className="badge-modal-content"
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            padding: '8px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <X size={24} style={{ color: '#6b7280' }} />
                    </button>

                    {/* 뱃지 이미지 */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div
                            className="badge-bounce"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)',
                                border: '4px solid white'
                            }}
                        >
                            {badgeImage ? (
                                <img
                                    src={badgeImage}
                                    alt={badge.name}
                                    style={{
                                        width: '80%',
                                        height: '80%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <Award style={{ color: 'white', width: '60px', height: '60px' }} />
                            )}
                        </div>
                    </div>

                    {/* 뱃지 정보 */}
                    <div style={{ textAlign: 'center' }}>
                        <h2
                            className="badge-slide-up"
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                margin: '0 0 1rem 0'
                            }}
                        >
                            🎉 {badge.name}
                        </h2>

                        <p
                            className="badge-slide-up-1"
                            style={{
                                color: '#6b7280',
                                lineHeight: '1.6',
                                margin: '0 0 1.5rem 0',
                                fontSize: '1rem'
                            }}
                        >
                            {badge.description}
                        </p>

                        <div
                            className="badge-slide-up-2"
                            style={{
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}
                        >
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                                획득일
                            </p>
                            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                                {formatDate(badge.acquiredAt)}
                            </p>
                        </div>

                        {/* 축하 메시지 */}
                        <div
                            className="badge-slide-up-3"
                            style={{
                                background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                                borderRadius: '12px',
                                padding: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <Award style={{ color: '#f59e0b', marginRight: '0.5rem', width: '20px', height: '20px' }} />
                                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                                    축하합니다!
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                이 뱃지는 당신의 특별한 순간을 기념합니다
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BadgeModal;