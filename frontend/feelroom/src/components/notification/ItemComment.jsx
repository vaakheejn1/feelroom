import { MessageCircle } from 'lucide-react';

const ItemComment = ({ text, time, userProfile, onUserClick, reviewId, onReviewClick }) => {
    // 닉네임을 볼드 처리하는 함수
    const formatTextWithBoldNickname = (text) => {
        if (!text) return text;

        // "닉네임님이" 패턴 찾기
        const match = text.match(/^(.+?)님이\s(.+)$/);
        if (match) {
            const [, nickname, restText] = match;
            return (
                <span>
                    <strong>{nickname}</strong>님이 {restText}
                </span>
            );
        }
        return text;
    };

    const handleClick = () => {
        // 리뷰 ID가 있으면 리뷰로 이동, 없으면 사용자 프로필로 이동
        if (reviewId && onReviewClick) {
            onReviewClick(reviewId);
        } else if (onUserClick) {
            onUserClick();
        }
    };

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
            onClick={handleClick}
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
                backgroundColor: '#e3f2fd',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
            }}>
                <MessageCircle size={20} color="#1976d2" />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                    {formatTextWithBoldNickname(text)}
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

export default ItemComment;