import React from 'react';
import { PixelIcon } from './PixelIcon';

interface GameOverModalProps {
  isVictory: boolean;
  floor: number;
  gold: number;
  deckCount: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  floor,
  gold,
  deckCount,
  onRestart,
}) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 6, 12, 0.94)',
      backdropFilter: 'blur(10px)',
      zIndex: 250,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'max(10px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
    }}>
      <div style={{
        backgroundColor: '#12141f',
        border: `2px solid ${isVictory ? '#fbbf24' : '#ef4444'}`,
        borderRadius: 16,
        padding: '32px 36px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        boxShadow: `0 10px 40px rgba(0,0,0,0.9), 0 0 30px ${isVictory ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
      }}>
        <div style={{ marginBottom: 16, display: 'inline-flex' }}>
          {isVictory ? (
            <PixelIcon name="trophy" size={64} color="#eab308" />
          ) : (
            <PixelIcon name="skull" size={64} color="#ef4444" />
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '26px',
          fontWeight: 900,
          color: isVictory ? '#facc15' : '#f87171',
          marginBottom: 10,
        }}>
          {isVictory ? '全线大捷！征服尖塔！' : '军阵溃败 (Defeated)'}
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: 24 }}>
          {isVictory 
            ? '恭喜你率领麾下英雄棋子阵营攻克了尖塔诸敌，登顶万象之巅！'
            : '统帅生命耗尽，尖塔的深渊再次将你吞噬... 重新整军再战吧！'}
        </p>

        {/* Stats */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 8,
          padding: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 28,
          textAlign: 'left',
          fontSize: '13px',
        }}>
          <div>攀登层数：<strong style={{ color: '#fbbf24' }}>第 {floor} 层</strong></div>
          <div>累计金币：<strong style={{ color: '#fbbf24' }}>{gold} G</strong></div>
          <div style={{ gridColumn: 'span 2' }}>战术锦囊：<strong style={{ color: '#38bdf8' }}>{deckCount} 张效果牌</strong></div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onRestart}
            className="spire-btn"
            style={{
              padding: '12px 32px',
              backgroundColor: isVictory ? '#854d0e' : '#7f1d1d',
              borderColor: isVictory ? '#facc15' : '#ef4444',
              fontSize: '15px',
              fontWeight: 800,
            }}
          >
            <PixelIcon name="undo" size={18} /> 重新出征
          </button>
        </div>
      </div>
    </div>
  );
};
