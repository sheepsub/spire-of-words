import React from 'react';
import type { Player, Relic } from '../types/game';
import { Heart, Shield, Coins, BookOpen, Layers, Volume2, VolumeX, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

interface TopBarProps {
  player: Player;
  currentFloor: number;
  floorType: string;
  onOpenDeck: () => void;
  onOpenLexicon: () => void;
  onOpenMap?: () => void;
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
  soundEnabled,
  onToggleSound,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'rgba(10, 11, 16, 0.95)',
      borderBottom: '1px solid rgba(197, 160, 89, 0.3)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
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
          fontFamily: 'var(--font-serif)',
          fontSize: '13px',
          fontWeight: 700,
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: 6,
          border: '1px solid rgba(251, 191, 36, 0.25)',
        }}>
          <Compass size={14} />
          <span>第 {currentFloor} 层 · {floorType}</span>
        </div>

        {/* Health Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Heart size={16} color="#ef4444" fill="#ef4444" />
          <div style={{
            position: 'relative',
            width: 100,
            height: 16,
            backgroundColor: '#331111',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid #7f1d1d',
          }}>
            <div style={{
              width: `${hpPercent}%`,
              height: '100%',
              backgroundColor: '#ef4444',
              transition: 'width 0.3s ease',
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
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
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '13px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            padding: '2px 6px',
            borderRadius: 6,
            border: '1px solid #38bdf8',
          }}>
            <Shield size={14} fill="#38bdf8" />
            <span>{player.block}</span>
          </div>
        )}

        {/* Gold */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#fbbf24',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '13px',
        }}>
          <Coins size={15} />
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
