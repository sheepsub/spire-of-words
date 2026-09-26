import React, { useState, useEffect, useRef } from 'react';
import { 
  CHESS_PIECES, 
  SYNERGIES, 
  ENEMY_WAVES 
} from '../data/autoChessData';
import type { 
  ActiveChessUnit, 
  ChessShopCard, 
  SynergyId 
} from '../types/autoChess';
import { sound } from '../utils/audio';
import { avFromSpeed } from '../utils/actionTimeline';
import { PixelIcon } from './PixelIcon';

interface AutoChessViewProps {
  onBackToTitle: () => void;
}

export const AutoChessView: React.FC<AutoChessViewProps> = ({ onBackToTitle }) => {
  // Player Economy & Progress
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [gold, setGold] = useState<number>(15);
  const [level, setLevel] = useState<number>(3); // Population cap (3 to 8)
  const [xp, setXp] = useState<number>(0);
  const [currentWaveIndex, setCurrentWaveIndex] = useState<number>(0);
  
  // Board & Bench Slots (8 Board slots: 0-3 frontline, 4-7 backline; 8 Bench slots)
  const [board, setBoard] = useState<(ActiveChessUnit | null)[]>(() => new Array(8).fill(null));
  const [bench, setBench] = useState<(ActiveChessUnit | null)[]>(() => new Array(8).fill(null));
  const [enemyBoard, setEnemyBoard] = useState<(ActiveChessUnit | null)[]>(() => new Array(8).fill(null));
  const enemyBoardRef = useRef<(ActiveChessUnit | null)[]>(enemyBoard);
  useEffect(() => {
    enemyBoardRef.current = enemyBoard;
  }, [enemyBoard]);

  // Keep a persistent copy of the board before combat to restore all units with full HP after combat
  const preCombatBoardRef = useRef<(ActiveChessUnit | null)[]>([]);

  // Shop & Reroll
  const [shopCards, setShopCards] = useState<ChessShopCard[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<ActiveChessUnit | null>(null);

  // Combat Phase State
  const [isCombatPhase, setIsCombatPhase] = useState<boolean>(false);
  const [combatOutcome, setCombatOutcome] = useState<'win' | 'lose' | null>(null);
  const [floatingDamage, setFloatingDamage] = useState<{ id: string; text: string; x: number; y: number; color: string }[]>([]);

  // Sound effects
  const playSoundSafe = (type: 'select' | 'draw' | 'slash' | 'block') => {
    try {
      if (type === 'select') sound.playSelect();
      if (type === 'draw') sound.playDraw();
      if (type === 'slash') sound.playSlash();
      if (type === 'block') sound.playBlock();
    } catch (e) {}
  };

  // Helper to spawn floating text
  const addFloatText = (text: string, x: number, y: number, color = '#ef4444') => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    setFloatingDamage(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingDamage(prev => prev.filter(f => f.id !== id));
    }, 900);
  };

  // Generate 5 shop cards
  const generateShop = () => {
    const newCards: ChessShopCard[] = [];
    for (let i = 0; i < 5; i++) {
      // Weight random piece by level
      const piece = CHESS_PIECES[Math.floor(Math.random() * CHESS_PIECES.length)];
      newCards.push({
        shopIndex: i,
        config: piece,
        cost: piece.cost,
        isDiscounted: false,
      });
    }
    setShopCards(newCards);
  };

  // Initial shop setup & starter pieces
  useEffect(() => {
    generateShop();
    // Give 2 starter units on bench
    const starterArtoria = createUnitInstance('artoria', 0, true);
    const starterIronclad = createUnitInstance('ironclad', 1, true);
    setBench(prev => {
      const next = [...prev];
      next[0] = starterArtoria;
      next[1] = starterIronclad;
      return next;
    });
  }, []);

  // Initialize enemy wave
  const setupWave = (waveIdx: number) => {
    const wave = ENEMY_WAVES[waveIdx % ENEMY_WAVES.length];
    const newEnemyBoard = new Array(8).fill(null);
    wave.enemies.forEach(e => {
      newEnemyBoard[e.slot] = {
        instanceId: `enemy_${e.configId}_${Date.now()}_${Math.random()}`,
        configId: e.configId,
        name: e.name,
        avatar: e.avatar,
        cost: 1,
        stars: e.stars,
        hp: e.hp,
        maxHp: e.maxHp,
        mana: 0,
        maxMana: e.maxMana,
        atk: e.atk,
        def: e.def,
        spd: e.spd,
        av: avFromSpeed(e.spd),
        range: e.range,
        synergies: [],
        skillName: e.skillName,
        skillDesc: '尖塔魔物蓄力猛攻',
        slot: e.slot,
        isBench: false,
        isEnemy: true,
      };
    });
    setEnemyBoard(newEnemyBoard);
  };

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

  // Automatic 3-in-1 Star Upgrade Checker
  const checkStarUpgrade = (currentBoard: (ActiveChessUnit | null)[], currentBench: (ActiveChessUnit | null)[]) => {
    let modified = false;
    let nextBoard = [...currentBoard];
    let nextBench = [...currentBench];

    // Check for 3 units of same configId & same star (1 -> 2, 2 -> 3)
    for (let targetStar = 1; targetStar <= 2; targetStar++) {
      const allUnits = [...nextBoard, ...nextBench].filter((u): u is ActiveChessUnit => u !== null && u.stars === targetStar);
      const counts: Record<string, ActiveChessUnit[]> = {};
      allUnits.forEach(u => {
        counts[u.configId] = counts[u.configId] || [];
        counts[u.configId].push(u);
      });

      for (const [cfgId, units] of Object.entries(counts)) {
        if (units.length >= 3) {
          // Found 3! Synthesize into upgraded unit
          const [u1, u2, u3] = units;
          const upgraded = createUnitInstance(cfgId, u1.slot, u1.isBench, targetStar + 1);
          playSoundSafe('draw');
          
          // Remove u2 and u3, replace u1 with upgraded
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
      setBoard(nextBoard);
      setBench(nextBench);
    }
  };

  // Buy Piece
  const handleBuyPiece = (shopCard: ChessShopCard) => {
    if (gold < shopCard.cost) {
      addFloatText('金币不足！', 200, 300, '#ef4444');
      return;
    }
    // Find empty bench slot
    const emptySlot = bench.findIndex(s => s === null);
    if (emptySlot === -1) {
      addFloatText('备战席已满！', 200, 300, '#ef4444');
      return;
    }

    playSoundSafe('select');
    setGold(g => g - shopCard.cost);
    const newUnit = createUnitInstance(shopCard.config.id, emptySlot, true);
    const nextBench = [...bench];
    nextBench[emptySlot] = newUnit;
    setBench(nextBench);

    // Remove from shop
    setShopCards(prev => prev.filter(c => c.shopIndex !== shopCard.shopIndex));

    // Check upgrade
    checkStarUpgrade(board, nextBench);
  };

  // Reroll Shop (D牌)
  const handleRerollShop = () => {
    if (gold < 2) {
      addFloatText('金币不足 2G！', 200, 300, '#ef4444');
      return;
    }
    playSoundSafe('select');
    setGold(g => g - 2);
    generateShop();
  };

  // Buy XP (F人口)
  const handleBuyXp = () => {
    if (gold < 4 || level >= 8) return;
    playSoundSafe('draw');
    setGold(g => g - 4);
    const newXp = xp + 4;
    const requiredXp = level * 4;
    if (newXp >= requiredXp) {
      setLevel(l => Math.min(8, l + 1));
      setXp(newXp - requiredXp);
      addFloatText(`人口突破！当前可上阵 ${level + 1} 人`, 200, 250, '#38bdf8');
    } else {
      setXp(newXp);
    }
  };

  // Move Unit between Board and Bench
  const handleSlotClick = (index: number, isBenchSlot: boolean) => {
    if (isCombatPhase) return;
    const currentList = isBenchSlot ? bench : board;
    const unit = currentList[index];

    if (!selectedUnit) {
      if (unit) setSelectedUnit(unit);
      return;
    }

    // Move or swap selected unit to clicked slot
    playSoundSafe('select');
    const nextBoard = [...board];
    const nextBench = [...bench];

    const sourceList = selectedUnit.isBench ? nextBench : nextBoard;
    const targetList = isBenchSlot ? nextBench : nextBoard;

    // Population limit check when moving bench -> board
    if (selectedUnit.isBench && !isBenchSlot && unit === null) {
      const activeBoardCount = nextBoard.filter(u => u !== null).length;
      if (activeBoardCount >= level) {
        addFloatText(`已达人口上限 (${level} 人)！请按F升级人口`, 200, 300, '#f59e0b');
        setSelectedUnit(null);
        return;
      }
    }

    // Swap units
    sourceList[selectedUnit.slot] = unit ? { ...unit, slot: selectedUnit.slot, isBench: selectedUnit.isBench } : null;
    targetList[index] = { ...selectedUnit, slot: index, isBench: isBenchSlot };

    setBoard(nextBoard);
    setBench(nextBench);
    setSelectedUnit(null);
    checkStarUpgrade(nextBoard, nextBench);
  };

  // Calculate Active Synergies on Board
  const activeSynergies = React.useMemo(() => {
    const counts: Record<SynergyId, number> = {
      warrior: 0,
      guardian: 0,
      assassin: 0,
      mage: 0,
      sovereign: 0,
      necro: 0,
    };
    const seenConfigs = new Set<string>();
    board.forEach(u => {
      if (u && !seenConfigs.has(u.configId)) {
        seenConfigs.add(u.configId);
        u.synergies.forEach(syn => {
          counts[syn] = (counts[syn] || 0) + 1;
        });
      }
    });
    return counts;
  }, [board]);

  // Start Realtime Auto Combat Simulation Loop
  const handleStartCombat = () => {
    const activePlayerUnits = board.filter(u => u !== null);
    if (activePlayerUnits.length === 0) {
      addFloatText('请先安排至少 1 名棋子上阵！', 200, 300, '#ef4444');
      return;
    }

    playSoundSafe('slash');
    // Cache current player formation with full HP for post-combat restoration
    preCombatBoardRef.current = board.map(u => u ? { ...u, hp: u.maxHp, mana: 0 } : null);
    setIsCombatPhase(true);
    setCombatOutcome(null);
    setupWave(currentWaveIndex);
  };

  // Combat Simulation Tick Loop (Every 650ms)
  useEffect(() => {
    if (!isCombatPhase) return;

    const timer = setInterval(() => {
      setBoard(prevBoard => {
        let nextBoard = prevBoard.map(u => u ? { ...u } : null);
        let nextEnemies = enemyBoardRef.current.map(e => e ? { ...e } : null);

        const livingPlayers = nextBoard.filter((u): u is ActiveChessUnit => u !== null && u.hp > 0);
        const livingEnemies = nextEnemies.filter((e): e is ActiveChessUnit => e !== null && e.hp > 0);

        // Check Victory / Defeat
        if (livingEnemies.length === 0) {
          clearInterval(timer);
          setIsCombatPhase(false);
          setCombatOutcome('win');
          playSoundSafe('draw');
          const reward = 5 + Math.floor(gold * 0.1);
          setGold(g => g + reward);
          setCurrentWaveIndex(w => w + 1);
          generateShop();
          // Restore all player units to full HP for next wave
          const restored = preCombatBoardRef.current.map(u => u ? { ...u, hp: u.maxHp, mana: 0 } : null);
          return restored;
        }

        if (livingPlayers.length === 0) {
          clearInterval(timer);
          setIsCombatPhase(false);
          setCombatOutcome('lose');
          playSoundSafe('block');
          setPlayerHp(hp => Math.max(0, hp - 15));
          generateShop();
          // Restore all player units to full HP for next wave
          const restored = preCombatBoardRef.current.map(u => u ? { ...u, hp: u.maxHp, mana: 0 } : null);
          return restored;
        }

        // 1. Player Units Attack
        livingPlayers.forEach(p => {
          const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
          if (target) {
            let damage = Math.max(15, p.atk - target.def);
            // Warrior synergy lifesteal
            if (activeSynergies.warrior >= 2) {
              p.hp = Math.min(p.maxHp, p.hp + Math.round(damage * 0.25));
            }
            // Sovereign gold true damage
            if (activeSynergies.sovereign >= 2) {
              damage += Math.round(gold * 0.15);
            }

            // Mana gain
            p.mana = Math.min(p.maxMana, p.mana + 35);
            if (p.mana >= p.maxMana) {
              p.mana = 0;
              damage = Math.round(damage * 2.2);
              addFloatText(`⚡${p.skillName}!`, 300, 200, '#38bdf8');
            }

            target.hp = Math.max(0, target.hp - damage);
            addFloatText(`-${damage}`, 400, 200 + target.slot * 25, '#ef4444');
          }
        });

        // 2. Enemy Units Attack
        livingEnemies.forEach(e => {
          const target = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
          if (target) {
            const damage = Math.max(10, e.atk - target.def);
            target.hp = Math.max(0, target.hp - damage);
            addFloatText(`-${damage}`, 200, 200 + target.slot * 25, '#f87171');
          }
        });

        setEnemyBoard(nextEnemies);
        return nextBoard;
      });
    }, 650);

    return () => clearInterval(timer);
  }, [isCombatPhase, gold, activeSynergies]);


  return (
    <div 
      className="spire-pixel-bg"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'max(6px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left))',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* TOP HEADER: Status, Economy, Round & Population */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        zIndex: 10,
      }}>
        {/* Return Button */}
        <button
          onClick={() => { playSoundSafe('select'); onBackToTitle(); }}
          className="spire-btn"
          style={{ padding: '6px 12px', fontSize: '11px', gap: 4 }}
        >
          <PixelIcon name="arrow-left" size={14} />
          <span>返回大厅</span>
        </button>

        {/* Center Round Banner */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#fef08a',
            letterSpacing: '1px',
            textShadow: '0 2px 8px rgba(234, 179, 8, 0.6)',
          }}>
            ⚔️ 尖塔自走棋 · 第 {currentWaveIndex + 1} 轮 {combatOutcome === 'win' ? '🎉 胜' : combatOutcome === 'lose' ? '💥 败' : ''}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-pixel)' }}>
            12 英雄像素棋子 · 羁绊连携 · 升星觉醒
          </div>
        </div>

        {/* Player Stats (HP, Gold, Population) */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-pixel-num)' }}>
            <PixelIcon name="heart" size={15} /> {playerHp}/100
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#facc15', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-pixel-num)' }}>
            <PixelIcon name="coins" size={15} /> {gold} G
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-pixel-num)' }}>
            <span>人口:</span> {board.filter(u => u !== null).length}/{level}
          </div>
        </div>
      </div>

      {/* CENTER WORKSPACE: Synergies (Left) + Battlefield Grid (Center) */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 14,
        margin: '8px 0',
        alignItems: 'stretch',
        overflow: 'hidden',
        zIndex: 5,
      }}>
        {/* LEFT COLUMN: Active Synergies Panel */}
        <div className="pixel-panel" style={{
          width: 'clamp(180px, 22%, 220px)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          backgroundColor: 'rgba(10, 13, 22, 0.95)',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-serif)',
            color: '#fef08a',
            borderBottom: '1px solid #374151',
            paddingBottom: 4,
            fontWeight: 700,
          }}>
            ✦ 羁绊连携 (SYNERGIES)
          </div>

          {SYNERGIES.map(syn => {
            const count = activeSynergies[syn.id] || 0;
            const isFullActive = count >= syn.breakpoints[0];
            return (
              <div key={syn.id} style={{
                padding: '5px 8px',
                borderRadius: 4,
                backgroundColor: isFullActive ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 20, 30, 0.6)',
                border: `1px solid ${isFullActive ? syn.color : '#1f2937'}`,
                boxShadow: isFullActive ? `0 0 8px ${syn.color}33` : undefined,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isFullActive ? syn.color : '#94a3b8' }}>
                    {syn.icon} {syn.name}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-pixel-num)', color: isFullActive ? '#ffffff' : '#64748b' }}>
                    {count}/{syn.breakpoints[syn.breakpoints.length - 1]}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: 2, lineHeight: 1.2 }}>
                  {syn.descriptions[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER COLUMN: BATTLEFIELD TACTICAL GRID (Player vs Enemy) */}
        <div className="pixel-panel" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'rgba(7, 9, 15, 0.96)',
          position: 'relative',
        }}>
          {/* Top Enemy Line */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}>
            <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-pixel)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PixelIcon name="sword" size={12} /> 尖塔魔物阵线 · WAVE {currentWaveIndex + 1}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              width: '100%',
              maxWidth: 480,
            }}>
              {enemyBoard.slice(0, 4).map((enemy, idx) => (
                <div key={idx} style={{
                  height: 68,
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px dashed rgba(239, 68, 68, 0.4)',
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  {enemy && (
                    <>
                      <img 
                        src={enemy.avatar} 
                        alt={enemy.name}
                        style={{ height: 46, objectFit: 'contain', imageRendering: 'pixelated' }}
                      />
                      <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 700 }}>
                        {enemy.name} ({enemy.hp})
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Central Combat Arena Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            margin: '4px 0',
          }}>
            <div style={{ height: 1, backgroundColor: '#374151', width: '100%' }} />
            <div style={{
              position: 'absolute',
              backgroundColor: '#090b14',
              padding: '2px 14px',
              borderRadius: 10,
              border: '1px solid #4b5563',
              fontSize: '10px',
              fontFamily: 'var(--font-serif)',
              color: '#facc15',
            }}>
              {isCombatPhase ? '⚔️ 激战中 (BATTLE IN PROGRESS) ⚔️' : '✦ 布阵整备阶段 (TACTICAL SETUP) ✦'}
            </div>
          </div>

          {/* Player Board Frontline & Backline */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}>
            <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-pixel)', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PixelIcon name="shield" size={12} /> 我方作战阵地 (前排 0-3 · 后排 4-7)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              width: '100%',
              maxWidth: 480,
            }}>
              {board.slice(0, 4).map((unit, idx) => {
                const isChosen = selectedUnit?.instanceId === unit?.instanceId;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSlotClick(idx, false)}
                    style={{
                      height: 68,
                      backgroundColor: isChosen ? 'rgba(59, 130, 246, 0.25)' : 'rgba(56, 189, 248, 0.08)',
                      border: `1.5px ${unit ? 'solid' : 'dashed'} ${isChosen ? '#3b82f6' : 'rgba(56, 189, 248, 0.4)'}`,
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {unit ? (
                      <>
                        {/* Stars */}
                        <div style={{ position: 'absolute', top: 2, left: 4, fontSize: '8px', color: '#facc15' }}>
                          {'★'.repeat(unit.stars)}
                        </div>
                        <img 
                          src={unit.avatar} 
                          alt={unit.name}
                          style={{ height: 44, objectFit: 'contain', imageRendering: 'pixelated' }}
                        />
                        {/* HP Bar */}
                        <div style={{ width: '80%', height: 3, backgroundColor: '#334155', borderRadius: 2, marginTop: 2 }}>
                          <div style={{ width: `${(unit.hp / unit.maxHp) * 100}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: '9px', color: '#ffffff', fontWeight: 700 }}>
                          {unit.name}
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: '9px', color: '#64748b' }}>空槽 {idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION DOCK: Bench (8 slots) + Shop (5 cards) + Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        backgroundColor: 'rgba(9, 11, 18, 0.98)',
        border: '2px solid #374151',
        borderRadius: 6,
        padding: '8px 12px',
        zIndex: 10,
      }}>
        {/* Bench Row (8 Slots) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-pixel)', whiteSpace: 'nowrap' }}>
              备战席:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {bench.map((unit, idx) => {
                const isChosen = selectedUnit?.instanceId === unit?.instanceId;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSlotClick(idx, true)}
                    style={{
                      width: 44,
                      height: 52,
                      backgroundColor: isChosen ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      border: `1.5px ${unit ? 'solid' : 'dashed'} ${isChosen ? '#3b82f6' : '#475569'}`,
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {unit ? (
                      <>
                        <div style={{ position: 'absolute', top: 1, left: 2, fontSize: '7px', color: '#facc15' }}>
                          {'★'.repeat(unit.stars)}
                        </div>
                        <img src={unit.avatar} alt={unit.name} style={{ height: 34, objectFit: 'contain', imageRendering: 'pixelated' }} />
                        <span style={{ fontSize: '7.5px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>{unit.name}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '7px', color: '#475569' }}>{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: F (Buy XP), D (Reroll), Start Combat */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleBuyXp}
              disabled={isCombatPhase || level >= 8}
              className="spire-btn"
              style={{ padding: '6px 10px', fontSize: '10px', gap: 4 }}
            >
              <span>升级人口 (4G)</span>
            </button>

            <button
              onClick={handleRerollShop}
              disabled={isCombatPhase}
              className="spire-btn"
              style={{ padding: '6px 10px', fontSize: '10px', gap: 4, backgroundColor: '#854d0e', color: '#fef08a' }}
            >
              <PixelIcon name="refresh" size={12} />
              <span>刷新酒馆 (2G)</span>
            </button>

            <button
              onClick={handleStartCombat}
              disabled={isCombatPhase}
              className="spire-btn"
              style={{
                padding: '7px 16px',
                fontSize: '12px',
                backgroundColor: isCombatPhase ? '#374151' : '#dc2626',
                borderColor: '#f87171',
                color: '#ffffff',
                fontWeight: 700,
                boxShadow: isCombatPhase ? undefined : '0 0 12px rgba(220, 38, 38, 0.6)',
              }}
            >
              <PixelIcon name="play" size={13} color="#ffffff" />
              <span>{isCombatPhase ? '战斗激化中...' : '开始战斗 (START)'}</span>
            </button>
          </div>
        </div>

        {/* Shop Row (5 Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8,
          borderTop: '1px solid #1f2937',
          paddingTop: 6,
        }}>
          {shopCards.map((card) => (
            <div
              key={card.shopIndex}
              className="pixel-panel"
              style={{
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: card.isDiscounted ? '#22c55e' : '#334155',
                boxShadow: card.isDiscounted ? '0 0 10px rgba(34, 197, 94, 0.3)' : undefined,
              }}
            >
              {/* Unit Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img 
                  src={card.config.avatar} 
                  alt={card.config.name} 
                  style={{ width: 36, height: 36, objectFit: 'contain', imageRendering: 'pixelated' }} 
                />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
                    {card.config.name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: 1 }}>
                    {card.config.title}
                  </div>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => handleBuyPiece(card)}
                disabled={isCombatPhase || gold < card.cost}
                style={{
                  padding: '4px 10px',
                  backgroundColor: gold >= card.cost ? '#2563eb' : '#374151',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontFamily: 'var(--font-pixel-num)',
                  border: 'none',
                  borderRadius: 3,
                  cursor: gold >= card.cost ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                }}
              >
                {card.cost} G
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Combat Damage Numbers */}
      {floatingDamage.map(item => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            color: item.color,
            fontFamily: 'var(--font-pixel-num)',
            fontSize: 16,
            fontWeight: 900,
            textShadow: '0 2px 4px #000',
            pointerEvents: 'none',
            animation: 'floatUp 0.8s ease-out forwards',
            zIndex: 90,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};
