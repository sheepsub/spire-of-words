import type { Card, EnchantmentType, AfflictionType } from '../types/game';

export interface EnchantmentConfig {
  type: EnchantmentType;
  title: string;
  enTitle: string;
  description: string;
  icon: string;
  color: string;
  glow: string;
}

export interface AfflictionConfig {
  type: AfflictionType;
  title: string;
  enTitle: string;
  description: string;
  icon: string;
  color: string;
}

export const STS2_ENCHANTMENTS: Record<EnchantmentType, EnchantmentConfig> = {
  sharp: {
    type: 'sharp',
    title: '锋利',
    enTitle: 'Sharp',
    description: '造成的伤害提升 4 点。',
    icon: '🗡️',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  adroit: {
    type: 'adroit',
    title: '伶俐',
    enTitle: 'Adroit',
    description: '获得的护甲值提升 4 点。',
    icon: '🛡️',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  momentum: {
    type: 'momentum',
    title: '动量',
    enTitle: 'Momentum',
    description: '本场战斗中，每次打出就使该牌伤害增加 3 点。',
    icon: '⚡',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
  slither: {
    type: 'slither',
    title: '蛇行',
    enTitle: 'Slither',
    description: '抽到时费用在 0 到 2 之间随机波动。',
    icon: '🐍',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  royally_approved: {
    type: 'royally_approved',
    title: '王室认证',
    enTitle: 'Royally Approved',
    description: '获得固有与保留，绝不错失战机。',
    icon: '👑',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  perfect_fit: {
    type: 'perfect_fit',
    title: '完美契合',
    enTitle: 'Perfect Fit',
    description: '每当被洗入抽牌堆时，必定置于抽牌堆最顶端。',
    icon: '🎯',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  slumbering: {
    type: 'slumbering',
    title: '沉眠精华',
    enTitle: 'Slumbering',
    description: '回合结束在手牌中时，费用永久 -1 直到打出。',
    icon: '🌙',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  glam: {
    type: 'glam',
    title: '华彩',
    enTitle: 'Glam',
    description: '每场战斗首次打出时，自动重放一次！',
    icon: '✨',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.5)',
  },
  imbued: {
    type: 'imbued',
    title: '注能',
    enTitle: 'Imbued',
    description: '在每场战斗开始时自动免费打出。',
    icon: '🔮',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
  },
  corrupted: {
    type: 'corrupted',
    title: '腐化',
    enTitle: 'Corrupted',
    description: '造成的伤害提升 50%，但扣除 2 点生命。',
    icon: '🩸',
    color: '#b91c1c',
    glow: 'rgba(185, 28, 28, 0.5)',
  },
  sown: {
    type: 'sown',
    title: '播种',
    enTitle: 'Sown',
    description: '每场战斗首次打出时，返还 1 点能量。',
    icon: '🌱',
    color: '#84cc16',
    glow: 'rgba(132, 204, 22, 0.4)',
  },
  swift: {
    type: 'swift',
    title: '迅速',
    enTitle: 'Swift',
    description: '首次打出时，额外抽 1 张牌。',
    icon: '🦅',
    color: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.4)',
  },
  instinct: {
    type: 'instinct',
    title: '本能',
    enTitle: 'Instinct',
    description: '这张牌的攻击伤害翻倍。',
    icon: '💥',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.5)',
  },
};

export const STS2_AFFLICTIONS: Record<AfflictionType, AfflictionConfig> = {
  bound: {
    type: 'bound',
    title: '魂缚',
    enTitle: 'Bound',
    description: '每回合只能打出 1 张魂缚牌。',
    icon: '⛓️',
    color: '#64748b',
  },
  entangled: {
    type: 'entangled',
    title: '缠身',
    enTitle: 'Entangled',
    description: '能量费用增加 1 点。',
    icon: '🕸️',
    color: '#71717a',
  },
  galvanized: {
    type: 'galvanized',
    title: '流电',
    enTitle: 'Galvanized',
    description: '打出这张牌时受到 3 点反噬伤害。',
    icon: '⚡',
    color: '#f59e0b',
  },
  smog: {
    type: 'smog',
    title: '烟雾',
    enTitle: 'Smog',
    description: '本回合打出后无法再打出技能牌。',
    icon: '💨',
    color: '#52525b',
  },
  hexed: {
    type: 'hexed',
    title: '邪咒',
    enTitle: 'Hexed',
    description: '获得虚无，回合结束未打出则被消耗。',
    icon: '👁️',
    color: '#7c3aed',
  },
};

export function applyEnchantment(card: Card, type: EnchantmentType): Card {
  const config = STS2_ENCHANTMENTS[type];
  const newCard = { ...card };
  newCard.enchantment = type;
  newCard.enchantmentTitle = config.title;
  newCard.enchantmentDesc = config.description;

  if (type === 'sharp' && newCard.baseDamage !== undefined) {
    newCard.baseDamage += 4;
  } else if (type === 'adroit' && newCard.baseBlock !== undefined) {
    newCard.baseBlock += 4;
  } else if (type === 'instinct' && newCard.baseDamage !== undefined) {
    newCard.baseDamage *= 2;
  } else if (type === 'royally_approved') {
    newCard.retainCard = true;
  }
  return newCard;
}

export function applyAffliction(card: Card, type: AfflictionType): Card {
  const config = STS2_AFFLICTIONS[type];
  const newCard = { ...card };
  newCard.affliction = type;
  newCard.afflictionTitle = config.title;
  newCard.afflictionDesc = config.description;

  if (type === 'entangled') {
    newCard.cost = Math.min(newCard.cost + 1, 4);
  }
  return newCard;
}

export function getRandomEnchantments(count: number = 3): EnchantmentConfig[] {
  const all = Object.values(STS2_ENCHANTMENTS);
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
