import React from 'react';
import type { Card } from '../types/game';
import type { EffectCard } from '../types/autoChess';
import { PixelIcon } from './PixelIcon';
import { CardView } from './CardView';
import { EffectCardItem } from './EffectCardItem';

interface DeckModalProps {
  cards: Card[];
  effectCards?: EffectCard[];
  title?: string;
  onClose: () => void;
}

export const DeckModal: React.FC<DeckModalProps> = ({
  cards,
  effectCards = [],
  title = '我的战术锦囊 (Tactical Deck)',
  onClose,
}) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 6, 12, 0.94)',
      backdropFilter: 'blur(10px)',
      zIndex: 220,
      display: 'flex',
      flexDirection: 'column',
      padding: 'max(10px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-gold)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PixelIcon name="zap" size={22} color="#fbbf24" />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fbbf24', fontSize: '20px' }}>
            {title} ({effectCards.length > 0 ? `${effectCards.length} 张万象效果牌` : `${cards.length} 张卡牌`})
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <PixelIcon name="close" size={26} />
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'center',
        paddingBottom: 20,
      }}>
        {effectCards.length > 0 ? (
          effectCards.map((c, i) => (
            <div key={`${c.id}_${i}`} style={{ transform: 'scale(0.95)' }}>
              <EffectCardItem card={c} />
            </div>
          ))
        ) : cards.length > 0 ? (
          cards.map((c) => (
            <div key={c.id}>
              <CardView card={c} />
            </div>
          ))
        ) : (
          <div style={{ color: '#64748b', fontSize: '15px', marginTop: 40 }}>
            当前锦囊内暂无效果牌
          </div>
        )}
      </div>
    </div>
  );
};
