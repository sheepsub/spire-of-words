import React, { useState } from 'react';
import type { Card, Player } from '../types/game';
import { CardView } from './CardView';
import { BookOpen, Heart, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface RestSiteViewProps {
  player: Player;
  onRest: () => void;
  onUpgradeCard: (cardId: string) => void;
  onLeave: () => void;
}

export const RestSiteView: React.FC<RestSiteViewProps> = ({
  player,
  onRest,
  onUpgradeCard,
  onLeave,
}) => {
  const [mode, setMode] = useState<'options' | 'selectCard' | 'done'>('options');
  const [selectedCardToUpgrade, setSelectedCardToUpgrade] = useState<Card | null>(null);

  const healAmount = Math.floor(player.maxHp * 0.3);
  const upgradeableCards = player.deck.filter((c) => !c.isUpgraded);

  const handleRestClick = () => {
    sound.playBuff();
    onRest();
    setMode('done');
  };

  const handleConfirmUpgrade = (card: Card) => {
    sound.playCritical();
    onUpgradeCard(card.id);
    setSelectedCardToUpgrade(null);
    setMode('done');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#0a0a0f',
      background: 'radial-gradient(circle at 50% 60%, #2b1704 0%, #0d0e17 65%, #05060a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'max(6px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
      overflowY: 'auto',
      position: 'relative',
    }}>
      {/* Campfire Fire Icon & Ambient glow */}
      <div style={{
        fontSize: 'clamp(42px, 11vh, 64px)',
        filter: 'drop-shadow(0 0 35px rgba(245, 158, 11, 0.8))',
        marginBottom: 8,
        animation: 'monster-idle 2.5s infinite',
      }}>
        🔥
      </div>

      <h1 style={{
        fontFamily: 'var(--font-serif)',
        color: '#facc15',
        fontSize: '28px',
        marginBottom: 8,
      }}>
        营火休息处 (Rest Site)
      </h1>

      <p style={{
        color: '#94a3b8',
        fontSize: '14px',
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 420,
      }}>
        在攀爬的间隙围坐炉火旁。你可以选择安然休憩抚平伤口，或是温故知新强化你的词汇与秘技。
      </p>

      {/* OPTIONS SCREEN */}
      {mode === 'options' && (
        <div style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '520px',
          width: '100%',
        }}>
          {/* REST OPTION */}
          <button
            onClick={handleRestClick}
            className="spire-btn"
            style={{
              flex: '1 1 200px',
              padding: '24px 16px',
              flexDirection: 'column',
              gap: 12,
              borderColor: '#ef4444',
            }}
          >
            <Heart size={36} color="#ef4444" fill="#ef4444" />
            <div style={{ fontSize: '18px', color: '#f8fafc' }}>安然休憩 (Rest)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'none' }}>
              回复 <strong style={{ color: '#4ade80' }}>+{healAmount}</strong> 点生命值 (30% Max HP)
            </div>
          </button>

          {/* SMITH / STUDY OPTION */}
          <button
            onClick={() => setMode('selectCard')}
            disabled={upgradeableCards.length === 0}
            className="spire-btn"
            style={{
              flex: '1 1 200px',
              padding: '24px 16px',
              flexDirection: 'column',
              gap: 12,
              borderColor: '#38bdf8',
            }}
          >
            <BookOpen size={36} color="#38bdf8" />
            <div style={{ fontSize: '18px', color: '#f8fafc' }}>温故知新 (Smith)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'none' }}>
              研读单词深化例句，将 1 张卡牌永久升级为 <strong style={{ color: '#facc15' }}>+1</strong> 强化版
            </div>
          </button>
        </div>
      )}

      {/* CARD SELECTION FOR UPGRADE */}
      {mode === 'selectCard' && (
        <div style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '75vh',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid var(--border-gold)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#facc15', fontSize: '18px' }}>
              选择 1 张卡牌进行词汇研读与数值强化
            </h3>
            <button
              onClick={() => setMode('options')}
              className="spire-btn"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              返回
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
            {upgradeableCards.map((c) => (
              <div key={c.id} onClick={() => setSelectedCardToUpgrade(c)}>
                <CardView
                  card={c}
                  selected={selectedCardToUpgrade?.id === c.id}
                  showMeaning={true}
                />
              </div>
            ))}
          </div>

          {selectedCardToUpgrade && (
            <div style={{
              marginTop: 16,
              padding: 14,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 8,
              border: '1px solid rgba(197, 160, 89, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16 }}>
                  强化目标: <span style={{ color: '#facc15' }}>{selectedCardToUpgrade.word}</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  例句：{selectedCardToUpgrade.exampleSentence} ({selectedCardToUpgrade.exampleTranslation})
                </div>
              </div>
              <button
                onClick={() => handleConfirmUpgrade(selectedCardToUpgrade)}
                className="spire-btn"
                style={{ backgroundColor: '#15803d', borderColor: '#4ade80' }}
              >
                <Sparkles size={16} /> 确认强化
              </button>
            </div>
          )}
        </div>
      )}

      {/* FINISHED / LEAVE BUTTON */}
      {mode === 'done' && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ color: '#86efac', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
            休整完毕，精神焕发！
          </div>
          <button
            onClick={() => {
              sound.playSelect();
              onLeave();
            }}
            className="spire-btn"
            style={{ padding: '12px 32px', fontSize: 16 }}
          >
            启程离开
          </button>
        </div>
      )}
    </div>
  );
};
