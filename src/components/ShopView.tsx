import React, { useState } from 'react';
import type { Card, Player, Relic } from '../types/game';
import { PixelIcon } from './PixelIcon';
import { CardView } from './CardView';
import { ALL_RELICS } from '../data/relics';
import { VOCABULARY_CARDS } from '../data/vocabulary';
import {
  ALL_COMPANION_CONFIGS,
  createCompanionInstance,
  type SpireCompanionConfig,
  type SpireCompanionInstance,
} from '../data/spireCompanions';
import { sound } from '../utils/audio';

interface ShopViewProps {
  player: Player;
  onBuyCard: (card: Card, cost: number) => void;
  onBuyRelic: (relic: Relic, cost: number) => void;
  onRemoveCard: (cardId: string, cost: number) => void;
  onRecruitCompanion?: (companion: SpireCompanionInstance, cost: number) => void;
  onUpgradeCompanion?: (companionInstanceId: string, cost: number) => void;
  onLeave: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  player,
  onBuyCard,
  onBuyRelic,
  onRemoveCard,
  onRecruitCompanion,
  onUpgradeCompanion,
  onLeave,
}) => {
  // Mercenary recruitment inventory (Spire Party integration)
  const [mercenaries, setMercenaries] = useState<Array<{ config: SpireCompanionConfig; cost: number; recruited: boolean }>>(() => {
    const currentIds = new Set(player.companions?.map(c => c.configId) || []);
    const available = ALL_COMPANION_CONFIGS.filter(c => !currentIds.has(c.id)).sort(() => Math.random() - 0.5);
    return available.slice(0, 2).map(c => ({
      config: c,
      cost: c.cost,
      recruited: false,
    }));
  });
  // Generate inventory on first mount for this character
  const [shopCards] = useState<Array<{ card: Card; price: number; bought: boolean }>>(() => {
    const charPool = player.characterId ? VOCABULARY_CARDS.filter(c => c.characterId === player.characterId) : [];
    const pool = (charPool.length >= 5 ? charPool : VOCABULARY_CARDS).sort(() => Math.random() - 0.5);
    const shuffled = pool.slice(0, 5);
    return shuffled.map((c, i) => ({
      card: { ...c, id: `shop_${c.id}_${Date.now()}_${i}` },
      price: c.rarity === 'rare' ? 120 : c.rarity === 'uncommon' ? 75 : 50,
      bought: false,
    }));
  });

  const [shopRelics] = useState<Array<{ relic: Relic; price: number; bought: boolean }>>(() => {
    const ownedIds = new Set(player.relics.map((r) => r.id));
    const available = ALL_RELICS.filter((r) => !ownedIds.has(r.id)).slice(0, 2);
    return available.map((r) => ({
      relic: r,
      price: r.rarity === 'rare' ? 220 : 160,
      bought: false,
    }));
  });

  const [cardRemovalCost] = useState(75);
  const [removalUsed, setRemovalUsed] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);

  const handleBuyCardItem = (index: number) => {
    const item = shopCards[index];
    if (item.bought || player.gold < item.price) return;
    sound.playGold();
    item.bought = true;
    onBuyCard(item.card, item.price);
  };

  const handleBuyRelicItem = (index: number) => {
    const item = shopRelics[index];
    if (item.bought || player.gold < item.price) return;
    sound.playGold();
    item.bought = true;
    onBuyRelic(item.relic, item.price);
  };

  const handleSelectCardToRemove = (cardId: string) => {
    if (removalUsed || player.gold < cardRemovalCost) return;
    sound.playGold();
    setRemovalUsed(true);
    setShowRemovalModal(false);
    onRemoveCard(cardId, cardRemovalCost);
  };

  const handleRecruit = (idx: number) => {
    const item = mercenaries[idx];
    if (item.recruited || player.gold < item.cost) return;
    if ((player.companions?.length || 0) >= (player.maxCompanions || 3)) {
      sound.playEnemyHit();
      return;
    }
    sound.playGold();
    sound.playBuff();
    setMercenaries(prev => prev.map((m, i) => i === idx ? { ...m, recruited: true } : m));
    const newComp = createCompanionInstance(item.config);
    onRecruitCompanion?.(newComp, item.cost);
  };

  const handleUpgradeComp = (comp: SpireCompanionInstance) => {
    const upgradeCost = comp.level === 1 ? 55 : 85;
    if (comp.level >= 3 || player.gold < upgradeCost) return;
    sound.playGold();
    sound.playCritical();
    onUpgradeCompanion?.(comp.instanceId, upgradeCost);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#0d0d14',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: 'max(8px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))',
      position: 'relative',
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '40px' }}>👳‍♂️</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fbbf24', fontSize: '22px' }}>
              地精古玩商贩 (The Merchant)
            </h2>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              “欢迎光临！瞧瞧这些强大的知识秘卷与无价奇珍，保你物超所值！”
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#fbbf24',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '18px',
          }}>
            <PixelIcon name="coins" size={20} />
            <span>{player.gold}</span>
          </div>

          <button
            onClick={() => { sound.playSelect(); onLeave(); }}
            className="spire-btn"
            style={{ padding: '8px 18px' }}
          >
            离开商店
          </button>
        </div>
      </div>

      {/* SECTION 1: CARDS FOR SALE */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          color: '#cbd5e1',
          fontSize: '16px',
          marginBottom: 12,
          borderBottom: '1px solid rgba(197, 160, 89, 0.2)',
          paddingBottom: 6,
        }}>
          战术卡牌 (Tactical Cards)
        </h3>

        <div style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 10,
        }}>
          {shopCards.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                opacity: item.bought ? 0.35 : 1,
              }}
            >
              <CardView card={item.card} />
              <button
                onClick={() => handleBuyCardItem(idx)}
                disabled={item.bought || player.gold < item.price}
                className="spire-btn"
                style={{
                  marginTop: 8,
                  padding: '6px 16px',
                  fontSize: '12px',
                  width: '100%',
                }}
              >
                {item.bought ? (
                  <>已售出 <PixelIcon name="check" size={14} /></>
                ) : (
                  <><PixelIcon name="coins" size={14} /> {item.price} G</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: RELICS & CARD REMOVAL */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* RELICS */}
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            color: '#cbd5e1',
            fontSize: '16px',
            marginBottom: 12,
            borderBottom: '1px solid rgba(197, 160, 89, 0.2)',
            paddingBottom: 6,
          }}>
            珍奇古物 (Ancient Relics)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {shopRelics.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: item.bought ? 0.35 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: '32px' }}>{item.relic.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '14px' }}>
                      {item.relic.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', maxWidth: 280 }}>
                      {item.relic.desc}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyRelicItem(idx)}
                  disabled={item.bought || player.gold < item.price}
                  className="spire-btn"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  {item.bought ? '已拥有' : <><PixelIcon name="coins" size={13} /> {item.price} G</>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CARD REMOVAL */}
        <div style={{ flex: '1 1 240px' }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            color: '#cbd5e1',
            fontSize: '16px',
            marginBottom: 12,
            borderBottom: '1px solid rgba(197, 160, 89, 0.2)',
            paddingBottom: 6,
          }}>
            牌组精简服务 (Deck Purge)
          </h3>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid #ef4444',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            opacity: removalUsed ? 0.35 : 1,
          }}>
            <PixelIcon name="trash" size={32} color="#ef4444" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '14px', marginBottom: 4 }}>
              遗忘一张卡牌 (Remove a Card)
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 12 }}>
              从牌组中永久移除 1 张基础牌或冗余牌，精炼牌组回转率。
            </div>

            <button
              onClick={() => setShowRemovalModal(true)}
              disabled={removalUsed || player.gold < cardRemovalCost}
              className="spire-btn"
              style={{
                borderColor: '#ef4444',
                color: '#fca5a5',
                padding: '8px 16px',
              }}
            >
              {removalUsed ? '本次已用' : <><PixelIcon name="coins" size={14} /> {cardRemovalCost} G 移除</>}
            </button>
          </div>
        </div>
      </div>

      {/* MERCENARY GUILD: COMPANIONS RECRUITMENT & TRAINING (自走棋与货币战争深度融合) */}
      <div style={{ marginTop: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid rgba(197, 160, 89, 0.3)', paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '20px' }}>⚔️</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fbbf24', fontSize: '17px', margin: 0 }}>
                尖塔佣兵公会 · 随从契约与进阶 (Mercenary Guild)
              </h3>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-pixel)' }}>
                招募英灵伙伴并肩爬塔 · 打出卡牌触发关键词协同 · 金币直升进阶解锁质变绝技 (队伍上限: {player.companions?.length || 0}/{player.maxCompanions || 3})
              </div>
            </div>
          </div>
        </div>

        {/* Existing Companions Leveling & Available Recruitment */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {/* Available Recruits */}
          {mercenaries.map((item, idx) => {
            const isFull = (player.companions?.length || 0) >= (player.maxCompanions || 3);
            const canAfford = player.gold >= item.cost;

            return (
              <div
                key={item.config.id}
                style={{
                  backgroundColor: 'rgba(20, 24, 38, 0.92)',
                  border: `1.5px solid ${item.recruited ? '#374151' : item.config.synergyColor}`,
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  opacity: item.recruited ? 0.4 : 1,
                  boxShadow: item.recruited ? undefined : `0 4px 12px rgba(0,0,0,0.6), inset 0 0 10px rgba(0,0,0,0.4)`,
                }}
              >
                {/* Companion Pixel Avatar */}
                <div style={{
                  width: 58,
                  height: 72,
                  borderRadius: 4,
                  backgroundColor: '#0a0d16',
                  border: `1.5px solid ${item.config.synergyColor}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <img
                    src={item.config.avatar}
                    alt={item.config.name}
                    style={{ maxHeight: '92%', maxWidth: '92%', objectFit: 'contain', imageRendering: 'pixelated' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    fontSize: '8px',
                    backgroundColor: item.config.synergyColor,
                    color: '#fff',
                    padding: '1px 3px',
                    fontFamily: 'var(--font-pixel)',
                  }}>
                    {item.config.synergyName.slice(0, 2)}
                  </div>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '13.5px' }}>
                      {item.config.name}
                    </div>
                    <span style={{ fontSize: '9px', color: item.config.synergyColor, fontFamily: 'var(--font-pixel)' }}>
                      {item.config.synergyName}
                    </span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#93c5fd', marginTop: 2 }}>
                    协同: {item.config.triggerDesc}
                  </div>
                  <div style={{ fontSize: '10px', color: '#fcd34d', marginTop: 2 }}>
                    绝技: {item.config.ultimateName}
                  </div>

                  <button
                    onClick={() => handleRecruit(idx)}
                    disabled={item.recruited || isFull || !canAfford}
                    className="spire-btn"
                    style={{
                      marginTop: 8,
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '11px',
                      justifyContent: 'center',
                    }}
                  >
                    {item.recruited ? '已入队' : isFull ? '队伍已满' : <><PixelIcon name="coins" size={12} /> {item.cost} G 契约招募</>}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Current Companions Upgrade Books */}
          {player.companions && player.companions.map((comp) => {
            const nextLv = comp.level + 1;
            const upgradeCost = comp.level === 1 ? 55 : 85;
            const canAfford = player.gold >= upgradeCost;
            const isMax = comp.level >= 3;

            return (
              <div
                key={comp.instanceId}
                style={{
                  backgroundColor: 'rgba(26, 31, 48, 0.92)',
                  border: `1.5px solid ${isMax ? '#eab308' : '#3b82f6'}`,
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  boxShadow: isMax ? '0 0 12px rgba(234, 179, 8, 0.3)' : undefined,
                }}
              >
                {/* Companion Sprite */}
                <div style={{
                  width: 58,
                  height: 72,
                  borderRadius: 4,
                  backgroundColor: '#0a0d16',
                  border: `1.5px solid ${comp.synergyColor}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <img
                    src={comp.avatar}
                    alt={comp.name}
                    style={{ maxHeight: '92%', maxWidth: '92%', objectFit: 'contain', imageRendering: 'pixelated' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    fontSize: '8px',
                    backgroundColor: comp.level === 3 ? '#eab308' : '#3b82f6',
                    color: '#fff',
                    padding: '1px 4px',
                    fontFamily: 'var(--font-pixel)',
                    fontWeight: 700,
                  }}>
                    Lv.{comp.level}
                  </div>
                </div>

                {/* Upgrade Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '13.5px' }}>
                      {comp.name}
                    </div>
                    <span style={{ fontSize: '9px', color: comp.synergyColor, fontFamily: 'var(--font-pixel)' }}>
                      Lv.{comp.level} {isMax ? '已极境' : `→ Lv.${nextLv}`}
                    </span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: isMax ? '#fde047' : '#94a3b8', marginTop: 2 }}>
                    {isMax ? comp.awakenedDesc : `进阶将强化生命与协战数值，Lv.3 可解锁质变绝技`}
                  </div>

                  <button
                    onClick={() => handleUpgradeComp(comp)}
                    disabled={isMax || !canAfford}
                    className="spire-btn"
                    style={{
                      marginTop: 8,
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '11px',
                      justifyContent: 'center',
                      borderColor: isMax ? '#64748b' : '#3b82f6',
                    }}
                  >
                    {isMax ? '★ 质变已觉醒 (MAX)' : <><PixelIcon name="sparkles" size={12} /> {upgradeCost} G 进阶至 Lv.{nextLv}</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD REMOVAL SELECTION MODAL */}
      {showRemovalModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            backgroundColor: '#12141f',
            border: '2px solid #ef4444',
            borderRadius: 12,
            padding: 20,
            maxWidth: 800,
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fca5a5', fontSize: '18px' }}>
                选择 1 张需要从牌组中彻底移除的卡牌
              </h3>
              <button
                onClick={() => setShowRemovalModal(false)}
                className="spire-btn"
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                取消
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'center',
              padding: 10,
            }}>
              {player.deck.map((c) => (
                <div key={c.id} onClick={() => handleSelectCardToRemove(c.id)}>
                  <CardView card={c} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
