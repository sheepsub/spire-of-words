import React from 'react';
import { Trophy, Skull, RotateCcw, BookOpen } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  floor: number;
  gold: number;
  deckCount: number;
  onRestart: () => void;
  onOpenLexicon: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  floor,
  gold,
  deckCount,
  onRestart,
  onOpenLexicon,
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
      padding: 'max(8px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
    }}>
      <div style={{
        backgroundColor: '#121422',
        border: isVictory ? '2px solid #eab308' : '2px solid #ef4444',
        borderRadius: 16,
        padding: '16px 24px',
        maxWidth: 480,
        width: '100%',
        maxHeight: '94vh',
        overflowY: 'auto',
        textAlign: 'center',
        boxShadow: isVictory 
          ? '0 10px 40px rgba(234, 179, 8, 0.3)' 
          : '0 10px 40px rgba(239, 68, 68, 0.3)',
      }}>
        <div style={{ marginBottom: 16 }}>
          {isVictory ? (
            <Trophy size={64} color="#eab308" />
          ) : (
            <Skull size={64} color="#ef4444" />
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          fontWeight: 900,
          color: isVictory ? '#facc15' : '#f87171',
          marginBottom: 10,
        }}>
          {isVictory ? '征服尖塔！(Spire Conquered)' : '折戟沉沙 (Defeated)'}
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: 24 }}>
          {isVictory 
            ? '恭喜你凭借博大精深的词汇储备与过人胆魄，击破了尖塔深处的终极领主！'
            : '尖塔的险阻让你暂时倒下，但所学到的词汇已化为不灭的学识积淀。'}
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
          <div>牌组总计：<strong style={{ color: '#38bdf8' }}>{deckCount} 张词汇</strong></div>
          <div>学习记录：<strong style={{ color: '#4ade80' }}>已自动同步</strong></div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onOpenLexicon}
            className="spire-btn"
            style={{ padding: '10px 18px', borderColor: '#38bdf8', color: '#bae6fd' }}
          >
            <BookOpen size={16} /> 查看生词本
          </button>

          <button
            onClick={onRestart}
            className="spire-btn"
            style={{
              padding: '10px 22px',
              backgroundColor: isVictory ? '#854d0e' : '#7f1d1d',
              borderColor: isVictory ? '#facc15' : '#ef4444',
            }}
          >
            <RotateCcw size={16} /> 重新爬塔
          </button>
        </div>
      </div>
    </div>
  );
};
