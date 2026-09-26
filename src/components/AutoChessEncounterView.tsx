import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { 
  ActiveChessUnit, 
  ChessShopCard, 
  SynergyId, 
  EffectCard 
} from '../types/autoChess';
import type { Player, Enemy } from '../types/game';
import { CHESS_PIECES, SYNERGIES } from '../data/autoChessData';
import { EffectCardItem } from './EffectCardItem';
import { sound } from '../utils/audio';
import { avFromSpeed, applyAdvance, applyDelay, applyInsert, initTimeline, step, AV_PER_SECOND } from '../utils/actionTimeline';
import { ActionBar } from './ActionBar';
import confetti from 'canvas-confetti';
import { PixelIcon } from './PixelIcon';

/** 战斗循环的 tick 间隔（毫秒）。每 tick 推进 AV_PER_SECOND × TICK_MS/1000 点行动值 */
const TICK_MS = 100;

interface AutoChessEncounterViewProps {
  player: Player;
  enemy: Enemy;
  floor: number;
  board: (ActiveChessUnit | null)[];
  bench: (ActiveChessUnit | null)[];
  effectHand: EffectCard[];
  level: number;
  xp: number;
  onUpdateBoard: (board: (ActiveChessUnit | null)[], bench: (ActiveChessUnit | null)[]) => void;
  onUpdateEffectHand?: (hand: EffectCard[]) => void;
  onUpdateGold: (updater: (prev: number) => number) => void;
  onUpdatePlayerHp: (newHp: number) => void;
  onVictory: (bountyGold: number) => void;
  onDefeat: (damageTaken: number) => void;
  onReturnToMenu?: () => void;
  onOpenMap?: () => void;
  onOpenDeck?: () => void;
}

export const AutoChessEncounterView: React.FC<AutoChessEncounterViewProps> = ({
  player,
  enemy,
  floor,
  board,
  bench,
  effectHand,
  level: initialLevel,
  xp: initialXp,
  onUpdateBoard,
  onUpdateGold,
  onUpdatePlayerHp,
  onVictory,
  onDefeat,
  onReturnToMenu,
  onOpenMap,
  onOpenDeck,
}) => {
  // Local active combat board states
  const [activeBoard, setActiveBoard] = useState<(ActiveChessUnit | null)[]>(board);
  const [activeBench, setActiveBench] = useState<(ActiveChessUnit | null)[]>(bench);
  const [enemyBoard, setEnemyBoard] = useState<(ActiveChessUnit | null)[]>(new Array(8).fill(null));
  const enemyBoardRef = useRef<(ActiveChessUnit | null)[]>(enemyBoard);
  useEffect(() => {
    enemyBoardRef.current = enemyBoard;
  }, [enemyBoard]);

  // Keep a persistent copy of the board before combat to restore all units with full HP after combat
  const preCombatBoardRef = useRef<(ActiveChessUnit | null)[]>(board);

  // Player Population Level & XP
  const [chessLevel, setChessLevel] = useState<number>(initialLevel || 3);
  const [chessXp, setChessXp] = useState<number>(initialXp || 0);

  // Tactical Energy (战术能量, 0 to 4)
  const [tacticalEnergy, setTacticalEnergy] = useState<number>(3);
  const [maxTacticalEnergy] = useState<number>(4);

  // Economy & Shop
  const [shopCards, setShopCards] = useState<ChessShopCard[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<ActiveChessUnit | null>(null);
  const [bountyEarned, setBountyEarned] = useState<number>(0);

  // Combat Phase
  const [isCombatPhase, setIsCombatPhase] = useState<boolean>(false);
  const [combatOutcome, setCombatOutcome] = useState<'win' | 'lose' | null>(null);
  // 当前正在行动的单位，用于行动条高亮
  const [currentActorId, setCurrentActorId] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<{ id: string; text: string; x: number; y: number; color: string }[]>([]);

  // Tactical Spell Visual Banner
  const [activeSpellVisual, setActiveSpellVisual] = useState<{
    id: string;
    text: string;
    color: string;
  } | null>(null);

  // Sync props to state if not in combat
  useEffect(() => {
    if (!isCombatPhase) {
      setActiveBoard(board);
      setActiveBench(bench);
    }
  }, [board, bench, isCombatPhase]);

  // Floating text spawner
  const addFloatText = (text: string, x: number, y: number, color = '#ef4444') => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 1100);
  };

  // Helper to create enemy minion
  function createEnemyMinion(name: string, stars: number, slot: number, hp: number, atk: number, def: number, range = 1): ActiveChessUnit {
    return {
      instanceId: `minion_${slot}_${Date.now()}`,
      configId: 'minion',
      name,
      avatar: enemy.image || enemy.avatar || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/105.gif',
      cost: 1,
      stars,
      hp,
      maxHp: hp,
      mana: 0,
      maxMana: 100,
      atk,
      def,
      spd: 95,
      av: avFromSpeed(95),
      range,
      synergies: [],
      skillName: '魔物猛击',
      skillDesc: '蓄力猛冲撕咬目标',
      slot,
      isBench: false,
      isEnemy: true,
    };
  }

  // Generate Enemy Chess Team based on the Spire Encounter & Floor
  const generateEncounterEnemies = () => {
    const newEnemyBoard = new Array(8).fill(null);
    const isBoss = enemy.isBoss || floor % 15 === 0;
    const isElite = enemy.isElite;
    const enemyImg = enemy.image || enemy.avatar;

    if (isBoss) {
      // Boss Encounter: 1 Giant Boss + 3 Minions
      newEnemyBoard[1] = {
        instanceId: `boss_${enemy.id}`,
        configId: 'boss',
        name: enemy.name,
        avatar: enemyImg,
        cost: 5,
        stars: 3,
        hp: Math.max(350, enemy.hp * 2),
        maxHp: Math.max(350, enemy.maxHp * 2),
        mana: 20,
        maxMana: 100,
        atk: 55 + floor * 3,
        def: 30 + floor * 2,
        spd: 100,
        av: avFromSpeed(100),
        range: 1,
        synergies: [],
        skillName: '破灭灾厄',
        skillDesc: '对全屏敌军造成巨额爆发伤害',
        slot: 1,
        isBench: false,
        isEnemy: true,
      };
      newEnemyBoard[4] = createEnemyMinion('暗黑术士', 2, 4, 180 + floor * 10, 35, 10, 2);
      newEnemyBoard[6] = createEnemyMinion('狂暴卫兵', 2, 6, 260 + floor * 15, 28, 18, 1);
    } else if (isElite) {
      // Elite Encounter: 1 Elite + 2 Minions
      newEnemyBoard[1] = {
        instanceId: `elite_${enemy.id}`,
        configId: 'elite',
        name: enemy.name,
        avatar: enemyImg,
        cost: 4,
        stars: 2,
        hp: Math.max(220, enemy.hp * 1.5),
        maxHp: Math.max(220, enemy.maxHp * 1.5),
        mana: 30,
        maxMana: 100,
        atk: 42 + floor * 2,
        def: 22 + floor,
        spd: 105,
        av: avFromSpeed(105),
        range: 1,
        synergies: [],
        skillName: '狂怒战吼',
        skillDesc: '激发凶暴血气提升全军伤害',
        slot: 1,
        isBench: false,
        isEnemy: true,
      };
      newEnemyBoard[5] = createEnemyMinion('尖塔小鬼', 2, 5, 140 + floor * 8, 26, 8, 2);
      newEnemyBoard[2] = createEnemyMinion('尖塔铁甲', 1, 2, 200 + floor * 10, 22, 16, 1);
    } else {
      // Normal Encounter: 2-3 standard monsters
      newEnemyBoard[1] = {
        instanceId: `mob_${enemy.id}_1`,
        configId: 'mob1',
        name: enemy.name,
        avatar: enemyImg,
        cost: 2,
        stars: 1,
        hp: Math.max(120, enemy.hp),
        maxHp: Math.max(120, enemy.maxHp),
        mana: 0,
        maxMana: 100,
        atk: 25 + floor * 2,
        def: 12 + floor,
        spd: 95,
        av: avFromSpeed(95),
        range: 1,
        synergies: [],
        skillName: '嗜血撕咬',
        skillDesc: '对单体造成重创',
        slot: 1,
        isBench: false,
        isEnemy: true,
      };
      newEnemyBoard[2] = createEnemyMinion('幼生甲虫', 1, 2, 100 + floor * 6, 20, 14, 1);
      if (floor > 2) {
        newEnemyBoard[5] = createEnemyMinion('暗影射手', 1, 5, 80 + floor * 5, 24, 6, 2);
      }
    }

    setEnemyBoard(newEnemyBoard);
  };

  // Generate 5 Chess Shop Options
  const generateShop = () => {
    const cards: ChessShopCard[] = [];
    for (let i = 0; i < 5; i++) {
      const piece = CHESS_PIECES[Math.floor(Math.random() * CHESS_PIECES.length)];
      cards.push({
        shopIndex: i,
        config: piece,
        cost: piece.cost,
        isDiscounted: false,
      });
    }
    setShopCards(cards);
  };

  // Setup initial encounter
  useEffect(() => {
    generateShop();
    generateEncounterEnemies();
    setBountyEarned(0);
  }, [floor, enemy]);

  // Helper to create unit instance from piece config
  function createUnitInstance(configId: string, slot: number, isBench: boolean, stars = 1): ActiveChessUnit {
    const config = CHESS_PIECES.find(c => c.id === configId) || CHESS_PIECES[0];
    const starMult = stars === 1 ? 1 : stars === 2 ? 1.8 : 3.2;
    return {
      instanceId: `unit_${config.id}_${Date.now()}_${Math.random()}`,
      configId: config.id,
      name: config.name,
      avatar: config.avatar,
      cost: config.cost,
      stars,
      hp: Math.round(config.baseHp * starMult),
      maxHp: Math.round(config.baseHp * starMult),
      mana: 0,
      maxMana: config.maxMana,
      atk: Math.round(config.baseAtk * starMult),
      def: Math.round(config.baseDef * starMult),
      spd: config.spd,
      av: avFromSpeed(config.spd),
      range: config.range,
      synergies: config.synergies,
      skillName: config.skillName,
      skillDesc: config.skillDesc,
      slot,
      isBench,
      isEnemy: false,
    };
  }

  // Check 3-in-1 Star Upgrade
  const checkStarUpgrade = (currentBoard: (ActiveChessUnit | null)[], currentBench: (ActiveChessUnit | null)[]) => {
    let modified = false;
    let nextBoard = [...currentBoard];
    let nextBench = [...currentBench];

    for (let targetStar = 1; targetStar <= 2; targetStar++) {
      const allUnits = [...nextBoard, ...nextBench].filter((u): u is ActiveChessUnit => u !== null && u.stars === targetStar);
      const counts: Record<string, ActiveChessUnit[]> = {};
      allUnits.forEach(u => {
        counts[u.configId] = counts[u.configId] || [];
        counts[u.configId].push(u);
      });

      for (const [cfgId, units] of Object.entries(counts)) {
        if (units.length >= 3) {
          const [u1, u2, u3] = units;
          const upgraded = createUnitInstance(cfgId, u1.slot, u1.isBench, targetStar + 1);
          sound.playDraw();
          confetti({ particleCount: 35, spread: 60 });
          addFloatText(`⭐ ⭐ ${upgraded.name} 升星晋级！`, 250, 180, '#fbbf24');

          if (u1.isBench) nextBench[u1.slot] = upgraded;
          else nextBoard[u1.slot] = upgraded;

          if (u2.isBench) nextBench[u2.slot] = null;
          else nextBoard[u2.slot] = null;

          if (u3.isBench) nextBench[u3.slot] = null;
          else nextBoard[u3.slot] = null;

          modified = true;
          break;
        }
      }
      if (modified) break;
    }

    if (modified) {
      setActiveBoard(nextBoard);
      setActiveBench(nextBench);
      onUpdateBoard(nextBoard, nextBench);
    }
  };

  // Buy Piece from Shop
  const handleBuyPiece = (shopCard: ChessShopCard) => {
    if (player.gold < shopCard.cost) {
      addFloatText('金币不足！', 200, 260, '#ef4444');
      return;
    }
    const emptySlot = activeBench.findIndex(s => s === null);
    if (emptySlot === -1) {
      addFloatText('备战席已满！', 200, 260, '#ef4444');
      return;
    }

    sound.playSelect();
    onUpdateGold(g => g - shopCard.cost);
    const newUnit = createUnitInstance(shopCard.config.id, emptySlot, true);
    const nextBench = [...activeBench];
    nextBench[emptySlot] = newUnit;
    setActiveBench(nextBench);
    onUpdateBoard(activeBoard, nextBench);

    setShopCards(prev => prev.filter(c => c.shopIndex !== shopCard.shopIndex));
    checkStarUpgrade(activeBoard, nextBench);
  };

  // Reroll Shop (2G)
  const handleRerollShop = () => {
    if (player.gold < 2) {
      addFloatText('金币不足 2G！', 160, 260, '#ef4444');
      return;
    }
    sound.playSelect();
    onUpdateGold(g => g - 2);
    generateShop();
  };

  // Buy XP (4G -> +4 XP)
  const handleBuyXp = () => {
    if (player.gold < 4) {
      addFloatText('金币不足 4G！', 160, 260, '#ef4444');
      return;
    }
    if (chessLevel >= 8) {
      addFloatText('已达最高人口上限 (8人)！', 160, 260, '#f59e0b');
      return;
    }
    sound.playSelect();
    onUpdateGold(g => g - 4);
    const newXp = chessXp + 4;
    const requiredXp = chessLevel * 4;
    if (newXp >= requiredXp) {
      setChessLevel(l => Math.min(8, l + 1));
      setChessXp(newXp - requiredXp);
      sound.playCritical();
      confetti({ particleCount: 25, spread: 50 });
      addFloatText(`👑 人口提升！现可上阵 ${chessLevel + 1} 人`, 200, 160, '#fbbf24');
    } else {
      setChessXp(newXp);
      addFloatText('+4 经验', 160, 240, '#38bdf8');
    }
  };

  // Move / Swap Unit on Board or Bench
  const handleSlotClick = (index: number, isBenchSlot: boolean) => {
    if (isCombatPhase) return;
    const currentList = isBenchSlot ? activeBench : activeBoard;
    const unit = currentList[index];

    if (!selectedUnit) {
      if (unit) setSelectedUnit(unit);
      return;
    }

    sound.playSelect();
    const nextBoard = [...activeBoard];
    const nextBench = [...activeBench];

    const sourceList = selectedUnit.isBench ? nextBench : nextBoard;
    const targetList = isBenchSlot ? nextBench : nextBoard;

    // Check population cap if bench -> board
    if (selectedUnit.isBench && !isBenchSlot && unit === null) {
      const activeCount = nextBoard.filter(u => u !== null).length;
      if (activeCount >= chessLevel) {
        addFloatText(`已达人口上限 (${chessLevel} 人)！购买经验升级人口`, 240, 260, '#f59e0b');
        setSelectedUnit(null);
        return;
      }
    }

    sourceList[selectedUnit.slot] = unit ? { ...unit, slot: selectedUnit.slot, isBench: selectedUnit.isBench } : null;
    targetList[index] = { ...selectedUnit, slot: index, isBench: isBenchSlot };

    setActiveBoard(nextBoard);
    setActiveBench(nextBench);
    onUpdateBoard(nextBoard, nextBench);
    setSelectedUnit(null);
    checkStarUpgrade(nextBoard, nextBench);
  };

  // Calculate Synergies
  const activeSynergies = useMemo(() => {
    const counts: Record<SynergyId, number> = {
      warrior: 0,
      guardian: 0,
      assassin: 0,
      mage: 0,
      sovereign: 0,
      necro: 0,
    };
    const seenConfigs = new Set<string>();
    activeBoard.forEach(u => {
      if (u && !seenConfigs.has(u.configId)) {
        seenConfigs.add(u.configId);
        u.synergies.forEach(syn => {
          counts[syn] = (counts[syn] || 0) + 1;
        });
      }
    });
    return counts;
  }, [activeBoard]);

  // Start Realtime Combat Simulation
  const handleStartCombat = () => {
    const activeUnits = activeBoard.filter(u => u !== null);
    if (activeUnits.length === 0) {
      addFloatText('请先安排至少 1 名棋子上阵！', 260, 260, '#ef4444');
      return;
    }

    sound.playSlash();

    // ============================================================
    // 羁绊改写开局行动条
    //   摆阵不再只是加数值 —— 凑齐的羁绊直接改写双方的行动值，
    //   也就是决定「谁先动手」。这是空间轴 → 时间轴的转换点。
    // ============================================================
    const nextBoard = activeBoard.map(u => (u ? { ...u } : null));
    const nextEnemy = enemyBoard.map(e => (e ? { ...e } : null));
    const allyUnits = nextBoard.filter((u): u is ActiveChessUnit => u !== null && u.hp > 0);
    const foeUnits = nextEnemy.filter((e): e is ActiveChessUnit => e !== null && e.hp > 0);

    // 先按速度铺好初始行动值
    initTimeline([...allyUnits, ...foeUnits]);

    const bondNotes: string[] = [];
    if ((activeSynergies.assassin || 0) >= 2) {
      allyUnits.forEach(u => applyAdvance(u, 0.3));
      bondNotes.push('🗡️ 幽冥刺客·抢跑');
    }
    if ((activeSynergies.guardian || 0) >= 2) {
      foeUnits.forEach(e => applyDelay(e, 0.25));
      bondNotes.push('🛡️ 重装坚壁·压阵');
    }
    if ((activeSynergies.mage || 0) >= 2) {
      allyUnits.forEach(u => { u.spd = Math.round(u.spd * 1.15); });
      bondNotes.push('⚡ 灵械魔导·超频');
    }

    setActiveBoard(nextBoard);
    setEnemyBoard(nextEnemy);

    // Cache current player formation with full HP & clean state for post-combat restoration
    preCombatBoardRef.current = nextBoard.map(u => u ? { ...u, hp: u.maxHp, mana: 0, isCastingSkill: false } : null);
    setIsCombatPhase(true);
    setCombatOutcome(null);
    setTacticalEnergy(3);

    if (bondNotes.length > 0) {
      addFloatText(`羁绊改轴：${bondNotes.join(' · ')}`, 240, 200, '#fbbf24');
    }
  };

  // Effect Card Click -> Directly Cast Instant Tactical Spell!
  const handleSelectEffectCard = (card: EffectCard) => {
    if (tacticalEnergy < card.cost) {
      addFloatText('战术能量不足！', 220, 260, '#ef4444');
      return;
    }
    executeEffectCard(card);
  };

  // Execute Effect Card on Board
  const executeEffectCard = (card: EffectCard) => {
    sound.playCritical();
    setTacticalEnergy(e => Math.max(0, e - card.cost));

    // Show visual spell banner
    setActiveSpellVisual({
      id: `spell_${Date.now()}`,
      text: `⚡ ${card.name}！`,
      color: card.color,
    });
    setTimeout(() => setActiveSpellVisual(null), 1600);

    // Apply specific effect to boards
    if (card.effectType === 'thunder_strike') {
      const dmg = 240;
      setEnemyBoard(prev => prev.map((e, idx) => {
        if (!e) return null;
        if (idx >= 4) { // Backline slots
          const newHp = Math.max(0, e.hp - dmg);
          addFloatText(`⚡ -${dmg}`, 360 + idx * 25, 140, '#38bdf8');
          return newHp <= 0 ? null : { ...e, hp: newHp };
        }
        return e;
      }));
    } else if (card.effectType === 'golden_aegis') {
      const shieldAmount = 300;
      setActiveBoard(prev => prev.map((u, idx) => {
        if (!u) return null;
        if (idx < 4) { // Frontline slots
          addFloatText(`🛡️ +${shieldAmount}`, 220 + idx * 35, 230, '#fbbf24');
          return { ...u, hp: Math.min(u.maxHp + shieldAmount, u.hp + shieldAmount) };
        }
        return u;
      }));
    } else if (card.effectType === 'berserk_fury') {
      addFloatText('🔥 战歌狂暴！攻速极限超频 +100%', 280, 200, '#ef4444');
      setActiveBoard(prev => prev.map(u => u ? { ...u, spd: Math.min(400, Math.round(u.spd * 2)), av: u.av / 2 } : null));
    } else if (card.effectType === 'mana_surge') {
      addFloatText('🌊 法力潮汐！全员蓝量充盈', 280, 200, '#a855f7');
      setActiveBoard(prev => prev.map(u => u ? { ...u, mana: u.maxMana } : null));
    } else if (card.effectType === 'glacial_freeze') {
      setEnemyBoard(prev => {
        const sorted = [...prev].filter((e): e is ActiveChessUnit => e !== null).sort((a, b) => b.atk - a.atk);
        if (sorted.length > 0) {
          const target = sorted[0];
          addFloatText('❄️ 寒冰绝对封印！', 380, 160, '#67e8f9');
          return prev.map(e => e?.instanceId === target.instanceId ? { ...e, spd: Math.max(40, Math.round(e.spd / 2.5)), av: e.av * 2.5, mana: 0 } : e);
        }
        return prev;
      });
    } else if (card.effectType === 'rejuvenating_rain') {
      setActiveBoard(prev => prev.map(u => {
        if (!u) return null;
        const heal = Math.round(u.maxHp * 0.6);
        addFloatText(`💚 +${heal}`, 220 + u.slot * 30, 230, '#22c55e');
        return { ...u, hp: Math.min(u.maxHp, u.hp + heal) };
      }));
    } else if (card.effectType === 'meteor_cataclysm') {
      const dmg = 300;
      addFloatText('☄️ 焚世陨石天火！', 380, 150, '#f97316');
      setEnemyBoard(prev => prev.map(e => {
        if (!e) return null;
        const newHp = Math.max(0, e.hp - dmg);
        return newHp <= 0 ? null : { ...e, hp: newHp };
      }));
    } else if (card.effectType === 'bounty_harvest') {
      setBountyEarned(b => b + 8);
      addFloatText('💰 悬赏激活！战后额外 +8G', 280, 200, '#eab308');
    } else if (card.effectType === 'excalibur_blast') {
      const dmg = 380;
      addFloatText('⚔️ EXCALIBUR！誓约胜利之剑！', 340, 150, '#fef08a');
      setEnemyBoard(prev => prev.map(e => {
        if (!e) return null;
        const newHp = Math.max(0, e.hp - dmg);
        return newHp <= 0 ? null : { ...e, hp: newHp };
      }));
    } else if (card.effectType === 'haste_wind') {
      // 拉条：己方全体行动值前移
      const moved = activeBoard.filter(u => u && u.hp > 0).length;
      setActiveBoard(prev => prev.map(u => {
        if (!u || u.hp <= 0) return u;
        const next = { ...u };
        applyAdvance(next, 0.35);
        return next;
      }));
      addFloatText(`💨 疾风迅令！我方 ${moved} 名棋子整体前移`, 280, 200, '#7dd3fc');
      sound.playSelect();
    } else if (card.effectType === 'frost_seal') {
      // 推条：敌方全体行动值后移，压到行动条末端
      const pushed = enemyBoard.filter(e => e && e.hp > 0).length;
      setEnemyBoard(prev => prev.map(e => {
        if (!e || e.hp <= 0) return e;
        const next = { ...e };
        applyDelay(next, 0.8);
        return next;
      }));
      addFloatText(`🧊 霜封锁轴！敌方 ${pushed} 名被压在末端`, 300, 200, '#67e8f9');
      sound.playCritical();
    } else if (card.effectType === 'instant_strike') {
      // 插队：己方攻击力最高者无视行动条立刻行动
      const alive = activeBoard.filter((u): u is ActiveChessUnit => u !== null && u.hp > 0);
      if (alive.length > 0) {
        const ace = [...alive].sort((a, b) => b.atk - a.atk)[0];
        setActiveBoard(prev => prev.map(u => {
          if (!u || u.instanceId !== ace.instanceId) return u;
          const next = { ...u };
          applyInsert(next);
          return next;
        }));
        addFloatText(`⚔️ ${ace.name} 插队！无视行动条`, 300, 190, '#fca5a5');
        sound.playCritical();
      }
    }
  };

  // ============================================================
  // 行动值驱动的战斗循环（星穹铁道式排轴）
  //   每个 tick 按 spd 推进所有单位的行动值，归零者行动并重置 av。
  //   拉条 / 推条 / 插队 都是通过改写 av 来改变行动顺序。
  // ============================================================
  useEffect(() => {
    if (!isCombatPhase) return;

    const timer = setInterval(() => {
      // 战术能量缓慢自充
      setTacticalEnergy(e => Math.min(maxTacticalEnergy, e + 0.12));

      setActiveBoard(prevBoard => {
        const nextBoard = prevBoard.map(u => (u ? { ...u } : null));
        const nextEnemies = enemyBoardRef.current.map(e => (e ? { ...e } : null));

        const alivePlayerUnits = nextBoard.filter((u): u is ActiveChessUnit => u !== null && u.hp > 0);
        const aliveEnemies = nextEnemies.filter((e): e is ActiveChessUnit => e !== null && e.hp > 0);

        // Win check
        if (aliveEnemies.length === 0) {
          clearInterval(timer);
          setIsCombatPhase(false);
          setCombatOutcome('win');
          sound.playVictory();
          confetti({ particleCount: 75, spread: 90 });
          // Restore all units back to 100% HP for upcoming floors
          const restored = preCombatBoardRef.current.map(u => u ? { ...u, hp: u.maxHp, mana: 0, isCastingSkill: false } : null);
          onUpdateBoard(restored, activeBench);
          setTimeout(() => {
            onVictory(bountyEarned);
          }, 1500);
          return restored;
        }

        // Defeat check
        if (alivePlayerUnits.length === 0) {
          clearInterval(timer);
          setIsCombatPhase(false);
          setCombatOutcome('lose');
          sound.playDefeat();
          const damage = 8 + aliveEnemies.reduce((acc, curr) => acc + curr.stars * 2, 0);
          const restored = preCombatBoardRef.current.map(u => u ? { ...u, hp: u.maxHp, mana: 0, isCastingSkill: false } : null);
          onUpdateBoard(restored, activeBench);
          onUpdatePlayerHp(Math.max(0, player.hp - damage));
          onDefeat(damage);
          return restored;
        }

        // —— 推进时间轴：取出本 tick 内行动的单位 ——
        const actors = step(
          [...alivePlayerUnits, ...aliveEnemies],
          AV_PER_SECOND * (TICK_MS / 1000),
          u => u.hp > 0,
        );
        if (actors.length > 0) {
          setCurrentActorId(actors[actors.length - 1].instanceId);
        }

        for (const actor of actors) {
          if (actor.hp <= 0) continue;
          const isEnemy = !!actor.isEnemy;
          const foePool = (isEnemy ? alivePlayerUnits : aliveEnemies).filter(u => u.hp > 0);
          if (foePool.length === 0) continue;

          // 我方就近打最近目标，敌方随机挑选
          let target: ActiveChessUnit;
          if (isEnemy) {
            target = foePool[Math.floor(Math.random() * foePool.length)];
          } else {
            target = [...foePool].sort((a, b) => {
              const da = Math.abs((a.slot % 4) - (actor.slot % 4)) + Math.abs(Math.floor(a.slot / 4) - Math.floor(actor.slot / 4));
              const db = Math.abs((b.slot % 4) - (actor.slot % 4)) + Math.abs(Math.floor(b.slot / 4) - Math.floor(actor.slot / 4));
              return da - db;
            })[0];
          }

          if (actor.mana >= actor.maxMana) {
            // 释放技能
            actor.mana = 0;
            const skillDmg = Math.round(actor.atk * (isEnemy ? 1.8 : 2.2));
            target.hp = Math.max(0, target.hp - skillDmg);
            if (isEnemy) {
              addFloatText(`💥 破阵击 -${skillDmg}`, 220, 240, '#f97316');
            } else {
              sound.playCritical();
              addFloatText(`⚡ ${actor.skillName}！`, 380, 160, '#a855f7');
              addFloatText(`-${skillDmg}`, 400, 180, '#ec4899');
            }
          } else {
            // 普攻，同时积攒法力
            actor.mana = Math.min(actor.maxMana, actor.mana + (isEnemy ? 20 : 25));
            const dmg = Math.max(isEnemy ? 8 : 10, actor.atk - target.def / 2);
            target.hp = Math.max(0, target.hp - dmg);
            if (isEnemy) {
              addFloatText(`-${dmg}`, 210, 250, '#f43f5e');
            } else {
              addFloatText(`-${dmg}`, 390, 190, '#ef4444');
            }
          }
        }

        setEnemyBoard(nextEnemies.map(e => (e && e.hp <= 0) ? null : e));

        return nextBoard.map(u => (u && u.hp <= 0) ? null : u);
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [isCombatPhase, bountyEarned, player.hp, activeBench, onUpdateBoard, onVictory, onDefeat, onUpdatePlayerHp]);

  return (
    <div className="autochess-container">
      
      {/* Floating Damage / Combat Numbers */}
      {floatingTexts.map(f => (
        <div
          key={f.id}
          style={{
            position: 'absolute',
            left: f.x,
            top: f.y,
            color: f.color,
            fontSize: '13px',
            fontFamily: 'var(--font-pixel-num)',
            fontWeight: 900,
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 1px 1px 0 #000',
            zIndex: 90,
            pointerEvents: 'none',
            transition: 'all 0.9s ease-out',
            transform: 'translateY(-20px)',
          }}
        >
          {f.text}
        </div>
      ))}

      {/* Screen VFX Banner */}
      {activeSpellVisual && (
        <div style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 80,
          pointerEvents: 'none',
        }}>
          <div style={{
            padding: '6px 20px',
            borderRadius: 14,
            border: `2px solid ${activeSpellVisual.color}`,
            backgroundColor: 'rgba(7, 10, 18, 0.94)',
            color: activeSpellVisual.color,
            boxShadow: `0 0 30px ${activeSpellVisual.color}, 0 4px 16px rgba(0,0,0,0.9)`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: '1px',
          }}>
            <PixelIcon name="sparkles" size={18} color={activeSpellVisual.color} />
            <span>{activeSpellVisual.text}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER: Commander Stats & Encounter Info */}
      <div className="autochess-header">
        {/* Left: Player Commander */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={player.characterAvatar} 
              alt={player.characterName} 
              className="autochess-commander-avatar"
            />
            <div style={{
              position: 'absolute',
              bottom: -3,
              right: -3,
              padding: '1px 5px',
              borderRadius: 8,
              backgroundColor: '#f59e0b',
              color: '#000000',
              fontSize: '9px',
              fontFamily: 'var(--font-pixel)',
              fontWeight: 900,
            }}>
              统帅
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 13, color: '#facc15' }}>
                {player.characterName}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                第 {floor} 层遭遇
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#4ade80' }}>
                <PixelIcon name="heart" size={12} color="currentColor" /> {player.hp} / {player.maxHp}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#fbbf24' }}>
                <PixelIcon name="coins" size={12} /> {player.gold} G
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#38bdf8' }}>
                <PixelIcon name="zap" size={12} color="currentColor" /> 战术能量: {Math.floor(tacticalEnergy)}/{maxTacticalEnergy}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            fontSize: 13,
            color: enemy.isBoss ? '#f43f5e' : enemy.isElite ? '#fb923c' : '#e2e8f0',
            letterSpacing: '1px',
          }}>
            {enemy.isBoss ? '🔥 尖塔魔王战' : enemy.isElite ? '⚡ 尖塔精英战' : '⚔️ 尖塔遭遇战'}
          </div>
          <div style={{ fontSize: 9.5, color: '#94a3b8' }}>
            上阵限额: {activeBoard.filter(u => u !== null).length} / {chessLevel} 人 (经验: {chessXp}/{chessLevel * 4})
          </div>
        </div>

        {/* Right: Enemy Commander & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 12, color: '#f87171' }}>
              {enemy.name}
            </div>
            <div style={{ fontSize: 9.5, color: '#94a3b8' }}>
              {enemy.title || '守关敌军'}
            </div>
          </div>
          <img 
            src={enemy.image || enemy.avatar} 
            alt={enemy.name} 
            className="autochess-enemy-avatar"
          />
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="spire-btn"
              style={{ padding: '4px 8px', fontSize: 10 }}
              title="查看地图"
            >
              <PixelIcon name="map" size={12} /> 地图
            </button>
          )}
          {onOpenDeck && (
            <button
              onClick={onOpenDeck}
              className="spire-btn"
              style={{ padding: '4px 8px', fontSize: 10 }}
              title="查看卡组"
            >
              <PixelIcon name="blocks" size={12} /> 卡组
            </button>
          )}
          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="spire-btn"
              style={{ padding: '4px 8px', fontSize: 10, color: '#ef4444' }}
              title="退出到主菜单"
            >
              菜单
            </button>
          )}
        </div>
      </div>

      {/* MAIN BATTLE ARENA (Left: Synergies, Center: Battlefields) */}
      <div className="autochess-arena-wrapper">
        
        {/* Left Side: Synergies & Shop Economy Panel */}
        <div className="autochess-synergies-panel">
          <div>
            <div style={{
              fontSize: 11,
              fontFamily: 'var(--font-serif)',
              color: '#facc15',
              fontWeight: 900,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <PixelIcon name="shield" size={13} color="#facc15" />
              <span>军阵羁绊 (Bonds)</span>
            </div>
            <div>
              {SYNERGIES.map(syn => {
                const count = activeSynergies[syn.id] || 0;
                const activeBp = syn.breakpoints.filter(b => count >= b).length;
                return (
                  <div 
                    key={syn.id}
                    className={`autochess-synergy-item ${activeBp > 0 ? 'autochess-synergy-active' : 'autochess-synergy-inactive'}`}
                    title={`${syn.name}: ${syn.description}\n${syn.descriptions.join('\n')}`}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{syn.icon}</span>
                      <span>{syn.name.slice(0, 4)}</span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-pixel-num)', fontWeight: 900 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shop & XP Buttons */}
          {!isCombatPhase && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={handleRerollShop}
                className="spire-btn"
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  fontSize: 10,
                  justifyContent: 'center',
                  color: '#c7d2fe',
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                }}
              >
                <PixelIcon name="refresh" size={11} /> 刷新棋子 (2G)
              </button>
              <button
                onClick={handleBuyXp}
                className="spire-btn"
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  fontSize: 10,
                  justifyContent: 'center',
                  color: '#fde047',
                  borderColor: 'rgba(250, 204, 21, 0.4)',
                }}
              >
                <PixelIcon name="arrow-up" size={11} /> 升人口 (+4XP/4G)
              </button>
            </div>
          )}
        </div>

        {/* Center: Battlefield (Enemy Top, Center Clash, Player Bottom) */}
        <div className="autochess-battlefield">
          
          {/* ENEMY BOARD (8 slots: 4 backline, 4 frontline) */}
          <div>
            <div style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#f87171',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>敌方战阵 (后排远程 / 前排坚盾)</span>
            </div>
            <div className="autochess-board-grid">
              {enemyBoard.map((unit, idx) => (
                <div
                  key={`enemy_${idx}`}
                  className="autochess-slot autochess-slot-enemy"
                >
                  {unit ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '2px 4px' }}>
                      <div style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-pixel)',
                        fontWeight: 900,
                        color: '#fca5a5',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}>
                        {'★'.repeat(unit.stars)} {unit.name}
                      </div>
                      <img 
                        src={unit.avatar} 
                        alt={unit.name} 
                        className="autochess-unit-sprite"
                      />
                      {/* Health Bar */}
                      <div style={{ width: '100%', height: 4, backgroundColor: '#0f172a', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#ef4444',
                          width: `${Math.max(0, (unit.hp / unit.maxHp) * 100)}%`,
                          transition: 'width 0.2s linear',
                        }} />
                      </div>
                      {/* Mana Bar */}
                      <div style={{ width: '100%', height: 3, backgroundColor: '#0f172a', borderRadius: 2, overflow: 'hidden', marginTop: 1 }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#38bdf8',
                          width: `${Math.min(100, (unit.mana / unit.maxMana) * 100)}%`,
                          transition: 'width 0.2s linear',
                        }} />
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-mono)' }}>
                      {idx < 4 ? '前排' : '后排'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 行动条：排轴可视化。越靠左越先行动，拉条/推条会让棋子沿条平移 */}
          <div style={{ margin: '5px 0' }}>
            <ActionBar
              units={[
                ...activeBoard.filter((u): u is ActiveChessUnit => u !== null),
                ...enemyBoard.filter((e): e is ActiveChessUnit => e !== null),
              ]}
              steps={8}
              currentActorId={currentActorId}
            />
          </div>

          {/* CENTER DIVIDER: Clash Status & Start Combat Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 8px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            margin: '4px 0',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PixelIcon name="sword" size={13} color="#facc15" />
              {isCombatPhase ? '正在交战中... 棋子冲锋撕咬施法！' : '准备阶段：调整站位，点击出击开战！'}
            </span>
            {!isCombatPhase && (
              <button
                onClick={handleStartCombat}
                style={{
                  padding: '5px 16px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)',
                  transform: 'scale(1)',
                  transition: 'all 0.15s ease',
                }}
              >
                <PixelIcon name="play" size={14} color="currentColor" /> 出击开战
              </button>
            )}
          </div>

          {/* PLAYER BOARD (8 slots: 4 frontline, 4 backline) */}
          <div>
            <div style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#4ade80',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>我方战阵 (前排坚盾 / 后排射手)</span>
              <span style={{ fontSize: 10, color: '#fde047', fontFamily: 'var(--font-mono)' }}>
                上阵: {activeBoard.filter(u => u !== null).length} / {chessLevel} 人
              </span>
            </div>

            {/* Combat Outcome Overlay */}
            {combatOutcome && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(5, 7, 14, 0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 60,
                pointerEvents: 'none',
              }}>
                <div style={{
                  padding: '12px 28px',
                  borderRadius: 16,
                  border: `2px solid ${combatOutcome === 'win' ? '#facc15' : '#ef4444'}`,
                  backgroundColor: '#0f172a',
                  color: combatOutcome === 'win' ? '#facc15' : '#f87171',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  fontWeight: 900,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
                }}>
                  {combatOutcome === 'win' ? '⚔️ 遭遇战大捷！正在清点战利品...' : '💥 战线崩溃，统帅受创！'}
                </div>
              </div>
            )}

            <div className="autochess-board-grid">
              {activeBoard.map((unit, idx) => (
                <div
                  key={`player_${idx}`}
                  onClick={() => handleSlotClick(idx, false)}
                  className={`autochess-slot autochess-slot-player ${selectedUnit?.slot === idx && !selectedUnit.isBench ? 'autochess-slot-selected' : ''}`}
                >
                  {unit ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '2px 4px' }}>
                      <div style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-pixel)',
                        fontWeight: 900,
                        color: unit.stars === 3 ? '#facc15' : unit.stars === 2 ? '#60a5fa' : '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}>
                        {'★'.repeat(unit.stars)} {unit.name}
                      </div>
                      <img 
                        src={unit.avatar} 
                        alt={unit.name} 
                        className="autochess-unit-sprite"
                      />
                      {/* Health Bar */}
                      <div style={{ width: '100%', height: 4, backgroundColor: '#0f172a', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#22c55e',
                          width: `${Math.max(0, (unit.hp / unit.maxHp) * 100)}%`,
                          transition: 'width 0.2s linear',
                        }} />
                      </div>
                      {/* Mana Bar */}
                      <div style={{ width: '100%', height: 3, backgroundColor: '#0f172a', borderRadius: 2, overflow: 'hidden', marginTop: 1 }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: '#38bdf8',
                          width: `${Math.min(100, (unit.mana / unit.maxMana) * 100)}%`,
                          transition: 'width 0.2s linear',
                        }} />
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
                      {idx < 4 ? '前排' : '后排'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* BENCH (8 slots) */}
          <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', marginBottom: 2 }}>
              备战席 (点击调动上阵 / 3个同星同名自动合成)
            </div>
            <div className="autochess-bench-grid">
              {activeBench.map((unit, idx) => (
                <div
                  key={`bench_${idx}`}
                  onClick={() => handleSlotClick(idx, true)}
                  className={`autochess-slot autochess-slot-player ${selectedUnit?.slot === idx && selectedUnit.isBench ? 'autochess-slot-selected' : ''}`}
                >
                  {unit ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', fontWeight: 900, color: '#facc15' }}>
                        {'★'.repeat(unit.stars)}
                      </div>
                      <img src={unit.avatar} alt={unit.name} className="autochess-bench-sprite" />
                    </div>
                  ) : (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
                      {idx + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM DRAWER: Tactical Effect Cards & Shop Pieces */}
      <div className="autochess-tactical-drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-serif)', fontWeight: 900, color: '#facc15', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PixelIcon name="zap" size={13} color="#facc15" />
              万象效果牌 (点击即刻施放战术奥义)
            </span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              战术能量: <strong style={{ color: '#38bdf8' }}>{Math.floor(tacticalEnergy)}</strong>/{maxTacticalEnergy}
            </span>
          </div>

          {!isCombatPhase && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>招募棋子:</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {shopCards.map(c => (
                  <button
                    key={c.shopIndex}
                    onClick={() => handleBuyPiece(c)}
                    disabled={player.gold < c.cost}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: player.gold >= c.cost ? 'pointer' : 'not-allowed',
                      opacity: player.gold >= c.cost ? 1 : 0.45,
                    }}
                  >
                    <img src={c.config.avatar} alt={c.config.name} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                    <span>{c.config.name}</span>
                    <span style={{ color: '#fbbf24' }}>{c.cost}G</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hand Cards Horizontal Scroll */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 2,
        }}>
          {effectHand.map((card, idx) => (
            <EffectCardItem
              key={`${card.id}_${idx}`}
              card={card}
              isCompact={true}
              disabled={tacticalEnergy < card.cost}
              onClick={() => handleSelectEffectCard(card)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
