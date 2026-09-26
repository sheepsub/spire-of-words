import React from 'react';
import type { Card } from '../types/game';
import { PixelIcon } from './PixelIcon';
import { CardIllustration } from './CardIllustrations';
import { getCardArtwork } from '../assets/cards';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onDragStart?: (card: Card) => void;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  compact = false,
  onDragStart,
}) => {
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
          <PixelIcon name="sparkles" size={9} />+1
        </div>
      )}

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
              maxWidth: '126px',
              letterSpacing: '0.2px',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            }} 
            title={card.name}
          >
            {card.name}
          </div>

        </div>

        {/* Card Artwork Area: Official High-Definition Illustration */}
        <div 
          className="card-artwork-container"
          style={{
            flex: 1,
            minHeight: 'var(--card-art-min-height, 56px)',
            borderRadius: 3,
            backgroundColor: '#05070d',
            border: card.enchantment ? '1.5px solid #eab308' : card.affliction ? '1.5px solid #ef4444' : '1.5px solid rgba(0, 0, 0, 0.85)',
          boxShadow: card.enchantment ? '0 0 10px rgba(234, 179, 8, 0.35)' : 'inset 0 0 10px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {card.sts2Art ? (
            <img
              src={`/sts2/cards/${card.sts2Art}`}
              alt={card.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
              }}
            />
          ) : getCardArtwork(card.illustrationKey || card.id) ? (
            <img
              src={getCardArtwork(card.illustrationKey || card.id)}
              alt={card.name}
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
            />
          )}

          {/* STS2 Enchantment Seal */}
          {card.enchantment && (
            <div style={{
              position: 'absolute',
              top: 2,
              left: 2,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid #eab308',
              boxShadow: '0 0 6px rgba(234, 179, 8, 0.8)',
              padding: '1px 5px',
              borderRadius: 2,
              fontSize: '8.5px',
              fontFamily: 'var(--font-pixel)',
              color: '#fde047',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              zIndex: 5,
            }}>
              ✨ {card.enchantmentTitle || '附魔'}
            </div>
          )}

          {/* STS2 Affliction Seal */}
          {card.affliction && (
            <div style={{
              position: 'absolute',
              bottom: 2,
              left: 2,
              backgroundColor: 'rgba(69, 10, 10, 0.92)',
              border: '1px solid #ef4444',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)',
              padding: '1px 5px',
              borderRadius: 2,
              fontSize: '8.5px',
              fontFamily: 'var(--font-pixel)',
              color: '#fca5a5',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              zIndex: 5,
            }}>
              ⛓️ {card.afflictionTitle || '苦痛'}
            </div>
          )}

          {/* Archetype tag overlay */}

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

        </div>

        {/* Card Rules Text / Effect */}
        <div 
          className="card-rules-container"
          style={{
            margin: '4px 0',
            fontSize: '10px',
            lineHeight: '13.5px',
            color: '#e2e8f0',
            minHeight: 'var(--card-rules-min-height, 46px)',
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
          {/* STS2 附魔效果说明 */}
          {card.enchantmentDesc && (
            <div style={{ color: '#fde047', fontWeight: 600, fontSize: '9px', marginTop: 2 }}>
              ✨ 附魔【{card.enchantmentTitle}】：{card.enchantmentDesc}
            </div>
          )}
          {/* STS2 苦痛效果说明 */}
          {card.afflictionDesc && (
            <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '9px', marginTop: 2 }}>
              ⛓️ 苦痛【{card.afflictionTitle}】：{card.afflictionDesc}
            </div>
          )}
        </div>

    </div>
  );
};
