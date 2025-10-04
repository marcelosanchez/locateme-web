import React from 'react';

interface PulseVisualProps {
  centerColor?: string;
  waveColor?: string;
  size?: number;
}

export const PulseVisual: React.FC<PulseVisualProps> = ({
  centerColor = '#2e4a9e',
  waveColor = '#12d04f',
  size = 120
}) => {
  const centerSize = size * 0.25;
  const maxPulseSize = size * 0.9;

  // Mantener translate en los keyframes para no perder el centrado
  const pulseStyles = `
    @keyframes ringPulse {
      0% {
        transform: translate(-50%, -50%) scale(0.1);
        opacity: 0.7;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0;
      }
    }
  `;

  return (
    <>
      <style>{pulseStyles}</style>

      <div
        className="flex items-center justify-center relative"
        style={{ width: size, height: size }}
      >
        {/* Pulso verde - detrás y centrado */}
        <div
          className="absolute rounded-full"
          style={{
            width: maxPulseSize,
            height: maxPulseSize,
            backgroundColor: waveColor,
            top: '50%',
            left: '50%',
            animation: 'ringPulse 2s infinite',
            zIndex: 1,
            willChange: 'transform, opacity'
          }}
        />

        {/* Círculo azul - encima y centrado */}
        <div
          className="rounded-full relative z-10"
          style={{
            width: centerSize,
            height: centerSize,
            backgroundColor: centerColor,
            boxShadow: `0 0 20px ${centerColor}80`
          }}
        />
      </div>
    </>
  );
};