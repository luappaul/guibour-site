'use client';

interface GuibourCharacterProps {
  size?: number;
  animate?: boolean;
}

export default function GuibourCharacter({ size = 120, animate = true }: GuibourCharacterProps) {
  const scale = size / 120;

  return (
    <div style={{
      position: 'relative',
      width: `${60 * scale}px`,
      height: `${size}px`,
      animation: animate ? 'walkCycle 12s linear infinite' : undefined,
    }}>
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: '60px',
        height: '120px',
        position: 'relative',
      }}>
        {/* Head */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#E8C898',
          zIndex: 3,
        }}>
          {/* Hair */}
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: '-1px',
            width: '26px',
            height: '14px',
            borderRadius: '13px 13px 0 0',
            background: '#5A3A20',
          }} />
          {/* Eyes */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '6px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#2A2A2A',
          }} />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '6px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#2A2A2A',
          }} />
        </div>

        {/* Body / White shirt */}
        <div style={{
          position: 'absolute',
          top: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30px',
          height: '40px',
          background: '#F0EDE8',
          borderRadius: '4px 4px 0 0',
          zIndex: 2,
        }}>
          {/* Tie */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '28px solid #3060A0',
          }} />
        </div>

        {/* Left arm */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '4px',
          width: '8px',
          height: '32px',
          background: '#F0EDE8',
          borderRadius: '4px',
          transformOrigin: 'top center',
          animation: animate ? 'armSwing 0.6s ease-in-out infinite alternate' : undefined,
          zIndex: 1,
        }} />

        {/* Right arm */}
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '4px',
          width: '8px',
          height: '32px',
          background: '#F0EDE8',
          borderRadius: '4px',
          transformOrigin: 'top center',
          animation: animate ? 'armSwing 0.6s ease-in-out infinite alternate-reverse' : undefined,
          zIndex: 1,
        }} />

        {/* Pants */}
        <div style={{
          position: 'absolute',
          top: '58px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          height: '14px',
          background: '#4A4A50',
          zIndex: 2,
        }} />

        {/* Left leg */}
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '12px',
          width: '10px',
          height: '30px',
          background: '#4A4A50',
          borderRadius: '3px',
          transformOrigin: 'top center',
          animation: animate ? 'legSwing 0.6s ease-in-out infinite alternate' : undefined,
          zIndex: 1,
        }}>
          {/* Shoe */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '-2px',
            width: '14px',
            height: '6px',
            background: '#2A2A2A',
            borderRadius: '2px 6px 2px 2px',
          }} />
        </div>

        {/* Right leg */}
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '12px',
          width: '10px',
          height: '30px',
          background: '#4A4A50',
          borderRadius: '3px',
          transformOrigin: 'top center',
          animation: animate ? 'legSwing 0.6s ease-in-out infinite alternate-reverse' : undefined,
          zIndex: 1,
        }}>
          {/* Shoe */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '-2px',
            width: '14px',
            height: '6px',
            background: '#2A2A2A',
            borderRadius: '2px 6px 2px 2px',
          }} />
        </div>
      </div>

      {/* Inline keyframes for arm/leg swing */}
      <style>{`
        @keyframes armSwing {
          0% { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }
        @keyframes legSwing {
          0% { transform: rotate(-12deg); }
          100% { transform: rotate(12deg); }
        }
      `}</style>
    </div>
  );
}
