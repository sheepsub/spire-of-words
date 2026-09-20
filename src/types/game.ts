export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare';
export type VocabDifficulty = 'all' | 'cet46' | 'ielts' | 'toefl' | 'gre';

export interface Card {
  id: string;
  word: string;
  phonetic: string;
  pos: string; // n., v., adj., adv.
  meaning: string; // Primary Chinese definition
  distractors: string[]; // 2 wrong definitions for quick recall challenge
  etymology?: string; // 词根/词源/助记
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
}

export interface Enemy {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  hp: number;
  block: number;
  avatar: string; // Emoji or SVG character indicator
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
