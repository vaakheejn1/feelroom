const BackgroundComponent = () => {
    const isMobile = window.innerWidth < 1200;

    const gradient = isMobile
        ? 'linear-gradient(135deg, #faf8f8 0%, #f5f0f0 25%, #f8f4f4 50%, #faf6f6 75%, #fcf8f8 100%)'
        : 'linear-gradient(135deg, #faf8f8 0%, #f5f0f0 25%, #f8f4f4 50%, #faf6f6 75%, #fcf8f8 100%)';

    const radialOverlay = isMobile
        ? 'radial-gradient(circle at top right, rgba(151, 19, 19, 0.12) 0%, transparent 60%)'
        : 'radial-gradient(circle at top right, rgba(151, 19, 19, 0.08) 0%, transparent 70%)';

    return (
        <div
            style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `${radialOverlay}, ${gradient}`,
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
};

export default BackgroundComponent;