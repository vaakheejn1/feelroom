const MovieCard = ({ title, image, onClick }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '120px',
                cursor: 'pointer',
                padding: '0.5rem'
            }}
            onClick={onClick}
        >
            {/* 영화 이미지 */}
            <div style={{
                width: '100px',
                height: '140px',
                backgroundColor: '#d1d5db',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                overflow: 'hidden'
            }}>
                {image ? (
                    <img
                        src={image}
                        alt={title}
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '0.75rem'
                    }}>
                        NO IMAGE
                    </div>
                )}
            </div>

            {/* 영화 제목 */}
            <p style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                textAlign: 'center',
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%'
            }}>
                {title}
            </p>
        </div>
    );
};

export default MovieCard;