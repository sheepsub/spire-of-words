import React, { useState, useRef, useEffect } from 'react';
import type { CharacterDefinition } from '../data/characters';

interface HoloServantCardProps {
  character: CharacterDefinition;
  viewMode?: 'card' | 'figure';
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const HoloServantCard: React.FC<HoloServantCardProps> = ({
  character,
  viewMode = 'card',
  width = 205,
  height = 290,
  interactive = true,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });
  const [isSummoning, setIsSummoning] = useState(false);

  // Trigger summoning flash when character changes
  useEffect(() => {
    setIsSummoning(true);
    const timer = setTimeout(() => setIsSummoning(false), 450);
    return () => clearTimeout(timer);
  }, [character.id, viewMode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    setTilt({ x: rotateX, y: rotateY });
    setShine({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.75,
    });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px',
      }}
    >
      {/* 1. Behind Card: Concentric Arcane Summoning Magic Circle */}
      <div
        className="arcane-summon-circle"
        style={{
          position: 'absolute',
          width: width * 1.5,
          height: width * 1.5,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.85,
        }}
      >
        {/* Outer Rotating Runic Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1.5px dashed ${character.archetypeColor}`,
            boxShadow: `0 0 20px ${character.archetypeGlow}, inset 0 0 20px ${character.archetypeGlow}`,
            animation: 'rotateSlow 32s linear infinite',
            opacity: 0.65,
          }}
        />

        {/* Middle Counter-Rotating Geometric Seal */}
        <div
          style={{
            position: 'absolute',
            inset: 18,
            borderRadius: '50%',
            border: `1px solid ${character.archetypeColor}`,
            animation: 'rotateReverse 20s linear infinite',
            opacity: 0.5,
          }}
        >
          {/* Internal Cross Star Runes */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: `1px solid ${character.archetypeColor}`,
              transform: 'rotate(45deg)',
              opacity: 0.4,
            }}
          />
        </div>

        {/* Central Mana Pulsing Core */}
        <div
          style={{
            position: 'absolute',
            inset: 35,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${character.archetypeGlow} 0%, transparent 70%)`,
            animation: 'manaPulse 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* 2. Dynamic Archetype Ambient Aura Behind Card */}
      {character.id === 'gilgamesh' && (
        /* Gilgamesh: Gate of Babylon Golden Ripple Portals */
        <div
          style={{
            position: 'absolute',
            inset: -20,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div className="gate-ripple" style={{ top: '10%', left: '-15%' }} />
          <div className="gate-ripple" style={{ bottom: '15%', right: '-15%', animationDelay: '1.2s' }} />
          <div className="gate-ripple" style={{ top: '60%', left: '-20%', animationDelay: '0.6s' }} />
        </div>
      )}

      {character.id === 'jalter' && (
        /* JAlter: Rising Dragon Hellfire Flames */
        <div
          style={{
            position: 'absolute',
            bottom: -15,
            left: -10,
            right: -10,
            height: 120,
            pointerEvents: 'none',
            zIndex: 6,
            background: 'linear-gradient(to top, rgba(244,63,94,0.4) 0%, rgba(225,29,72,0.15) 50%, transparent 100%)',
            filter: 'blur(4px)',
            animation: 'fireBreath 2.4s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* 3. The 3D Holographic Tilt Card Body */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={isSummoning ? 'summon-flash-active' : ''}
        style={{
          position: 'relative',
          width,
          height,
          borderRadius: 8,
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${tilt.x !== 0 || tilt.y !== 0 ? 1.04 : 1}, ${tilt.x !== 0 || tilt.y !== 0 ? 1.04 : 1}, 1)`,
          transformStyle: 'preserve-3d',
          transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.4s ease' : 'transform 0.08s ease-out',
          boxShadow: `0 0 28px ${character.archetypeGlow}, 0 16px 36px rgba(0, 0, 0, 0.85)`,
          border: `2px solid ${character.archetypeColor}`,
          backgroundColor: '#0a0d16',
          overflow: 'hidden',
          zIndex: 4,
          cursor: interactive ? 'pointer' : 'default',
        }}
      >
        {/* Card Artwork Image (Card or Figure) */}
        {viewMode === 'card' ? (
          <img
            src={character.cardSprite || character.avatarSprite}
            alt={character.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              imageRendering: 'auto',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at 50% 35%, rgba(26,38,62,0.7) 0%, rgba(5,7,15,0.98) 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              position: 'relative',
            }}
          >
            <img
              src={character.avatarSprite}
              alt={character.name}
              className="monster-idle"
              style={{
                maxHeight: '92%',
                maxWidth: '92%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.95))',
                imageRendering: 'auto',
                zIndex: 5,
              }}
            />
            {/* Ground Arcane Circle */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                width: width * 0.75,
                height: 22,
                borderRadius: '50%',
                background: `radial-gradient(ellipse at center, ${character.archetypeGlow} 0%, transparent 75%)`,
                boxShadow: `0 0 14px ${character.archetypeColor}`,
                zIndex: 2,
              }}
            />
          </div>
        )}

        {/* Dynamic Holographic Foil Light Sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 220, 100, 0.3) 25%, rgba(100, 220, 255, 0.25) 45%, transparent 70%)`,
            opacity: shine.opacity,
            mixBlendMode: 'color-dodge',
            pointerEvents: 'none',
            transition: 'opacity 0.25s ease',
            zIndex: 6,
          }}
        />

        {/* Diagonal Rainbow Specular Sweep */}
        <div
          className="holographic-glint"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.12) 35%, rgba(255,215,0,0.2) 48%, rgba(0,255,255,0.15) 55%, transparent 70%)',
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 7,
          }}
        />

        {/* Golden Edge Bevel Highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.25), inset 0 0 14px ${character.archetypeGlow}`,
            pointerEvents: 'none',
            zIndex: 8,
          }}
        />

        {/* Summoning Light Rift Overlay on switch */}
        {isSummoning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.9) 0%, rgba(234, 179, 8, 0.5) 45%, transparent 80%)',
              mixBlendMode: 'screen',
              animation: 'summonBurst 0.45s ease-out forwards',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
