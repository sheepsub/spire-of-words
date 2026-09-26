import React, { useState } from 'react';
import { CHARACTERS, ARCHETYPE_ICON, type CharacterDefinition } from '../data/characters';
import { sound } from '../utils/audio';
import { AtmosphericParticles } from './AtmosphericParticles';
import { HoloServantCard } from './HoloServantCard';
import { PixelIcon } from './PixelIcon';

interface CharacterSelectViewProps {
  onSelectCharacter: (character: CharacterDefinition) => void;
  onPreviewCharacter?: (character: CharacterDefinition) => void;
  onBackToTitle: () => void;
  initialCharacterId?: string;
}

export const CharacterSelectView: React.FC<CharacterSelectViewProps> = ({
  onSelectCharacter,
  onPreviewCharacter,
  onBackToTitle,
  initialCharacterId = 'artoria',
}) => {
  const [selectedChar, setSelectedChar] = useState<CharacterDefinition>(() => {
    return CHARACTERS.find(c => c.id === initialCharacterId) || CHARACTERS[0];
  });
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'sts' | 'fate' | 'crossover'>('all');

  const stsIds = ['ironclad', 'silent', 'defect', 'watcher', 'necrobinder', 'regent'];
  const fateIds = ['artoria', 'gilgamesh', 'mash', 'jalter', 'serenity', 'rin'];
  // 跨界联动：既不属于尖塔原生，也不属于 Fate 英灵（菲比 / 饺子）
  const crossoverIds = ['phoebe', 'stewie'];

  const filteredCharacters = CHARACTERS.filter(char => {
    if (categoryFilter === 'sts') return stsIds.includes(char.id);
    if (categoryFilter === 'fate') return fateIds.includes(char.id);
    if (categoryFilter === 'crossover') return crossoverIds.includes(char.id);
    return true;
  });

  const handleSelect = (char: CharacterDefinition) => {
    sound.playSelect();
    setSelectedChar(char);
    onPreviewCharacter?.(char);
  };

  const handleConfirm = () => {
    sound.playDraw();
    onSelectCharacter(selectedChar);
  };

  const starterDeck = selectedChar.getStarterDeck();

  return (
    <div 
      className="spire-pixel-bg"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'max(6px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Dynamic Magical Particle Atmosphere */}
      <AtmosphericParticles color={selectedChar.archetypeColor} density={40} />

      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        zIndex: 10,
      }}>
        <button
          onClick={() => { 
            sound.playSelect(); 
            onPreviewCharacter?.(selectedChar); 
            onBackToTitle(); 
          }}
          className="spire-btn"
          style={{ padding: '8px 14px', fontSize: '11px' }}
        >
          <PixelIcon name="arrow-left" size={14} />
          <span>返回大厅</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(20px, 3.5vw, 26px)',
            color: '#fef08a',
            letterSpacing: '2px',
            textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, 0 4px 12px rgba(234, 179, 8, 0.6)',
            marginBottom: 2,
          }}>
            英雄召见 · CHOOSE THY HERO
          </h2>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '11px',
            color: '#94a3b8',
            letterSpacing: '1px',
          }}>
            {CHARACTERS.length} 位传奇英雄与英灵全员登场 · 纯正 2D 格斗像素立绘建模 · 专属流派与羁绊机制
          </div>
        </div>

        <div style={{ width: 100 }} /> {/* Spacer */}
      </div>

      {/* Center Hero Gallery Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 18,
        margin: '10px 0',
        alignItems: 'stretch',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 10,
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
      }}>
        {/* Left: 12 Heroes Selectable Tabs with Category Filter */}
        <div style={{
          width: 'clamp(240px, 32%, 310px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          overflowY: 'auto',
          paddingRight: 6,
        }}>
          {/* Category Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            padding: '2px',
            backgroundColor: 'rgba(10, 12, 18, 0.95)',
            border: '1px solid #374151',
            borderRadius: 4,
            marginBottom: 2,
            flexShrink: 0,
          }}>
            {[
              { id: 'all', label: `全部 (${CHARACTERS.length})` },
              { id: 'sts', label: `尖塔 (${stsIds.length})` },
              { id: 'fate', label: `Fate (${fateIds.length})` },
              { id: 'crossover', label: `联动 (${crossoverIds.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playSelect();
                  setCategoryFilter(tab.id as 'all' | 'sts' | 'fate' | 'crossover');
                }}
                style={{
                  flex: 1,
                  padding: '4px 2px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-pixel)',
                  backgroundColor: categoryFilter === tab.id ? 'rgba(59, 130, 246, 0.4)' : 'transparent',
                  color: categoryFilter === tab.id ? '#ffffff' : '#94a3b8',
                  border: categoryFilter === tab.id ? '1px solid #3b82f6' : '1px solid transparent',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontWeight: categoryFilter === tab.id ? 700 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredCharacters.map((char) => {
            const isChosen = char.id === selectedChar.id;
            return (
              <div
                key={char.id}
                onClick={() => handleSelect(char)}
                className="pixel-panel"
                style={{
                  padding: '7px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  backgroundColor: isChosen ? 'rgba(26, 31, 48, 0.98)' : 'rgba(12, 14, 22, 0.88)',
                  borderColor: isChosen ? char.archetypeColor : '#1f2937',
                  boxShadow: isChosen 
                    ? `0 0 0 2px ${char.archetypeColor}, 0 0 14px ${char.archetypeGlow}` 
                    : undefined,
                  transform: isChosen ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Mini Servant Card Portrait */}
                <div style={{
                  width: 52,
                  height: 68,
                  borderRadius: 4,
                  backgroundColor: '#0a0d16',
                  border: `2px solid ${isChosen ? char.archetypeColor : '#374151'}`,
                  boxShadow: isChosen ? `0 0 8px ${char.archetypeGlow}` : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <img 
                    src={char.avatarSprite} 
                    alt={char.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: char.archetypeColor,
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '8px',
                    textAlign: 'center',
                    padding: '1px 0',
                    fontWeight: 700,
                  }}>
                    {char.servantClass.split(' ')[0]}
                  </div>
                </div>

                {/* Character Name & Tag */}
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 900,
                    fontSize: '13px',
                    color: isChosen ? '#ffffff' : '#e2e8f0',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}>
                    {char.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: char.archetypeColor,
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                  }}>
                    <PixelIcon name={ARCHETYPE_ICON[char.archetype]} size={10} color={char.archetypeColor} />
                    <span>{char.archetypeTag}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Character Detailed Showcase */}
        <div className="pixel-panel" style={{
          flex: 1,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(14, 16, 26, 0.96)',
          overflowY: 'auto',
        }}>
          {/* Top Section: Art Showcase & Core Info */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Magnificent Pixel Hero Figure Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <HoloServantCard
                character={selectedChar}
                width={200}
                height={283}
              />
            </div>

            {/* Title & Basic Stats */}
            <div style={{ flex: 1, minWidth: 230 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '9.5px',
                  color: '#ffffff',
                  backgroundColor: selectedChar.archetypeColor,
                  padding: '2px 8px',
                  borderRadius: 2,
                  fontWeight: 700,
                }}>
                  {selectedChar.servantClass}
                </span>
                <span style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '9.5px',
                  color: selectedChar.archetypeColor,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: `1px solid ${selectedChar.archetypeColor}`,
                  padding: '2px 8px',
                }}>
                  {selectedChar.archetypeName}
                </span>
              </div>

              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontSize: '23px',
                color: '#f8fafc',
                marginBottom: 2,
              }}>
                {selectedChar.name}
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
                {selectedChar.title}
              </div>

              {/* Noble Phantasm Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '11px',
                color: '#fde047',
                marginBottom: 10,
                fontFamily: 'var(--font-pixel)',
              }}>
                <PixelIcon name="sword" size={12} color="#facc15" />
                <span>宝具: {selectedChar.noblePhantasm}</span>
              </div>

              {/* Attributes Row */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f87171', fontFamily: 'var(--font-pixel-num)', fontSize: '12px' }}>
                  <PixelIcon name="heart" size={15} color="#ef4444" />
                  <span>{selectedChar.hp} HP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#facc15', fontFamily: 'var(--font-pixel-num)', fontSize: '12px' }}>
                  <PixelIcon name="zap" size={15} color="#eab308" />
                  <span>{selectedChar.energy} 能量</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fbbf24', fontFamily: 'var(--font-pixel-num)', fontSize: '12px' }}>
                  <PixelIcon name="coins" size={15} color="#fbbf24" />
                  <span>{selectedChar.gold} G</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lore Quote */}
          <div style={{
            margin: '10px 0 6px',
            padding: '7px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderLeft: `3px solid ${selectedChar.archetypeColor}`,
            fontSize: '11.5px',
            fontStyle: 'italic',
            color: '#e2e8f0',
          }}>
            {selectedChar.description}
          </div>

          {/* Middle Section: Playstyle & Relic */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 10,
            margin: '6px 0 10px',
          }}>
            {/* Playstyle Box */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid #334155',
              padding: '8px 12px',
              borderRadius: 4,
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '10.5px',
                color: '#38bdf8',
                marginBottom: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <PixelIcon name="sparkles" size={13} color="#38bdf8" />
                <span>职阶战法与机制</span>
              </div>
              <p style={{ fontSize: '11px', lineHeight: '16px', color: '#cbd5e1', margin: 0 }}>
                {selectedChar.playstyle}
              </p>
            </div>

            {/* Starter Relic Box */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid #334155',
              padding: '8px 12px',
              borderRadius: 4,
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '10.5px',
                color: '#fbbf24',
                marginBottom: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ fontSize: '13px' }}>{selectedChar.starterRelic.icon}</span>
                <span>固有宝具: {selectedChar.starterRelic.name}</span>
              </div>
              <p style={{ fontSize: '11px', lineHeight: '16px', color: '#cbd5e1', margin: 0 }}>
                {selectedChar.starterRelic.desc}
              </p>
            </div>
          </div>

          {/* Starter Deck Preview Tags */}
          <div>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: '#94a3b8',
              marginBottom: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <PixelIcon name="blocks" size={12} />
              <span>初始魔导牌库 (10张精选卡牌):</span>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
              maxHeight: 64,
              overflowY: 'auto',
            }}>
              {starterDeck.map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: card.type === 'attack' ? 'rgba(127, 29, 29, 0.4)' 
                      : card.type === 'power' ? 'rgba(120, 53, 15, 0.4)' 
                      : 'rgba(30, 58, 138, 0.4)',
                    border: `1px solid ${card.type === 'attack' ? '#ef4444' : card.type === 'power' ? '#f59e0b' : '#3b82f6'}`,
                    padding: '2px 7px',
                    borderRadius: 2,
                    fontSize: '10px',
                    color: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title={card.name}
                >
                  <span style={{ fontFamily: 'var(--font-pixel-num)', fontSize: '8px', color: '#fef08a' }}>{card.cost}E</span>
                  <strong style={{ color: '#fef08a' }}>{card.name.split('(')[0].trim()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Confirm Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        zIndex: 10,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => {
            sound.playSelect();
            onPreviewCharacter?.(selectedChar);
            onBackToTitle();
          }}
          className="spire-btn"
          style={{
            padding: '11px 22px',
            fontSize: '13px',
            backgroundColor: '#1e293b',
            borderColor: selectedChar.archetypeColor,
            color: '#f8fafc',
            gap: 8,
          }}
        >
          <PixelIcon name="arrow-left" size={15} color={selectedChar.archetypeColor} />
          <span>设为大厅展示并返回</span>
        </button>

        <button
          onClick={handleConfirm}
          className="spire-btn"
          style={{
            padding: '11px 32px',
            fontSize: '14px',
            backgroundColor: '#854d0e',
            color: '#fef08a',
            gap: 10,
            boxShadow: '0 0 16px rgba(234, 179, 8, 0.4)',
          }}
        >
          <PixelIcon name="play" size={17} color="#fde047" />
          <span>召唤【{selectedChar.name}】出征尖塔 (SUMMON SERVANT)</span>
        </button>
      </div>
    </div>
  );
};
