import React from 'react';
import type { Player, Relic } from '../types/game';
import { Heart, Shield, Coins, BookOpen, Layers, Volume2, VolumeX, Compass, Home } from 'lucide-react';
import { sound } from '../utils/audio';

interface TopBarProps {
  player: Player;
  currentFloor: number;
  floorType: string;
  onOpenDeck: () => void;
  onOpenLexicon: () => void;
  onOpenMap?: () => void;
  onReturnToMenu?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  player,
  currentFloor,
  floorType,
  onOpenDeck,
  onOpenLexicon,
  onOpenMap,
  onReturnToMenu,
  soundEnabled,
  onToggleSound,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'rgba(8, 9, 14, 0.96)',
      borderBottom: '2px solid #000',
      boxShadow: '0 4px 0 0 #000, 0 8px 20px rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      zIndex: 100,
      flexWrap: 'wrap',
      gap: 8,
    }} className="safe-top">
      {/* Left: Player HP & Shield & Floor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Floor indicator */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '2px solid #000',
          boxShadow: '0 -2px 0 0 #000, 0 2px 0 0 #000, -2px 0 0 0 #000, 2px 0 0 0 #000',
        }}>
          <Compass size={13} />
          <span>第 {currentFloor} 层 · {floorType}</span>
        </div>

        {/* Health Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Heart size={16} color="#ef4444" fill="#ef4444" />
          <div className="pixel-hp-bar-bg" style={{
            position: 'relative',
            width: 110,
            height: 16,
          }}>
            <div className="pixel-hp-fill" style={{
              width: `${hpPercent}%`,
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontFamily: 'var(--font-pixel-num)',
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>
              {player.hp}/{player.maxHp}
            </div>
          </div>
        </div>

        {/* Current Block if > 0 */}
        {player.block > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            color: '#38bdf8',
            fontFamily: 'var(--font-pixel-num)',
            fontWeight: 700,
            fontSize: '11px',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            padding: '2px 6px',
            border: '2px solid #000',
            boxShadow: '0 -1px 0 0 #000, 0 1px 0 0 #000, -1px 0 0 0 #000, 1px 0 0 0 #000',
          }}>
            <Shield size={13} fill="#38bdf8" />
            <span>{player.block}</span>
          </div>
        )}

        {/* Gold */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#fbbf24',
          fontFamily: 'var(--font-pixel-num)',
          fontWeight: 700,
          fontSize: '11px',
        }}>
          <Coins size={14} />
          <span>{player.gold}</span>
        </div>
      </div>

      {/* Center: Relics Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        maxWidth: '350px',
        padding: '2px 0',
      }}>
        {player.relics.map((relic: Relic) => (
          <div
            key={relic.id}
            title={`${relic.name}\n${relic.desc}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              cursor: 'help',
              flexShrink: 0,
            }}
          >
            {relic.icon}
          </div>
        ))}
      </div>

      {/* Right: Quick Navigation & Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {onReturnToMenu && (
          <button
            onClick={() => { sound.playSelect(); onReturnToMenu(); }}
            title="返回主菜单"
            className="spire-btn"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <Home size={14} />
            <span>主菜单</span>
          </button>
        )}

        {onOpenMap && (
          <button
            onClick={() => { sound.playSelect(); onOpenMap(); }}
            title="查看地图"
            className="spire-btn"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <Compass size={14} />
            <span>地图</span>
          </button>
        )}

        <button
          onClick={() => { sound.playSelect(); onOpenLexicon(); }}
          title="词汇图鉴与生词本"
          className="spire-btn"
          style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#38bdf8', color: '#bae6fd' }}
        >
          <BookOpen size={14} />
          <span>生词本</span>
        </button>

        <button
          onClick={() => { sound.playSelect(); onOpenDeck(); }}
          title="查看卡组"
          className="spire-btn"
          style={{ padding: '6px 10px', fontSize: '12px' }}
        >
          <Layers size={14} />
          <span>卡组 ({player.deck.length})</span>
        </button>

        <button
          onClick={onToggleSound}
          title={soundEnabled ? '静音' : '开启音效'}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: soundEnabled ? '#f8fafc' : '#64748b',
            borderRadius: 6,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </div>
  );
};
