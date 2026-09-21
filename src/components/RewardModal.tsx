import React, { useState } from 'react';
import type { Card } from '../types/game';
import { CardView } from './CardView';
import { VOCABULARY_CARDS } from '../data/vocabulary';
import { sound } from '../utils/audio';
import { Coins, PlusCircle } from 'lucide-react';

interface RewardModalProps {
  characterId?: string;
  goldReward: number;
  onClaimGold: () => void;
  goldClaimed: boolean;
  onPickCard: (card: Card) => void;
  cardPicked: boolean;
  onContinue: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  characterId,
  goldReward,
  onClaimGold,
  goldClaimed,
  onPickCard,
  cardPicked,
  onContinue,
}) => {
  // Generate 3 character-specific cards for drafting
  const [draftCards] = useState<Card[]>(() => {
    const charPool = characterId ? VOCABULARY_CARDS.filter(c => c.characterId === characterId) : [];
    const pool = (charPool.length >= 3 ? charPool : VOCABULARY_CARDS).sort(() => Math.random() - 0.5);
    return pool.slice(0, 3).map((c, i) => ({
      ...c,
      id: `draft_${c.id}_${Date.now()}_${i}`,
    }));
  });

  const [showingCardPicker, setShowingCardPicker] = useState(false);

  const handleSelectCard = (c: Card) => {
    sound.playCritical();
    onPickCard(c);
    setShowingCardPicker(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 6, 12, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 150,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        backgroundColor: '#12141f',
        border: '2px solid var(--border-gold)',
        borderRadius: 14,
        padding: '24px 30px',
        maxWidth: 580,
        width: '100%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9), 0 0 25px var(--border-gold-glow)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '32px',
          marginBottom: 4,
        }}>
          ⚔️
        </div>

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          color: '#fbbf24',
          fontSize: '24px',
          fontWeight: 900,
          marginBottom: 6,
        }}>
          战斗大捷！(Victory)
        </h2>

        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: 20 }}>
          你击溃了敌人，收获了宝贵的知识与战利品。
        </p>

        {/* REWARD LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {/* Gold Reward */}
          <button
            onClick={() => {
              if (!goldClaimed) {
                sound.playGold();
                onClaimGold();
              }
            }}
            disabled={goldClaimed}
            className="spire-btn"
            style={{
              padding: '12px 18px',
              justifyContent: 'space-between',
              backgroundColor: goldClaimed ? 'rgba(255,255,255,0.05)' : undefined,
              borderColor: goldClaimed ? '#475569' : '#fbbf24',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Coins size={20} color="#fbbf24" />
              <span style={{ fontSize: '15px', color: goldClaimed ? '#94a3b8' : '#f8fafc' }}>
                获得 {goldReward} 金币 (Gold)
              </span>
            </div>
            <span style={{ fontSize: '12px', color: goldClaimed ? '#64748b' : '#fbbf24' }}>
              {goldClaimed ? '已领取' : '点击领取'}
            </span>
          </button>

          {/* Card Reward */}
          <button
            onClick={() => {
              if (!cardPicked) {
                sound.playSelect();
                setShowingCardPicker(true);
              }
            }}
            disabled={cardPicked}
            className="spire-btn"
            style={{
              padding: '12px 18px',
              justifyContent: 'space-between',
              backgroundColor: cardPicked ? 'rgba(255,255,255,0.05)' : undefined,
              borderColor: cardPicked ? '#475569' : '#38bdf8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PlusCircle size={20} color="#38bdf8" />
              <span style={{ fontSize: '15px', color: cardPicked ? '#94a3b8' : '#f8fafc' }}>
                挑选一张新词汇卡牌加入牌组
              </span>
            </div>
            <span style={{ fontSize: '12px', color: cardPicked ? '#64748b' : '#38bdf8' }}>
              {cardPicked ? '已加入牌组' : '3 选 1 构筑'}
            </span>
          </button>
        </div>

        {/* CONTINUE BUTTON */}
        <button
          onClick={() => {
            sound.playSelect();
            onContinue();
          }}
          className="spire-btn"
          style={{
            padding: '12px 36px',
            fontSize: '16px',
            backgroundColor: '#1e3a8a',
            borderColor: '#60a5fa',
          }}
        >
          继续前行 (Continue)
        </button>
      </div>

      {/* CARD PICKER SUB-MODAL */}
      {showingCardPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            color: '#facc15',
            fontSize: '22px',
            marginBottom: 8,
          }}>
            选择 1 张卡牌加入你的战斗卡组
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: 24 }}>
            挑选与你的战术流派契合的词汇，在往后的战斗中强化运用它
          </p>

          <div style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 28,
          }}>
            {draftCards.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectCard(c)}
                style={{ cursor: 'pointer' }}
              >
                <CardView card={c} showMeaning={true} />
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowingCardPicker(false)}
            className="spire-btn"
            style={{ padding: '8px 24px', fontSize: '14px', borderColor: '#64748b' }}
          >
            跳过 (不拿取卡牌)
          </button>
        </div>
      )}
    </div>
  );
};
