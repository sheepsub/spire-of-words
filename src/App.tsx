import React, { useState, useCallback } from 'react';
import type { 
  Player, 
  Enemy, 
  Card, 
  MapNode, 
  GameScreen,
} from './types/game';
import { getRandomMonster } from './data/enemies';
import { generateActMap } from './utils/mapGenerator';
import type { GeneratedFloor } from './utils/mapGenerator';
import { sound } from './utils/audio';

// Components
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { RestSiteView } from './components/RestSiteView';
import { ShopView } from './components/ShopView';
import { RewardModal } from './components/RewardModal';
import { DeckModal } from './components/DeckModal';
import { TitleView } from './components/TitleView';
import { CharacterSelectView } from './components/CharacterSelectView';
import { AutoChessView } from './components/AutoChessView';
import { AutoChessEncounterView } from './components/AutoChessEncounterView';
import { GameOverModal } from './components/GameOverModal';
import { RotatePrompt } from './components/RotatePrompt';
import { DEFAULT_CHARACTER, type CharacterDefinition } from './data/characters';
import { applyEnchantment } from './data/enchantments';
import { 
  ALL_COMPANION_CONFIGS, 
  createCompanionInstance, 
  calculateInterest, 
  upgradeCompanion 
} from './data/spireCompanions';
import type { ActiveChessUnit, EffectCard } from './types/autoChess';
import { STARTER_EFFECT_CARDS } from './data/effectCardsData';
import { CHESS_PIECES } from './data/autoChessData';
import { avFromSpeed } from './utils/actionTimeline';

function createInitialChessPiece(configId: string, slot: number, isBench: boolean, stars = 1): ActiveChessUnit {
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

export const App: React.FC = () => {
  // Master Game State - Starts at Title Screen (Main Menu)
  const [screen, setScreen] = useState<GameScreen>('title');
  const [previousScreen, setPreviousScreen] = useState<GameScreen | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isVirtualLandscape, setIsVirtualLandscape] = useState(false);
  
  // Selected Character & Archetype
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDefinition>(DEFAULT_CHARACTER);
  
  // Modals overlay
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
    relics: [DEFAULT_CHARACTER.starterRelic],
    archetypeColor: DEFAULT_CHARACTER.archetypeColor,
    archetypeGlow: DEFAULT_CHARACTER.archetypeGlow,
    companions: [createCompanionInstance(ALL_COMPANION_CONFIGS[0])],
    maxCompanions: 3,
  }));

  // Auto-Chess & Tactical Effect Deck State (王者万象棋核心状态)
  const [chessBoard, setChessBoard] = useState<(ActiveChessUnit | null)[]>(() => {
    const b = new Array(8).fill(null);
    b[0] = createInitialChessPiece('artoria', 0, false);
    b[1] = createInitialChessPiece('mash', 1, false);
    return b;
  });
  const [chessBench, setChessBench] = useState<(ActiveChessUnit | null)[]>(() => new Array(8).fill(null));
  const [chessLevel, setChessLevel] = useState<number>(3);
  const [chessXp, setChessXp] = useState<number>(0);
  const [effectDeck, setEffectDeck] = useState<EffectCard[]>([...STARTER_EFFECT_CARDS]);
  const [effectHand, setEffectHand] = useState<EffectCard[]>([...STARTER_EFFECT_CARDS]);

  // Battle State
  const [enemy, setEnemy] = useState<Enemy | null>(null);

  // Reward State
  const [rewardGold, setRewardGold] = useState<number>(18);
  const [rewardInterest, setRewardInterest] = useState<number>(0);
  const [goldClaimed, setGoldClaimed] = useState<boolean>(false);
  const [cardPicked, setCardPicked] = useState<boolean>(false);

  // START COMBAT
  const startCombat = useCallback((floorNum: number) => {
    const newEnemy = getRandomMonster(floorNum);
    const hasAnchor = player.relics.some((r) => r.id === 'anchor');
    const hasVajra = player.relics.some((r) => r.id === 'vajra');
    const hasFlask = player.relics.some((r) => r.id === 'toxic_flask');
    const hasPaladinAegis = player.relics.some((r) => r.id === 'iron_aegis');
    const hasBabylonKey = player.relics.some((r) => r.id === 'babylon_key');

    // Relic: Toxic Flask (3 poison, 1 weak at combat start)
    if (hasFlask) {
      newEnemy.statusEffects.poison += 3;
      newEnemy.statusEffects.weak += 1;
    }

    const startingBlock = (hasAnchor ? 10 : 0) + (hasPaladinAegis ? 8 : 0);

    setEnemy(newEnemy);

    setPlayer((prev) => ({
      ...prev,
      block: startingBlock,
      companions: prev.companions?.map(c => ({ ...c, block: 0 })),
      statusEffects: {
        strength: (hasVajra ? 1 : 0) + (hasBabylonKey ? 2 : 0),
        weak: 0,
        vulnerable: 0,
        poison: 0,
        dexterity: 0,
      },
    }));

    setScreen('battle');
  }, [player.relics]);

  // Handle player selecting a map node
  const handleSelectMapNode = (node: MapNode) => {
    setPreviousScreen(null);
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


  // REWARD CLAIMS
  const handleClaimGold = () => {
    setPlayer((prev) => ({ ...prev, gold: prev.gold + rewardGold }));
    setGoldClaimed(true);
  };

  const handlePickEffectCard = (card: EffectCard) => {
    setEffectDeck((prev) => [...prev, card]);
    setEffectHand((prev) => [...prev, card]);
    setCardPicked(true);
  };

  const handleContinueAfterReward = () => {
    setScreen('map');
  };

  // START RUN WITH CHARACTER
  const startRunWithCharacter = (char: CharacterDefinition) => {
    const starterCompConfig = (char.id === 'artoria')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'mash') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'ironclad')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'cultist') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'silent' || char.id === 'serenity')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'silent') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'necrobinder')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'necrobinder') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'defect')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'defect') || ALL_COMPANION_CONFIGS[0])
      : ALL_COMPANION_CONFIGS[0];

    const starterComp = createCompanionInstance(starterCompConfig);

    // Initialize Chess Formation and Starter Effect Cards
    const p1 = (char.id === 'ironclad') ? 'ironclad' 
      : (char.id === 'silent' || char.id === 'serenity') ? 'silent' 
      : (char.id === 'gilgamesh') ? 'gilgamesh' 
      : (char.id === 'rin') ? 'rin' 
      : (char.id === 'jalter') ? 'jalter' 
      : (char.id === 'necrobinder') ? 'necrobinder' 
      : (char.id === 'defect') ? 'defect' 
      : 'artoria';
    const p2 = (p1 === 'artoria') ? 'mash' : (p1 === 'ironclad') ? 'silent' : 'artoria';

    const initBoard = new Array(8).fill(null);
    initBoard[0] = createInitialChessPiece(p1, 0, false);
    initBoard[1] = createInitialChessPiece(p2, 1, false);
    setChessBoard(initBoard);
    setChessBench(new Array(8).fill(null));
    setChessLevel(3);
    setChessXp(0);
    setEffectDeck([...STARTER_EFFECT_CARDS]);
    setEffectHand([...STARTER_EFFECT_CARDS]);

    setSelectedCharacter(char);
    setFloors(generateActMap(15));
    setCurrentFloor(0);
    setCurrentNodeId(null);
    setPlayer({
      characterId: char.id,
      characterName: char.name,
      characterAvatar: char.avatarSprite,
      archetypeColor: char.archetypeColor,
      archetypeGlow: char.archetypeGlow,
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
      relics: [char.starterRelic],
      companions: [starterComp],
      maxCompanions: 3,
    });
    setScreen('map');
  };

  // RESTART RUN
  const handleRestart = () => {
    startRunWithCharacter(selectedCharacter);
  };

  // Switch character preview & synchronize player deck/stats immediately
  const handleSwitchCharacter = (char: CharacterDefinition) => {
    const starterCompConfig = (char.id === 'artoria')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'mash') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'ironclad')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'cultist') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'silent' || char.id === 'serenity')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'silent') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'necrobinder')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'necrobinder') || ALL_COMPANION_CONFIGS[0])
      : (char.id === 'defect')
      ? (ALL_COMPANION_CONFIGS.find(c => c.id === 'defect') || ALL_COMPANION_CONFIGS[0])
      : ALL_COMPANION_CONFIGS[0];

    const starterComp = createCompanionInstance(starterCompConfig);

    setSelectedCharacter(char);
    setPlayer((prev) => ({
      ...prev,
      characterId: char.id,
      characterName: char.name,
      characterAvatar: char.avatarSprite,
      archetypeColor: char.archetypeColor,
      archetypeGlow: char.archetypeGlow,
      hp: char.hp,
      maxHp: char.maxHp,
      energy: char.energy,
      maxEnergy: char.energy,
      block: 0,
      gold: char.gold,
      deck: char.getStarterDeck(),
      relics: [char.starterRelic],
      companions: prev.companions && prev.companions.length > 0 ? prev.companions : [starterComp],
      maxCompanions: 3,
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

      {/* Top Bar Status - Hidden on Title, Character Select, Battle (uses its own integrated header) and Auto-Chess Screens */}
      {screen !== 'title' && screen !== 'char_select' && screen !== 'autochess' && screen !== 'battle' && (
        <TopBar
          player={player}
          currentFloor={currentFloor}
          floorType={
            screen === 'rest' ? '营火休息'
            : screen === 'shop' ? '商贩'
            : '爬塔路标'
          }
          onOpenDeck={() => setShowDeck(true)}
          onOpenMap={screen !== 'map' && screen !== 'gameover' && screen !== 'victory' ? () => {
            setPreviousScreen(screen);
            setScreen('map');
          } : undefined}
          onReturnToMenu={() => setScreen('title')}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            sound.enabled = next;
            setSoundEnabled(next);
          }}
        />
      )}

      {/* MAIN SCREEN SWITCHER */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {screen === 'title' && (
          <TitleView
            onStartGame={() => startRunWithCharacter(selectedCharacter)}
            onStartAutoChess={() => setScreen('autochess')}
            onOpenCharacterSelect={() => setScreen('char_select')}
            onResumeRun={() => setScreen('map')}
            hasActiveRun={currentFloor > 0}
            currentFloor={currentFloor}
            onOpenDeck={() => setShowDeck(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              const next = !soundEnabled;
              sound.enabled = next;
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

        {screen === 'autochess' && (
          <AutoChessView onBackToTitle={() => setScreen('title')} />
        )}

        {screen === 'map' && (
          <MapView
            floors={floors}
            currentFloor={currentFloor}
            currentNodeId={currentNodeId}
            onSelectNode={handleSelectMapNode}
            onClose={previousScreen && previousScreen !== 'map' && previousScreen !== 'title' ? () => {
              setScreen(previousScreen);
              setPreviousScreen(null);
            } : undefined}
            characterMarker={
              selectedCharacter.id === 'serenity'
                ? '/sts2/map/map_marker_silent.png'
                : selectedCharacter.id === 'mash'
                ? '/sts2/map/map_marker_defect.png'
                : selectedCharacter.id === 'gilgamesh'
                ? '/sts2/map/map_marker_regent.webp'
                : selectedCharacter.id === 'rin'
                ? '/sts2/map/map_marker_watcher.webp'
                : selectedCharacter.id === 'jalter'
                ? '/sts2/map/map_marker_necrobinder.png'
                : '/sts2/map/map_marker_ironclad.png'
            }
          />
        )}

        {screen === 'battle' && enemy && (
          <AutoChessEncounterView
            player={player}
            enemy={enemy}
            floor={currentFloor}
            board={chessBoard}
            bench={chessBench}
            effectHand={effectHand}
            level={chessLevel}
            xp={chessXp}
            onUpdateBoard={(b, benchUnits) => {
              setChessBoard(b);
              setChessBench(benchUnits);
            }}
            onUpdateEffectHand={(h) => setEffectHand(h)}
            onUpdateGold={(updater) => setPlayer((prev) => ({ ...prev, gold: Math.max(0, updater(prev.gold)) }))}
            onUpdatePlayerHp={(newHp) => setPlayer((prev) => ({ ...prev, hp: newHp }))}
            onVictory={(bountyGold) => {
              setTimeout(() => {
                sound.playVictory();
                let baseReward = Math.floor(Math.random() * 15) + 15;
                const interest = calculateInterest(player.gold);
                setRewardGold(baseReward + interest + bountyGold);
                setRewardInterest(interest);
                setGoldClaimed(false);
                setCardPicked(false);
                setScreen('reward');
              }, 400);
            }}
            onDefeat={(damageTaken) => {
              if (player.hp - damageTaken <= 0) {
                setScreen('gameover');
              } else {
                setScreen('map');
              }
            }}
            onReturnToMenu={() => setScreen('title')}
            onOpenMap={() => {
              setPreviousScreen('battle');
              setScreen('map');
            }}
            onOpenDeck={() => setShowDeck(true)}
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
            onEnchantCard={(cardId, enchantment) => {
              setPlayer((prev) => ({
                ...prev,
                deck: prev.deck.map((c) => (c.id === cardId ? applyEnchantment(c, enchantment) : c)),
              }));
            }}
            onTrainCompanion={() => {
              setPlayer((prev) => ({
                ...prev,
                companions: prev.companions?.map((c) => ({
                  ...c,
                  hp: c.maxHp,
                  mana: c.maxMana,
                })),
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
            onRecruitCompanion={(newComp, cost) => {
              setPlayer((prev) => ({
                ...prev,
                gold: prev.gold - cost,
                companions: [...(prev.companions || []), newComp],
              }));
            }}
            onUpgradeCompanion={(compInstanceId, cost) => {
              setPlayer((prev) => ({
                ...prev,
                gold: prev.gold - cost,
                companions: prev.companions?.map((c) =>
                  c.instanceId === compInstanceId ? upgradeCompanion(c) : c
                ),
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
          interestReward={rewardInterest}
          onClaimGold={handleClaimGold}
          goldClaimed={goldClaimed}
          onPickEffectCard={handlePickEffectCard}
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
        />
      )}

      {/* FULL DECK MODAL */}
      {showDeck && (
        <DeckModal
          cards={player.deck}
          effectCards={effectDeck}
          title="我的战术锦囊与万象效果牌 (My Tactical Deck)"
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
