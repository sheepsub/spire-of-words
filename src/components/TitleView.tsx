import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { CHARACTERS, type CharacterDefinition } from '../data/characters';
import { AtmosphericParticles } from './AtmosphericParticles';
import { HoloServantCard } from './HoloServantCard';
import { 
  Play, 
  BookOpen, 
  Layers, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Compass, 
  ShieldCheck,
  UserCheck,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TitleViewProps {
  onStartGame: () => void;
  onOpenCharacterSelect: () => void;
  onResumeRun?: () => void;
  hasActiveRun?: boolean;
  currentFloor?: number;
  onOpenLexicon: () => void;
  onOpenDeck: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  selectedCharacter?: CharacterDefinition;
  onSelectCharacter?: (char: CharacterDefinition) => void;
  selectedCharName?: string;
  selectedCharTitle?: string;
  selectedCharSprite?: string;
  selectedCharCard?: string;
  selectedCharTag?: string;
  selectedCharColor?: string;
}

export const TitleView: React.FC<TitleViewProps> = ({
  onStartGame,
  onOpenCharacterSelect,
  onResumeRun,
  hasActiveRun = false,
  currentFloor = 0,
  onOpenLexicon,
  onOpenDeck,
  soundEnabled,
  onToggleSound,
  selectedCharacter,
  onSelectCharacter,
}) => {
  const currentChar = selectedCharacter || CHARACTERS[0];
  const currentIndex = Math.max(0, CHARACTERS.findIndex(c => c.id === currentChar.id));

  // Responsive hook for compact mobile landscape viewports
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight <= 540;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerHeight <= 540);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handlePrev = () => {
    sound.playSelect();
    const prevIdx = (currentIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    onSelectCharacter?.(CHARACTERS[prevIdx]);
  };

  const handleNext = () => {
    sound.playSelect();
    const nextIdx = (currentIndex + 1) % CHARACTERS.length;
    onSelectCharacter?.(CHARACTERS[nextIdx]);
  };

  // Support 'Enter' key to quickly start game, Arrow keys / A / D to switch servant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (hasActiveRun && onResumeRun) {
          sound.playDraw();
          onResumeRun();
        } else {
          sound.playDraw();
          onStartGame();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasActiveRun, onResumeRun, onStartGame, currentIndex, onSelectCharacter]);

  // Card dimensions tailored for mobile landscape vs desktop
  const cardWidth = isCompact ? 152 : 205;
  const cardHeight = isCompact ? 216 : 290;

  return (
    <div 
      className="title-warm-pixel-bg title-view-container"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isCompact ? 'center' : 'space-between',
        alignItems: 'center',
        padding: 'max(8px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Dynamic Ambient Warm Ember Particle Atmosphere */}
      <AtmosphericParticles color="#f59e0b" density={isCompact ? 28 : 42} />

      {/* HORIZONTAL 3-COLUMN LAYOUT IN LANDSCAPE */}
      <div 
        className="title-content-row"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          width: '100%',
          maxWidth: '1240px',
          flex: 1,
          zIndex: 10,
          gap: isCompact ? '12px' : '36px',
          flexWrap: 'wrap',
          padding: '4px 0',
        }}
      >
        {/* COLUMN 1: BRAND LOGO & MOTTO & SOUND SETTINGS */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCompact ? 'center' : 'flex-start',
          textAlign: isCompact ? 'center' : 'left',
          maxWidth: isCompact ? '260px' : '360px',
          flexShrink: 0,
        }}>
          {/* Top Subtitle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#fbbf24',
            fontFamily: 'var(--font-pixel)',
            fontSize: isCompact ? '9.5px' : '11px',
            letterSpacing: '1px',
            textShadow: '0 2px 4px #000',
            marginBottom: 4,
          }}>
            <Sparkles size={12} color="#fbbf24" />
            <span>VOCABULARY DECKBUILDER</span>
            <Sparkles size={12} color="#fbbf24" />
          </div>

          {/* Shimmering Metallic Gold Title */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            fontSize: isCompact ? 'clamp(24px, 4.2vw, 36px)' : 'clamp(34px, 5.5vw, 56px)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            marginBottom: 4,
            filter: 'drop-shadow(0 0 24px rgba(234, 179, 8, 0.7))',
          }}>
            <span className="shimmer-gold-title">
              SPIRE OF WORDS
            </span>
          </h1>

          <p style={{
            fontSize: isCompact ? '10.5px' : '12px',
            color: '#94a3b8',
            fontStyle: 'italic',
            letterSpacing: '0.4px',
            lineHeight: 1.4,
            marginBottom: isCompact ? 8 : 14,
          }}>
            "Words are thy runic blade; Vocabulary is thy indestructible shield."
          </p>

          {/* Sound Toggle Button in Left Column for Easy Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                sound.playSelect();
                onToggleSound();
              }}
              className="spire-btn"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                color: soundEnabled ? '#86efac' : '#94a3b8',
                borderColor: soundEnabled ? 'rgba(74, 222, 128, 0.4)' : '#475569',
              }}
            >
              {soundEnabled ? <Volume2 size={14} color="#4ade80" /> : <VolumeX size={14} color="#94a3b8" />}
              <span>音效: {soundEnabled ? '已开' : '静音'}</span>
            </button>

            <div style={{
              fontSize: '10px',
              color: '#64748b',
              fontFamily: 'var(--font-mono)',
            }}>
              v1.2.0 横屏重构版
            </div>
          </div>
        </div>

        {/* COLUMN 2: 3D HOLOGRAPHIC SERVANT CARD & SWITCHER */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
        }}>
          <div style={{ position: 'relative' }}>
            {/* Left Switcher Arrow */}
            <button
              onClick={handlePrev}
              title="切换上一位英灵 (A 或 ←)"
              className="spire-btn"
              style={{
                position: 'absolute',
                left: isCompact ? -20 : -26,
                top: '44%',
                transform: 'translateY(-50%)',
                width: isCompact ? 32 : 38,
                height: isCompact ? 32 : 38,
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(10, 14, 24, 0.95)',
                border: `2px solid ${currentChar.archetypeColor}`,
                boxShadow: `0 0 16px ${currentChar.archetypeGlow}, 0 4px 10px rgba(0,0,0,0.85)`,
                zIndex: 30,
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={isCompact ? 18 : 22} color={currentChar.archetypeColor} />
            </button>

            {/* Right Switcher Arrow */}
            <button
              onClick={handleNext}
              title="切换下一位英灵 (D 或 →)"
              className="spire-btn"
              style={{
                position: 'absolute',
                right: isCompact ? -20 : -26,
                top: '44%',
                transform: 'translateY(-50%)',
                width: isCompact ? 32 : 38,
                height: isCompact ? 32 : 38,
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(10, 14, 24, 0.95)',
                border: `2px solid ${currentChar.archetypeColor}`,
                boxShadow: `0 0 16px ${currentChar.archetypeGlow}, 0 4px 10px rgba(0,0,0,0.85)`,
                zIndex: 30,
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={isCompact ? 18 : 22} color={currentChar.archetypeColor} />
            </button>

            {/* 3D Holographic Foil Card */}
            <HoloServantCard
              character={currentChar}
              viewMode="card"
              width={cardWidth}
              height={cardHeight}
            />

            {/* Class & Name Badge */}
            <div style={{
              position: 'absolute',
              bottom: isCompact ? -12 : -16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(9, 11, 18, 0.96)',
              border: `2px solid ${currentChar.archetypeColor}`,
              boxShadow: '0 -2px 0 0 #000, 0 2px 0 0 #000, -2px 0 0 0 #000, 2px 0 0 0 #000',
              padding: isCompact ? '2px 10px' : '4px 14px',
              color: '#f8fafc',
              fontFamily: 'var(--font-pixel)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              borderRadius: 3,
              zIndex: 25,
            }}>
              <div style={{
                fontSize: isCompact ? '11px' : '13px',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'var(--font-pixel)',
              }}>
                {currentChar.name}
              </div>
              <div style={{
                fontSize: isCompact ? '8.5px' : '9.5px',
                color: '#94a3b8',
                fontFamily: 'var(--font-pixel)',
                marginTop: 1,
              }}>
                {currentChar.title}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: isCompact ? '9.5px' : '11px',
            color: currentChar.archetypeColor,
            fontFamily: 'var(--font-pixel)',
            marginTop: isCompact ? 14 : 16,
          }}>
            {currentChar.archetypeTag}
          </div>

          {/* 6 Servants Mini Carousel Dots */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            margin: '3px 0',
          }}>
            {CHARACTERS.map((c) => {
              const isCur = c.id === currentChar.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    sound.playSelect();
                    onSelectCharacter?.(c);
                  }}
                  title={`点击切换到 ${c.name} (${c.servantClass})`}
                  style={{
                    width: isCur ? (isCompact ? 20 : 26) : (isCompact ? 7 : 9),
                    height: isCompact ? 6 : 8,
                    borderRadius: 3,
                    backgroundColor: isCur ? c.archetypeColor : 'rgba(148, 163, 184, 0.35)',
                    border: isCur ? `1px solid ${c.archetypeColor}` : 'none',
                    boxShadow: isCur ? `0 0 8px ${c.archetypeGlow}` : undefined,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    padding: 0,
                  }}
                />
              );
            })}
          </div>

          {/* Detailed Roster Selection Button */}
          <button
            onClick={() => { sound.playSelect(); onOpenCharacterSelect(); }}
            className="spire-btn"
            style={{
              padding: isCompact ? '4px 10px' : '6px 14px',
              fontSize: isCompact ? '9.5px' : '11px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderColor: currentChar.archetypeColor,
              color: '#f8fafc',
              gap: 5,
              marginTop: 2,
            }}
          >
            <Users size={isCompact ? 12 : 13} color={currentChar.archetypeColor} />
            <span>6位英灵流派与宝具</span>
          </button>
        </div>

        {/* COLUMN 3: ACTION MENU BUTTONS */}
        <div 
          className="pixel-panel" 
          style={{
            padding: isCompact ? '12px 14px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: isCompact ? 7 : 10,
            width: isCompact ? '230px' : '280px',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(12, 15, 25, 0.92)',
            border: `2px solid ${currentChar.archetypeColor}`,
            boxShadow: `0 0 24px ${currentChar.archetypeGlow}, 0 12px 32px rgba(0, 0, 0, 0.85)`,
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          {/* Continue button if run active */}
          {hasActiveRun && currentFloor > 0 && onResumeRun && (
            <button
              onClick={() => {
                sound.playDraw();
                onResumeRun();
              }}
              className="spire-btn"
              style={{
                padding: isCompact ? '8px 12px' : '11px 16px',
                fontSize: isCompact ? '11px' : '13px',
                backgroundColor: '#1e3a8a',
                color: '#93c5fd',
                justifyContent: 'flex-start',
              }}
            >
              <Compass size={isCompact ? 14 : 16} color="#60a5fa" />
              <span>继续攀登 (第 {currentFloor} 层)</span>
            </button>
          )}

          {/* Start New Run Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onStartGame();
            }}
            className="spire-btn"
            style={{
              padding: isCompact ? '10px 14px' : '13px 18px',
              fontSize: isCompact ? '12px' : '14px',
              backgroundColor: '#854d0e',
              color: '#fef08a',
              justifyContent: 'flex-start',
              boxShadow: '0 0 14px rgba(234, 179, 8, 0.4)',
            }}
          >
            <Play size={isCompact ? 15 : 17} color="#fde047" fill="#fde047" />
            <span>{hasActiveRun && currentFloor > 0 ? '重新开始攀登' : '踏入尖塔 (START)'}</span>
          </button>

          {/* Select Character / Hero Roster Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenCharacterSelect();
            }}
            className="spire-btn"
            style={{
              padding: isCompact ? '8px 12px' : '11px 16px',
              fontSize: isCompact ? '11px' : '12.5px',
              borderColor: currentChar.archetypeColor,
              color: '#ffffff',
              justifyContent: 'flex-start',
            }}
          >
            <UserCheck size={isCompact ? 14 : 16} color={currentChar.archetypeColor} />
            <span>英灵召见 (SERVANTS)</span>
          </button>

          {/* Lexicon / Vocabulary Library */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenLexicon();
            }}
            className="spire-btn"
            style={{
              padding: isCompact ? '8px 12px' : '10px 16px',
              fontSize: isCompact ? '11px' : '12px',
              justifyContent: 'flex-start',
            }}
          >
            <BookOpen size={isCompact ? 14 : 15} color="#fbbf24" />
            <span>尖塔词典 (LEXICON)</span>
          </button>

          {/* Starter Deck Preview */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenDeck();
            }}
            className="spire-btn"
            style={{
              padding: isCompact ? '8px 12px' : '10px 16px',
              fontSize: isCompact ? '11px' : '12px',
              justifyContent: 'flex-start',
            }}
          >
            <Layers size={isCompact ? 14 : 15} color="#38bdf8" />
            <span>卡牌套组鉴赏</span>
          </button>
        </div>
      </div>

      {/* FOOTER BAR: GAMEPLAY RULE TIP */}
      {!isCompact && (
        <div style={{
          textAlign: 'center',
          zIndex: 10,
          padding: '4px 0',
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '3px 12px',
            borderRadius: 4,
            fontSize: '11px',
            color: '#cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <ShieldCheck size={13} color="#34d399" />
            <span>出牌唤醒词义享 <strong style={{ color: '#facc15' }}>1.5x 暴击</strong> | 原生支持真人发音与词根记忆</span>
          </div>
        </div>
      )}
    </div>
  );
};
