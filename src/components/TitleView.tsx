import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { CHARACTERS, ARCHETYPE_ICON, type CharacterDefinition } from '../data/characters';
import { AtmosphericParticles } from './AtmosphericParticles';
import { HoloServantCard } from './HoloServantCard';
import { PixelIcon } from './PixelIcon';
import type { PixelIconName } from '../data/pixelIcons';

interface TitleViewProps {
  onStartGame: () => void;
  onStartAutoChess?: () => void;
  onOpenCharacterSelect: () => void;
  onResumeRun?: () => void;
  hasActiveRun?: boolean;
  currentFloor?: number;
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

// Bright & Refreshing Pixel Scenery Themes
const SCENERY_THEMES: {
  id: string;
  name: string;
  pixelIcon: PixelIconName;
  url: string;
  particleColor: string;
}[] = [
  {
    id: 'summer',
    name: '晴空花海',
    pixelIcon: 'sun',
    url: '/assets/backgrounds/title_bg_bright_pixel.png',
    particleColor: '#fef08a',
  },
  {
    id: 'prairie',
    name: '浮空圣塔',
    pixelIcon: 'castle',
    url: '/assets/backgrounds/title_bg_prairie_pixel.jpg',
    particleColor: '#e0e7ff',
  },
  {
    id: 'meadow',
    name: '翠绿密林',
    pixelIcon: 'tree-pine',
    url: '/assets/backgrounds/title_bg_meadow_pixel.png',
    particleColor: '#86efac',
  },
];

export const TitleView: React.FC<TitleViewProps> = ({
  onStartGame,
  onStartAutoChess,
  onOpenCharacterSelect,
  onResumeRun,
  hasActiveRun = false,
  currentFloor = 0,
  onOpenDeck,
  soundEnabled,
  onToggleSound,
  selectedCharacter,
  onSelectCharacter,
}) => {
  const currentChar = selectedCharacter || CHARACTERS[0];
  const currentIndex = Math.max(0, CHARACTERS.findIndex(c => c.id === currentChar.id));

  // Scenery Theme Switcher State (Defaults to Bright Sunny Flower Meadow)
  const [sceneryIdx, setSceneryIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('spire_title_scenery_idx');
    const parsed = saved ? parseInt(saved, 10) : 0;
    return isNaN(parsed) || parsed < 0 || parsed >= SCENERY_THEMES.length ? 0 : parsed;
  });

  const currentTheme = SCENERY_THEMES[sceneryIdx];

  const handleNextScenery = () => {
    sound.playSelect();
    const next = (sceneryIdx + 1) % SCENERY_THEMES.length;
    setSceneryIdx(next);
    try {
      localStorage.setItem('spire_title_scenery_idx', next.toString());
    } catch {
      // Ignore
    }
  };

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

  const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sound.playSelect();
    const prevIdx = (currentIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    onSelectCharacter?.(CHARACTERS[prevIdx]);
  };

  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

  // Meadow hero stage dimensions tailored for mobile landscape vs desktop
  const heroWidth = isCompact ? 160 : 250;
  const heroHeight = isCompact ? 175 : 280;

  // 英雄连位选人条：每个槽位直接显示该英雄的像素立绘。
  const dockChrome = 14 + 3 * (CHARACTERS.length - 1);
  const dockMaxWidth = isCompact ? 250 : 420;
  const runeSize = Math.max(
    11,
    Math.min(isCompact ? 15 : 30, Math.floor((dockMaxWidth - dockChrome) / CHARACTERS.length)),
  );

  return (
    <div 
      className="title-warm-pixel-bg title-view-container"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'max(6px, env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(18px, env(safe-area-inset-left))',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%, rgba(34, 197, 94, 0.04) 100%), url('${currentTheme.url}')`,
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dynamic Ambient Sun-Dappled Pollen & Breezy Petals */}
      <AtmosphericParticles color={currentTheme.particleColor} density={isCompact ? 20 : 34} />

      {/* HORIZONTAL 3-COLUMN LAYOUT IN LANDSCAPE */}
      <div 
        className="title-content-row"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1240px',
          zIndex: 10,
          gap: isCompact ? '12px' : '36px',
          flexWrap: 'nowrap',
          padding: '2px 0',
        }}
      >
        {/* COLUMN 1: STARDEW TAVERN HANGING SIGNBOARD & SETTINGS */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCompact ? 'center' : 'flex-start',
          justifyContent: 'center',
          width: isCompact ? '230px' : '360px',
          maxWidth: isCompact ? '230px' : '360px',
          flexShrink: 0,
        }}>
          {/* Wooden Tavern Signboard */}
          <div 
            className="stardew-title-sign" 
            style={{ 
              width: '100%', 
              marginBottom: isCompact ? 8 : 14, 
              padding: isCompact ? '8px 12px' : '12px 18px',
              position: 'relative' 
            }}
          >
            {/* Rustic Timber Rooflet */}
            <div className="stardew-timber-roof">
              <PixelIcon name="leaf" size={9} color="#bbf7d0" />
              <PixelIcon name="leaf" size={9} color="#bbf7d0" />
            </div>

            {/* Grounding Timber Posts rooted into the Meadow */}
            <div className="stardew-timber-post stardew-timber-post-l" />
            <div className="stardew-timber-post stardew-timber-post-r" />
            
            {/* Brass Corner Rivets */}
            <div className="stardew-rivet stardew-rivet-tl" />
            <div className="stardew-rivet stardew-rivet-tr" />
            <div className="stardew-rivet stardew-rivet-bl" />
            <div className="stardew-rivet stardew-rivet-br" />

            {/* Top Ribbon: Genre Tagline */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isCompact ? 4 : 6 }}>
              <div className="stardew-ribbon-banner" style={{ fontSize: isCompact ? '8px' : '9.5px', padding: isCompact ? '2px 8px' : '3px 12px' }}>
                <PixelIcon name="sparkle" size={8} color="#6f4209" />
                <span>ROGUELIKE · AUTOBATTLER · TIMELINE</span>
                <PixelIcon name="sparkle" size={8} color="#6f4209" />
              </div>
            </div>

            {/* 3D Carved Pixel Title */}
            <h1 
              className="stardew-pixel-title"
              style={{
                fontSize: isCompact ? '22px' : 'clamp(28px, 4.4vw, 40px)',
                textAlign: 'center',
                margin: isCompact ? '6px 0 4px' : '10px 0 8px',
                letterSpacing: isCompact ? '1.5px' : '2px',
              }}
            >
              REVERSAL DAY
            </h1>

          </div>

          {/* Stardew Options / Sound & Scenery Wood Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? 5 : 8, width: '100%', justifyContent: 'center' }}>
            <button
              onClick={() => {
                sound.playSelect();
                onToggleSound();
              }}
              className="stardew-btn stardew-btn-wood"
              style={{
                padding: isCompact ? '5px 8px' : '6px 14px',
                fontSize: isCompact ? '10px' : '11px',
                gap: 4,
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <PixelIcon
                name={soundEnabled ? 'volume-2' : 'volume-x'}
                size={isCompact ? 12 : 14}
                color={soundEnabled ? '#f5d76e' : '#cfc6b4'}
              />
              <span>{soundEnabled ? '音效: 开' : '音效: 关'}</span>
            </button>

            {/* Scenery Theme Switcher */}
            <button
              onClick={handleNextScenery}
              className="stardew-btn stardew-btn-wood"
              title="切换明亮清新风景 (晴空花海 / 浮空圣塔 / 翠绿密林)"
              style={{
                padding: isCompact ? '5px 8px' : '6px 12px',
                fontSize: isCompact ? '10px' : '11px',
                gap: 4,
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <PixelIcon name={currentTheme.pixelIcon} size={isCompact ? 12 : 14} color="#fde047" />
              <span>{currentTheme.name}</span>
            </button>

            <div style={{
              fontSize: isCompact ? '9px' : '10px',
              color: '#5a3a12',
              fontFamily: 'var(--font-pixel)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
              backgroundColor: 'rgba(247, 240, 222, 0.95)',
              padding: isCompact ? '3px 6px' : '4px 8px',
              border: '1px solid #b8761d',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(30, 15, 6, 0.2)',
              flexShrink: 0,
            }}>
              v1.2.0
            </div>
          </div>
        </div>

        {/* COLUMN 2: MEADOW HERO STAGE & TACTILE SWITCHERS */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          margin: isCompact ? '0 4px' : '0 24px',
        }}>
          {/* Hero Showcase (Open-Air Meadow Stand) */}
          <div style={{ position: 'relative' }}>
            <HoloServantCard
              character={currentChar}
              width={heroWidth}
              height={heroHeight}
            />

            {/* Left 3D Wood Arrow Switcher */}
            <div
              style={{
                position: 'absolute',
                left: isCompact ? -36 : -64,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 100,
                pointerEvents: 'auto',
              }}
            >
              <button
                type="button"
                onClick={handlePrev}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="切换上一位英灵 (键盘 ← 或 A)"
                className="stardew-btn stardew-arrow-btn"
                style={{
                  width: isCompact ? 32 : 46,
                  height: isCompact ? 32 : 46,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                <PixelIcon name="chevron-left" size={isCompact ? 18 : 24} color="#fef08a" />
              </button>
            </div>

            {/* Right 3D Wood Arrow Switcher */}
            <div
              style={{
                position: 'absolute',
                right: isCompact ? -36 : -64,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 100,
                pointerEvents: 'auto',
              }}
            >
              <button
                type="button"
                onClick={handleNext}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="切换下一位英灵 (键盘 → 或 D)"
                className="stardew-btn stardew-arrow-btn"
                style={{
                  width: isCompact ? 32 : 46,
                  height: isCompact ? 32 : 46,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                <PixelIcon name="chevron-right" size={isCompact ? 18 : 24} color="#fef08a" />
              </button>
            </div>
          </div>

          {/* Carved Oak & Brass Nameplate (Cleanly placed below the Dais) */}
          <div className="stardew-nameplate" style={{
            margin: isCompact ? '4px auto 1px' : '8px auto 2px',
            padding: isCompact ? '3px 12px' : '4px 16px',
          }}>
            <div style={{
              fontSize: isCompact ? '8px' : '9.5px',
              color: '#fef08a',
              fontFamily: 'var(--font-pixel)',
              textShadow: '1px 1px 0 #1b0a04',
              marginBottom: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}>
              <span>{currentChar.servantClass}</span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <PixelIcon name={ARCHETYPE_ICON[currentChar.archetype]} size={isCompact ? 9 : 10} color="#fef08a" />
                <span>{currentChar.archetypeTag}</span>
              </span>
            </div>
            <div style={{
              fontSize: isCompact ? '10.5px' : '13px',
              fontWeight: 700,
              color: '#ffd166',
              fontFamily: 'var(--font-pixel)',
              textShadow: '1px 1px 0 #1b0a04',
            }}>
              {currentChar.name}
            </div>
            <div style={{
              fontSize: isCompact ? '7.5px' : '9px',
              color: '#fef9c3',
              fontFamily: 'var(--font-pixel)',
              textShadow: '1px 1px 0 #1b0a04',
              marginTop: 1,
              opacity: 0.9,
            }}>
              {currentChar.title}
            </div>
          </div>

          {/* 14 Servants Carved Oak Roster Dock */}
          <div className="stardew-roster-dock" style={{
            margin: isCompact ? '3px 0 1px' : '6px 0 2px',
            padding: isCompact ? '3px 5px' : '5px 7px',
            gap: isCompact ? 3 : 4,
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
                  title={`点击选择 ${c.name} (${c.servantClass})`}
                  className={`stardew-hero-rune ${isCur ? 'active' : ''}`}
                  style={{ width: runeSize, height: runeSize }}
                >
                  <img
                    src={c.avatarSprite}
                    alt={c.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center bottom',
                      imageRendering: 'pixelated',
                      display: 'block',
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Detailed Roster Selection Button */}
          <button
            onClick={() => { sound.playSelect(); onOpenCharacterSelect(); }}
            className="stardew-btn stardew-btn-wood"
            style={{
              padding: isCompact ? '3px 10px' : '6px 16px',
              fontSize: isCompact ? '9px' : '11px',
              gap: 5,
              marginTop: isCompact ? 3 : 6,
            }}
          >
            <PixelIcon name="users" size={isCompact ? 11 : 14} color="#fef08a" />
            <span>{CHARACTERS.length}位英雄与英灵全览</span>
          </button>
        </div>

        {/* COLUMN 3: STARDEW ADVENTURER'S GUILD NOTICEBOARD */}
        <div 
          className="stardew-panel" 
          style={{
            position: 'relative',
            padding: isCompact ? '10px 12px' : '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: isCompact ? 6 : 10,
            width: isCompact ? '200px' : '280px',
            flexShrink: 0,
          }}
        >
          {/* Rustic Timber Rooflet */}
          <div className="stardew-timber-roof">
            <PixelIcon name="leaf" size={9} color="#bbf7d0" />
            <PixelIcon name="leaf" size={9} color="#bbf7d0" />
          </div>

          {/* Grounding Timber Posts rooted into the Meadow */}
          <div className="stardew-timber-post stardew-timber-post-l" />
          <div className="stardew-timber-post stardew-timber-post-r" />

          {/* Noticeboard Header Plaque */}
          <div className="stardew-board-header" style={{
            fontSize: isCompact ? '10px' : '11px',
            padding: isCompact ? '4px 8px' : '5px 10px',
            marginBottom: isCompact ? 2 : 4,
          }}>
            <PixelIcon name="scroll-horizontal" size={isCompact ? 10 : 12} color="#fffbeb" />
            <span>冒险者公会 · 远征战令</span>
          </div>

          {/* Continue button if run active */}
          {hasActiveRun && currentFloor > 0 && onResumeRun && (
            <button
              onClick={() => {
                sound.playDraw();
                onResumeRun();
              }}
              className="stardew-btn stardew-btn-blue"
              style={{
                padding: isCompact ? '6px 10px' : '10px 14px',
                fontSize: isCompact ? '10.5px' : '12px',
                gap: 6,
                justifyContent: 'flex-start',
                width: '100%',
              }}
            >
              <PixelIcon name="compass" size={isCompact ? 13 : 18} color="#9db3d0" />
              <span>继续攀登 (第 {currentFloor} 层)</span>
            </button>
          )}

          {/* Start New Run Button (Spire Slay + Companion Squad + Currency Wars) */}
          <button
            onClick={() => {
              sound.playSelect();
              onStartGame();
            }}
            className="stardew-btn stardew-btn-primary"
            style={{
              padding: isCompact ? '8px 10px' : '12px 14px',
              fontSize: isCompact ? '11.5px' : '13.5px',
              gap: 8,
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            <PixelIcon name="play" size={isCompact ? 15 : 20} color="#fffbeb" />
            <span style={{ fontWeight: 800 }}>{hasActiveRun && currentFloor > 0 ? '继续尖塔' : '踏入尖塔'}</span>
          </button>

          {/* Auto-Chess Sandbox Mode Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onStartAutoChess?.();
            }}
            className="stardew-btn stardew-btn-purple"
            style={{
              padding: isCompact ? '6px 10px' : '10px 14px',
              fontSize: isCompact ? '10.5px' : '12px',
              gap: 6,
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            <PixelIcon name="sparkles" size={isCompact ? 13 : 17} color="#f4f9ec" />
            <span style={{ fontWeight: 700 }}>自走棋演练场 (SANDBOX)</span>
          </button>

          {/* Select Character / Hero Roster Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenCharacterSelect();
            }}
            className="stardew-btn stardew-btn-red"
            style={{
              padding: isCompact ? '6px 10px' : '10px 14px',
              fontSize: isCompact ? '10.5px' : '12px',
              gap: 6,
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            <PixelIcon name="user" size={isCompact ? 13 : 17} color="#f8ece7" />
            <span style={{ fontWeight: 700 }}>英灵阵容 (SERVANTS)</span>
          </button>

          {/* Starter Deck Preview */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenDeck();
            }}
            className="stardew-btn stardew-btn-blue"
            style={{
              padding: isCompact ? '6px 10px' : '10px 14px',
              fontSize: isCompact ? '10.5px' : '12px',
              gap: 6,
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            <PixelIcon name="blocks" size={isCompact ? 13 : 17} color="#eaeff7" />
            <span style={{ fontWeight: 700 }}>战术卡组整备</span>
          </button>
        </div>
      </div>

    </div>
  );
};
