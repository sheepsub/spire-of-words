import React, { useState } from 'react';
import type { Card } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, Sparkles, Info } from 'lucide-react';
import { CardIllustration } from './CardIllustrations';
import { getCardArtwork } from '../assets/cards';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  showMeaning?: boolean;
  compact?: boolean;
  onDragStart?: (card: Card) => void;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  showMeaning = true,
  compact = false,
  onDragStart,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.speakWord(card.word);
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSelect();
    setIsFlipped(!isFlipped);
  };

  const cost = card.isUpgraded && card.upgradedCost !== undefined ? card.upgradedCost : card.cost;
  const damage = card.isUpgraded && card.upgradedDamage !== undefined ? card.upgradedDamage : card.baseDamage;
  const block = card.isUpgraded && card.upgradedBlock !== undefined ? card.upgradedBlock : card.baseBlock;
  const hits = card.isUpgraded && card.upgradedHits !== undefined ? card.upgradedHits : card.hits;

  const cardClass = card.type === 'attack' 
    ? 'card-attack' 
    : card.type === 'skill' 
    ? 'card-skill' 
    : 'card-power';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      draggable={!disabled}
      onDragStart={() => onDragStart && onDragStart(card)}
      className={`card-frame ${cardClass} ${selected ? 'selected ring-2 ring-yellow-400' : ''} ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
      style={{
        transform: compact ? 'scale(0.85)' : undefined,
        perspective: '1000px',
      }}
    >
      {/* Energy Cost Orb */}
      <div className="energy-orb">
        {cost}
      </div>

      {/* Upgraded Ribbon / Mastery Star */}
      {card.isUpgraded && (
        <div style={{
          position: 'absolute',
          top: -6,
          right: -6,
          backgroundColor: '#eab308',
          color: '#000',
          padding: '2px 5px',
          border: '1px solid #fff',
          boxShadow: '0 0 0 1px #000, 0 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'var(--font-pixel-num)',
          fontSize: 9,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          zIndex: 6,
        }}>
          <Sparkles size={9} />+1
        </div>
      )}

      {/* Back of Card: In-Depth Oxford Study View */}
      {isFlipped ? (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '10px 4px 4px 4px',
          fontSize: '11px',
          color: '#cbd5e1',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <strong style={{ color: '#facc15', fontSize: '14px', textTransform: 'capitalize' }}>
                {card.word}
              </strong>
              <button
                onClick={handleFlip}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '10px', marginBottom: 6 }}>
              {card.pos} {card.phonetic}
            </div>

            <div style={{ color: '#fef08a', fontWeight: 700, marginBottom: 8 }}>
              {card.meaning}
            </div>

            {card.etymology && (
              <div style={{ fontSize: '10px', color: '#93c5fd', backgroundColor: 'rgba(0,0,0,0.4)', padding: '4px 6px', borderRadius: 4, marginBottom: 6 }}>
                💡 <strong>词根：</strong>{card.etymology}
              </div>
            )}

            {card.collocation && (
              <div style={{ fontSize: '10px', color: '#86efac', marginBottom: 6 }}>
                🔗 <strong>搭配：</strong>{card.collocation}
              </div>
            )}

            {card.exampleSentence && (
              <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
                “{card.exampleSentence}”
              </div>
            )}
          </div>

          <button
            onClick={handleFlip}
            className="spire-btn"
            style={{ padding: '4px 8px', fontSize: '10px', alignSelf: 'center', width: '100%' }}
          >
            返回卡面
          </button>
        </div>
      ) : (
        /* Front of Card */
        <>
          {/* Card Header: Distinct Card Name & Flip/Audio controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 2,
            marginBottom: 2,
            paddingLeft: 22,
          }}>
            <div 
              className="card-name-title"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontSize: '11.5px',
                color: card.isUpgraded ? '#86efac' : '#fef08a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '92px',
                letterSpacing: '0.2px',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }} 
              title={card.name || card.word}
            >
              {card.name || card.word}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                onClick={handleFlip}
                title="词汇深度解析"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: '#38bdf8',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Info size={10} />
              </button>

              <button
                onClick={handlePronounce}
                title="发音"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Volume2 size={10} />
              </button>
            </div>
          </div>

          {/* Subheader: Incantation Word (魔导咏唱) with POS & Phonetic */}
          <div 
            className="card-word-incantation"
            style={{
              fontSize: '9.5px',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
              marginBottom: 3,
              paddingLeft: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'var(--font-serif)', letterSpacing: '0.3px' }}>
              “{card.word}”
            </span>
            <span style={{ fontSize: '8.5px', color: '#64748b' }}>
              {card.pos} {card.phonetic}
            </span>
          </div>

          {/* Card Artwork Area: Official High-Definition Fate Illustration */}
          <div style={{
            flex: 1,
            minHeight: 56,
            borderRadius: 3,
            backgroundColor: '#05070d',
            border: '1.5px solid rgba(0, 0, 0, 0.85)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {getCardArtwork(card.illustrationKey || card.id) ? (
              <img
                src={getCardArtwork(card.illustrationKey || card.id)}
                alt={card.name || card.word}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                }}
              />
            ) : (
              <CardIllustration
                illustrationKey={card.illustrationKey || card.id}
                type={card.type}
                archetype={card.archetype}
              />
            )}

            {/* Archetype / Prefix tag overlay */}
            {card.prefix && (
              <span style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                color: '#67e8f9',
                backgroundColor: 'rgba(6, 182, 212, 0.65)',
                padding: '1px 4px',
                fontWeight: 700,
                borderRadius: 2,
                backdropFilter: 'blur(2px)',
              }}>
                前缀 {card.prefix}-
              </span>
            )}

            {card.archetype === 'poison' && (
              <span style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                color: '#86efac',
                backgroundColor: 'rgba(34, 197, 94, 0.65)',
                padding: '1px 4px',
                fontWeight: 700,
                borderRadius: 2,
                backdropFilter: 'blur(2px)',
              }}>
                🧪 剧毒
              </span>
            )}

            {card.archetype === 'shield' && (
              <span style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                color: '#93c5fd',
                backgroundColor: 'rgba(59, 130, 246, 0.65)',
                padding: '1px 4px',
                fontWeight: 700,
                borderRadius: 2,
                backdropFilter: 'blur(2px)',
              }}>
                🛡️ 坚城
              </span>
            )}

            {card.archetype === 'combo' && (
              <span style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                color: '#fde047',
                backgroundColor: 'rgba(234, 179, 8, 0.65)',
                padding: '1px 4px',
                fontWeight: 700,
                borderRadius: 2,
                backdropFilter: 'blur(2px)',
              }}>
                ⚡ 连击
              </span>
            )}

            {card.archetype === 'wealth' && (
              <span style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                color: '#fbbf24',
                backgroundColor: 'rgba(217, 119, 6, 0.65)',
                padding: '1px 4px',
                fontWeight: 700,
                borderRadius: 2,
                backdropFilter: 'blur(2px)',
              }}>
                👑 财宝
              </span>
            )}

            {card.archetype === 'fury' && (
              <span style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                color: '#fca5a5',
                backgroundColor: 'rgba(225, 29, 72, 0.65)',
                padding: '1px 4px',
                fontWeight: 700,
                borderRadius: 2,
                backdropFilter: 'blur(2px)',
              }}>
                🚩 绝境
              </span>
            )}

            {/* Tier badge */}
            <span style={{
              position: 'absolute',
              bottom: 2,
              right: 4,
              fontSize: '8px',
              fontFamily: 'var(--font-pixel)',
              color: '#cbd5e1',
              textTransform: 'uppercase',
              fontWeight: 700,
              backgroundColor: 'rgba(0,0,0,0.75)',
              padding: '1px 4px',
              borderRadius: 2,
            }}>
              {card.tier}
            </span>
          </div>

          {/* Card Rules Text / Effect */}
          <div style={{
            margin: '4px 0',
            fontSize: '10px',
            lineHeight: '13.5px',
            color: '#e2e8f0',
            minHeight: 46,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            borderRadius: 4,
            padding: '4px 6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {damage !== undefined && (
              <div>
                造成 <strong style={{ color: '#f87171' }}>{damage}</strong> 点伤害
                {hits && hits > 1 ? ` × ${hits} 次` : ''}。
              </div>
            )}
            {card.bodySlam && (
              <div style={{ color: '#67e8f9', fontWeight: 600 }}>
                造成等同于当前护甲值的伤害！
              </div>
            )}
            {card.pierceBlock && (
              <div style={{ color: '#f59e0b', fontWeight: 600 }}>
                ⚡ 穿透破甲：直接削减生命！
              </div>
            )}
            {card.goldScaling && (
              <div style={{ color: '#fbbf24', fontWeight: 600 }}>
                👑 黄金律：每 50 金币额外多发 1 段打击！
              </div>
            )}
            {card.bloodForBlood && (
              <div style={{ color: '#f43f5e', fontWeight: 600 }}>
                🩸 绝境：自身生命 ≤ 50% 时伤害翻倍！
              </div>
            )}
            {card.finisher && (
              <div style={{ color: '#facc15', fontWeight: 600 }}>
                💎 终结技：本回合每出 1 张牌 +{card.finisherBonus || 4} 伤害！
              </div>
            )}
            {card.reverberateOnCritical && (
              <div style={{ color: '#60a5fa', fontWeight: 600 }}>
                ⚡ 咏唱暴击时追加 1 段全额剑气！
              </div>
            )}
            {card.vulnerableMultiplier && (
              <div style={{ color: '#f87171', fontWeight: 600 }}>
                对易伤目标造成 {card.vulnerableMultiplier} 倍极效毁天伤害！
              </div>
            )}
            {block !== undefined && (
              <div>
                获得 <strong style={{ color: '#38bdf8' }}>{block}</strong> 点格挡。
              </div>
            )}
            {card.reflectionDamage && (
              <div style={{ color: '#818cf8', fontWeight: 600 }}>
                🛡️ 反震：同时对敌造成等量反弹伤害！
              </div>
            )}
            {card.retainCard && (
              <div style={{ color: '#93c5fd', fontStyle: 'italic' }}>
                保留：回合结束不弃牌。
              </div>
            )}
            {card.vulnerable && (
              <div>
                施加 <strong style={{ color: '#fb923c' }}>{card.vulnerable}</strong> 层易伤。
              </div>
            )}
            {card.weak && (
              <div>
                施加 <strong style={{ color: '#a78bfa' }}>{card.weak}</strong> 层虚弱。
              </div>
            )}
            {card.drawCards && (
              <div>
                抽 <strong style={{ color: '#34d399' }}>{card.drawCards}</strong> 张牌。
              </div>
            )}
            {card.gainEnergy && (
              <div>
                获得 <strong style={{ color: '#fde047' }}>{card.gainEnergy}</strong> 点能量。
              </div>
            )}
            {card.goldGain && (
              <div style={{ color: '#fbbf24' }}>
                获得 <strong style={{ color: '#fde047' }}>+{card.goldGain}</strong> 金币。
              </div>
            )}
            {card.hpCost && (
              <div style={{ color: '#f43f5e' }}>
                消耗自身 <strong style={{ color: '#fda4af' }}>{card.hpCost}</strong> 点生命。
              </div>
            )}
            {card.poison && (
              <div>
                {card.id.includes('catalyst') || card.catalyst ? (
                  <span style={{ color: '#4ade80' }}>使目标身上的中毒层数<strong>翻倍</strong>！</span>
                ) : (
                  <span>施加 <strong style={{ color: '#4ade80' }}>{card.poison}</strong> 层中毒。</span>
                )}
              </div>
            )}
            {card.strength && (
              <div>
                获得 <strong style={{ color: '#f87171' }}>{card.strength}</strong> 点力量。
              </div>
            )}
            {card.cardDrawOnAttack && (
              <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                能力：每打出攻击牌抽 1 张牌！
              </div>
            )}
            {card.heal && (
              <div>
                回复 <strong style={{ color: '#4ade80' }}>{card.heal}</strong> 点生命。
              </div>
            )}
            {card.exhaust && (
              <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>消耗。</div>
            )}
          </div>

          {/* Vocabulary Meaning Box */}
          {showMeaning && (
            <div style={{
              borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
              paddingTop: 3,
              fontSize: '10px',
              color: '#fef08a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              fontWeight: 600,
            }} title={card.meaning}>
              {card.meaning}
            </div>
          )}
        </>
      )}
    </div>
  );
};
