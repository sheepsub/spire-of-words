import React, { useState, useCallback, useRef } from 'react';
import type { 
  Player, 
  Enemy, 
  Card, 
  MapNode, 
  GameScreen, 
  FloatText 
} from './types/game';
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
import { TitleView } from './components/TitleView';
import { CharacterSelectView } from './components/CharacterSelectView';
import { GameOverModal } from './components/GameOverModal';
import { RotatePrompt } from './components/RotatePrompt';
import { DEFAULT_CHARACTER, type CharacterDefinition } from './data/characters';

export const App: React.FC = () => {
  // Master Game State - Starts at Title Screen (Main Menu)
  const [screen, setScreen] = useState<GameScreen>('title');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isVirtualLandscape, setIsVirtualLandscape] = useState(false);
  
  // Selected Character & Archetype
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDefinition>(DEFAULT_CHARACTER);
  
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
    characterId: DEFAULT_CHARACTER.id,
    characterName: DEFAULT_CHARACTER.name,
    characterAvatar: DEFAULT_CHARACTER.avatarSprite,
    hp: DEFAULT_CHARACTER.hp,
    maxHp: DEFAULT_CHARACTER.maxHp,
    energy: DEFAULT_CHARACTER.energy,
    maxEnergy: DEFAULT_CHARACTER.energy,
    block: 0,
    gold: DEFAULT_CHARACTER.gold,
    statusEffects: {
      strength: 0,
      weak: 0,
      vulnerable: 0,
      poison: 0,
      dexterity: 0,
    },
    deck: DEFAULT_CHARACTER.getStarterDeck(),
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    relics: [DEFAULT_CHARACTER.starterRelic],
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

  // Combat Relic tracking refs
  const cardsPlayedThisTurnRef = useRef<number>(0);
  const scholarTriggeredRef = useRef<boolean>(false);

  // START COMBAT
  const startCombat = useCallback((floorNum: number) => {
    const newEnemy = getRandomMonster(floorNum);
    const hasAnchor = player.relics.some((r) => r.id === 'anchor');
    const hasVajra = player.relics.some((r) => r.id === 'vajra');
    const hasLexicon = player.relics.some((r) => r.id === 'oxford_lexicon');
    const hasFlask = player.relics.some((r) => r.id === 'toxic_flask');
    const hasPaladinAegis = player.relics.some((r) => r.id === 'iron_aegis');
    const hasBabylonKey = player.relics.some((r) => r.id === 'babylon_key');
    const hasDragonBanner = player.relics.some((r) => r.id === 'dragon_witch_banner');

    cardsPlayedThisTurnRef.current = 0;
    scholarTriggeredRef.current = false;

    // Relic: Toxic Flask (3 poison, 1 weak at combat start)
    if (hasFlask) {
      newEnemy.statusEffects.poison += 3;
      newEnemy.statusEffects.weak += 1;
    }

    const startingBlock = (hasAnchor ? 10 : 0) + (hasPaladinAegis ? 8 : 0);

    // Shuffle full deck into draw pile
    const initialDrawPile = [...player.deck].sort(() => Math.random() - 0.5);
    const { draw, discard, hand } = drawCards(5, initialDrawPile, [], []);

    setEnemy(newEnemy);
    setIsPlayerTurn(true);
    setBattleTurn(1);

    setPlayer((prev) => ({
      ...prev,
      energy: prev.maxEnergy + (hasLexicon ? 1 : 0),
      block: startingBlock,
      drawPile: draw,
      discardPile: discard,
      hand: hand,
      exhaustPile: [],
      statusEffects: {
        strength: (hasVajra ? 1 : 0) + (hasBabylonKey ? 2 : 0),
        weak: 0,
        vulnerable: 0,
        poison: 0,
        dexterity: 0,
      },
    }));

    if (hasAnchor) {
      addFloatText('+10 🛡️ 船锚护体', 'block', 25, 45);
    }
    if (hasPaladinAegis) {
      setTimeout(() => addFloatText('+8 🛡️ 理想之城', 'block', 25, 45), 250);
    }
    if (hasFlask) {
      setTimeout(() => addFloatText('🧪 妄想毒身: 3剧毒 1虚弱', 'debuff', 70, 38), 450);
    }
    if (hasBabylonKey) {
      setTimeout(() => addFloatText('+2 力量 👑 王之财宝', 'buff', 25, 38), 350);
    }
    if (hasDragonBanner) {
      setTimeout(() => addFloatText('🚩 邪龙之怒启动', 'buff', 25, 45), 350);
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

    // 0. HP SACRIFICE (Jeanne Alter)
    if (card.hpCost) {
      updatedPlayerHp = Math.max(1, updatedPlayerHp - card.hpCost);
      addFloatText(`-${card.hpCost} 🩸 鲜血献祭`, 'damage', 25, 45);
    }

    // 1. DAMAGE CALCULATION
    if (baseDmg !== undefined || card.bodySlam) {
      sound.playSlash();
      if (!isCritical) {
        addFloatText('⚠️ 咏唱失误! 威力衰减 50%', 'miss', 70, 30);
      }

      // Gilgamesh: Gate of Babylon (Gold Scaling)
      let effectiveHits = hits;
      if (card.goldScaling) {
        const bonusHits = Math.floor(player.gold / 50);
        effectiveHits += bonusHits;
        if (bonusHits > 0) {
          addFloatText(`👑 黄金律追加 +${bonusHits}段!`, 'buff', 25, 30);
        }
      }

      // Saber: Mana Burst (Reverberate on Critical)
      if (card.reverberateOnCritical && isCritical) {
        effectiveHits *= 2;
        addFloatText('⚡ 魔力回响! 剑气连击翻倍', 'buff', 25, 30);
      }

      for (let h = 0; h < effectiveHits; h++) {
        let dmg = (baseDmg || 0) + player.statusEffects.strength;

        // Mash: Shield Slam (Body Slam)
        if (card.bodySlam) {
          dmg += player.block;
        }

        // Jeanne Alter: Blood for Blood (Frenzy: if HP <= 50%, 2x damage)
        if (card.bloodForBlood && player.hp <= Math.floor(player.maxHp * 0.5)) {
          dmg = Math.floor(dmg * 2);
          if (h === 0) {
            addFloatText('🩸 绝境反击! 伤害翻倍', 'buff', 25, 35);
          }
        }

        // Tohsaka Rin: Finisher (Bonus damage per card played this turn)
        if (card.finisher) {
          const finBonus = (card.finisherBonus || 4) * cardsPlayedThisTurnRef.current;
          dmg += finBonus;
          if (h === 0 && finBonus > 0) {
            addFloatText(`💎 连击终结 +${finBonus}`, 'buff', 25, 35);
          }
        }

        // Gilgamesh: Babylon Key (Gold >= 60 adds +3 piercing damage)
        const hasBabylonKey = player.relics.some((r) => r.id === 'babylon_key');
        if (hasBabylonKey && player.gold >= 60) {
          dmg += 3;
        }

        // Jeanne Alter: Dragon Witch Banner (Frenzy: if HP <= 50%, 1.5x damage)
        const hasDragonBanner = player.relics.some((r) => r.id === 'dragon_witch_banner');
        if (hasDragonBanner && player.hp <= Math.floor(player.maxHp * 0.5)) {
          dmg = Math.floor(dmg * 1.5);
        }

        if (player.statusEffects.weak > 0) dmg = Math.floor(dmg * 0.75);

        // Vulnerable on enemy (standard 1.5x, or Saber Excalibur 3x)
        if (enemy.statusEffects.vulnerable > 0) {
          const mult = card.vulnerableMultiplier || 1.5;
          dmg = Math.floor(dmg * mult);
        }

        if (isCritical) {
          const hasRing = player.relics.some((r) => r.id === 'mnemonic_ring');
          dmg = Math.floor(dmg * (hasRing ? 1.8 : 1.5));
        } else {
          // Weakened damage on wrong answer (50%)
          dmg = Math.max(1, Math.floor(dmg * 0.5));
        }

        // Gilgamesh: Enuma Elish (Pierce Block - bypass enemy block directly)
        if (card.pierceBlock) {
          updatedEnemyHp = Math.max(0, updatedEnemyHp - dmg);
          addFloatText(
            isCritical ? `-${dmg} ⚡乖离真伤!` : `-${dmg} (弱化 50%)`,
            isCritical ? 'critical' : 'damage',
            70 + Math.random() * 8,
            45
          );
        } else {
          // Normal: apply against enemy block first
          if (updatedEnemyBlock >= dmg) {
            updatedEnemyBlock -= dmg;
            addFloatText(`-${dmg} 🛡️`, 'block', 70 + Math.random() * 8, 45);
          } else {
            const rem = dmg - updatedEnemyBlock;
            updatedEnemyBlock = 0;
            updatedEnemyHp = Math.max(0, updatedEnemyHp - rem);
            addFloatText(
              isCritical ? `-${rem} ⚡暴击!` : `-${rem} (弱化 50%)`, 
              isCritical ? 'critical' : 'damage', 
              70 + Math.random() * 8, 
              45
            );
          }
        }
      }
    }

    // 2. BLOCK CALCULATION & REFLECTION
    if (baseBlk !== undefined) {
      sound.playBlock();
      let blk = baseBlk + player.statusEffects.dexterity;
      if (isCritical) {
        blk = Math.floor(blk * 1.5);
      } else {
        // Weakened block on wrong answer (50%)
        blk = Math.floor(blk * 0.5);
      }
      updatedPlayerBlock += blk;
      addFloatText(isCritical ? `+${blk} 🛡️` : `+${blk} 🛡️(弱化 50%)`, 'block', 25, 45);

      // Mash: Lord Camelot Reflection Damage
      if (card.reflectionDamage && blk > 0) {
        if (updatedEnemyBlock >= blk) {
          updatedEnemyBlock -= blk;
          addFloatText(`-${blk} 🛡️ 理想城反震`, 'block', 70, 45);
        } else {
          const rem = blk - updatedEnemyBlock;
          updatedEnemyBlock = 0;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - rem);
          addFloatText(`-${rem} 🛡️ 理想之城反震!`, 'damage', 70, 45);
        }
      }
    }

    // 3. STATUS DEBUFFS & BUFFS
    const newEnemyStatus = { ...enemy.statusEffects };
    const effectiveVuln = vuln ? (isCritical ? vuln : Math.max(0, Math.floor(vuln * 0.5))) : 0;
    const effectiveWeak = weak ? (isCritical ? weak : Math.max(0, Math.floor(weak * 0.5))) : 0;
    const effectivePoison = poison ? (isCritical ? poison : Math.max(0, Math.floor(poison * 0.5))) : 0;

    if (effectiveVuln > 0) {
      newEnemyStatus.vulnerable += effectiveVuln;
      addFloatText(`+${effectiveVuln} 易伤`, 'debuff', 70, 38);
    }
    if (effectiveWeak > 0) {
      newEnemyStatus.weak += effectiveWeak;
      addFloatText(`+${effectiveWeak} 虚弱`, 'debuff', 70, 38);
    }
    if (effectivePoison > 0) {
      newEnemyStatus.poison += effectivePoison;
      addFloatText(`+${effectivePoison} 🧪中毒`, 'debuff', 70, 38);
    }

    // Hassan: Catalyst (doubles poison)
    if ((card.catalyst || card.id.includes('catalyst')) && newEnemyStatus.poison > 0) {
      newEnemyStatus.poison *= 2;
      addFloatText(`🧪 剧毒催化翻倍! ${newEnemyStatus.poison}层`, 'debuff', 70, 38);
    }

    // Mash: Metallicize (Fortress Guard)
    let newPlayerMetallicize = player.statusEffects.metallicize || 0;
    if (card.id.includes('fortress_guard')) {
      const blkGain = card.isUpgraded ? 9 : 6;
      newPlayerMetallicize += blkGain;
      addFloatText(`+${blkGain} 🛡️/回合 坚壁金属化`, 'buff', 25, 38);
    }

    // Tohsaka Rin: Jewel Sword (Card draw on attack)
    let newPlayerCardDrawOnAttack = player.statusEffects.cardDrawOnAttack || 0;
    if (card.cardDrawOnAttack) {
      newPlayerCardDrawOnAttack += 1;
      addFloatText('💎 宝石剑刻印: 攻击抽牌+1', 'buff', 25, 38);
    }

    // Draw on attack trigger from Jewel Sword
    let jewelSwordDraw = 0;
    if (card.type === 'attack' && (player.statusEffects.cardDrawOnAttack || 0) > 0) {
      jewelSwordDraw = player.statusEffects.cardDrawOnAttack!;
      addFloatText(`+${jewelSwordDraw} 抽牌 宝石剑`, 'buff', 25, 25);
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

    // Gilgamesh: Golden Rule & Treasury Shield gold gain
    let updatedPlayerGold = player.gold;
    if (card.goldGain) {
      updatedPlayerGold += card.goldGain;
      sound.playGold();
      addFloatText(`+${card.goldGain} 🪙 黄金律`, 'buff', 25, 38);
    }

    // Relic: Feather Quill (词汇回忆暴击获得 2 金币)
    if (isCritical) {
      const hasQuill = player.relics.some((r) => r.id === 'feather_quill');
      if (hasQuill) {
        updatedPlayerGold += 2;
        addFloatText('+2 🪙 羽毛笔', 'buff', 25, 38);
      }
    }

    // Relic: Scholar Scroll (首次打出词根牌抽1张牌并施加1层易伤)
    const hasScholarScroll = player.relics.some((r) => r.id === 'scholar_scroll');
    const isRootCard = card.archetype === 'root' || !!card.prefix || !!card.rootWord;
    let scholarDraw = 0;
    if (hasScholarScroll && isRootCard && !scholarTriggeredRef.current) {
      scholarTriggeredRef.current = true;
      scholarDraw = 1;
      newEnemyStatus.vulnerable += 1;
      addFloatText('📜 学士羊皮卷: 抽1牌 + 易伤!', 'buff', 25, 30);
    }

    // Relic: Resonance Tuning Fork (单回合每打出第 3 张牌返还 1 点能量并抽 1 张牌)
    cardsPlayedThisTurnRef.current += 1;
    const hasTuningFork = player.relics.some((r) => r.id === 'tuning_fork');
    let forkDraw = 0;
    if (hasTuningFork && cardsPlayedThisTurnRef.current % 3 === 0) {
      currentEnergy += 1;
      forkDraw = 1;
      addFloatText('🎵 灵弦共鸣: +1⚡ +抽1牌!', 'buff', 25, 25);
    }

    // 4. DRAW EXTRA CARDS
    let curDraw = player.drawPile;
    let curDiscard = player.discardPile;
    let curHand = player.hand.filter((c) => c.id !== card.id);

    const totalDraw = (drawNum || 0) + scholarDraw + forkDraw + jewelSwordDraw;
    if (totalDraw > 0) {
      const drawn = drawCards(totalDraw, curDraw, curDiscard, curHand);
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
      gold: updatedPlayerGold,
      deck: updatedDeck,
      hand: curHand,
      drawPile: curDraw,
      discardPile: curDiscard,
      statusEffects: {
        ...prev.statusEffects,
        strength: newPlayerStrength,
        metallicize: newPlayerMetallicize,
        cardDrawOnAttack: newPlayerCardDrawOnAttack,
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
          let baseReward = Math.floor(Math.random() * 15) + 15;
          const hasBabylonKey = player.relics.some((r) => r.id === 'babylon_key');
          if (hasBabylonKey) {
            baseReward = Math.floor(baseReward * 1.5);
          }
          setRewardGold(baseReward);
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
    cardsPlayedThisTurnRef.current = 0;

    // 1. Move hand to discard pile (keeping cards with retainCard)
    const retainedHand = player.hand.filter((c) => c.retainCard);
    const discardedHand = player.hand.filter((c) => !c.retainCard);
    let nextDiscard = [...player.discardPile, ...discardedHand];
    let nextDraw = [...player.drawPile];

    // 2. Resolve Enemy Intent
    setTimeout(() => {
      if (enemy.hp <= 0) return;

      let currentEnemy = { ...enemy };
      let updatedPlayerHp = player.hp;
      let remainingBlock = player.block;

      // Enemy Attack
      if (currentEnemy.intent.type === 'attack' && currentEnemy.intent.value) {
        sound.playEnemyHit();
        const times = currentEnemy.intent.times || 1;
        for (let t = 0; t < times; t++) {
          let dmg = currentEnemy.intent.value + currentEnemy.statusEffects.strength;
          if (currentEnemy.statusEffects.weak > 0) dmg = Math.floor(dmg * 0.75);
          if (player.statusEffects.vulnerable > 0) dmg = Math.floor(dmg * 1.5);

          if (remainingBlock >= dmg) {
            // Block absorbed
            remainingBlock -= dmg;
            addFloatText(`-${dmg} 🛡️`, 'block', 25, 45);
          } else {
            const unblocked = dmg - remainingBlock;
            remainingBlock = 0;
            updatedPlayerHp = Math.max(0, updatedPlayerHp - unblocked);
            addFloatText(`-${unblocked}`, 'damage', 25, 45);
          }

          // Relic: Dragon Witch Banner (Jeanne Alter 反伤)
          const hasDragonBanner = player.relics.some((r) => r.id === 'dragon_witch_banner');
          if (hasDragonBanner && currentEnemy.hp > 0) {
            currentEnemy.hp = Math.max(0, currentEnemy.hp - 4);
            addFloatText('-4 🚩 邪龙逆火!', 'damage', 70, 45);
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

      // Draw cards (retaining retainedHand)
      const drawn = drawCards(5, nextDraw, nextDiscard, retainedHand);

      // Relic: Hourglass (deals 4 damage to enemy at start of player turn)
      const hasHourglass = player.relics.some((r) => r.id === 'ebbinghaus_glass');
      if (hasHourglass && currentEnemy.hp > 0) {
        currentEnemy.hp = Math.max(0, currentEnemy.hp - 4);
        addFloatText('-4 ⏳沙漏', 'damage', 70, 45);
      }

      // Relic: Paladin Aegis (回合结束保留50%剩余护甲)
      const hasPaladinAegis = player.relics.some((r) => r.id === 'iron_aegis');
      let updatedPlayerBlock = hasPaladinAegis ? Math.floor(remainingBlock * 0.5) : 0;
      if (updatedPlayerBlock > 0) {
        addFloatText(`🛡️ 坚城保留: ${updatedPlayerBlock}护甲`, 'block', 25, 45);
      }

      // Metallicize (Mash: Fortress Guard)
      const metallicizeAmt = player.statusEffects.metallicize || 0;
      if (metallicizeAmt > 0) {
        updatedPlayerBlock += metallicizeAmt;
        addFloatText(`+${metallicizeAmt} 🛡️ 金属要塞`, 'block', 25, 45);
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

  // START RUN WITH CHARACTER
  const startRunWithCharacter = (char: CharacterDefinition) => {
    setSelectedCharacter(char);
    setFloors(generateActMap(15));
    setCurrentFloor(0);
    setCurrentNodeId(null);
    setPlayer({
      characterId: char.id,
      characterName: char.name,
      characterAvatar: char.avatarSprite,
      hp: char.hp,
      maxHp: char.maxHp,
      energy: char.energy,
      maxEnergy: char.energy,
      block: 0,
      gold: char.gold,
      statusEffects: {
        strength: 0,
        weak: 0,
        vulnerable: 0,
        poison: 0,
        dexterity: 0,
      },
      deck: char.getStarterDeck(),
      drawPile: [],
      hand: [],
      discardPile: [],
      exhaustPile: [],
      relics: [char.starterRelic],
    });
    setScreen('map');
  };

  // RESTART RUN
  const handleRestart = () => {
    startRunWithCharacter(selectedCharacter);
  };

  // Switch character preview & synchronize player deck/stats immediately
  const handleSwitchCharacter = (char: CharacterDefinition) => {
    setSelectedCharacter(char);
    setPlayer((prev) => ({
      ...prev,
      characterId: char.id,
      characterName: char.name,
      characterAvatar: char.avatarSprite,
      hp: char.hp,
      maxHp: char.maxHp,
      energy: char.energy,
      maxEnergy: char.energy,
      block: 0,
      gold: char.gold,
      deck: char.getStarterDeck(),
      drawPile: [],
      hand: [],
      discardPile: [],
      relics: [char.starterRelic],
    }));
  };

  return (
    <div 
      className={isVirtualLandscape ? 'force-virtual-landscape' : ''}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Mobile Portrait Detection & Force Landscape Helper */}
      <RotatePrompt 
        isVirtualLandscape={isVirtualLandscape}
        onToggleVirtualLandscape={() => setIsVirtualLandscape(prev => !prev)}
      />

      {/* Top Bar Status - Hidden on Title and Character Select Screens */}
      {screen !== 'title' && screen !== 'char_select' && (
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
          onReturnToMenu={() => setScreen('title')}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            sound.enabled = next;
            sound.speechEnabled = next;
            setSoundEnabled(next);
          }}
        />
      )}

      {/* MAIN SCREEN SWITCHER */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {screen === 'title' && (
          <TitleView
            onStartGame={() => startRunWithCharacter(selectedCharacter)}
            onOpenCharacterSelect={() => setScreen('char_select')}
            onResumeRun={() => setScreen('map')}
            hasActiveRun={currentFloor > 0}
            currentFloor={currentFloor}
            onOpenLexicon={() => setShowLexicon(true)}
            onOpenDeck={() => setShowDeck(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              const next = !soundEnabled;
              sound.enabled = next;
              sound.speechEnabled = next;
              setSoundEnabled(next);
            }}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={handleSwitchCharacter}
          />
        )}

        {screen === 'char_select' && (
          <CharacterSelectView
            initialCharacterId={selectedCharacter.id}
            onPreviewCharacter={handleSwitchCharacter}
            onSelectCharacter={(char) => {
              handleSwitchCharacter(char);
              startRunWithCharacter(char);
            }}
            onBackToTitle={() => setScreen('title')}
          />
        )}

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
          characterId={player.characterId}
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
