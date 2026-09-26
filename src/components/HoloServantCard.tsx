import React, { useState, useRef, useEffect } from 'react';
import type { CharacterDefinition } from '../data/characters';

interface HoloServantCardProps {
  character: CharacterDefinition;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const HoloServantCard: React.FC<HoloServantCardProps> = ({
  character,
  width = 205,
  height = 290,
  interactive = true,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isSummoning, setIsSummoning] = useState(false);

  // Trigger summoning flash when character changes
  useEffect(() => {
    setIsSummoning(true);
    const timer = setTimeout(() => setIsSummoning(false), 450);
    return () => clearTimeout(timer);
  }, [character.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setTilt({ x: 0, y: 0 });
  };

  // OPEN-AIR MEADOW FIGURE MODE (Pixel Hero standing directly in the meadow scene)
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`meadow-hero-stage ${isSummoning ? 'summon-flash-active' : ''}`}
      style={{
        position: 'relative',
        width: width * 1.15,
        height: height * 1.05,
        perspective: '1000px',
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {/* Soft Ambient Sunlit Halo */}
      <div
        style={{
          position: 'absolute',
          width: width * 1.3,
          height: height * 0.9,
          top: '10%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${character.archetypeGlow} 0%, rgba(254, 240, 138, 0.12) 45%, transparent 75%)`,
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(12px)',
          animation: 'manaPulse 3.5s ease-in-out infinite',
        }}
      />

      {/* Soft Natural Ground Shadow on Grass */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          width: width * 0.75,
          height: 16,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(20, 35, 15, 0.5) 0%, rgba(20, 35, 15, 0.15) 55%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(2px)',
        }}
      />

      {/* The High-Definition Pixel Hero Sprite */}
      <img
        src={character.avatarSprite}
        alt={character.name}
        className="monster-idle"
        style={{
          position: 'relative',
          maxHeight: height * 0.9,
          maxWidth: '96%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 6px 12px rgba(25, 40, 15, 0.45))',
          zIndex: 3,
          transform: `perspective(800px) rotateX(${tilt.x * 0.45}deg) rotateY(${tilt.y * 0.45}deg) scale3d(${tilt.x !== 0 || tilt.y !== 0 ? 1.04 : 1}, ${tilt.x !== 0 || tilt.y !== 0 ? 1.04 : 1}, 1)`,
          transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'transform 0.08s ease-out',
          marginBottom: 2,
        }}
      />

      {/* Summoning Light Burst Overlay on character switch */}
      {isSummoning && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.85) 0%, rgba(234, 179, 8, 0.4) 50%, transparent 80%)',
            mixBlendMode: 'screen',
            animation: 'summonBurst 0.45s ease-out forwards',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
