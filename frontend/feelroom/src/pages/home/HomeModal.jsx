import React, { useState, useEffect } from 'react';
import { X, Users, TrendingUp, Bot } from 'lucide-react';

const HomeModal = ({ show, onClose, onSelect }) => {
    const [selectedOptions, setSelectedOptions] = useState(['following', 'popular', 'ai']);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

    useEffect(() => {
        const onResize = () => {
            setIsMobile(window.innerWidth < 1200);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const options = [
        {
            id: 'following',
            title: '팔로잉 유저들의 리뷰',
            description: '팔로우하는 사용자들의 최신 리뷰를 확인해보세요',
            icon: Users,
            color: '#3b82f6',
        },
        {
            id: 'popular',
            title: '인기 리뷰',
            description: '많은 좋아요와 댓글을 받은 인기 리뷰들을 살펴보세요',
            icon: TrendingUp,
            color: '#ef4444',
        },
        {
            id: 'ai',
            title: '취향분석 AI추천 리뷰',
            description: 'AI가 회원님의 취향에 맞는 리뷰를 추천해드려요',
            icon: Bot,
            color: '#8b5cf6',
        },
    ];

    const handleOptionToggle = (optionId) => {
        setSelectedOptions(prev => {
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            } else {
                return [...prev, optionId];
            }
        });
    };

    const handleConfirm = () => {
        if (selectedOptions.length > 0) {
            onSelect(selectedOptions);
        }
    };

    const handleReset = () => {
        setSelectedOptions([]);
    };

    if (!show) return null;

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
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: isMobile ? '420px' : '510px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#111827',
                            margin: 0,
                        }}>
                            추천 리뷰 선택
                        </h2>
                        <p style={{
                            fontSize: '0.9rem',
                            color: '#6b7280',
                            margin: '0.5rem 0 0 0',
                        }}>
                            원하는 리뷰를 선택해주세요 (중복 선택 가능)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <X size={24} color="#6b7280" />
                    </button>
                </div>

                {/* 옵션 리스트 */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: '1rem',
                }}>
                    {options.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedOptions.includes(option.id);

                        return (
                            <div
                                key={option.id}
                                onClick={() => handleOptionToggle(option.id)}
                                style={{
                                    border: `2px solid ${isSelected ? option.color : '#e5e7eb'}`,
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? `${option.color}08` : '#ffffff',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        e.target.style.backgroundColor = '#f9fafb';
                                        e.target.style.borderColor = '#d1d5db';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#e5e7eb';
                                    }
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                }}>
                                    <div style={{
                                        padding: '0.75rem',
                                        borderRadius: '50%',
                                        backgroundColor: isSelected ? option.color : '#f3f4f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginLeft: isMobile ? '-12px' : '0px',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        transition: 'all 0.3s ease',
                                    }}>
                                        <Icon
                                            size={20}
                                            color={isSelected ? 'white' : option.color}

                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: isSelected ? option.color : '#111827',
                                            margin: '0 0 0.5rem 0',
                                            transition: 'color 0.3s ease',
                                        }}>
                                            {option.title}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#6b7280',
                                            margin: 0,
                                            lineHeight: '1.4',
                                        }}>
                                            {option.description}
                                        </p>
                                    </div>
                                </div>

                                {/* 선택 체크 표시 */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: option.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <span style={{
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                        }}>
                                            ✓
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 하단 버튼들 */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                }}>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '0.2rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#6b7280',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.borderColor = '#d1d5db';
                        }}
                    >
                        초기화
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedOptions.length === 0}
                        style={{
                            padding: '0.2rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: selectedOptions.length > 0 ? '#bc0c0c' : '#d1d5db',
                            color: 'white',
                            cursor: selectedOptions.length > 0 ? 'pointer' : 'not-allowed',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (selectedOptions.length > 0) {
                                e.target.style.backgroundColor = '#a10909';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedOptions.length > 0) {
                                e.target.style.backgroundColor = '#bc0c0c';
                            }
                        }}
                    >
                        선택 완료 ({selectedOptions.length})
                    </button>
                </div>

                {/* 선택된 항목 미리보기 */}
                {selectedOptions.length > 0 && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                    }}>
                        <p style={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            margin: '0 0 0.5rem 0',
                            fontWeight: '500',
                        }}>
                            선택된 추천 타입:
                        </p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                        }}>
                            {selectedOptions.map(optionId => {
                                const option = options.find(opt => opt.id === optionId);
                                return (
                                    <span
                                        key={optionId}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: option.color,
                                            color: 'white',
                                            borderRadius: '16px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {option.title}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeModal;