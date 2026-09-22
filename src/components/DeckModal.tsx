import React from 'react';
import type { Card } from '../types/game';
import { CardView } from './CardView';
import { X, Layers } from 'lucide-react';

interface DeckModalProps {
  cards: Card[];
  title?: string;
  onClose: () => void;
}

export const DeckModal: React.FC<DeckModalProps> = ({
  cards,
  title = '我的战斗卡组 (Current Deck)',
  onClose,
}) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 6, 12, 0.92)',
      backdropFilter: 'blur(8px)',
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
          <Layers size={22} color="#fbbf24" />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fbbf24', fontSize: '20px' }}>
            {title} ({cards.length} 张牌)
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
          <X size={26} />
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
        paddingBottom: 20,
      }}>
        {cards.map((c) => (
          <div key={c.id}>
            <CardView card={c} showMeaning={true} />
          </div>
        ))}
      </div>
    </div>
  );
};
