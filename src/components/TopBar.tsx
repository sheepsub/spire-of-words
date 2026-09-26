import React from 'react';
import type { Player, Relic } from '../types/game';
import { PixelIcon } from './PixelIcon';
import { sound } from '../utils/audio';

interface TopBarProps {
  player: Player;
  currentFloor: number;
  floorType: string;
  onOpenDeck: () => void;
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
  onOpenMap,
  onReturnToMenu,
  soundEnabled,
  onToggleSound,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

  return (
    <div 
      className="safe-all spire-top-bar"
      style={{
        width: '100%',
        height: 'var(--top-bar-height, 52px)',
        backgroundImage: 'url(/sts2/ui/top_bar.png)',
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        backgroundColor: '#0c0e15',
        borderBottom: '2px solid #000',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.9), inset 0 -1px 0 rgba(197, 160, 89, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 max(12px, env(safe-area-inset-right)) 0 max(12px, env(safe-area-inset-left))',
        zIndex: 100,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        position: 'relative',
      }}
    >
      {/* LEFT SECTION: Character Portrait, HP, Block, Gold, Floor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Character Avatar Backdrop */}
        {player.characterAvatar && (
          <div 
            title={player.characterName || '当前英雄'}
            style={{
              width: 38,
              height: 38,
              backgroundImage: 'url(/sts2/ui/top_bar_char_backdrop.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <img 
              src={player.characterAvatar} 
              alt={player.characterName || 'Hero'}
              style={{
                width: 28,
                height: 28,
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
          </div>
        )}

        {/* Health Bar (STS Authentic Heart & Crimson Gauge) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <img 
            src="/sts2/ui/top_bar_heart.png" 
            alt="HP" 
            style={{ width: 26, height: 22, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} 
          />
          <div style={{
            position: 'relative',
            width: 105,
            height: 16,
            backgroundColor: 'rgba(30, 8, 8, 0.9)',
            border: '2px solid #000',
            boxShadow: '0 0 0 1px #78350f, inset 0 2px 4px rgba(0,0,0,0.8)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${hpPercent}%`,
              height: '100%',
              background: 'linear-gradient(180deg, #f87171 0%, #dc2626 40%, #991b1b 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
              transition: 'width 0.3s ease',
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 800,
              color: '#fff',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px #000',
              letterSpacing: '0.5px',
            }}>
              {player.hp} / {player.maxHp}
            </div>
          </div>
        </div>

        {/* Block Badge (if > 0) */}
        {player.block > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: '#38bdf8',
            fontFamily: 'var(--font-serif)',
            fontWeight: 800,
            fontSize: '12px',
            backgroundColor: 'rgba(12, 35, 60, 0.9)',
            padding: '2px 6px',
            border: '1.5px solid #0284c7',
            borderRadius: 4,
            boxShadow: '0 0 6px rgba(56, 189, 248, 0.4)',
          }}>
            <PixelIcon name="shield" size={12} color="#38bdf8" />
            <span>{player.block}</span>
          </div>
        )}

        {/* Gold (STS Authentic Coin Pouch with Currency Wars Interest) */}
        <div 
          title={`当前持有金币: ${player.gold} G\n📈 货币战争理财分红: 战斗胜利时将额外获取 +${Math.min(5, Math.floor(player.gold / 10))} G (储蓄理财，每 10 G +1 利息，上限 +5)`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            color: '#fde047',
            fontFamily: 'var(--font-serif)',
            fontWeight: 800,
            fontSize: '13px',
            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(250, 204, 21, 0.4)',
            flexShrink: 0,
            cursor: 'help',
          }}
        >
          <img 
            src="/sts2/ui/top_bar_gold.png" 
            alt="Gold" 
            style={{ width: 24, height: 22, objectFit: 'contain' }} 
          />
          <span>{player.gold}</span>
          <span style={{
            fontSize: '9px',
            color: '#fef08a',
            backgroundColor: 'rgba(234, 179, 8, 0.25)',
            border: '1px solid rgba(234, 179, 8, 0.5)',
            borderRadius: 3,
            padding: '1px 3px',
            fontFamily: 'var(--font-pixel)',
            marginLeft: 2,
          }}>
            +{Math.min(5, Math.floor(player.gold / 10))}息
          </span>
        </div>

        {/* Floor Indicator (STS Authentic Spire Icon) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(197, 160, 89, 0.35)',
          borderRadius: 4,
          flexShrink: 0,
        }}>
          <img 
            src="/sts2/ui/top_bar_floor.png" 
            alt="Floor" 
            style={{ width: 20, height: 20, objectFit: 'contain' }} 
          />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#e2e8f0',
            textShadow: '0 1px 2px #000',
          }}>
            第 {currentFloor} 层 · {floorType}
          </span>
        </div>

        {/* COMPANION SQUAD BAR (自走棋出战英灵) */}
        {player.companions && player.companions.length > 0 && (
          <div 
            title={`出战随从队伍 (${player.companions.length}/${player.maxCompanions || 3})\n随从在战斗中将与你协同作战并释放宝具！`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid #334155',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-pixel)' }}>队伍:</span>
            {player.companions.map((comp) => (
              <div
                key={comp.instanceId}
                title={`${comp.name} (Lv.${comp.level})\n【羁绊】${comp.synergyName}\n【协同】${comp.triggerDesc}\n【大招】${comp.ultimateName}`}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 3,
                  border: `1.5px solid ${comp.synergyColor}`,
                  overflow: 'hidden',
                  backgroundColor: '#0a0d16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'help',
                }}
              >
                <img src={comp.avatar} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CENTER: Relics Inventory Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        overflowX: 'auto',
        maxWidth: '360px',
        padding: '0 8px',
        flexShrink: 1,
      }}>
        {player.relics.map((relic: Relic) => (
          <div
            key={relic.id}
            title={`${relic.name}\n${relic.desc}`}
            style={{
              width: 30,
              height: 30,
              borderRadius: 4,
              backgroundColor: 'rgba(25, 20, 15, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.5)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              cursor: 'help',
              flexShrink: 0,
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.15)';
              e.currentTarget.style.borderColor = '#fbbf24';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(197, 160, 89, 0.5)';
            }}
          >
            {relic.icon}
          </div>
        ))}
      </div>

      {/* RIGHT SECTION: Navigation & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Settings / Main Menu */}
        {onReturnToMenu && (
          <button
            onClick={() => { sound.playSelect(); onReturnToMenu(); }}
            title="返回主菜单"
            className="spire-btn"
            style={{
              height: 32,
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(25, 20, 15, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.5)',
              borderRadius: 4,
              color: '#e2e8f0',
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <img src="/sts2/ui/top_bar_settings.png" alt="Settings" style={{ width: 16, height: 16, objectFit: 'contain' }} />
            <span>主菜单</span>
          </button>
        )}

        {/* Map Button (STS Authentic Map Icon) */}
        {onOpenMap && (
          <button
            onClick={() => { sound.playSelect(); onOpenMap(); }}
            title="查看尖塔地图"
            className="spire-btn"
            style={{
              height: 32,
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(25, 20, 15, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.65)',
              borderRadius: 4,
              color: '#facc15',
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <img src="/sts2/ui/top_bar_map.png" alt="Map" style={{ width: 16, height: 16, objectFit: 'contain' }} />
            <span>地图</span>
          </button>
        )}

        {/* Deck Button (STS Authentic Deck Icon with count) */}
        <button
          onClick={() => { sound.playSelect(); onOpenDeck(); }}
          title={`查看卡组 (${player.deck.length} 张)`}
          className="spire-btn"
          style={{
            height: 32,
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(25, 20, 15, 0.85)',
            border: '1px solid rgba(197, 160, 89, 0.65)',
            borderRadius: 4,
            color: '#fde047',
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <img src="/sts2/ui/top_bar_deck.png" alt="Deck" style={{ width: 16, height: 16, objectFit: 'contain' }} />
          <span>卡组 ({player.deck.length})</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? '静音' : '开启音效'}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: soundEnabled ? '#f8fafc' : '#64748b',
            borderRadius: 4,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {soundEnabled ? <PixelIcon name="volume-2" size={15} /> : <PixelIcon name="volume-x" size={15} />}
        </button>
      </div>
    </div>
  );
};
