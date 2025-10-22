// src/components/notification/ItemFollow.jsx
import React from 'react';
import { User } from 'lucide-react';

const ItemFollow = ({ text, time, userProfile, onUserClick }) => {
    // 닉네임과 나머지 문구 분리
    const nickname = userProfile?.nickname || '';
    const message = text?.replace(nickname, '');

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white'
            }}
        >
            {/* 프로필 이미지 */}
            <div
                onClick={onUserClick}
                style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem',
                    cursor: onUserClick ? 'pointer' : 'default',
                    overflow: 'hidden'
                }}
            >
                {userProfile?.profileImageUrl ? (
                    <img
                        src={userProfile.profileImageUrl}
                        alt={nickname || '사용자'}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : (
                    <User size={20} color="#6b7280" />
                )}
                {userProfile?.profileImageUrl && (
                    <div
                        style={{
                            display: 'none',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <User size={20} color="#6b7280" />
                    </div>
                )}
            </div>

            {/* 알림 내용 */}
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                    <span
                        onClick={onUserClick}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                        style={{
                            fontWeight: 'bold',
                            cursor: onUserClick ? 'pointer' : 'default'
                        }}
                    >
                        {nickname}
                    </span>
                    {message}
                </p>
                {time && (
                    <p
                        style={{
                            margin: '0.25rem 0 0 0',
                            fontSize: '0.75rem',
                            color: '#9ca3af'
                        }}
                    >
                        {time}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ItemFollow;
