export type SynergyId = 'warrior' | 'guardian' | 'assassin' | 'mage' | 'sovereign' | 'necro';

export interface SynergyInfo {
  id: SynergyId;
  name: string;
  icon: string;
  color: string;
  description: string;
  breakpoints: number[]; // e.g. [2, 4]
  descriptions: string[];
}

export interface ChessPieceConfig {
  id: string; // e.g. 'artoria', 'ironclad', ...
  name: string;
  enName: string;
  title: string;
  cost: number;
  avatar: string;
  synergies: SynergyId[];
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  maxMana: number;
  spd: number; // 速度：决定行动值 AV = 10000 / spd，越大越先动
  range: number; // 1: melee (frontline), 2-3: ranged
  skillName: string;
  skillDesc: string;
}

export interface ActiveChessUnit {
  instanceId: string;
  configId: string;
  name: string;
  avatar: string;
  cost: number;
  stars: number; // 1, 2, 3
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  atk: number;
  def: number;
  spd: number;
  av: number; // 行动值：越小越先行动，归零即轮到它
  range: number;
  synergies: SynergyId[];
  skillName: string;
  skillDesc: string;
  slot: number; // 0-7 for board, 0-7 for bench
  isBench: boolean;
  isEnemy?: boolean;
  // Runtime combat animation state
  targetId?: string | null;
  lastAttackTime?: number;
  isCastingSkill?: boolean;
  isHit?: boolean;
}

export interface ChessShopCard {
  shopIndex: number;
  config: ChessPieceConfig;
  cost: number;
  isDiscounted: boolean;
  isLocked?: boolean;
}

export interface EnemyWave {
  wave: number;
  title: string;
  desc: string;
  enemies: {
    configId: string;
    name: string;
    avatar: string;
    stars: number;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    spd: number;
    maxMana: number;
    range: number;
    slot: number;
    skillName: string;
  }[];
}

// 王者万象棋风格效果牌 (Tactical Effect Card)
export type EffectCardCategory = 'assault' | 'aegis' | 'tactic' | 'growth' | 'ultimate';

export type EffectCardType =
  | 'thunder_strike'     // 万象天雷: 轰炸敌方后排
  | 'meteor_cataclysm'  // 焚世天火: 巨型陨石轰炸战场中心
  | 'glacial_freeze'    // 霜华冰封: 冻结敌方核心输出
  | 'decapitate'        // 处决断头: 斩杀残血敌人
  | 'golden_aegis'      // 金钟罩体: 前排全员高额圣盾
  | 'berserk_fury'      // 嗜血狂暴: 全员攻速与移速飙升
  | 'mana_surge'        // 法力潮汐: 全体立即回复巨额法力开大
  | 'rejuvenating_rain' // 灵泉甘霖: 全体瞬发治疗与净化
  | 'shadow_ambush'     // 暗影突袭: 刺客暴击与后排突刺
  | 'bounty_harvest'    // 战阵悬赏: 击杀掉落金币
  | 'instant_star_up'   // 奇迹升星: 指定棋子升星
  | 'excalibur_blast'   // 誓约圣剑光炮: 毁灭性光柱横扫敌阵
  | 'gate_of_babylon'   // 王之宝库: 金色宝具剑雨倾泻
  | 'thorn_barrier'     // 荆棘反伤: 反弹受到伤害
  | 'haste_wind'        // 疾风迅令: 己方全体拉条（行动值大幅减少，提前行动）
  | 'frost_seal'        // 霜封锁轴: 敌方全体推条（行动值大幅增加，延后行动）
  | 'instant_strike';   // 疾影插队: 指定己方立刻行动，无视行动条

export interface EffectCard {
  id: string;
  name: string;
  enName: string;
  category: EffectCardCategory;
  cost: number; // 消耗战术能量 (0-2)
  icon: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  desc: string;
  empoweredDesc?: string; // 强化/升星效果说明
  effectType: EffectCardType;
  isUpgraded?: boolean;
}
