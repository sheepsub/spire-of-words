import React, { useState, useCallback } from 'react';
import type { 
  Player, 
  Enemy, 
  Card, 
  MapNode, 
  GameScreen, 
  FloatText 
} from './types/game';
import { getStarterDeck } from './data/vocabulary';
import { STARTER_RELIC } from './data/relics';
import { getRandomMonster } from './data/enemies';
import { generateActMap } from './utils/mapGenerator';
import type { GeneratedFloor } from './utils/mapGenerator';
import { sound } from './utils/audio';

// Components
import { TopBar } from './components/TopBar';
import { BattleView } from './components/BattleView';
import { MapView } from './components/MapView';
import { RestSiteView } from './components/RestSiteView';
import { ShopView } from './components/ShopView';
import { RewardModal } from './components/RewardModal';
import { LexiconModal } from './components/LexiconModal';
import { DeckModal } from './components/DeckModal';
import { GameOverModal } from './components/GameOverModal';

export const App: React.FC = () => {
  // Master Game State
  const [screen, setScreen] = useState<GameScreen>('map');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Modals overlay
  const [showLexicon, setShowLexicon] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [customDeckView, setCustomDeckView] = useState<{ cards: Card[]; title: string } | null>(null);

  // Map & Floors
  const [floors, setFloors] = useState<GeneratedFloor[]>(() => generateActMap(15));
  const [currentFloor, setCurrentFloor] = useState<number>(0);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  // Player State
  const [player, setPlayer] = useState<Player>(() => ({
    hp: 75,
    maxHp: 75,
    energy: 3,
    maxEnergy: 3,
    block: 0,
    gold: 99,
    statusEffects: {
      strength: 0,
      weak: 0,
      vulnerable: 0,
      poison: 0,
      dexterity: 0,
    },
    deck: getStarterDeck(),
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    relics: [STARTER_RELIC],
  }));

  // Battle State
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [battleTurn, setBattleTurn] = useState<number>(1);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);

  // Reward State
  const [rewardGold, setRewardGold] = useState<number>(18);
  const [goldClaimed, setGoldClaimed] = useState<boolean>(false);
  const [cardPicked, setCardPicked] = useState<boolean>(false);

  // Spawn floating combat text
  const addFloatText = useCallback((text: string, type: FloatText['type'], x: number, y: number) => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    setFloatTexts((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setFloatTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1100);
  }, []);

  // Draw cards from drawPile to hand (reshuffling discardPile if needed)
  const drawCards = useCallback((count: number, currentDraw: Card[], currentDiscard: Card[], currentHand: Card[]) => {
    let draw = [...currentDraw];
    let discard = [...currentDiscard];
    let hand = [...currentHand];

    for (let i = 0; i < count; i++) {
      if (draw.length === 0) {
        if (discard.length === 0) break; // No cards left anywhere
        // Reshuffle discard into draw
        draw = [...discard].sort(() => Math.random() - 0.5);
        discard = [];
      }
      const topCard = draw.pop();
      if (topCard) {
        hand.push(topCard);
        sound.playDraw();
      }
    }

    return { draw, discard, hand };
  }, []);

  // START COMBAT
  const startCombat = useCallback((floorNum: number) => {
    const newEnemy = getRandomMonster(floorNum);
    const hasAnchor = player.relics.some((r) => r.id === 'anchor');
    const hasVajra = player.relics.some((r) => r.id === 'vajra');
    const hasLexicon = player.relics.some((r) => r.id === 'oxford_lexicon');

    // Shuffle full deck into draw pile
    const initialDrawPile = [...player.deck].sort(() => Math.random() - 0.5);
    const { draw, discard, hand } = drawCards(5, initialDrawPile, [], []);

    setEnemy(newEnemy);
    setIsPlayerTurn(true);
    setBattleTurn(1);

    setPlayer((prev) => ({
      ...prev,
      energy: prev.maxEnergy + (hasLexicon ? 1 : 0),
      block: hasAnchor ? 10 : 0,
      drawPile: draw,
      discardPile: discard,
      hand: hand,
      exhaustPile: [],
      statusEffects: {
        strength: hasVajra ? 1 : 0,
        weak: 0,
        vulnerable: 0,
        poison: 0,
        dexterity: 0,
      },
    }));

    if (hasAnchor) {
      addFloatText('+10 🛡️ 船锚护体', 'block', 25, 45);
    }

    setScreen('battle');
  }, [player.deck, player.maxEnergy, player.relics, drawCards, addFloatText]);

  // Handle player selecting a map node
  const handleSelectMapNode = (node: MapNode) => {
    setCurrentFloor(node.floor);
    setCurrentNodeId(node.id);

    // Update accessible nodes on the map
    setFloors((prevFloors) => {
      return prevFloors.map((fl) => {
        return {
          ...fl,
          nodes: fl.nodes.map((n) => {
            if (n.id === node.id) {
              return { ...n, visited: true, accessible: false };
            }
            // Enable next floor nodes connected to this node
            if (node.nextNodes.includes(n.id)) {
              return { ...n, accessible: true };
            }
            return { ...n, accessible: false };
          }),
        };
      });
    });

    // Navigate to respective scene
    if (node.type === 'monster' || node.type === 'elite' || node.type === 'boss') {
      startCombat(node.floor);
    } else if (node.type === 'rest') {
      setScreen('rest');
    } else if (node.type === 'shop') {
      setScreen('shop');
    } else {
      // Event / Mystery - default to monster or random gold
      startCombat(node.floor);
    }
  };

  // PLAY CARD ACTION (COMBAT)
  const handlePlayCard = (card: Card, isCritical: boolean) => {
    if (!enemy || !isPlayerTurn) return;

    const cost = card.isUpgraded && card.upgradedCost !== undefined ? card.upgradedCost : card.cost;
    let currentEnergy = player.energy - cost;

    // Upgraded status check
    const baseDmg = card.isUpgraded && card.upgradedDamage !== undefined ? card.upgradedDamage : card.baseDamage;
    const baseBlk = card.isUpgraded && card.upgradedBlock !== undefined ? card.upgradedBlock : card.baseBlock;
    const hits = (card.isUpgraded && card.upgradedHits !== undefined ? card.upgradedHits : card.hits) || 1;
    const vuln = card.isUpgraded && card.upgradedVulnerable !== undefined ? card.upgradedVulnerable : card.vulnerable;
    const weak = card.isUpgraded && card.upgradedWeak !== undefined ? card.upgradedWeak : card.weak;
    const poison = card.isUpgraded && card.upgradedPoison !== undefined ? card.upgradedPoison : card.poison;
    const drawNum = card.isUpgraded && card.upgradedDrawCards !== undefined ? card.upgradedDrawCards : card.drawCards;
    const strengthGain = card.isUpgraded && card.upgradedStrength !== undefined ? card.upgradedStrength : card.strength;

    let updatedEnemyHp = enemy.hp;
    let updatedEnemyBlock = enemy.block;
    let updatedPlayerBlock = player.block;
    let updatedPlayerHp = player.hp;

    // 1. DAMAGE CALCULATION
    if (baseDmg !== undefined) {
      sound.playSlash();
      for (let h = 0; h < hits; h++) {
        let dmg = baseDmg + player.statusEffects.strength;
        if (player.statusEffects.weak > 0) dmg = Math.floor(dmg * 0.75);
        if (enemy.statusEffects.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
        if (isCritical) {
          const hasRing = player.relics.some((r) => r.id === 'mnemonic_ring');
          dmg = Math.floor(dmg * (hasRing ? 1.8 : 1.5));
        }

        // Apply against enemy block first
        if (updatedEnemyBlock >= dmg) {
          updatedEnemyBlock -= dmg;
          addFloatText(`-${dmg} 🛡️`, 'block', 70 + Math.random() * 8, 45);
        } else {
          const rem = dmg - updatedEnemyBlock;
          updatedEnemyBlock = 0;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - rem);
          addFloatText(
            isCritical ? `-${rem} ⚡暴击!` : `-${rem}`, 
            isCritical ? 'critical' : 'damage', 
            70 + Math.random() * 8, 
            45
          );
        }
      }
    }

    // 2. BLOCK CALCULATION
    if (baseBlk !== undefined) {
      sound.playBlock();
      let blk = baseBlk + player.statusEffects.dexterity;
      if (isCritical) blk = Math.floor(blk * 1.5);
      updatedPlayerBlock += blk;
      addFloatText(`+${blk} 🛡️`, 'block', 25, 45);
    }

    // 3. STATUS DEBUFFS & BUFFS
    const newEnemyStatus = { ...enemy.statusEffects };
    if (vuln) {
      newEnemyStatus.vulnerable += vuln;
      addFloatText(`+${vuln} 易伤`, 'debuff', 70, 38);
    }
    if (weak) {
      newEnemyStatus.weak += weak;
      addFloatText(`+${weak} 虚弱`, 'debuff', 70, 38);
    }
    if (poison) {
      newEnemyStatus.poison += poison;
      addFloatText(`+${poison} 🧪中毒`, 'debuff', 70, 38);
    }

    // Special: Catalyst (Power) doubles poison!
    if (card.id.includes('catalyst') && newEnemyStatus.poison > 0) {
      newEnemyStatus.poison *= 2;
      addFloatText(`中毒翻倍! 🧪${newEnemyStatus.poison}`, 'debuff', 70, 38);
    }

    // Player buffs
    let newPlayerStrength = player.statusEffects.strength;
    if (strengthGain) {
      newPlayerStrength += strengthGain;
      sound.playBuff();
      addFloatText(`+${strengthGain} 力量`, 'buff', 25, 38);
    }

    if (card.heal) {
      updatedPlayerHp = Math.min(player.maxHp, updatedPlayerHp + card.heal);
      addFloatText(`+${card.heal} 生命`, 'heal', 25, 45);
    }

    if (card.gainEnergy) {
      currentEnergy += card.gainEnergy;
    }

    // 4. DRAW EXTRA CARDS
    let curDraw = player.drawPile;
    let curDiscard = player.discardPile;
    let curHand = player.hand.filter((c) => c.id !== card.id);

    if (drawNum) {
      const drawn = drawCards(drawNum, curDraw, curDiscard, curHand);
      curDraw = drawn.draw;
      curDiscard = drawn.discard;
      curHand = drawn.hand;
    }

    // Move played card to discard or exhaust
    if (card.exhaust) {
      // Exclude from discard
    } else {
      curDiscard = [...curDiscard, card];
    }

    // 5. UPDATE WORD MASTERY IN PERSISTENT DECK
    const updatedDeck = player.deck.map((dc) => {
      if (dc.word.toLowerCase() === card.word.toLowerCase()) {
        return {
          ...dc,
          masteryCount: isCritical ? dc.masteryCount + 1 : dc.masteryCount,
          needReview: !isCritical ? true : dc.needReview,
        };
      }
      return dc;
    });

    // Update state
    setEnemy({
      ...enemy,
      hp: updatedEnemyHp,
      block: updatedEnemyBlock,
      statusEffects: newEnemyStatus,
    });

    setPlayer((prev) => ({
      ...prev,
      hp: updatedPlayerHp,
      block: updatedPlayerBlock,
      energy: currentEnergy,
      deck: updatedDeck,
      hand: curHand,
      drawPile: curDraw,
      discardPile: curDiscard,
      statusEffects: {
        ...prev.statusEffects,
        strength: newPlayerStrength,
      },
    }));

    // CHECK ENEMY DEFEAT
    if (updatedEnemyHp <= 0) {
      setTimeout(() => {
        sound.playVictory();

        // Relic: Burning Blood
        const hasBlood = player.relics.some((r) => r.id === 'burning_blood');
        const healedHp = hasBlood ? Math.min(player.maxHp, updatedPlayerHp + 6) : updatedPlayerHp;

        setPlayer((prev) => ({
          ...prev,
          hp: healedHp,
          hand: [],
          drawPile: [],
          discardPile: [],
        }));

        if (enemy.isBoss) {
          setScreen('victory');
        } else {
          setRewardGold(Math.floor(Math.random() * 15) + 15);
          setGoldClaimed(false);
          setCardPicked(false);
          setScreen('reward');
        }
      }, 500);
    }
  };

  // END TURN ACTION
  const handleEndTurn = () => {
    if (!isPlayerTurn || !enemy) return;
    setIsPlayerTurn(false);

    // 1. Move hand to discard pile
    let nextDiscard = [...player.discardPile, ...player.hand];
    let nextDraw = [...player.drawPile];

    // 2. Resolve Enemy Intent
    setTimeout(() => {
      if (enemy.hp <= 0) return;

      let currentEnemy = { ...enemy };
      let updatedPlayerHp = player.hp;
      let updatedPlayerBlock = 0; // Player block resets at turn end

      // Enemy Attack
      if (currentEnemy.intent.type === 'attack' && currentEnemy.intent.value) {
        sound.playEnemyHit();
        const times = currentEnemy.intent.times || 1;
        for (let t = 0; t < times; t++) {
          let dmg = currentEnemy.intent.value + currentEnemy.statusEffects.strength;
          if (currentEnemy.statusEffects.weak > 0) dmg = Math.floor(dmg * 0.75);
          if (player.statusEffects.vulnerable > 0) dmg = Math.floor(dmg * 1.5);

          if (player.block >= dmg) {
            // Block absorbed
            addFloatText(`-${dmg} 🛡️`, 'block', 25, 45);
          } else {
            const unblocked = dmg - player.block;
            updatedPlayerHp = Math.max(0, updatedPlayerHp - unblocked);
            addFloatText(`-${unblocked}`, 'damage', 25, 45);
          }
        }
      }

      // Enemy Defend
      if (currentEnemy.intent.type === 'defend' && currentEnemy.intent.value) {
        sound.playBlock();
        currentEnemy.block += currentEnemy.intent.value;
        addFloatText(`+${currentEnemy.intent.value} 🛡️`, 'block', 70, 45);
      }

      // Enemy Buff (Ritual / Enrage)
      if (currentEnemy.intent.type === 'buff') {
        sound.playBuff();
        if (currentEnemy.statusEffects.ritual !== undefined) {
          currentEnemy.statusEffects.ritual += 2;
          currentEnemy.statusEffects.strength += 2;
          addFloatText('+2 力量', 'buff', 70, 45);
        } else {
          currentEnemy.statusEffects.strength += 3;
          currentEnemy.block += 6;
          addFloatText('咆哮强化!', 'buff', 70, 45);
        }
      }

      // 3. Status effect ticks
      // Poison on enemy
      if (currentEnemy.statusEffects.poison > 0) {
        const poisonDmg = currentEnemy.statusEffects.poison;
        currentEnemy.hp = Math.max(0, currentEnemy.hp - poisonDmg);
        currentEnemy.statusEffects.poison -= 1;
        addFloatText(`-${poisonDmg} 🧪中毒`, 'damage', 70, 45);
      }

      // Weak & Vulnerable ticks
      if (currentEnemy.statusEffects.weak > 0) currentEnemy.statusEffects.weak -= 1;
      if (currentEnemy.statusEffects.vulnerable > 0) currentEnemy.statusEffects.vulnerable -= 1;
      
      const newPlayerWeak = Math.max(0, player.statusEffects.weak - 1);
      const newPlayerVuln = Math.max(0, player.statusEffects.vulnerable - 1);

      // Check Player Death
      if (updatedPlayerHp <= 0) {
        setPlayer((prev) => ({ ...prev, hp: 0 }));
        setScreen('gameover');
        return;
      }

      // 4. Start Next Turn for Player
      const nextTurn = battleTurn + 1;
      setBattleTurn(nextTurn);

      // Draw 5 cards
      const drawn = drawCards(5, nextDraw, nextDiscard, []);

      // Relic: Hourglass (deals 4 damage to enemy at start of player turn)
      const hasHourglass = player.relics.some((r) => r.id === 'ebbinghaus_glass');
      if (hasHourglass && currentEnemy.hp > 0) {
        currentEnemy.hp = Math.max(0, currentEnemy.hp - 4);
        addFloatText('-4 ⏳沙漏', 'damage', 70, 45);
      }

      setEnemy(currentEnemy);
      setPlayer((prev) => ({
        ...prev,
        hp: updatedPlayerHp,
        block: updatedPlayerBlock,
        energy: prev.maxEnergy,
        drawPile: drawn.draw,
        discardPile: drawn.discard,
        hand: drawn.hand,
        statusEffects: {
          ...prev.statusEffects,
          weak: newPlayerWeak,
          vulnerable: newPlayerVuln,
        },
      }));

      setIsPlayerTurn(true);
    }, 800);
  };

  // REWARD CLAIMS
  const handleClaimGold = () => {
    setPlayer((prev) => ({ ...prev, gold: prev.gold + rewardGold }));
    setGoldClaimed(true);
  };

  const handlePickCard = (card: Card) => {
    setPlayer((prev) => ({ ...prev, deck: [...prev.deck, card] }));
    setCardPicked(true);
  };

  const handleContinueAfterReward = () => {
    setScreen('map');
  };

  // RESTART RUN
  const handleRestart = () => {
    setFloors(generateActMap(15));
    setCurrentFloor(0);
    setCurrentNodeId(null);
    setPlayer({
      hp: 75,
      maxHp: 75,
      energy: 3,
      maxEnergy: 3,
      block: 0,
      gold: 99,
      statusEffects: {
        strength: 0,
        weak: 0,
        vulnerable: 0,
        poison: 0,
        dexterity: 0,
      },
      deck: getStarterDeck(),
      drawPile: [],
      hand: [],
      discardPile: [],
      exhaustPile: [],
      relics: [STARTER_RELIC],
    });
    setScreen('map');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top Bar Status */}
      <TopBar
        player={player}
        currentFloor={currentFloor}
        floorType={
          screen === 'battle' ? (enemy?.isBoss ? '领主战斗' : enemy?.isElite ? '精英战斗' : '怪物战斗')
          : screen === 'rest' ? '营火休息'
          : screen === 'shop' ? '商贩'
          : '爬塔路标'
        }
        onOpenDeck={() => setShowDeck(true)}
        onOpenLexicon={() => setShowLexicon(true)}
        onOpenMap={screen !== 'map' && screen !== 'gameover' && screen !== 'victory' ? () => setScreen('map') : undefined}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          sound.enabled = next;
          sound.speechEnabled = next;
          setSoundEnabled(next);
        }}
      />

      {/* MAIN SCREEN SWITCHER */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {screen === 'map' && (
          <MapView
            floors={floors}
            currentFloor={currentFloor}
            currentNodeId={currentNodeId}
            onSelectNode={handleSelectMapNode}
          />
        )}

        {screen === 'battle' && enemy && (
          <BattleView
            player={player}
            enemy={enemy}
            onPlayCard={handlePlayCard}
            onEndTurn={handleEndTurn}
            isPlayerTurn={isPlayerTurn}
            floatTexts={floatTexts}
            onOpenDeckList={(cards, title) => setCustomDeckView({ cards, title })}
          />
        )}

        {screen === 'rest' && (
          <RestSiteView
            player={player}
            onRest={() => {
              const heal = Math.floor(player.maxHp * 0.3);
              setPlayer((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + heal) }));
            }}
            onUpgradeCard={(cardId) => {
              setPlayer((prev) => ({
                ...prev,
                deck: prev.deck.map((c) => (c.id === cardId ? { ...c, isUpgraded: true } : c)),
              }));
            }}
            onLeave={() => setScreen('map')}
          />
        )}

        {screen === 'shop' && (
          <ShopView
            player={player}
            onBuyCard={(card, cost) => {
              setPlayer((prev) => ({
                ...prev,
                gold: prev.gold - cost,
                deck: [...prev.deck, card],
              }));
            }}
            onBuyRelic={(relic, cost) => {
              setPlayer((prev) => ({
                ...prev,
                gold: prev.gold - cost,
                relics: [...prev.relics, relic],
              }));
            }}
            onRemoveCard={(cardId, cost) => {
              setPlayer((prev) => ({
                ...prev,
                gold: prev.gold - cost,
                deck: prev.deck.filter((c) => c.id !== cardId),
              }));
            }}
            onLeave={() => setScreen('map')}
          />
        )}
      </div>

      {/* REWARD MODAL */}
      {screen === 'reward' && (
        <RewardModal
          goldReward={rewardGold}
          onClaimGold={handleClaimGold}
          goldClaimed={goldClaimed}
          onPickCard={handlePickCard}
          cardPicked={cardPicked}
          onContinue={handleContinueAfterReward}
        />
      )}

      {/* GAME OVER & VICTORY MODALS */}
      {(screen === 'gameover' || screen === 'victory') && (
        <GameOverModal
          isVictory={screen === 'victory'}
          floor={currentFloor}
          gold={player.gold}
          deckCount={player.deck.length}
          onRestart={handleRestart}
          onOpenLexicon={() => setShowLexicon(true)}
        />
      )}

      {/* LEXICON & SRS MISTAKE BOOK MODAL */}
      {showLexicon && (
        <LexiconModal
          deckCards={player.deck}
          onClose={() => setShowLexicon(false)}
          onPracticeReward={(earnedGold) => {
            setPlayer((prev) => ({ ...prev, gold: prev.gold + earnedGold }));
          }}
        />
      )}

      {/* FULL DECK MODAL */}
      {showDeck && (
        <DeckModal
          cards={player.deck}
          title="我的完整词汇卡组 (My Full Deck)"
          onClose={() => setShowDeck(false)}
        />
      )}

      {/* CUSTOM DECK/DISCARD VIEW MODAL */}
      {customDeckView && (
        <DeckModal
          cards={customDeckView.cards}
          title={customDeckView.title}
          onClose={() => setCustomDeckView(null)}
        />
      )}
    </div>
  );
};

export default App;
