import React, { useState } from 'react';
import type { Player, Enemy, Card, FloatText } from '../types/game';
import { CardView } from './CardView';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  Swords, 
  Sparkles, 
  Skull,
  TrendingUp,
  Flame,
  Layers,
  Archive
} from 'lucide-react';

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

  // When a card is selected, prepare the 3 recall options
  const handleSelectCard = (card: Card) => {
    if (!isPlayerTurn) return;
    const cost = card.isUpgraded && card.upgradedCost !== undefined ? card.upgradedCost : card.cost;
    if (player.energy < cost) {
      sound.playSelect();
      return;
    }

    sound.playSelect();
    setSelectedCard(card);

    // Shuffle correct meaning with 2 distractors
    const options = [card.meaning, ...card.distractors];
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
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      sound.playEnemyHit();
    }

    setHitAnim(true);
    setTimeout(() => setHitAnim(false), 300);

    onPlayCard(selectedCard, isCorrect);
    setSelectedCard(null);
  };

  // Skip quiz and play normally
  const handleDirectPlay = () => {
    if (!selectedCard) return;
    setHitAnim(true);
    setTimeout(() => setHitAnim(false), 300);
    onPlayCard(selectedCard, false);
    setSelectedCard(null);
  };

  // Calculate enemy display damage with vulnerable/weak
  const getEnemyIntentDamage = () => {
    if (enemy.intent.type !== 'attack' || !enemy.intent.value) return 0;
    let dmg = enemy.intent.value + enemy.statusEffects.strength;
    if (enemy.statusEffects.weak > 0) dmg = Math.floor(dmg * 0.75);
    if (player.statusEffects.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
    return Math.max(0, dmg);
  };

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
    }} className="spire-bg">
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
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            fontSize: ft.type === 'critical' ? '24px' : '20px',
            color: ft.type === 'damage' ? '#f87171' 
                 : ft.type === 'block' ? '#38bdf8'
                 : ft.type === 'critical' ? '#facc15'
                 : ft.type === 'heal' ? '#4ade80'
                 : '#e2e8f0',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px currentColor',
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
        padding: '16px 20px',
        position: 'relative',
      }}>
        {/* PLAYER DISPLAY */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 10,
        }}>
          {/* Player avatar */}
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #334155 0%, #0f172a 100%)',
            border: '3px solid var(--border-gold)',
            boxShadow: '0 0 20px rgba(197, 160, 89, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            position: 'relative',
          }}>
            🧙‍♂️
            {player.block > 0 && (
              <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: '#0284c7',
                border: '2px solid #bae6fd',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}>
                {player.block}
              </div>
            )}
          </div>

          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>
            学者勇士 (Scholar)
          </div>

          {/* Player Status Effects */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {player.statusEffects.strength > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={12} /> 力量 {player.statusEffects.strength}
              </span>
            )}
            {player.statusEffects.vulnerable > 0 && (
              <span style={{ backgroundColor: 'rgba(249, 115, 22, 0.25)', color: '#fdba74', border: '1px solid #f97316', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skull size={12} /> 易伤 {player.statusEffects.vulnerable}
              </span>
            )}
            {player.statusEffects.weak > 0 && (
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', border: '1px solid #a855f7', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skull size={12} /> 虚弱 {player.statusEffects.weak}
              </span>
            )}
          </div>
        </div>

        {/* VS / Turn banner */}
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-serif)',
          color: '#cbd5e1',
          zIndex: 10,
        }}>
          <div style={{
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: isPlayerTurn ? '#86efac' : '#f87171',
            fontWeight: 800,
          }}>
            {isPlayerTurn ? '【你的回合】' : '【敌方行动中...】'}
          </div>
        </div>

        {/* ENEMY DISPLAY */}
        <div 
          className={`monster-idle ${hitAnim ? 'shake' : ''}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            zIndex: 10,
          }}
        >
          {/* Intent Indicator Bubble */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid rgba(239, 68, 68, 0.6)',
            padding: '4px 10px',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.7)',
            cursor: 'help',
          }} title={enemy.intent.desc}>
            {enemy.intent.type === 'attack' && (
              <>
                <Swords size={16} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: 14 }}>
                  {enemyIntentDamage}
                  {enemy.intent.times && enemy.intent.times > 1 ? ` × ${enemy.intent.times}` : ''}
                </span>
              </>
            )}
            {enemy.intent.type === 'defend' && (
              <>
                <Shield size={16} color="#38bdf8" />
                <span style={{ color: '#38bdf8', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: 14 }}>
                  +{enemy.intent.value} 🛡️
                </span>
              </>
            )}
            {enemy.intent.type === 'buff' && (
              <>
                <Flame size={16} color="#fbbf24" />
                <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>强化</span>
              </>
            )}
            {enemy.intent.type === 'debuff' && (
              <>
                <Skull size={16} color="#a855f7" />
                <span style={{ color: '#a855f7', fontSize: 11, fontWeight: 700 }}>诅咒</span>
              </>
            )}
          </div>

          {/* Enemy avatar */}
          <div style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #451a1a 0%, #1a0505 100%)',
            border: '3px solid #ef4444',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '52px',
            position: 'relative',
          }}>
            {enemy.avatar}
            {enemy.block > 0 && (
              <div style={{
                position: 'absolute',
                top: -8,
                left: -8,
                backgroundColor: '#0284c7',
                border: '2px solid #bae6fd',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}>
                {enemy.block}
              </div>
            )}
          </div>

          {/* Enemy name & HP bar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 15, color: '#f8fafc' }}>
              {enemy.name}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{enemy.title}</div>
            
            {/* Enemy HP Bar */}
            <div style={{
              width: 130,
              height: 14,
              backgroundColor: '#331111',
              borderRadius: 7,
              overflow: 'hidden',
              border: '1px solid #7f1d1d',
              marginTop: 4,
              position: 'relative',
            }}>
              <div style={{
                width: `${enemyHpPercent}%`,
                height: '100%',
                backgroundColor: '#ef4444',
                transition: 'width 0.25s ease',
              }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: '#ffffff',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
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

      {/* RECALL STRIKE OVERLAY (When card is selected to play) */}
      {selectedCard && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(10, 11, 16, 0.78)',
          backdropFilter: 'blur(5px)',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 24, 38, 0.98)',
            border: '2px solid var(--border-gold)',
            borderRadius: 14,
            padding: '20px 24px',
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px var(--border-gold-glow)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={20} color="#facc15" />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontSize: 16,
                color: '#facc15',
                letterSpacing: 1,
              }}>
                词汇唤醒暴击挑战
              </span>
            </div>

            <div style={{
              fontSize: '24px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 900,
              color: '#f8fafc',
              textTransform: 'capitalize',
              marginBottom: 4,
            }}>
              {selectedCard.word}
            </div>

            <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
              {selectedCard.pos} {selectedCard.phonetic}
            </div>

            <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 14 }}>
              选择正确词义，立即触发 <strong style={{ color: '#facc15' }}>暴击 (1.5x 增益)</strong>！
            </div>

            {/* 3 Recall Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {shuffledOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecallChoice(option)}
                  className="spire-btn"
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderColor: 'rgba(197, 160, 89, 0.5)',
                  }}
                >
                  <span style={{ color: '#facc15', marginRight: 6 }}>{String.fromCharCode(65 + idx)}.</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>

            {/* Etymology / Hint Accordion */}
            {selectedCard.etymology && (
              <div style={{
                fontSize: 11,
                color: '#94a3b8',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '6px 10px',
                borderRadius: 6,
                marginBottom: 14,
                textAlign: 'left',
              }}>
                💡 <span style={{ color: '#bae6fd' }}>词根解析：</span>{selectedCard.etymology}
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                取消出牌
              </button>

              <button
                onClick={handleDirectPlay}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#e2e8f0',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                直接打出 (常规数值)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & HAND OF CARDS */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        zIndex: 20,
      }}>
        {/* Battle Controls Bar: Energy, Draw Pile, Discard Pile, End Turn */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 8px 16px',
        }}>
          {/* Left: Player Main Energy Orb & Draw Pile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="main-energy-orb" title="剩余能量">
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                fontSize: '22px',
                color: '#1c1002',
                lineHeight: 1,
              }}>
                {player.energy}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#452204' }}>
                /{player.maxEnergy}
              </span>
            </div>

            <button
              onClick={() => onOpenDeckList(player.drawPile, '抽牌堆 (Draw Pile)')}
              className="spire-btn"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="查看抽牌堆"
            >
              <Layers size={14} />
              <span>抽牌堆 ({player.drawPile.length})</span>
            </button>
          </div>

          {/* Right: Discard Pile & End Turn Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => onOpenDeckList(player.discardPile, '弃牌堆 (Discard Pile)')}
              className="spire-btn"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="查看弃牌堆"
            >
              <Archive size={14} />
              <span>弃牌堆 ({player.discardPile.length})</span>
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
          padding: '8px 24px 12px 24px',
          gap: 10,
          minHeight: 270,
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
