import { useEffect } from 'react';

const AnimationComponent = () => {
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
      @keyframes filmMove {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(0%); }
      }
    `;
        document.head.appendChild(styleSheet);

        return () => {
            if (document.head.contains(styleSheet)) {
                document.head.removeChild(styleSheet);
            }
        };
    }, []);

    return (
        <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.1,
            zIndex: 1,
            pointerEvents: 'none'
        }}>
            <div className="film-strip" style={{
                position: 'absolute',
                width: '150px',
                height: '200%',
                background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 20px,
          rgba(151, 19, 19, 0.1) 20px,
          rgba(151, 19, 19, 0.1) 25px
        )`,
                animation: 'filmMove 20s linear infinite',
                left: '10%',
                animationDelay: '0s'
            }}></div>

            <div className="film-strip" style={{
                position: 'absolute',
                width: '150px',
                height: '200%',
                background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 20px,
          rgba(151, 19, 19, 0.1) 20px,
          rgba(151, 19, 19, 0.1) 25px
        )`,
                animation: 'filmMove 20s linear infinite',
                left: '30%',
                animationDelay: '-5s'
            }}></div>

            <div className="film-strip" style={{
                position: 'absolute',
                width: '150px',
                height: '200%',
                background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 20px,
          rgba(151, 19, 19, 0.1) 20px,
          rgba(151, 19, 19, 0.1) 25px
        )`,
                animation: 'filmMove 20s linear infinite',
                right: '20%',
                animationDelay: '-10s'
            }}></div>

            <div className="film-strip" style={{
                position: 'absolute',
                width: '150px',
                height: '200%',
                background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 20px,
          rgba(151, 19, 19, 0.1) 20px,
          rgba(151, 19, 19, 0.1) 25px
        )`,
                animation: 'filmMove 20s linear infinite',
                right: '5%',
                animationDelay: '-15s'
            }}></div>
        </div>
    );
};

export default AnimationComponent;