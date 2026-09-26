import type { SpireCompanionInstance } from '../data/spireCompanions';

export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare';
export type Archetype = 'root' | 'poison' | 'shield' | 'combo' | 'wealth' | 'fury' | 'general' | 'necro' | 'regent';

// STS2 (杀戮尖塔 2) 附魔与苦痛类型
export type EnchantmentType =
  | 'sharp' // 锋利: +3 伤害
  | 'adroit' // 伶俐: +3 护甲
  | 'momentum' // 动量: 战斗中每次打出增加伤害
  | 'slither' // 蛇行: 费用在 0-3 随机变化
  | 'royally_approved' // 王室认证: 固有 + 保留
  | 'perfect_fit' // 完美契合: 洗牌总在抽牌堆顶
  | 'slumbering' // 沉眠精华: 回合结束费用-1
  | 'glam' // 华彩: 每场战斗重放 1 次
  | 'imbued' // 注能: 战斗开始自动打出
  | 'corrupted' // 腐化: 伤害+50%，失去 2 生命
  | 'sown' // 播种: 首次打出获得 1 能量
  | 'swift' // 迅速: 首次打出抽 1 张牌
  | 'instinct'; // 本能: 攻击伤害翻倍

export type AfflictionType =
  | 'bound' // 魂缚: 每回合只能打出 1 张魂缚牌
  | 'entangled' // 缠身: 费用+1
  | 'galvanized' // 流电: 打出受 3 伤害
  | 'smog' // 烟雾: 本回合无法再打出技能牌
  | 'hexed'; // 邪咒: 获得虚无

export interface Card {
  id: string;
  name: string; // Distinct card name (e.g. 誓约胜利之剑 (Excalibur))
  characterId?: string; // Character owner (artoria, gilgamesh, mash, jalter, serenity, rin)
  archetype?: Archetype;

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
  cardDrawOnAttack?: boolean; // 宝石剑：每打出 1 张攻击牌抽 1 张牌
  illustrationKey?: string; // 专属立绘标识
  sts2Art?: string; // STS2 官方卡牌插画文件名

  // STS2 (杀戮尖塔 2) 附魔与苦痛系统
  enchantment?: EnchantmentType;
  enchantmentTitle?: string;
  enchantmentDesc?: string;
  affliction?: AfflictionType;
  afflictionTitle?: string;
  afflictionDesc?: string;
  replayedOnce?: boolean; // 华彩/涡旋重放标记

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
  archetypeColor?: string;
  archetypeGlow?: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  gold: number;
  statusEffects: StatusEffects;
  deck: Card[];
  relics: Relic[];
  // Spire Party & Companions (Auto-Chess & Currency Wars integration)
  companions?: SpireCompanionInstance[];
  maxCompanions?: number;
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
  | 'autochess'
  | 'reward' 
  | 'rest' 
  | 'shop' 
  | 'deck' 
  | 'gameover' 
  | 'victory';
