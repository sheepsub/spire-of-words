import React, { useState, useEffect } from 'react';
import type { Player, Enemy, Card, FloatText } from '../types/game';
import { CardView } from './CardView';
import { sound } from '../utils/audio';
import { getRandomDistractors } from '../data/dictionary';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  Swords, 
  Sparkles, 
  Skull,
  TrendingUp,
  Flame,
  Layers,
  Archive,
  Volume2,
  AlertTriangle
} from 'lucide-react';
import heroPixelImg from '../assets/pixel/hero_scholar.jpg';

interface BattleViewProps {
  player: Player;
  enemy: Enemy;
  onPlayCard: (card: Card, isCritical: boolean) => void;
  onEndTurn: () => void;
  isPlayerTurn: boolean;
  floatTexts: FloatText[];
  onOpenDeckList: (cards: Card[], title: string) => void;
}

export const BattleView: React.FC<BattleViewProps> = ({
  player,
  enemy,
  onPlayCard,
  onEndTurn,
  isPlayerTurn,
  floatTexts,
  onOpenDeckList,
}) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [hitAnim, setHitAnim] = useState<boolean>(false);

  // When a card is selected, prepare the 4 recall options & speak pronunciation
  const handleSelectCard = (card: Card) => {
    if (!isPlayerTurn) return;
    const cost = card.isUpgraded && card.upgradedCost !== undefined ? card.upgradedCost : card.cost;
    if (player.energy < cost) {
      sound.playSelect();
      return;
    }

    sound.playSelect();
    setSelectedCard(card);

    // Speak English pronunciation automatically for immersive spellcasting
    sound.speakWord(card.word);

    // Dynamic distractors from 150+ dictionary database matching part of speech
    const distractors = getRandomDistractors(card.word, card.meaning, card.pos, 3);
    const options = [card.meaning, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    setShuffledOptions(options);
  };

  // Submit recall answer
  const handleRecallChoice = (choice: string) => {
    if (!selectedCard) return;
    const isCorrect = choice === selectedCard.meaning;

    if (isCorrect) {
      sound.playCritical();
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.65 },
      });
    } else {
      sound.playEnemyHit();
      sound.haptic('heavy');
    }

    setHitAnim(true);
    setTimeout(() => setHitAnim(false), 350);

    onPlayCard(selectedCard, isCorrect);
    setSelectedCard(null);
  };

  // Keyboard shortcut listener for options (1/2/3/4, A/B/C/D) and Esc to cancel
  useEffect(() => {
    if (!selectedCard || shuffledOptions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedCard(null);
        return;
      }

      const key = e.key.toUpperCase();
      let index = -1;
      if (key === '1' || key === 'A') index = 0;
      else if (key === '2' || key === 'B') index = 1;
      else if (key === '3' || key === 'C') index = 2;
      else if (key === '4' || key === 'D') index = 3;

      if (index >= 0 && index < shuffledOptions.length) {
        e.preventDefault();
        handleRecallChoice(shuffledOptions[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard, shuffledOptions]);

  // Calculate enemy display damage with vulnerable/weak
  const getEnemyIntentDamage = () => {
    if (enemy.intent.type !== 'attack' || !enemy.intent.value) return 0;
    let dmg = enemy.intent.value + enemy.statusEffects.strength;
    if (enemy.statusEffects.weak > 0) dmg = Math.floor(dmg * 0.75);
    if (player.statusEffects.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
    return Math.max(0, dmg);
  };

  const playerHpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const enemyHpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
  const enemyIntentDamage = getEnemyIntentDamage();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    }} className="spire-pixel-bg">
      {/* Floating combat texts */}
      {floatTexts.map((ft) => (
        <div
          key={ft.id}
          className="animate-float-text"
          style={{
            position: 'absolute',
            left: `${ft.x}%`,
            top: `${ft.y}%`,
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-pixel-num)',
            fontWeight: 700,
            fontSize: ft.type === 'critical' ? '20px' : '16px',
            color: ft.type === 'damage' ? '#f87171' 
                 : ft.type === 'block' ? '#38bdf8'
                 : ft.type === 'critical' ? '#facc15'
                 : ft.type === 'heal' ? '#4ade80'
                 : '#e2e8f0',
            zIndex: 90,
            pointerEvents: 'none',
          }}
        >
          {ft.text}
        </div>
      ))}

      {/* TOP/MIDDLE: Battle Arena (Player & Enemy) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '4px max(24px, env(safe-area-inset-right)) 4px max(24px, env(safe-area-inset-left))',
        position: 'relative',
        zIndex: 10,
        minHeight: 'clamp(120px, 30vh, 200px)',
      }}>
        {/* PLAYER DISPLAY */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 10,
        }}>
          {/* Servant Battlefield Standing Figure & Arcane Circle */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minHeight: 'clamp(110px, 24vh, 180px)',
            width: 'clamp(120px, 20vw, 180px)',
          }}>
            <img 
              src={player.characterAvatar || heroPixelImg} 
              alt={player.characterName || '英灵战士'} 
              className="monster-idle"
              style={{
                height: 'clamp(110px, 24vh, 180px)',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.95)) drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))',
                imageRendering: 'auto',
                zIndex: 5,
              }}
            />
            {/* Ground Arcane Summon Ring */}
            <div style={{
              position: 'absolute',
              bottom: -4,
              width: 140,
              height: 24,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.55) 0%, rgba(37, 99, 235, 0.2) 60%, transparent 80%)',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.6)',
              zIndex: 2,
              pointerEvents: 'none',
            }} />
            {player.block > 0 && (
              <>
                {/* Luminous Crystalline Shield Aura */}
                <div style={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: 16,
                  border: '2px solid rgba(56, 189, 248, 0.75)',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 16px rgba(56, 189, 248, 0.2)',
                  pointerEvents: 'none',
                  zIndex: 8,
                }} />
                <div style={{
                  position: 'absolute',
                  top: -6,
                  right: -4,
                  backgroundColor: '#0284c7',
                  border: '2px solid #38bdf8',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.9)',
                  padding: '2px 8px',
                  color: '#fff',
                  fontFamily: 'var(--font-pixel-num)',
                  fontWeight: 700,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  zIndex: 20,
                  borderRadius: 4,
                }}>
                  🛡️ {player.block}
                </div>
              </>
            )}
          </div>

          {/* Player Name & HP bar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontFamily: 'var(--font-pixel)', 
              fontWeight: 700, 
              fontSize: 12, 
              color: '#f8fafc',
              textShadow: '0 2px 4px #000',
            }}>
              {player.characterName || '御主英灵'}
            </div>
            
            {/* Player Segmented 16-bit HP Bar */}
            <div className="pixel-hp-bar-bg" style={{
              width: 140,
              marginTop: 4,
              position: 'relative',
            }}>
              <div className="pixel-hp-fill" style={{
                width: `${playerHpPercent}%`,
              }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontFamily: 'var(--font-pixel-num)',
                fontWeight: 700,
                color: '#ffffff',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}>
                {player.hp}/{player.maxHp}
              </div>
            </div>
          </div>

          {/* Player Status Badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {player.statusEffects.strength > 0 && (
              <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={12} /> 力量 {player.statusEffects.strength}
              </span>
            )}
            {player.statusEffects.dexterity > 0 && (
              <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.25)', color: '#7dd3fc', border: '1px solid #38bdf8', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield size={12} /> 敏捷 {player.statusEffects.dexterity}
              </span>
            )}
            {player.statusEffects.weak > 0 && (
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', border: '1px solid #a855f7', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skull size={12} /> 虚弱 {player.statusEffects.weak}
              </span>
            )}
            {player.statusEffects.vulnerable > 0 && (
              <span style={{ backgroundColor: 'rgba(249, 115, 22, 0.25)', color: '#fdba74', border: '1px solid #f97316', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skull size={12} /> 易伤 {player.statusEffects.vulnerable}
              </span>
            )}
          </div>
        </div>

        {/* VS Pixel Arcane Clashing Insignia */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          opacity: 0.85,
        }}>
          <Swords size={22} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.7))' }} />
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: isPlayerTurn ? '#4ade80' : '#f87171',
            letterSpacing: '1px',
          }}>
            {isPlayerTurn ? '▶ 你的回合' : '⏳ 敌方行动'}
          </div>
        </div>

        {/* ENEMY DISPLAY */}
        <div 
          className={`monster-idle ${hitAnim ? 'shake' : ''}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            zIndex: 10,
          }}
        >
          {/* Enemy Intent Bubble */}
          <div style={{
            backgroundColor: 'rgba(15, 17, 26, 0.95)',
            border: '2px solid #374151',
            boxShadow: '0 -2px 0 0 #000, 0 2px 0 0 #000, -2px 0 0 0 #000, 2px 0 0 0 #000',
            padding: '3px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 28,
            borderRadius: 4,
          }} title={enemy.intent.desc}>
            {enemy.intent.type === 'attack' && (
              <>
                <Swords size={15} color="#ef4444" />
                <span style={{
                  color: '#ef4444',
                  fontFamily: 'var(--font-pixel-num)',
                  fontWeight: 700,
                  fontSize: 12,
                }}>
                  {enemyIntentDamage}
                </span>
                {enemy.intent.times && enemy.intent.times > 1 && (
                  <span style={{ color: '#f87171', fontSize: 10, fontFamily: 'var(--font-pixel-num)' }}>
                    x{enemy.intent.times}
                  </span>
                )}
              </>
            )}
            {enemy.intent.type === 'defend' && (
              <>
                <Shield size={15} color="#38bdf8" />
                <span style={{ color: '#38bdf8', fontFamily: 'var(--font-pixel-num)', fontSize: 11, fontWeight: 700 }}>
                  +{enemy.intent.value} 防御
                </span>
              </>
            )}
            {enemy.intent.type === 'buff' && (
              <>
                <Flame size={15} color="#fbbf24" />
                <span style={{ color: '#fbbf24', fontSize: 10, fontWeight: 700 }}>强化</span>
              </>
            )}
            {enemy.intent.type === 'debuff' && (
              <>
                <Skull size={15} color="#a855f7" />
                <span style={{ color: '#a855f7', fontSize: 10, fontWeight: 700 }}>诅咒</span>
              </>
            )}
          </div>

          {/* Enemy Sprite on Pedestal */}
          <div className="pixel-pedestal" style={{ position: 'relative' }}>
            {enemy.image ? (
              <img 
                src={enemy.image} 
                alt={enemy.name}
                className="pixel-art"
                style={{
                  width: enemy.isBoss ? 'clamp(100px, 20vh, 140px)' : 'clamp(85px, 17vh, 120px)',
                  height: enemy.isBoss ? 'clamp(100px, 20vh, 140px)' : 'clamp(85px, 17vh, 120px)',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9))',
                }}
              />
            ) : (
              <div style={{
                width: 95,
                height: 95,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '46px',
              }}>
                {enemy.avatar}
              </div>
            )}
            {enemy.block > 0 && (
              <div style={{
                position: 'absolute',
                top: -8,
                left: -8,
                backgroundColor: '#0284c7',
                border: '2px solid #38bdf8',
                boxShadow: '0 0 0 2px #000, 0 4px 10px rgba(0,0,0,0.8)',
                padding: '2px 8px',
                color: '#fff',
                fontFamily: 'var(--font-pixel-num)',
                fontWeight: 700,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                zIndex: 20,
              }}>
                🛡️ {enemy.block}
              </div>
            )}
          </div>

          {/* Enemy name & HP bar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontFamily: 'var(--font-pixel)', 
              fontWeight: 700, 
              fontSize: 12, 
              color: '#f8fafc',
              textShadow: '0 2px 4px #000',
            }}>
              {enemy.name}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{enemy.title}</div>
            
            {/* Enemy Segmented 16-bit HP Bar */}
            <div className="pixel-hp-bar-bg" style={{
              width: 140,
              marginTop: 4,
              position: 'relative',
            }}>
              <div className="pixel-hp-fill" style={{
                width: `${enemyHpPercent}%`,
              }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontFamily: 'var(--font-pixel-num)',
                fontWeight: 700,
                color: '#ffffff',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}>
                {enemy.hp}/{enemy.maxHp}
              </div>
            </div>
          </div>

          {/* Enemy Status Badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {enemy.statusEffects.poison > 0 && (
              <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.25)', color: '#86efac', border: '1px solid #22c55e', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                🧪 中毒 {enemy.statusEffects.poison}
              </span>
            )}
            {enemy.statusEffects.vulnerable > 0 && (
              <span style={{ backgroundColor: 'rgba(249, 115, 22, 0.25)', color: '#fdba74', border: '1px solid #f97316', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skull size={12} /> 易伤 {enemy.statusEffects.vulnerable}
              </span>
            )}
            {enemy.statusEffects.weak > 0 && (
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', border: '1px solid #a855f7', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skull size={12} /> 虚弱 {enemy.statusEffects.weak}
              </span>
            )}
            {enemy.statusEffects.strength > 0 && (
              <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={12} /> 力量 {enemy.statusEffects.strength}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* WORD INCANTATION QUIZ MODAL (Mobile Landscape 2-Column Touch Layout) */}
      {selectedCard && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 6, 15, 0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'max(8px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
        }}>
          <div className="pixel-panel" style={{
            padding: '16px 20px',
            maxWidth: 640,
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(234, 179, 8, 0.25)',
            border: '2px solid var(--border-gold)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px solid rgba(251, 191, 36, 0.2)', paddingBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#facc15" />
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 800,
                  fontSize: 14,
                  color: '#facc15',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  魔导咏唱 · 词义裁定
                </span>
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #475569',
                  color: '#cbd5e1',
                  borderRadius: '50%',
                  width: 26,
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                title="返回手牌"
              >
                ✕
              </button>
            </div>

            {/* 2-Column Responsive Layout in Landscape */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
              alignItems: 'center',
            }}>
              {/* Left Column: Word details & Rules */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 900,
                    color: '#f8fafc',
                    textTransform: 'capitalize',
                    letterSpacing: 1,
                  }}>
                    {selectedCard.word}
                  </div>
                  <button
                    onClick={() => sound.speakWord(selectedCard.word)}
                    title="重播发音"
                    style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      border: '1px solid #38bdf8',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 size={15} />
                  </button>
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 700, marginRight: 6 }}>{selectedCard.pos}</span>
                  <span>{selectedCard.phonetic}</span>
                </div>

                {/* Etymology / Hint */}
                {selectedCard.etymology && (
                  <div style={{
                    fontSize: 10.5,
                    color: '#94a3b8',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    padding: '6px 10px',
                    border: '1px solid #334155',
                    borderRadius: 4,
                    textAlign: 'left',
                    lineHeight: 1.4,
                  }}>
                    💡 <span style={{ color: '#bae6fd', fontWeight: 700 }}>词源：</span>{selectedCard.etymology}
                  </div>
                )}

                {/* Rule indicator */}
                <div style={{
                  fontSize: 11,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}>
                  <div style={{ color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Sparkles size={12} />
                    <span><strong>回答正确</strong>：100%威力并触发暴击</span>
                  </div>
                  <div style={{ color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <AlertTriangle size={12} />
                    <span><strong>回答错误</strong>：威力衰减 50%</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 4 Touch-friendly Choice Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {shuffledOptions.map((option, idx) => {
                  const badge = ['A', 'B', 'C', 'D'][idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => handleRecallChoice(option)}
                      className="spire-btn"
                      style={{
                        padding: '10px 14px',
                        fontSize: '12.5px',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        backgroundColor: 'rgba(20, 24, 39, 0.95)',
                        borderColor: 'rgba(234, 179, 8, 0.35)',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{
                        backgroundColor: 'rgba(234, 179, 8, 0.2)',
                        color: '#facc15',
                        border: '1px solid rgba(234, 179, 8, 0.5)',
                        borderRadius: 4,
                        padding: '2px 7px',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}>
                        {badge}
                      </span>
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>{option}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setSelectedCard(null)}
                  className="spire-btn"
                  style={{
                    fontSize: 11,
                    padding: '6px 14px',
                    backgroundColor: 'rgba(71, 85, 105, 0.25)',
                    borderColor: '#475569',
                    color: '#94a3b8',
                    justifyContent: 'center',
                    marginTop: 4,
                  }}
                >
                  放弃本次咏唱
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & HAND OF CARDS */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
        zIndex: 20,
      }}>
        {/* Battle Controls Bar: Energy, Draw Pile, Discard Pile, End Turn */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 max(20px, env(safe-area-inset-right)) 4px max(20px, env(safe-area-inset-left))',
        }}>
          {/* Left: Player Main Energy Orb & Draw Pile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="main-energy-orb" title="剩余能量">
              <span style={{
                fontFamily: 'var(--font-pixel-num)',
                fontWeight: 700,
                fontSize: '18px',
                color: '#1c1002',
                lineHeight: 1,
              }}>
                {player.energy}
              </span>
              <span style={{ 
                fontSize: '9px', 
                fontWeight: 700, 
                color: '#452204',
                fontFamily: 'var(--font-pixel-num)'
              }}>
                /{player.maxEnergy}
              </span>
            </div>

            <button
              onClick={() => onOpenDeckList(player.drawPile, '抽牌堆 (Draw Pile)')}
              className="spire-btn"
              style={{ padding: '5px 10px', fontSize: '11px' }}
              title="查看抽牌堆"
            >
              <Layers size={13} />
              <span>抽牌 ({player.drawPile.length})</span>
            </button>
          </div>

          {/* Right: Discard Pile & End Turn Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => onOpenDeckList(player.discardPile, '弃牌堆 (Discard Pile)')}
              className="spire-btn"
              style={{ padding: '5px 10px', fontSize: '11px' }}
              title="查看弃牌堆"
            >
              <Archive size={13} />
              <span>弃牌 ({player.discardPile.length})</span>
            </button>

            <button
              onClick={() => {
                if (isPlayerTurn) {
                  sound.playDraw();
                  onEndTurn();
                }
              }}
              disabled={!isPlayerTurn}
              className="end-turn-btn"
              style={{
                padding: '10px 18px',
                fontSize: '13px',
              }}
            >
              结束回合
            </button>
          </div>
        </div>

        {/* HAND CARDS FAN CONTAINER */}
        <div style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'visible',
          display: 'flex',
          justifyContent: player.hand.length <= 4 ? 'center' : 'flex-start',
          alignItems: 'flex-end',
          padding: '2px max(24px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))',
          gap: 8,
          minHeight: 'clamp(170px, 36vh, 260px)',
        }}>
          {player.hand.map((card) => {
            const cost = card.isUpgraded && card.upgradedCost !== undefined ? card.upgradedCost : card.cost;
            const canAfford = player.energy >= cost;

            return (
              <div
                key={card.id}
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.2s ease',
                }}
              >
                <CardView
                  card={card}
                  onClick={() => handleSelectCard(card)}
                  disabled={!isPlayerTurn || !canAfford}
                  selected={selectedCard?.id === card.id}
                  showMeaning={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
