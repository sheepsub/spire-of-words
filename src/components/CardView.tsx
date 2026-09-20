import React from 'react';
import type { Card } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, Sparkles, Sword, Shield, Zap } from 'lucide-react';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  showMeaning?: boolean; // In battle, defaults to hidden until hovered/tapped, or always visible based on settings
  compact?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  showMeaning = true,
  compact = false,
}) => {
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.speakWord(card.word);
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
      className={`card-frame ${cardClass} ${selected ? 'selected ring-2 ring-yellow-400' : ''} ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
      style={{
        transform: compact ? 'scale(0.85)' : undefined,
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
          padding: '2px 6px',
          borderRadius: 10,
          fontSize: 10,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
        }}>
          <Sparkles size={11} /> +1
        </div>
      )}

      {/* Card Header: English Word & Pronounce Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 2,
        paddingLeft: 22, // space for energy orb
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 900,
          fontSize: card.word.length > 9 ? '13px' : '15px',
          color: card.isUpgraded ? '#86efac' : '#f8fafc',
          textTransform: 'capitalize',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100px',
        }}>
          {card.word}
        </div>
        <button
          onClick={handlePronounce}
          title="发音"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#cbd5e1',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Volume2 size={13} />
        </button>
      </div>

      {/* Phonetic & POS */}
      <div style={{
        fontSize: '11px',
        color: '#94a3b8',
        fontFamily: 'var(--font-mono)',
        marginBottom: 6,
        paddingLeft: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{card.pos}</span>
        <span>{card.phonetic}</span>
      </div>

      {/* Card Artwork / Icon Area */}
      <div style={{
        flex: 1,
        minHeight: 52,
        borderRadius: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '4px',
      }}>
        {card.type === 'attack' && <Sword size={32} color="#f87171" style={{ opacity: 0.85 }} />}
        {card.type === 'skill' && <Shield size={32} color="#60a5fa" style={{ opacity: 0.85 }} />}
        {card.type === 'power' && <Zap size={32} color="#fbbf24" style={{ opacity: 0.85 }} />}
        
        {/* Tier badge */}
        <span style={{
          position: 'absolute',
          bottom: 2,
          right: 4,
          fontSize: '9px',
          color: '#64748b',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          {card.tier}
        </span>
      </div>

      {/* Card Rules Text / Effect */}
      <div style={{
        margin: '6px 0',
        fontSize: '11px',
        lineHeight: '15px',
        color: '#e2e8f0',
        minHeight: 46,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
        {block !== undefined && (
          <div>
            获得 <strong style={{ color: '#38bdf8' }}>{block}</strong> 点格挡。
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
        {card.poison && (
          <div>
            施加 <strong style={{ color: '#4ade80' }}>{card.poison}</strong> 层中毒。
          </div>
        )}
        {card.strength && (
          <div>
            获得 <strong style={{ color: '#f87171' }}>{card.strength}</strong> 点力量。
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
          paddingTop: 4,
          fontSize: '10.5px',
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
    </div>
  );
};
