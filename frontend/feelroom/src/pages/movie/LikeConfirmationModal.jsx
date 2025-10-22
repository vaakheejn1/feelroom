import React from 'react';
import { Heart, X } from 'lucide-react';

const LikeConfirmationModal = ({ isOpen, onClose, onConfirm, isLiked, movieTitle, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div
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
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
        
        .heart-animation {
          animation: heartBeat 0.6s ease-in-out;
        }
        
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
          75% { transform: scale(1.1); }
        }
        
        .button-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

            <div
                className="modal-content"
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        color: '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                    }}
                >
                    <X size={20} />
                </button>

                {/* 아이콘 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div
                        className="heart-animation"
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: isLiked ? '#fef2f2' : '#f0fdf4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${isLiked ? '#fecaca' : '#bbf7d0'}`
                        }}
                    >
                        <Heart
                            size={32}
                            fill={isLiked ? "#ef4444" : "#22c55e"}
                            color={isLiked ? "#ef4444" : "#22c55e"}
                        />
                    </div>
                </div>

                {/* 제목 */}
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    color: '#111827',
                    lineHeight: '1.4'
                }}>
                    {isLiked ? '좋아요를 취소하시겠습니까?' : '이 영화에 좋아요를 하시겠습니까?'}
                </h3>

                {/* 영화 제목 */}
                {movieTitle && (
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        fontWeight: '500',
                        padding: '0.5rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        "{movieTitle}"
                    </p>
                )}

                {/* 설명 텍스트 */}
                <p style={{
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    lineHeight: '1.5'
                }}>
                    {isLiked
                        ? '좋아요를 취소하면 내 관심 영화 목록에서 제거됩니다.'
                        : '좋아요를 누르면 내 관심 영화 목록에 추가됩니다.'}
                </p>

                {/* 버튼 그룹 */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center'
                }}>
                    {/* 취소 버튼 */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="button-hover"
                        style={{
                            flex: 1,
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#374151',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            opacity: isLoading ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = '#f9fafb';
                                e.target.style.borderColor = '#9ca3af';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        취소
                    </button>

                    {/* 확인 버튼 */}
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="button-hover"
                        style={{
                            flex: 1,
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            backgroundColor: isLiked ? '#ef4444' : '#22c55e',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            opacity: isLoading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = isLiked ? '#dc2626' : '#16a34a';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = isLiked ? '#ef4444' : '#22c55e';
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                처리 중...
                            </>
                        ) : (
                            <>
                                <Heart size={16} fill="currentColor" />
                                {isLiked ? '좋아요 취소' : '좋아요'}
                            </>
                        )}
                    </button>
                </div>

                <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </div>
    );
};

export default LikeConfirmationModal;