import type { Enemy, EnemyIntent } from '../types/game';

export interface EnemyTemplate {
  name: string;
  title: string;
  avatar: string;
  minHp: number;
  maxHp: number;
  getIntents: (turn: number, enemy: Enemy) => EnemyIntent;
  isElite?: boolean;
  isBoss?: boolean;
}

export const MONSTER_TEMPLATES: EnemyTemplate[] = [
  // 1. 巴别教徒 (Cultist of Babel) - Classic Spire scaling threat
  {
    name: '巴别教徒',
    title: '语言的狂热信徒',
    avatar: '🦅',
    minHp: 48,
    maxHp: 54,
    getIntents: (turn) => {
      if (turn === 1) {
        return {
          type: 'buff',
          desc: '【咒语宣扬】获得 2 点仪式（每回合力量+2）',
        };
      }
      return {
        type: 'attack',
        value: 6,
        desc: '【黑暗突刺】造成 6 基础伤害',
      };
    },
  },
  // 2. 下颚蠕虫 (Jaw Worm)
  {
    name: '下颚蠕虫',
    title: '尖塔底层的吞噬者',
    avatar: '🐛',
    minHp: 40,
    maxHp: 46,
    getIntents: (turn) => {
      const cycle = turn % 3;
      if (cycle === 1) {
        return {
          type: 'attack',
          value: 11,
          desc: '【重嚼】造成 11 点伤害',
        };
      } else if (cycle === 2) {
        return {
          type: 'buff',
          value: 6,
          desc: '【咆哮】获得 6 点格挡与 3 点力量',
        };
      } else {
        return {
          type: 'attack',
          value: 7,
          desc: '【扑打】造成 7 点伤害并获得 5 点格挡',
        };
      }
    },
  },
  // 3. 酸液软泥怪 (Acid Slime)
  {
    name: '酸液软泥怪',
    title: '腐蚀性巨型原生体',
    avatar: '🧪',
    minHp: 44,
    maxHp: 50,
    getIntents: (turn) => {
      if (turn % 2 === 1) {
        return {
          type: 'attack',
          value: 8,
          desc: '【腐蚀唾液】造成 8 点伤害，施加 1 层虚弱',
        };
      }
      return {
        type: 'attack',
        value: 12,
        desc: '【猛烈冲撞】造成 12 点伤害',
      };
    },
  },
];

export const ELITE_TEMPLATES: EnemyTemplate[] = [
  // 地精大块头 (Gremlin Nob) - Tests skill vs attack balance
  {
    name: '地精大块头',
    title: '狂怒的嗜血巨怪',
    avatar: '👹',
    minHp: 82,
    maxHp: 88,
    isElite: true,
    getIntents: (turn) => {
      if (turn === 1) {
        return {
          type: 'buff',
          desc: '【激怒咆哮】进入激怒状态（玩家每次打出技能卡，其力量+2）',
        };
      } else if (turn % 3 === 2) {
        return {
          type: 'attack',
          value: 14,
          desc: '【狂怒冲锋】造成 14 伤害并施加易伤',
        };
      } else {
        return {
          type: 'attack',
          value: 18,
          desc: '【巨锤重砸】造成 18 伤害',
        };
      }
    },
  },
];

export const BOSS_TEMPLATES: EnemyTemplate[] = [
  // 六角亡魂 (Hexaghost) - Act 1 Boss
  {
    name: '六角亡魂',
    title: '尖塔第一幕领主',
    avatar: '👻',
    minHp: 150,
    maxHp: 160,
    isBoss: true,
    getIntents: (turn) => {
      if (turn === 1) {
        return {
          type: 'buff',
          desc: '【幽冥点火】激活 6 道灵魂幽火',
        };
      } else if (turn === 2) {
        return {
          type: 'attack',
          value: 3,
          times: 6,
          desc: '【炼狱轰击】造成 3x6 共 18 点伤害！',
        };
      } else if (turn % 3 === 0) {
        return {
          type: 'defend',
          value: 16,
          desc: '【幽火屏障】获得 16 点格挡并强化自身',
        };
      } else {
        return {
          type: 'attack',
          value: 12,
          desc: '【灼热幽光】造成 12 点伤害',
        };
      }
    },
  },
];

export function createEnemy(template: EnemyTemplate): Enemy {
  const hp = Math.floor(Math.random() * (template.maxHp - template.minHp + 1)) + template.minHp;
  const dummyEnemy: Enemy = {
    id: `enemy_${Date.now()}_${Math.random()}`,
    name: template.name,
    title: template.title,
    maxHp: hp,
    hp: hp,
    block: 0,
    avatar: template.avatar,
    statusEffects: {
      strength: 0,
      weak: 0,
      vulnerable: 0,
      poison: 0,
      dexterity: 0,
      ritual: template.name.includes('教徒') ? 0 : undefined,
    },
    intent: { type: 'attack', desc: '准备就绪' },
    patternIndex: 1,
    isBoss: template.isBoss,
    isElite: template.isElite,
  };
  dummyEnemy.intent = template.getIntents(1, dummyEnemy);
  return dummyEnemy;
}

export function getRandomMonster(floor: number): Enemy {
  if (floor === 15) {
    return createEnemy(BOSS_TEMPLATES[0]);
  }
  if (floor === 8 || floor === 12) {
    return createEnemy(ELITE_TEMPLATES[0]);
  }
  const t = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
  return createEnemy(t);
}
