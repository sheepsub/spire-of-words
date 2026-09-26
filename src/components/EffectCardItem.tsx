import React from 'react';
import type { EffectCard } from '../types/autoChess';
import { PixelIcon } from './PixelIcon';

interface EffectCardItemProps {
  card: EffectCard;
  onClick?: () => void;
  disabled?: boolean;
  isCompact?: boolean;
  isSelected?: boolean;
}

export const EffectCardItem: React.FC<EffectCardItemProps> = ({
  card,
  onClick,
  disabled = false,
  isCompact = false,
  isSelected = false,
}) => {
  const getCategoryLabel = () => {
    switch (card.category) {
      case 'assault': return '天灾打击';
      case 'aegis': return '坚壁守护';
      case 'tactic': return '军阵神策';
      case 'growth': return '经济整军';
      case 'ultimate': return '传世终绝';
      default: return '万象战术';
    }
  };

  if (isCompact) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="effect-card-compact"
        style={{
          background: card.bgGradient,
          borderColor: isSelected ? '#facc15' : 'rgba(255, 255, 255, 0.22)',
          boxShadow: isSelected 
            ? `0 0 24px ${card.glowColor}, 0 0 10px #facc15` 
            : `0 6px 16px rgba(0,0,0,0.6)`,
          transform: isSelected ? 'translateY(-6px) scale(1.05)' : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Cost orb */}
        <div 
          style={{
            position: 'absolute',
            top: -7,
            right: -7,
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: card.color,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-pixel-num)',
            fontSize: 11,
            fontWeight: 900,
            border: '2px solid #0f172a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
            zIndex: 10,
          }}
        >
          {card.cost > 0 ? `${card.cost}⚡` : '瞬'}
        </div>

        {/* Top bar: Category & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>{card.icon}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 900,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.5px',
            }}>
              {card.name}
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.75)',
              textTransform: 'uppercase',
            }}>
              {getCategoryLabel()}
            </div>
          </div>
        </div>

        {/* Center: Tactical Effect Summary */}
        <div style={{
          fontSize: 10.5,
          color: 'rgba(255, 255, 255, 0.95)',
          lineHeight: 1.3,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          borderRadius: 6,
          padding: '6px 7px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          flex: 1,
          margin: '4px 0',
          display: 'flex',
          alignItems: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          {card.desc}
        </div>

        {/* Bottom: Instant Cast action tip */}
        <div style={{
          fontSize: 9.5,
          color: '#fde047',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          paddingTop: 4,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <PixelIcon name="zap" size={11} color="#facc15" />
            <span>即刻释放</span>
          </span>
          <span style={{ fontSize: 8.5, color: 'rgba(255, 255, 255, 0.6)' }}>万象奥义</span>
        </div>
      </button>
    );
  }

  // Full size card (In Reward / Shop / Deck Inspection)
  return (
    <div
      onClick={onClick}
      style={{
        background: card.bgGradient,
        boxShadow: isSelected 
          ? `0 0 30px ${card.glowColor}, 0 0 16px #facc15` 
          : `0 8px 24px rgba(0,0,0,0.65), inset 0 0 20px ${card.glowColor}`,
        width: 230,
        minWidth: 230,
        height: 310,
        borderRadius: 16,
        border: `2px solid ${isSelected ? '#facc15' : 'rgba(255, 255, 255, 0.2)'}`,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)',
        transform: isSelected ? 'scale(1.04) translateY(-4px)' : undefined,
        boxSizing: 'border-box',
        userSelect: 'none',
        textAlign: 'left',
      }}
    >
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>{card.icon}</span>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 900,
              color: '#ffffff',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.5px',
            }}>
              {card.name}
            </div>
            <div style={{ fontSize: 10, color: '#fde047', fontWeight: 600 }}>
              {getCategoryLabel()}
            </div>
          </div>
        </div>
        <div 
          style={{
            padding: '3px 8px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 900,
            color: '#ffffff',
            backgroundColor: card.color,
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {card.cost > 0 ? `${card.cost} 能量` : '瞬发'}
        </div>
      </div>

      {/* Main Tactical Effect Body */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.52)',
        backdropFilter: 'blur(8px)',
        borderRadius: 10,
        padding: '10px 12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        margin: '8px 0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#cbd5e1',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <PixelIcon name="sparkles" size={12} color="#facc15" />
          <span>战术效果:</span>
        </div>
        <div style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.95)',
          lineHeight: 1.4,
          fontWeight: 500,
        }}>
          {card.desc}
        </div>
      </div>

      {/* Upgraded Power / Mastery Effect */}
      {card.empoweredDesc && (
        <div style={{
          backgroundColor: 'rgba(69, 26, 3, 0.45)',
          borderRadius: 8,
          padding: '8px 10px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 900,
            color: '#facc15',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 2,
          }}>
            <PixelIcon name="zap" size={11} color="#facc15" />
            <span>进阶威能:</span>
          </div>
          <div style={{
            fontSize: 11,
            color: '#fef3c7',
            lineHeight: 1.35,
            fontWeight: 500,
          }}>
            {card.empoweredDesc}
          </div>
        </div>
      )}
    </div>
  );
};
