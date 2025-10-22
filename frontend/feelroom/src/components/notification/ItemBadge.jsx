import React from 'react';

// 뱃지 이미지들을 import
import badge1 from '../../assets/badge/1_USER_SIGNUP.png';
import badge2 from '../../assets/badge/2_REVIEW_WRITE_COUNT_1.png';
import badge3 from '../../assets/badge/3_COMMENT_WRITE_COUNT_1.png';
import badge4 from '../../assets/badge/4_REVIEW_WRITE_COUNT_10.png';
import badge5 from '../../assets/badge/5_MOVIE_LIKE_COUNT_20.png';
import badge6 from '../../assets/badge/6_USER_FOLLOWING_COUNT_1.png';
import badge7 from '../../assets/badge/7_REVIEW_LIKE_RECEIVED_COUNT_10.png';
import badge8 from '../../assets/badge/8_USER_FOLLOWER_COUNT_1.png';

const ItemBadge = ({ text, time, badgeId, onBadgeClick }) => {
    // 뱃지 ID와 이미지 매핑
    const badgeImageMap = {
        1: badge1,
        2: badge2,
        3: badge3,
        4: badge4,
        5: badge5,
        6: badge6,
        7: badge7,
        8: badge8
    };

    const badgeImage = badgeImageMap[badgeId];

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
            }}
            onClick={() => onBadgeClick(badgeId)}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem',
                backgroundColor: '#fff3cd',
                border: '2px solid #ffc107'
            }}>
                {badgeImage ? (
                    <img
                        src={badgeImage}
                        alt="뱃지"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ffc107',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px'
                    }}>
                        🏆
                    </div>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                    {text}
                </p>
                {time && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                        {time}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ItemBadge;