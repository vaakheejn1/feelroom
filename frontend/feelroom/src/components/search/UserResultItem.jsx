import { User } from 'lucide-react';

const UserResultItem = ({ userImage, nickname, onClick }) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
            }}
        >
            {/* 유저 이미지 */}
            <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f3f4f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginRight: '0.75rem'
            }}>
                {userImage ? (
                    <img
                        src={userImage}
                        alt={nickname}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <User size={24} color="#6b7280" />
                )}
            </div>

            {/* 닉네임 */}
            <span style={{
                flex: 1,
                fontSize: '1rem',
                fontWeight: '500',
                color: '#374151'
            }}>
                {nickname}
            </span>
        </div>
    );
};

export default UserResultItem;