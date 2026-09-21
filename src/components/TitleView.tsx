import React, { useEffect } from 'react';
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

  return (
    <div 
      className="spire-pixel-bg"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px 20px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Dynamic Ambient Magical Particle Atmosphere */}
      <AtmosphericParticles color={currentChar.archetypeColor} density={45} />

      {/* Top Ambient Glow / Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#fbbf24',
        fontFamily: 'var(--font-pixel)',
        fontSize: '11px',
        letterSpacing: '1px',
        zIndex: 10,
        textShadow: '0 2px 4px #000',
      }}>
        <Sparkles size={14} color="#fbbf24" />
        <span>ROGUE-LITE VOCABULARY DECKBUILDER</span>
        <Sparkles size={14} color="#fbbf24" />
      </div>

      {/* Main Title Area */}
      <div style={{
        textAlign: 'center',
        zIndex: 10,
        marginTop: 8,
      }}>
        {/* Shimmering Metallic Gold Title */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 900,
          fontSize: 'clamp(36px, 7vw, 64px)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          lineHeight: 1.1,
          marginBottom: 8,
          filter: 'drop-shadow(0 0 28px rgba(234, 179, 8, 0.7))',
        }}>
          <span className="shimmer-gold-title">
            SPIRE OF WORDS
          </span>
        </h1>

        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(14px, 2.8vw, 20px)',
          color: '#fbbf24',
          letterSpacing: '2px',
          textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 16px rgba(251, 191, 36, 0.5)',
          marginBottom: 12,
        }}>
          尖 塔 单 词 · 语 言 狂 潮
        </div>

        <p style={{
          fontSize: '12px',
          color: '#94a3b8',
          maxWidth: '460px',
          margin: '0 auto',
          fontStyle: 'italic',
          letterSpacing: '0.5px',
        }}>
          "Words are thy runic blade; Vocabulary is thy indestructible shield."
        </p>
      </div>

      {/* Center Display: Scholar Hero Sprite & Action Menu */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(20px, 6vw, 60px)',
        flexWrap: 'wrap',
        zIndex: 10,
        margin: '16px 0',
      }}>
        {/* Fate Servant Feature Box with Switching Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ position: 'relative' }}>
            {/* Left Switcher Arrow */}
            <button
              onClick={handlePrev}
              title="切换上一位英灵 (A 或 ←)"
              className="spire-btn"
              style={{
                position: 'absolute',
                left: -26,
                top: '44%',
                transform: 'translateY(-50%)',
                width: 38,
                height: 38,
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
              <ChevronLeft size={22} color={currentChar.archetypeColor} />
            </button>

            {/* Right Switcher Arrow */}
            <button
              onClick={handleNext}
              title="切换下一位英灵 (D 或 →)"
              className="spire-btn"
              style={{
                position: 'absolute',
                right: -26,
                top: '44%',
                transform: 'translateY(-50%)',
                width: 38,
                height: 38,
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
              <ChevronRight size={22} color={currentChar.archetypeColor} />
            </button>

            {/* 3D Holographic Foil Card with Magic Circle */}
            <HoloServantCard
              character={currentChar}
              viewMode="card"
              width={205}
              height={290}
            />

            {/* Class & Name Badge */}
            <div style={{
              position: 'absolute',
              bottom: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(9, 11, 18, 0.96)',
              border: `2px solid ${currentChar.archetypeColor}`,
              boxShadow: '0 -2px 0 0 #000, 0 2px 0 0 #000, -2px 0 0 0 #000, 2px 0 0 0 #000',
              padding: '4px 14px',
              color: '#f8fafc',
              fontFamily: 'var(--font-pixel)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              borderRadius: 3,
              transition: 'border-color 0.25s ease',
              zIndex: 25,
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'var(--font-pixel)',
              }}>
                {currentChar.name}
              </div>
              <div style={{
                fontSize: '9.5px',
                color: '#94a3b8',
                fontFamily: 'var(--font-pixel)',
                marginTop: 2,
              }}>
                {currentChar.title}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '11px',
            color: currentChar.archetypeColor,
            fontFamily: 'var(--font-pixel)',
            marginTop: 14,
          }}>
            {currentChar.archetypeTag}
          </div>

          {/* 6 Servants Mini Carousel Dots & Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            margin: '2px 0',
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
                    width: isCur ? 26 : 9,
                    height: 8,
                    borderRadius: 4,
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

          <div style={{
            fontSize: '9px',
            color: '#64748b',
            fontFamily: 'var(--font-pixel)',
            letterSpacing: '0.5px',
          }}>
            ◀ 点击箭头或按 A / D 切换英灵 ({currentIndex + 1}/6) ▶
          </div>

          {/* Detailed Roster Selection Button */}
          <button
            onClick={() => { sound.playSelect(); onOpenCharacterSelect(); }}
            className="spire-btn"
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderColor: currentChar.archetypeColor,
              color: '#f8fafc',
              gap: 6,
              marginTop: 2,
            }}
          >
            <Users size={13} color={currentChar.archetypeColor} />
            <span>查看 6 位英灵流派与宝具详情</span>
          </button>
        </div>

        {/* Action Menu Buttons with Glassmorphic Arcane Frame */}
        <div className="pixel-panel" style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
          minWidth: 'clamp(240px, 30vw, 320px)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(12, 15, 25, 0.88)',
          border: `2px solid ${currentChar.archetypeColor}`,
          boxShadow: `0 0 24px ${currentChar.archetypeGlow}, 0 12px 32px rgba(0, 0, 0, 0.85)`,
          transition: 'all 0.3s ease',
          zIndex: 10,
        }}>
          {/* Continue button if run active */}
          {hasActiveRun && currentFloor > 0 && onResumeRun && (
            <button
              onClick={() => {
                sound.playDraw();
                onResumeRun();
              }}
              className="spire-btn"
              style={{
                padding: '12px 18px',
                fontSize: '13px',
                backgroundColor: '#1e3a8a',
                color: '#93c5fd',
                justifyContent: 'flex-start',
              }}
            >
              <Compass size={16} color="#60a5fa" />
              <span>继续攀登 (第 {currentFloor} 层)</span>
            </button>
          )}

          {/* Select Character / Hero Roster Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenCharacterSelect();
            }}
            className="spire-btn"
            style={{
              padding: '13px 18px',
              fontSize: '13px',
              borderColor: currentChar.archetypeColor,
              color: '#ffffff',
              justifyContent: 'flex-start',
            }}
          >
            <UserCheck size={17} color={currentChar.archetypeColor} />
            <span>英灵召见与职阶选择 (SERVANTS)</span>
          </button>

          {/* Start New Run Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onStartGame();
            }}
            className="spire-btn"
            style={{
              padding: '14px 20px',
              fontSize: '14px',
              backgroundColor: '#854d0e',
              color: '#fef08a',
              justifyContent: 'flex-start',
            }}
          >
            <Play size={18} color="#fde047" fill="#fde047" />
            <span>{hasActiveRun && currentFloor > 0 ? '重新开始攀登' : '踏入尖塔 (START)'}</span>
          </button>

          {/* Lexicon / Vocabulary Library */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenLexicon();
            }}
            className="spire-btn"
            style={{
              padding: '11px 18px',
              fontSize: '12px',
              justifyContent: 'flex-start',
            }}
          >
            <BookOpen size={16} color="#fbbf24" />
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
              padding: '11px 18px',
              fontSize: '12px',
              justifyContent: 'flex-start',
            }}
          >
            <Layers size={16} color="#38bdf8" />
            <span>卡牌套组鉴赏</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playSelect();
              onToggleSound();
            }}
            className="spire-btn"
            style={{
              padding: '10px 18px',
              fontSize: '11px',
              color: soundEnabled ? '#86efac' : '#94a3b8',
              justifyContent: 'flex-start',
            }}
          >
            {soundEnabled ? <Volume2 size={16} color="#4ade80" /> : <VolumeX size={16} color="#94a3b8" />}
            <span>音效 & 发音: {soundEnabled ? '已开启' : '静音'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div style={{
        textAlign: 'center',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: '11px',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <ShieldCheck size={13} color="#34d399" />
          <span>核心玩法：出牌唤醒词义触发 <strong style={{ color: '#facc15' }}>1.5x 暴击</strong> | 支持真实英语语音发音</span>
        </div>

        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '9px',
          color: '#64748b',
          letterSpacing: '1px',
        }}>
          v1.2.0 PIXEL RETRO EDITION · REACT + VITE + CAPACITOR
        </div>
      </div>
    </div>
  );
};
