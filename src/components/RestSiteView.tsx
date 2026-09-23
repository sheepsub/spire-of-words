import React, { useState } from 'react';
import type { Card, Player, EnchantmentType } from '../types/game';
import { CardView } from './CardView';
import { BookOpen, Heart, Sparkles, Wand2 } from 'lucide-react';
import { sound } from '../utils/audio';
import { getRandomEnchantments, type EnchantmentConfig } from '../data/enchantments';

interface RestSiteViewProps {
  player: Player;
  onRest: () => void;
  onUpgradeCard: (cardId: string) => void;
  onEnchantCard?: (cardId: string, enchantment: EnchantmentType) => void;
  onLeave: () => void;
}

export const RestSiteView: React.FC<RestSiteViewProps> = ({
  player,
  onRest,
  onUpgradeCard,
  onEnchantCard,
  onLeave,
}) => {
  const [mode, setMode] = useState<'options' | 'selectCard' | 'selectCardForEnchant' | 'selectEnchantment' | 'done'>('options');
  const [selectedCardToUpgrade, setSelectedCardToUpgrade] = useState<Card | null>(null);
  const [selectedCardToEnchant, setSelectedCardToEnchant] = useState<Card | null>(null);
  const [offeredEnchantments, setOfferedEnchantments] = useState<EnchantmentConfig[]>([]);

  const healAmount = Math.floor(player.maxHp * 0.3);
  const upgradeableCards = player.deck.filter((c) => !c.isUpgraded);
  const enchantableCards = player.deck.filter((c) => !c.enchantment);

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

  const handleStartEnchant = () => {
    sound.playSTS2Click();
    setMode('selectCardForEnchant');
  };

  const handleSelectCardForEnchant = (card: Card) => {
    sound.playSTS2Click();
    setSelectedCardToEnchant(card);
    setOfferedEnchantments(getRandomEnchantments(3));
    setMode('selectEnchantment');
  };

  const handleConfirmEnchantment = (enchantment: EnchantmentConfig) => {
    if (!selectedCardToEnchant) return;
    sound.playSTS2Tarot();
    onEnchantCard?.(selectedCardToEnchant.id, enchantment.type);
    setSelectedCardToEnchant(null);
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
        fontSize: '26px',
        marginBottom: 6,
      }}>
        营火休息处 (Rest Site)
      </h1>

      <p style={{
        color: '#94a3b8',
        fontSize: '13px',
        marginBottom: 24,
        textAlign: 'center',
        maxWidth: 520,
      }}>
        围坐炉火旁。你可以安然休憩抚平伤口、研读词汇数值强化，或借助先祖之力进行《杀戮尖塔 2》专属附魔！
      </p>

      {/* OPTIONS SCREEN */}
      {mode === 'options' && (
        <div style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '680px',
          width: '100%',
        }}>
          {/* REST OPTION */}
          <button
            onClick={handleRestClick}
            className="spire-btn"
            style={{
              flex: '1 1 180px',
              padding: '20px 14px',
              flexDirection: 'column',
              gap: 10,
              borderColor: '#ef4444',
            }}
          >
            <Heart size={32} color="#ef4444" fill="#ef4444" />
            <div style={{ fontSize: '16px', color: '#f8fafc' }}>安然休憩 (Rest)</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'none' }}>
              回复 <strong style={{ color: '#4ade80' }}>+{healAmount}</strong> 点生命值 (30% Max HP)
            </div>
          </button>

          {/* SMITH / STUDY OPTION */}
          <button
            onClick={() => setMode('selectCard')}
            disabled={upgradeableCards.length === 0}
            className="spire-btn"
            style={{
              flex: '1 1 180px',
              padding: '20px 14px',
              flexDirection: 'column',
              gap: 10,
              borderColor: '#38bdf8',
            }}
          >
            <BookOpen size={32} color="#38bdf8" />
            <div style={{ fontSize: '16px', color: '#f8fafc' }}>温故知新 (Smith)</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'none' }}>
              研读单词深化例句，将 1 张卡牌强化为 <strong style={{ color: '#facc15' }}>+1</strong> 强化版
            </div>
          </button>

          {/* STS2 ENCHANT OPTION */}
          <button
            onClick={handleStartEnchant}
            disabled={enchantableCards.length === 0}
            className="spire-btn"
            style={{
              flex: '1 1 180px',
              padding: '20px 14px',
              flexDirection: 'column',
              gap: 10,
              borderColor: '#eab308',
              boxShadow: '0 0 16px rgba(234, 179, 8, 0.25)',
            }}
          >
            <Wand2 size={32} color="#eab308" />
            <div style={{ fontSize: '16px', color: '#fef08a' }}>先祖附魔 (Enchant)</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'none' }}>
              借由《尖塔2》法则，赋予卡牌 <strong style={{ color: '#facc15' }}>动量/华彩/蛇行/王室</strong> 等全新词缀
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
              选择 1 张卡牌进行词汇研读与数值强化 (+1)
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
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              marginTop: 16,
              borderTop: '1px solid #334155',
              paddingTop: 16,
            }}>
              <button
                onClick={() => handleConfirmUpgrade(selectedCardToUpgrade)}
                className="spire-btn"
                style={{ padding: '10px 24px', borderColor: '#facc15', color: '#facc15', fontSize: '14px' }}
              >
                确认强化: {selectedCardToUpgrade.name || selectedCardToUpgrade.word} (+1)
              </button>
            </div>
          )}
        </div>
      )}

      {/* CARD SELECTION FOR STS2 ENCHANTMENT */}
      {mode === 'selectCardForEnchant' && (
        <div style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '75vh',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid #eab308',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#facc15', fontSize: '18px' }}>
              选择 1 张卡牌注入《杀戮尖塔 2》先祖附魔
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
            {enchantableCards.map((c) => (
              <div key={c.id} onClick={() => handleSelectCardForEnchant(c)}>
                <CardView
                  card={c}
                  showMeaning={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SELECT WHICH ENCHANTMENT TO APPLY */}
      {mode === 'selectEnchantment' && selectedCardToEnchant && (
        <div style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          border: '2px solid #eab308',
          boxShadow: '0 0 25px rgba(234, 179, 8, 0.4)',
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#facc15', fontSize: '20px', margin: 0 }}>
            ✨ 为【{selectedCardToEnchant.name}】选择先祖附魔
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, textAlign: 'center' }}>
            从尖塔古卷中涌现的 3 种附魔神谕，挑选其一刻印于魔导卡面：
          </p>

          <div style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
          }}>
            {offeredEnchantments.map((enc) => (
              <button
                key={enc.type}
                onClick={() => handleConfirmEnchantment(enc)}
                className="spire-btn"
                style={{
                  flex: '1 1 200px',
                  padding: '16px 12px',
                  flexDirection: 'column',
                  gap: 8,
                  borderColor: enc.color,
                  boxShadow: `0 0 12px ${enc.glow}`,
                  backgroundColor: 'rgba(2, 6, 23, 0.85)',
                }}
              >
                <div style={{ fontSize: '26px' }}>{enc.icon}</div>
                <div style={{ fontSize: '16px', color: enc.color, fontWeight: 800 }}>
                  {enc.title} ({enc.enTitle})
                </div>
                <div style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '15px', textTransform: 'none' }}>
                  {enc.description}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setMode('selectCardForEnchant')}
            className="spire-btn"
            style={{ padding: '6px 16px', fontSize: '12px', marginTop: 6 }}
          >
            重选卡牌
          </button>
        </div>
      )}

      {/* DONE STATE */}
      {mode === 'done' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          padding: '32px 48px',
          borderRadius: 12,
          border: '1px solid var(--border-gold)',
        }}>
          <Sparkles size={48} color="#facc15" />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#facc15', fontSize: '22px' }}>
            整备完毕，重踏征途！
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', maxWidth: 360, textAlign: 'center' }}>
            炉火渐渐平息，精神与牌组已焕然一新。前方的尖塔迷宫正等待着你的誓约！
          </p>
          <button
            onClick={onLeave}
            className="spire-btn spire-btn-gold"
            style={{ padding: '12px 32px', fontSize: '16px' }}
          >
            继续攀登 (Proceed)
          </button>
        </div>
      )}
    </div>
  );
};
