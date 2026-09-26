import artoriaImg from '../assets/pixel/artoria_pixel.png';
import gilgameshImg from '../assets/pixel/gilgamesh_pixel.png';
import mashImg from '../assets/pixel/mash_pixel.png';
import jalterImg from '../assets/pixel/jalter_pixel.png';
import serenityImg from '../assets/pixel/serenity_pixel.png';
import rinImg from '../assets/pixel/rin_pixel.png';
import ironcladImg from '../assets/pixel/ironclad_pixel.png';
import silentImg from '../assets/pixel/silent_pixel.png';
import defectImg from '../assets/pixel/defect_pixel.png';
import necrobinderImg from '../assets/pixel/necrobinder_pixel.png';
import regentImg from '../assets/pixel/regent_pixel.png';
import phoebeImg from '../assets/pixel/phoebe_pixel.png';
import stewieImg from '../assets/pixel/stewie_pixel.png';
import cultistImg from '../assets/cultist.jpg';

export type CompanionSynergy = 'warrior' | 'guardian' | 'assassin' | 'mage' | 'sovereign' | 'necro';

export interface SpireCompanionConfig {
  id: string;
  name: string;
  title: string;
  avatar: string;
  synergy: CompanionSynergy;
  synergyName: string;
  synergyColor: string;
  cost: number;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  triggerTag: 'attack' | 'skill' | 'power' | 'critical' | 'poison' | 'shield';
  triggerDesc: string;
  coopDamage: number;
  coopBlock: number;
  ultimateName: string;
  ultimateDesc: string;
  // Lv3 Breakpoint qualitative leap (质变效果)
  awakenedDesc: string;
}

export interface SpireCompanionInstance {
  instanceId: string;
  configId: string;
  name: string;
  title: string;
  avatar: string;
  synergy: CompanionSynergy;
  synergyName: string;
  synergyColor: string;
  level: number; // 1, 2, 3
  hp: number;
  maxHp: number;
  block: number;
  mana: number; // 0..100
  maxMana: number;
  atk: number;
  def: number;
  triggerTag: 'attack' | 'skill' | 'power' | 'critical' | 'poison' | 'shield';
  triggerDesc: string;
  coopDamage: number;
  coopBlock: number;
  ultimateName: string;
  ultimateDesc: string;
  awakenedDesc: string;
  isCastingUltimate?: boolean;
}

export const ALL_COMPANION_CONFIGS: SpireCompanionConfig[] = [
  // 1. 玛修 · 🛡️ 重装坚壁
  {
    id: 'mash',
    name: '玛修 · 基列莱特',
    title: '盾之亚从者 · 理想之城',
    avatar: mashImg,
    synergy: 'guardian',
    synergyName: '重装坚壁',
    synergyColor: '#38bdf8',
    cost: 50,
    baseHp: 45,
    baseAtk: 4,
    baseDef: 8,
    triggerTag: 'shield',
    triggerDesc: '玩家打出【防御/技能牌】时，协同撑开坚韧护盾 (+6 护盾，全体 +3 护盾)',
    coopDamage: 0,
    coopBlock: 6,
    ultimateName: '已然遥远的理想之城 (Lord Camelot)',
    ultimateDesc: '展开白垩之城，为全队提供 20 充能护盾并免疫下 1 次伤害',
    awakenedDesc: '【Lv.3 质变】开局直接赋予全体友方 25 点无上护盾，且每次协防护盾翻倍！',
  },

  // 2. 阿尔托莉雅 · ⚔️ 剑士先锋
  {
    id: 'artoria',
    name: '阿尔托莉雅',
    title: '不列颠骑士王 · 誓约之剑',
    avatar: artoriaImg,
    synergy: 'warrior',
    synergyName: '剑士先锋',
    synergyColor: '#2563eb',
    cost: 75,
    baseHp: 40,
    baseAtk: 9,
    baseDef: 4,
    triggerTag: 'attack',
    triggerDesc: '玩家打出【攻击牌】时，协同风王突刺 (造成 8 伤害并剥除 3 点护甲)',
    coopDamage: 8,
    coopBlock: 0,
    ultimateName: '誓约胜利之剑 (Excalibur)',
    ultimateDesc: '耀眼黄金光炮轰击全场，造成 24 点穿透物理伤害并附加 2 层易伤',
    awakenedDesc: '【Lv.3 质变】风王突刺伤害翻倍为 16 点，且大招直接斩断目标 50% 当前护甲！',
  },

  // 3. 吉尔伽美什 · 👑 群星王者
  {
    id: 'gilgamesh',
    name: '吉尔伽美什',
    title: '黄金律 · 英雄王',
    avatar: gilgameshImg,
    synergy: 'sovereign',
    synergyName: '群星王者',
    synergyColor: '#eab308',
    cost: 90,
    baseHp: 38,
    baseAtk: 12,
    baseDef: 2,
    triggerTag: 'attack',
    triggerDesc: '打出【攻击牌】时金色涟漪射击 (附加基于当前持有金币 10% 的神圣伤害)',
    coopDamage: 7,
    coopBlock: 0,
    ultimateName: '王之财宝 (Gate of Babylon)',
    ultimateDesc: '万宝齐射暴风骤雨，造成 4 段打击 (每段 6 + 金币/20 伤害)',
    awakenedDesc: '【Lv.3 质变】每次协战神圣伤害翻倍为金币的 20%，并在战胜后额外偷取 15 枚纯金！',
  },

  // 4. 静默猎手 · 🗡️ 幽冥刺客
  {
    id: 'silent',
    name: '静默猎手',
    title: '雾林毒刺 · 尖塔刺客',
    avatar: silentImg,
    synergy: 'assassin',
    synergyName: '幽冥刺客',
    synergyColor: '#22c55e',
    cost: 65,
    baseHp: 34,
    baseAtk: 8,
    baseDef: 3,
    triggerTag: 'poison',
    triggerDesc: '敌人拥有【中毒】或打出【攻击牌】时，协同投掷淬毒飞刀 (6 伤害 + 3 中毒)',
    coopDamage: 6,
    coopBlock: 0,
    ultimateName: '精准刃舞 (Blade Dance)',
    ultimateDesc: '投掷 6 柄剧毒飞刃，总计造成 20 点伤害并将全场敌人中毒层数翻倍',
    awakenedDesc: '【Lv.3 质变】飞刀暴击率提升至 100%，且每层中毒让刺客伤害提升 2%！',
  },

  // 5. 故障机器人 · ⚡ 灵械魔导
  {
    id: 'defect',
    name: '故障机器人',
    title: '远古自律核心 · 电动力学',
    avatar: defectImg,
    synergy: 'mage',
    synergyName: '灵械魔导',
    synergyColor: '#0ea5e9',
    cost: 70,
    baseHp: 36,
    baseAtk: 7,
    baseDef: 5,
    triggerTag: 'critical',
    triggerDesc: '打出【攻击牌】或【能力牌】时，激发连锁充能闪电 (8 伤害 + 回复 1 能量)',
    coopDamage: 8,
    coopBlock: 0,
    ultimateName: '电动力学 (Electrodynamics)',
    ultimateDesc: '等离子风暴轰鸣全场，造成 22 点闪电贯穿伤害并附加 2 虚弱',
    awakenedDesc: '【Lv.3 质变】每次充能闪电额外给予玩家 +1 抽牌，魔导大招无消耗重放一次！',
  },

  // 6. 亡灵奥斯提 · 💀 死灵巫妖
  {
    id: 'necrobinder',
    name: '契约之手 · 奥斯提',
    title: '幽冥巫妖 · 骸骨巨腕',
    avatar: necrobinderImg,
    synergy: 'necro',
    synergyName: '死灵巫妖',
    synergyColor: '#a855f7',
    cost: 80,
    baseHp: 50,
    baseAtk: 6,
    baseDef: 6,
    triggerTag: 'power',
    triggerDesc: '玩家受到攻击或打出【终结技】时，骸骨巨爪反扑 (吸收 8 伤害并反噬 8 点死灵暗劲)',
    coopDamage: 8,
    coopBlock: 8,
    ultimateName: '冥府死兆星 (Doom of Styx)',
    ultimateDesc: '天降幽冥死兆，对敌人施加 20 点死灵伤害（生命低于 20% 时直接绝杀）',
    awakenedDesc: '【Lv.3 质变】玩家受到致命伤害时，奥斯提替死并立即复活玩家恢复 35% 生命！',
  },

  // 7. 邪教徒随从 · 🦅 尖塔同盟
  {
    id: 'cultist',
    name: '狂信邪教徒',
    title: '喀喀喀 · 尖塔先知',
    avatar: cultistImg,
    synergy: 'warrior',
    synergyName: '剑士先锋',
    synergyColor: '#f97316',
    cost: 40,
    baseHp: 30,
    baseAtk: 5,
    baseDef: 2,
    triggerTag: 'attack',
    triggerDesc: '每回合开始自动吟唱【力量涌动 (+1 力量)】，玩家出牌时协同啄击 (5 伤害)',
    coopDamage: 5,
    coopBlock: 0,
    ultimateName: '吾力无可匹敌！(My Power is Unmatched!)',
    ultimateDesc: '狂暴羽翼拍击，获得 3 点永久力量并狂啄敌人造成 18 点伤害',
    awakenedDesc: '【Lv.3 质变】力量提升效果翻倍为每回合 +2 力量！',
  },

  // 8. 铁甲战士 · ⚔️ 恶魔先锋
  {
    id: 'ironclad',
    name: '铁甲战士',
    title: '恶魔之血 · 尖塔老将',
    avatar: ironcladImg,
    synergy: 'warrior',
    synergyName: '剑士先锋',
    synergyColor: '#ef4444',
    cost: 70,
    baseHp: 48,
    baseAtk: 10,
    baseDef: 4,
    triggerTag: 'attack',
    triggerDesc: '打出【攻击牌】时协同重刃狂斩 (造成 9 伤害)',
    coopDamage: 9,
    coopBlock: 0,
    ultimateName: '恶魔形态 (Demon Form)',
    ultimateDesc: '释放恶魔之炎，立刻对敌人造成 25 点重创并获得 3 点临时力量',
    awakenedDesc: '【Lv.3 质变】每回合自动提供 +2 力量，攻击附带 50% 溅射真伤！',
  },

  // 9. 贞德 [Alter] · 💀 龙之魔女
  {
    id: 'jalter',
    name: '贞德 [Alter]',
    title: '龙之魔女 · 绝望咆哮',
    avatar: jalterImg,
    synergy: 'necro',
    synergyName: '死灵巫妖',
    synergyColor: '#a855f7',
    cost: 85,
    baseHp: 42,
    baseAtk: 11,
    baseDef: 3,
    triggerTag: 'power',
    triggerDesc: '玩家受到伤害或生命低于 50% 时，邪龙黑炎反震 (造成 10 伤害)',
    coopDamage: 10,
    coopBlock: 0,
    ultimateName: '咆哮吧！我的愤怒 (La Grondement Du Haine)',
    ultimateDesc: '插下诅咒战旗召唤狱火，造成 28 点黑炎灼烧并施加 3 层易伤',
    awakenedDesc: '【Lv.3 质变】狂暴反伤效果翻倍为 20 点，且终极技直接斩杀低于 25% 生命目标！',
  },

  // 10. 静谧哈桑 · 🗡️ 曼陀罗毒刺
  {
    id: 'serenity',
    name: '静谧哈桑',
    title: '暗杀教团 · 曼陀罗之花',
    avatar: serenityImg,
    synergy: 'assassin',
    synergyName: '幽冥刺客',
    synergyColor: '#10b981',
    cost: 60,
    baseHp: 32,
    baseAtk: 7,
    baseDef: 3,
    triggerTag: 'poison',
    triggerDesc: '打出【技能牌】或【剧毒牌】时协同毒雾潜行 (造成 6 伤害 + 2 中毒)',
    coopDamage: 6,
    coopBlock: 0,
    ultimateName: '妄想毒身 (Zabaniya)',
    ultimateDesc: '剧毒接吻，引爆敌人体内全部毒素并附加 5 层剧毒与 2 层虚弱',
    awakenedDesc: '【Lv.3 质变】剧毒不再随回合自然衰减，敌人每层中毒受到 1.5 倍毒发伤害！',
  },

  // 11. 远坂凛 · 💎 魔术名门
  {
    id: 'rin',
    name: '远坂凛',
    title: '宝石魔术使 · 极光结晶',
    avatar: rinImg,
    synergy: 'mage',
    synergyName: '灵械魔导',
    synergyColor: '#ec4899',
    cost: 75,
    baseHp: 35,
    baseAtk: 8,
    baseDef: 4,
    triggerTag: 'critical',
    triggerDesc: '暴击时协同投掷五大元素宝石弹 (造成 8 伤害 + 获得 4 护盾)',
    coopDamage: 8,
    coopBlock: 4,
    ultimateName: '宝石魔术 · 极光爆破 (Jewel Barrage)',
    ultimateDesc: '释放红宝石储备，造成 24 点魔力冲击并为玩家抽 2 张牌',
    awakenedDesc: '【Lv.3 质变】每次暴击额外使下一张打出的卡牌耗能降为 0！',
  },

  // 12. 摄政王 · 👑 猩红王权
  {
    id: 'regent',
    name: '摄政王',
    title: '猩红之座 · 尖塔统帅',
    avatar: regentImg,
    synergy: 'sovereign',
    synergyName: '群星王者',
    synergyColor: '#dc2626',
    cost: 85,
    baseHp: 44,
    baseAtk: 9,
    baseDef: 5,
    triggerTag: 'attack',
    triggerDesc: '打出第 2 张攻击牌时协同猩红号令 (造成 9 伤害并提升全队 2 点护盾)',
    coopDamage: 9,
    coopBlock: 2,
    ultimateName: '猩红之冕 (Regent Verdict)',
    ultimateDesc: '王之裁决斩落，造成 26 点裁决重创并使敌人下一回合力量 -4',
    awakenedDesc: '【Lv.3 质变】全队随从攻击力永久提升 25%，并额外获得 20% 金币利息收益！',
  },

  // 13. 菲比 · 🗡️ 光噪虚蚀
  {
    id: 'phoebe',
    name: '菲比',
    title: '隐海修会 · 光噪告解者',
    avatar: phoebeImg,
    synergy: 'assassin',
    synergyName: '幽冥刺客',
    synergyColor: '#38bdf8',
    cost: 70,
    baseHp: 33,
    baseAtk: 7,
    baseDef: 4,
    triggerTag: 'poison',
    triggerDesc: '敌人带有【中毒】或玩家打出【技能牌】时，协同咏唱光噪圣歌 (造成 7 伤害 + 2 层光噪)',
    coopDamage: 7,
    coopBlock: 0,
    ultimateName: '光辉圣咏 (Radiant Hymn)',
    ultimateDesc: '举起音感仪咏唱，引爆全场敌人身上的持续伤害并额外附加 6 层光噪',
    awakenedDesc: '【Lv.3 质变】光噪层数不再随回合衰减，且每层光噪额外造成 1.5 倍结算伤害！',
  },

  // 14. 饺子 · 👑 谋略统率
  {
    id: 'stewie',
    name: '饺子',
    title: '世界征服者 · 阴谋天才',
    avatar: stewieImg,
    synergy: 'sovereign',
    synergyName: '群星王者',
    synergyColor: '#fb923c',
    cost: 85,
    baseHp: 42,
    baseAtk: 10,
    baseDef: 4,
    triggerTag: 'skill',
    triggerDesc: '玩家每打出 3 张牌，协同启动一次阴谋 (造成 10 伤害 + 获得 3 护盾)',
    coopDamage: 10,
    coopBlock: 3,
    ultimateName: '天才的最终审判 (Final Verdict)',
    ultimateDesc: '掏出高科技道具发动终极阴谋，造成 28 点穿透伤害（无视护甲）',
    awakenedDesc: '【Lv.3 质变】每回合第一张牌耗能降为 0，且阴谋触发次数翻倍！',
  },
];

// Calculate Financial Interest (from Honkai Star Rail Currency Wars)
// Every 10 gold gives +1 dividend at victory, capped at +5 gold per combat
export function calculateInterest(gold: number): number {
  return Math.min(5, Math.floor(gold / 10));
}

// Convert Config into Active Spire Companion Instance
export function createCompanionInstance(config: SpireCompanionConfig, level: number = 1): SpireCompanionInstance {
  const levelMultiplier = level === 1 ? 1 : level === 2 ? 1.4 : 1.9;
  const maxHp = Math.round(config.baseHp * levelMultiplier);
  const atk = Math.round(config.baseAtk * levelMultiplier);
  const def = Math.round(config.baseDef * levelMultiplier);
  const coopDamage = Math.round(config.coopDamage * levelMultiplier);
  const coopBlock = Math.round(config.coopBlock * levelMultiplier);

  return {
    instanceId: `comp_${config.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    configId: config.id,
    name: config.name,
    title: config.title,
    avatar: config.avatar,
    synergy: config.synergy,
    synergyName: config.synergyName,
    synergyColor: config.synergyColor,
    level,
    hp: maxHp,
    maxHp,
    block: 0,
    mana: 25, // Start with some initial mana for rapid battle excitement
    maxMana: 100,
    atk,
    def,
    triggerTag: config.triggerTag,
    triggerDesc: config.triggerDesc,
    coopDamage,
    coopBlock,
    ultimateName: config.ultimateName,
    ultimateDesc: config.ultimateDesc,
    awakenedDesc: config.awakenedDesc,
  };
}

// Upgrade an existing companion to next level
export function upgradeCompanion(companion: SpireCompanionInstance): SpireCompanionInstance {
  const nextLevel = Math.min(3, companion.level + 1);
  const config = ALL_COMPANION_CONFIGS.find(c => c.id === companion.configId);
  if (!config) return companion;
  
  const upgraded = createCompanionInstance(config, nextLevel);
  upgraded.instanceId = companion.instanceId;
  upgraded.hp = Math.min(upgraded.maxHp, companion.hp + (upgraded.maxHp - companion.maxHp));
  upgraded.mana = companion.mana;
  return upgraded;
}
