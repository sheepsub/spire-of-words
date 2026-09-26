import React, { useState } from 'react';
import type { EffectCard } from '../types/autoChess';
import { ALL_EFFECT_CARDS } from '../data/effectCardsData';
import { PixelIcon } from './PixelIcon';
import { EffectCardItem } from './EffectCardItem';
import { sound } from '../utils/audio';

interface RewardModalProps {
  characterId?: string;
  goldReward: number;
  interestReward?: number;
  onClaimGold: () => void;
  goldClaimed: boolean;
  onPickEffectCard?: (card: EffectCard) => void;
  cardPicked: boolean;
  onContinue: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  goldReward,
  interestReward = 0,
  onClaimGold,
  goldClaimed,
  onPickEffectCard,
  cardPicked,
  onContinue,
}) => {
  // Generate 3 random Effect Cards for tactical drafting
  const [draftEffectCards] = useState<EffectCard[]>(() => {
    const pool = [...ALL_EFFECT_CARDS].sort(() => Math.random() - 0.5);
    return pool.slice(0, 3).map((c, i) => ({
      ...c,
      id: `draft_${c.id}_${Date.now()}_${i}`,
    }));
  });

  const [showingCardPicker, setShowingCardPicker] = useState(false);

  const handleSelectEffectCard = (c: EffectCard) => {
    sound.playCritical();
    if (onPickEffectCard) {
      onPickEffectCard(c);
    }
    setShowingCardPicker(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 6, 12, 0.9)',
      backdropFilter: 'blur(8px)',
      zIndex: 150,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'max(8px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
    }}>
      <div style={{
        backgroundColor: '#12141f',
        border: '2px solid var(--border-gold)',
        borderRadius: 14,
        padding: '14px 24px',
        maxWidth: 560,
        width: '100%',
        maxHeight: '94vh',
        overflowY: 'auto',
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
              <PixelIcon name="coins" size={20} color="#fbbf24" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '15px', color: goldClaimed ? '#94a3b8' : '#f8fafc' }}>
                  获得 {goldReward} 金币 (Gold)
                </span>
                {interestReward > 0 && (
                  <span style={{ fontSize: '10px', color: '#facc15', fontFamily: 'var(--font-pixel)', marginTop: 2 }}>
                    📈 货币战争利息分红: +{interestReward} G (储蓄理财收益)
                  </span>
                )}
              </div>
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
              <PixelIcon name="zap" size={20} color="#38bdf8" />
              <span style={{ fontSize: '15px', color: cardPicked ? '#94a3b8' : '#f8fafc' }}>
                挑选一张【万象效果牌】加入战术锦囊
              </span>
            </div>
            <span style={{ fontSize: '12px', color: cardPicked ? '#64748b' : '#38bdf8' }}>
              {cardPicked ? '已加入战术库' : '3 选 1 效果牌'}
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

      {/* EFFECT CARD PICKER SUB-MODAL */}
      {showingCardPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(10px)',
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
            fontSize: '24px',
            fontWeight: 900,
            marginBottom: 8,
          }}>
            挑选 1 张【万象效果牌】(Tactical Effect Card)
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: 24, textAlign: 'center', maxWidth: 500 }}>
            效果牌可在自走棋遭遇战中即时打出！释放时能量超频，威力翻倍！
          </p>

          <div style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 28,
            maxWidth: '1000px',
          }}>
            {draftEffectCards.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectEffectCard(c)}
                style={{ cursor: 'pointer', transform: 'scale(1.02)' }}
              >
                <EffectCardItem card={c} />
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowingCardPicker(false)}
            className="spire-btn"
            style={{ padding: '8px 24px', fontSize: '14px', borderColor: '#64748b' }}
          >
            跳过 (不拿取效果牌)
          </button>
        </div>
      )}
    </div>
  );
};
