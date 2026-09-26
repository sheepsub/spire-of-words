import type { Relic } from '../types/game';

// 1. Saber (Artoria): Avalon
export const RELIC_SCHOLAR_SCROLL: Relic = {
  id: 'scholar_scroll',
  name: '遥远的理想乡 (Avalon)',
  desc: 'Saber 誓约之宝具。每场战斗首次打出攻击牌时，立即抽 1 张牌并施加 1 层易伤。',
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

// 7. Necrobinder (STS2 亡灵契约师): Hand of Osti
export const RELIC_NECRO_HAND: Relic = {
  id: 'necro_hand',
  name: '奥斯提之灵 (Hand of Osti)',
  desc: 'STS2 亡灵契约师契约。战斗开始时召唤奥斯提并使 1 张手牌获得【注能】附魔；消耗卡牌时汲取 2 点生命。',
  icon: '💀',
  rarity: 'starter',
};

// 8. Regent (STS2 储君): Crown of Stars
export const RELIC_REGENT_CROWN: Relic = {
  id: 'regent_crown',
  name: '群星之冕 (Crown of Stars)',
  desc: 'STS2 储君星辰宝器。每回合打出的第一张牌自动获得【华彩】重放；每次暴击造成 2 倍伤害。',
  icon: '👑',
  rarity: 'starter',
};

// 9. STS1 铁甲战士: Burning Blood
export const RELIC_BURNING_BLOOD: Relic = {
  id: 'burning_blood',
  name: '燃烧之血 (Burning Blood)',
  desc: '铁甲战士不灭恶魔之誓。战斗结束时，立即回复 6 点生命。',
  icon: '🩸',
  rarity: 'starter',
};

// 10. STS1 静默猎手: Ring of the Snake
export const RELIC_RING_OF_SNAKE: Relic = {
  id: 'ring_of_snake',
  name: '蛇之戒指 (Ring of the Snake)',
  desc: '静默猎手剧毒誓戒。在第一回合额外抽 2 张牌。',
  icon: '🐍',
  rarity: 'starter',
};

// 11. STS1 故障机器人: Cracked Core
export const RELIC_CRACKED_CORE: Relic = {
  id: 'cracked_core',
  name: '破损核心 (Cracked Core)',
  desc: '故障机器人古代能量核。在战斗开始时，生成 1 个雷电充能球（每回合造成 3 点自动穿透伤害）。',
  icon: '⚡',
  rarity: 'starter',
};

// 12. STS1 观者: Pure Water
export const RELIC_PURE_WATER: Relic = {
  id: 'pure_water',
  name: '纯洁水珠 (Pure Water)',
  desc: '观者清修圣水。在战斗开始时，将 1 张 0 费奇迹牌（获得 1 能量并保留）加入手牌。',
  icon: '💧',
  rarity: 'starter',
};

// 13. STS2 先祖附魔铁砧
export const RELIC_ANCIENT_ANVIL: Relic = {
  id: 'ancient_anvil',
  name: '先祖附魔砧 (Anvil of the Ancients)',
  desc: '古代尖塔遗落的锻造砧。可以在休息处为 1 张卡牌进行永久附魔。',
  icon: '⚒️',
  rarity: 'rare',
};

// 14. Phoebe (鸣潮 · 隐海修会): Spectro Censer
export const RELIC_PHOEBE_CENSER: Relic = {
  id: 'spectro_censer',
  name: '隐海圣物 · 光噪香炉 (Spectro Censer)',
  desc: '菲比告解之器。战斗开始时，立即对敌方全体施加 2 层光噪（持续伤害），并使其衍射抗性降低 15%。',
  icon: '🕯️',
  rarity: 'starter',
};

// 15. Stewie (恶搞之家): Conquest Blueprint
export const RELIC_STEWIE_BLUEPRINT: Relic = {
  id: 'conquest_blueprint',
  name: '世界征服蓝图 (Conquest Blueprint)',
  desc: '饺子谋略之书。每回合打出的第一张牌耗能降为 0；每打出 3 张牌，随机 1 张手牌获得 1 层「谋略」。',
  icon: '📋',
  rarity: 'starter',
};

export const ALL_RELICS: Relic[] = [
  RELIC_SCHOLAR_SCROLL,
  RELIC_GILGAMESH_KEY,
  RELIC_PALADIN_AEGIS,
  RELIC_JALTER_BANNER,
  RELIC_ALCHEMIST_FLASK,
  RELIC_WEAVER_FORK,
  RELIC_NECRO_HAND,
  RELIC_REGENT_CROWN,
  RELIC_BURNING_BLOOD,
  RELIC_RING_OF_SNAKE,
  RELIC_CRACKED_CORE,
  RELIC_PURE_WATER,
  RELIC_PHOEBE_CENSER,
  RELIC_STEWIE_BLUEPRINT,
  RELIC_ANCIENT_ANVIL,
  {
    id: 'ancient_tablet',
    name: '远古石板 (Ancient Tablet)',
    desc: '每回合开始时额外抽 1 张牌。',
    icon: '📜',
    rarity: 'rare',
  },
  {
    id: 'ancient_relic',
    name: '先贤遗物 (Ancient Relic)',
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
    name: '共鸣指环 (Resonance Ring)',
    desc: '每回合首次造成伤害时，伤害提升 30%。',
    icon: '💍',
    rarity: 'common',
  },
  {
    id: 'ebbinghaus_glass',
    name: '时之沙漏 (Hourglass)',
    desc: '在你的回合开始时，对所有敌人造成 4 点伤害。',
    icon: '⏳',
    rarity: 'rare',
  },
  {
    id: 'feather_quill',
    name: '黄金羽笔 (Golden Quill)',
    desc: '每场战斗胜利后额外获得 2 点金币。',
    icon: '🪶',
    rarity: 'shop',
  },
];

export const STARTER_RELIC: Relic = ALL_RELICS[0];
