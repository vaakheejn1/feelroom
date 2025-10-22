import React from 'react';

const BackgroundComponent = () => {
    const isMobile = window.innerWidth < 1200;

    // 모바일이 아닐 때 연하게 처리
    const gradient = isMobile
        ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 30%, #ffeaea 70%, #971313 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 40%,  #ffeaea 80%, #f59c9cff 90%, #b71414ff 100%, rgba(255,255,255,0.3) 100%)';

    return (
        <div
            style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: gradient,
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
};

export default BackgroundComponent;
