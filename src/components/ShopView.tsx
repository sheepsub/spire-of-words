import React, { useState } from 'react';
import type { Card, Player, Relic } from '../types/game';
import { CardView } from './CardView';
import { ALL_RELICS } from '../data/relics';
import { VOCABULARY_CARDS } from '../data/vocabulary';
import { Coins, Trash2, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface ShopViewProps {
  player: Player;
  onBuyCard: (card: Card, cost: number) => void;
  onBuyRelic: (relic: Relic, cost: number) => void;
  onRemoveCard: (cardId: string, cost: number) => void;
  onLeave: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  player,
  onBuyCard,
  onBuyRelic,
  onRemoveCard,
  onLeave,
}) => {
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

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#0d0d14',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: '20px 24px 80px 24px',
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
            <Coins size={20} />
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
          词汇卡牌 (Vocabulary Scrolls)
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
              <CardView card={item.card} showMeaning={true} />
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
                  <>已售出 <Check size={14} /></>
                ) : (
                  <><Coins size={14} /> {item.price} G</>
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
                  {item.bought ? '已拥有' : <><Coins size={13} /> {item.price} G</>}
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
            <Trash2 size={32} color="#ef4444" style={{ marginBottom: 8 }} />
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
              {removalUsed ? '本次已用' : <><Coins size={14} /> {cardRemovalCost} G 移除</>}
            </button>
          </div>
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
                  <CardView card={c} showMeaning={true} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
