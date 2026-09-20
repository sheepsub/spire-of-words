import type { Relic } from '../types/game';

export const ALL_RELICS: Relic[] = [
  {
    id: 'burning_blood',
    name: '燃烧之血 (Burning Blood)',
    desc: '在战斗结束时，回复 6 点生命。',
    icon: '🩸',
    rarity: 'starter',
  },
  {
    id: 'rosetta_stone',
    name: '罗塞塔石碑 (Rosetta Stone)',
    desc: '战斗中直接显示词根解析；每回合开始额外抽 1 张牌。',
    icon: '📜',
    rarity: 'rare',
  },
  {
    id: 'oxford_lexicon',
    name: '先贤词典 (Ancient Lexicon)',
    desc: '战斗开始时获得 1 点额外能量。',
    icon: '📖',
    rarity: 'rare',
  },
  {
    id: 'anchor',
    name: '坚韧之锚 (Anchor)',
    desc: '在第一回合开始时，获得 10 点格挡。',
    icon: '⚓',
    rarity: 'common',
  },
  {
    id: 'vajra',
    name: '金刚杵 (Vajra)',
    desc: '战斗开始时，获得 1 点力量。',
    icon: '⚡',
    rarity: 'common',
  },
  {
    id: 'mnemonic_ring',
    name: '记忆指环 (Mnemonic Ring)',
    desc: '词汇回忆暴击（Critical Recall）伤害额外提升 30%。',
    icon: '💍',
    rarity: 'common',
  },
  {
    id: 'ebbinghaus_glass',
    name: '艾宾浩斯沙漏 (Hourglass)',
    desc: '在你的回合开始时，对所有敌人造成 4 点伤害。',
    icon: '⏳',
    rarity: 'rare',
  },
  {
    id: 'feather_quill',
    name: '博学羽毛笔 (Scholar\'s Quill)',
    desc: '每次成功回忆单词，获得 2 点金币。',
    icon: '🪶',
    rarity: 'shop',
  },
];

export const STARTER_RELIC: Relic = ALL_RELICS[0];
