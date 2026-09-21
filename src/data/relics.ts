import type { Relic } from '../types/game';

// 1. Saber (Artoria): Avalon
export const RELIC_SCHOLAR_SCROLL: Relic = {
  id: 'scholar_scroll',
  name: '遥远的理想乡 (Avalon)',
  desc: 'Saber 誓约之宝具。每场战斗首次打出词根连携牌时，立即抽 1 张牌并施加 1 层易伤。',
  icon: '✨',
  rarity: 'starter',
};

// 2. Archer (Gilgamesh): Babylon Key
export const RELIC_GILGAMESH_KEY: Relic = {
  id: 'babylon_key',
  name: '王之财宝之钥 (Babylon Key)',
  desc: 'Archer 黄金律宝具。战斗开始时获得 2 点力量；金币超 60 时每次攻击追加 3 点伤害；战斗胜利额外结算 50% 金币。',
  icon: '🗝️',
  rarity: 'starter',
};

// 3. Shielder (Mash): Lord Camelot
export const RELIC_PALADIN_AEGIS: Relic = {
  id: 'iron_aegis',
  name: '已然遥远的理想之城 (Lord Camelot)',
  desc: 'Shielder 守护之宝具。第一回合获得 8 点格挡；回合结束时保留当前未被消耗护甲的 50%。',
  icon: '🏰',
  rarity: 'starter',
};

// 4. Avenger (Jeanne Alter): La Grondement Du Haine
export const RELIC_JALTER_BANNER: Relic = {
  id: 'dragon_witch_banner',
  name: '咆哮吧，吾之愤怒 (La Grondement)',
  desc: 'Avenger 邪龙之旗。每次受到攻击对敌人反弹 4 点真实伤害；生命低于 50% 时，所有攻击伤害提升 50%。',
  icon: '🚩',
  rarity: 'starter',
};

// 5. Assassin (Serenity): Zabaniya Flask
export const RELIC_ALCHEMIST_FLASK: Relic = {
  id: 'toxic_flask',
  name: '妄想毒身之瓶 (Zabaniya Flask)',
  desc: 'Assassin 幽冥毒萃。战斗开始时，立即对敌方施加 3 层剧毒与 1 层虚弱。',
  icon: '🧪',
  rarity: 'starter',
};

// 6. Magus (Rin Tohsaka): Jewel Magic Crest
export const RELIC_WEAVER_FORK: Relic = {
  id: 'tuning_fork',
  name: '阿什托雷特魔术刻印 (Jewel Crest)',
  desc: 'Magus 魔力回路刻印。单回合每打出第 3 张牌时，立即返还 1 点能量并抽 1 张牌。',
  icon: '💎',
  rarity: 'starter',
};

export const ALL_RELICS: Relic[] = [
  RELIC_SCHOLAR_SCROLL,
  RELIC_GILGAMESH_KEY,
  RELIC_PALADIN_AEGIS,
  RELIC_JALTER_BANNER,
  RELIC_ALCHEMIST_FLASK,
  RELIC_WEAVER_FORK,
  {
    id: 'burning_blood',
    name: '燃烧之血 (Burning Blood)',
    desc: '在战斗结束时，回复 6 点生命。',
    icon: '🩸',
    rarity: 'common',
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
