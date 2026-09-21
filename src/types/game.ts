export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare';
export type VocabDifficulty = 'all' | 'cet46' | 'ielts' | 'toefl' | 'gre';
export type VocabArchetype = 'root' | 'poison' | 'shield' | 'combo' | 'wealth' | 'fury' | 'general';

export interface DictionaryEntry {
  id: string;
  word: string;
  phonetic: string;
  pos: string; // n., v., adj., adv.
  meaning: string;
  distractors: string[];
  tier: VocabDifficulty;
  etymology?: string;
  prefix?: string;
  rootWord?: string;
  archetype?: VocabArchetype;
  collocation?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface Card {
  id: string;
  name: string; // Distinct card name (e.g. 誓约胜利之剑 (Excalibur))
  characterId?: string; // Character owner (artoria, gilgamesh, mash, jalter, serenity, rin)
  word: string;
  phonetic: string;
  pos: string; // n., v., adj., adv.
  meaning: string; // Primary Chinese definition
  distractors: string[]; // 2 wrong definitions for quick recall challenge
  etymology?: string; // 词根/词源/助记
  prefix?: string; // 前缀 e.g. 'dis', 're', 'pro'
  rootWord?: string; // 词根 e.g. 'rupt', 'struct', 'fort'
  archetype?: VocabArchetype;
  collocation?: string; // 常用搭配 e.g. 'sever ties with'
  exampleSentence?: string;
  exampleTranslation?: string;
  tier: VocabDifficulty;

  cost: number;
  type: CardType;
  rarity: CardRarity;
  
  // Base effects
  baseDamage?: number;
  baseBlock?: number;
  hits?: number;
  drawCards?: number;
  gainEnergy?: number;
  vulnerable?: number; // 易伤层数
  weak?: number; // 虚弱层数
  strength?: number; // 力量加成
  poison?: number; // 中毒层数
  heal?: number; // 治疗生命
  exhaust?: boolean; // 消耗牌
  bodySlam?: boolean; // 盾击：造成等同于当前护甲值的伤害
  catalyst?: boolean; // 催化剂：将敌人中毒层数翻倍
  hpCost?: number; // 鲜血献祭：扣除生命
  bloodForBlood?: boolean; // 背水一战：半血以下双倍伤害
  finisher?: boolean; // 终结技：根据本回合出牌数额外增加伤害
  finisherBonus?: number; // 终结技每张牌增伤
  goldScaling?: boolean; // 王之财宝：每 50 金币额外追加 1 段打击
  goldGain?: number; // 获得金币
  pierceBlock?: boolean; // 乖离剑：无视敌方护甲直接扣血
  retainCard?: boolean; // 保留手牌
  vulnerableMultiplier?: number; // 对易伤敌人倍率 (如 3x)
  reflectionDamage?: boolean; // 理想之城：本回合获得护甲时反弹等量伤害
  reverberateOnCritical?: boolean; // 咏唱暴击追加 1 段全额打击
  cardDrawOnAttack?: boolean; // 宝石剑：每打出 1 张攻击牌抽 1 张牌
  illustrationKey?: string; // 专属立绘标识

  // Upgrades
  isUpgraded: boolean;
  upgradedDamage?: number;
  upgradedBlock?: number;
  upgradedCost?: number;
  upgradedHits?: number;
  upgradedVulnerable?: number;
  upgradedWeak?: number;
  upgradedDrawCards?: number;
  upgradedPoison?: number;
  upgradedStrength?: number;
  upgradedGoldGain?: number;

  // Learning tracking
  masteryCount: number; // Correct recalls count
  needReview: boolean;  // Flagged as mistake
}

export type IntentType = 'attack' | 'defend' | 'buff' | 'debuff' | 'special';

export interface EnemyIntent {
  type: IntentType;
  value?: number;
  times?: number;
  desc: string;
}

export interface StatusEffects {
  strength: number;
  weak: number;
  vulnerable: number;
  poison: number;
  dexterity: number;
  ritual?: number; // Cultist gains strength each turn
  metallicize?: number; // Gains block each turn
  cardDrawOnAttack?: number; // Draws cards whenever an attack card is played
}

export interface Enemy {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  hp: number;
  block: number;
  avatar: string; // Emoji fallback
  image?: string; // High-resolution dark fantasy artwork
  statusEffects: StatusEffects;
  intent: EnemyIntent;
  patternIndex: number;
  isBoss?: boolean;
  isElite?: boolean;
}

export interface Relic {
  id: string;
  name: string;
  desc: string;
  icon: string;
  rarity: 'starter' | 'common' | 'rare' | 'shop';
}

export interface Player {
  characterId?: string;
  characterName?: string;
  characterAvatar?: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  gold: number;
  statusEffects: StatusEffects;
  deck: Card[];
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  relics: Relic[];
}

export type NodeType = 'monster' | 'elite' | 'rest' | 'shop' | 'event' | 'boss';

export interface MapNode {
  id: string;
  floor: number;
  lane: number; // 0, 1, 2
  type: NodeType;
  visited: boolean;
  accessible: boolean;
  nextNodes: string[]; // ids of connected nodes in next floor
}

export type GameScreen = 
  | 'title' 
  | 'char_select'
  | 'map' 
  | 'battle' 
  | 'reward' 
  | 'rest' 
  | 'shop' 
  | 'deck' 
  | 'lexicon' 
  | 'gameover' 
  | 'victory';

export interface FloatText {
  id: string;
  text: string;
  type: 'damage' | 'block' | 'critical' | 'heal' | 'buff' | 'debuff' | 'miss';
  x: number;
  y: number;
}
