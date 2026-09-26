import type { ChessPieceConfig, SynergyInfo, EnemyWave } from '../types/autoChess';

import artoriaImg from '../assets/pixel/artoria_pixel.png';
import gilgameshImg from '../assets/pixel/gilgamesh_pixel.png';
import mashImg from '../assets/pixel/mash_pixel.png';
import jalterImg from '../assets/pixel/jalter_pixel.png';
import serenityImg from '../assets/pixel/serenity_pixel.png';
import rinImg from '../assets/pixel/rin_pixel.png';
import ironcladImg from '../assets/pixel/ironclad_pixel.png';
import silentImg from '../assets/pixel/silent_pixel.png';
import defectImg from '../assets/pixel/defect_pixel.png';
import watcherImg from '../assets/pixel/watcher_pixel.png';
import necrobinderImg from '../assets/pixel/necrobinder_pixel.png';
import regentImg from '../assets/pixel/regent_pixel.png';
import phoebeImg from '../assets/pixel/phoebe_pixel.png';
import stewieImg from '../assets/pixel/stewie_pixel.png';

// Enemy pixel avatars
import jawWormSvg from '../assets/pixel/jaw_worm_pixel.svg';
import cultistSvg from '../assets/pixel/cultist_pixel.svg';
import gremlinNobSvg from '../assets/pixel/gremlin_nob_pixel.svg';
import hexaghostSvg from '../assets/pixel/hexaghost_pixel.svg';

// 6 Core Synergies
export const SYNERGIES: SynergyInfo[] = [
  {
    id: 'warrior',
    name: '剑士与狂战',
    icon: '⚔️',
    color: '#ef4444',
    description: '挥舞利刃的近战先锋，普攻吸血并撕裂护甲',
    breakpoints: [2, 4],
    descriptions: [
      '(2) 攻击吸血 25%，普攻削弱目标 5 点护甲',
      '(4) 攻击吸血 55%，普攻削弱目标 12 点护甲并获得暴击'
    ]
  },
  {
    id: 'guardian',
    name: '重装坚壁',
    icon: '🛡️',
    color: '#38bdf8',
    description: '坚不可摧的守护之城，开局赋予全军坚韧护盾',
    breakpoints: [2],
    descriptions: [
      '(2) 战斗开局为全体友军提供 80 点充能护甲，防御力 +20'
    ]
  },
  {
    id: 'assassin',
    name: '幽冥刺客',
    icon: '🗡️',
    color: '#22c55e',
    description: '潜行暗影的索命死神，战斗开始突袭敌方后排并附带剧毒',
    breakpoints: [2, 4],
    descriptions: [
      '(2) 开局突袭敌方后排，暴击率 +30%，普攻附加 4 点剧毒',
      '(4) 暴击率 +65%，暴击伤害 220%，剧毒扩散至全场目标'
    ]
  },
  {
    id: 'mage',
    name: '灵械魔导',
    icon: '⚡',
    color: '#0ea5e9',
    description: '引动以太与元素充能，攻速狂飙并高频施放大招',
    breakpoints: [2, 4],
    descriptions: [
      '(2) 攻击速度 +35%，普攻法力回复 +50%',
      '(4) 攻速 +80%，释放技能后立即返还 35 点法力'
    ]
  },
  {
    id: 'sovereign',
    name: '群星王者',
    icon: '👑',
    color: '#f59e0b',
    description: '君临天下的至高威严，根据持有金币造成巨额额外真实神圣伤害',
    breakpoints: [2],
    descriptions: [
      '(2) 每次攻击附加基于当前持有金币 15% 的真实穿透神圣伤害'
    ]
  },
  {
    id: 'necro',
    name: '死灵巫妖',
    icon: '💀',
    color: '#a855f7',
    description: '掌控生死黄泉契约，亡语唤醒远古白骨幽魂',
    breakpoints: [2],
    descriptions: [
      '(2) 友方棋子阵亡时，将以 50% 最大生命复活为骸骨幽灵继续作战'
    ]
  }
];

// All 12 Playable Pixel Chess Pieces
export const CHESS_PIECES: ChessPieceConfig[] = [
  // 1 费棋子
  {
    id: 'mash',
    name: '玛修',
    enName: 'Mash',
    title: '圆桌盾卫',
    cost: 1,
    avatar: mashImg,
    synergies: ['guardian'],
    baseHp: 650,
    baseAtk: 45,
    baseDef: 25,
    maxMana: 100,
    spd: 83,
    range: 1,
    skillName: '理想之城',
    skillDesc: '展开方碑巨盾，全体友军获得 120 护盾，持续 5 秒',
  },
  {
    id: 'serenity',
    name: '静谧哈桑',
    enName: 'Serenity',
    title: '暗影刺客',
    cost: 1,
    avatar: serenityImg,
    synergies: ['assassin'],
    baseHp: 480,
    baseAtk: 65,
    baseDef: 10,
    maxMana: 80,
    spd: 118,
    range: 1,
    skillName: '妄想毒身',
    skillDesc: '匕首刺穿要害，造成 180 伤害并施加 15 层剧毒',
  },
  {
    id: 'ironclad',
    name: '铁甲战士',
    enName: 'Ironclad',
    title: '赤红战鬼',
    cost: 1,
    avatar: ironcladImg,
    synergies: ['warrior'],
    baseHp: 620,
    baseAtk: 58,
    baseDef: 18,
    maxMana: 90,
    spd: 91,
    range: 1,
    skillName: '恶魔重劈',
    skillDesc: '跃起重剑劈砍，对目标造成 210 伤害并恢复 60 点生命',
  },

  // 2 费棋子
  {
    id: 'artoria',
    name: '阿尔托莉雅',
    enName: 'Artoria',
    title: '骑士王',
    cost: 2,
    avatar: artoriaImg,
    synergies: ['warrior', 'sovereign'],
    baseHp: 750,
    baseAtk: 72,
    baseDef: 22,
    maxMana: 100,
    spd: 100,
    range: 1,
    skillName: '誓约胜利之剑',
    skillDesc: '汇聚金色光辉斩出光柱，对整列敌人造成 280 魔法破甲伤害',
  },
  {
    id: 'silent',
    name: '静默猎手',
    enName: 'Silent',
    title: '幽冥刺客',
    cost: 2,
    avatar: silentImg,
    synergies: ['assassin'],
    baseHp: 540,
    baseAtk: 78,
    baseDef: 12,
    maxMana: 80,
    spd: 125,
    range: 2,
    skillName: '精准刃舞',
    skillDesc: '暴风般连续投掷 4 把飞刃，每把造成 85 暴击伤害',
  },
  {
    id: 'defect',
    name: '故障机器人',
    enName: 'Defect',
    title: '远古灵械',
    cost: 2,
    avatar: defectImg,
    synergies: ['mage'],
    baseHp: 580,
    baseAtk: 60,
    baseDef: 16,
    maxMana: 90,
    spd: 105,
    range: 3,
    skillName: '电动力学',
    skillDesc: '激发等离子闪电，在所有敌军之间高频弹射 5 次，每次 110 雷伤',
  },
  {
    id: 'rin',
    name: '远坂凛',
    enName: 'Rin',
    title: '宝石魔导',
    cost: 2,
    avatar: rinImg,
    synergies: ['mage'],
    baseHp: 520,
    baseAtk: 68,
    baseDef: 12,
    maxMana: 85,
    spd: 111,
    range: 3,
    skillName: '宝石暴鸣',
    skillDesc: '引爆 3 枚红宝石魔弹，对小范围敌人造成 240 爆炸伤害并击退',
  },

  // 3 费棋子
  {
    id: 'watcher',
    name: '观者',
    enName: 'Watcher',
    title: '神姿武僧',
    cost: 3,
    avatar: watcherImg,
    synergies: ['warrior', 'sovereign'],
    baseHp: 720,
    baseAtk: 92,
    baseDef: 20,
    maxMana: 90,
    spd: 105,
    range: 1,
    skillName: '神化诛邪',
    skillDesc: '化身神性姿态，在 6 秒内攻击力翻倍（+100%），攻击获得溅射',
  },
  {
    id: 'jalter',
    name: '黑贞德',
    enName: 'Jalter',
    title: '复仇魔女',
    cost: 3,
    avatar: jalterImg,
    synergies: ['warrior', 'assassin'],
    baseHp: 680,
    baseAtk: 96,
    baseDef: 14,
    maxMana: 100,
    spd: 111,
    range: 1,
    skillName: '咆哮吧吾之愤怒',
    skillDesc: '邪龙战旗插地，焚尽全场敌人造成 320 范围黑炎伤害并赋予重伤',
  },
  {
    id: 'regent',
    name: '储君',
    enName: 'Regent',
    title: '群星继承者',
    cost: 3,
    avatar: regentImg,
    synergies: ['sovereign', 'mage'],
    baseHp: 700,
    baseAtk: 88,
    baseDef: 18,
    maxMana: 90,
    spd: 100,
    range: 3,
    skillName: '群星之冕',
    skillDesc: '调动苍穹星辰光束轰击敌人造成 350 真实伤害，友军获得 20% 攻速',
  },

  {
    id: 'phoebe',
    name: '菲比',
    enName: 'Phoebe',
    title: '光噪告解者',
    cost: 3,
    avatar: phoebeImg,
    synergies: ['assassin', 'mage'],
    baseHp: 660,
    baseAtk: 82,
    baseDef: 16,
    maxMana: 95,
    spd: 103,
    range: 3,
    skillName: '光辉圣咏',
    skillDesc: '举起音感仪咏唱圣歌，对全场敌人施加 25 层光噪持续伤害，并引爆已叠加层数造成 300 衍射伤害',
  },

  // 4 费传说棋子
  {
    id: 'gilgamesh',
    name: '吉尔伽美什',
    enName: 'Gilgamesh',
    title: '英雄王',
    cost: 4,
    avatar: gilgameshImg,
    synergies: ['sovereign', 'mage'],
    baseHp: 820,
    baseAtk: 110,
    baseDef: 24,
    maxMana: 120,
    spd: 118,
    range: 3,
    skillName: '王之财宝',
    skillDesc: '开启 8 道黄金涟漪传送门，连续射出 8 柄宝具轰炸随机敌人，总计造成 650 伤害',
  },
  {
    id: 'necrobinder',
    name: '亡灵契约师',
    enName: 'Necrobinder',
    title: '巫妖女王',
    cost: 4,
    avatar: necrobinderImg,
    synergies: ['necro', 'guardian'],
    baseHp: 780,
    baseAtk: 95,
    baseDef: 22,
    maxMana: 100,
    spd: 100,
    range: 2,
    skillName: '奥斯提重锤',
    skillDesc: '唤来巨型幽冥白骨左手奥斯提砸击地面，造成 400 范围伤害并击晕敌人 2 秒',
  },
  {
    id: 'stewie',
    name: '饺子',
    enName: 'Stewie',
    title: '世界征服者',
    cost: 4,
    avatar: stewieImg,
    synergies: ['sovereign', 'mage'],
    baseHp: 700,
    baseAtk: 105,
    baseDef: 20,
    maxMana: 110,
    spd: 112,
    range: 3,
    skillName: '世界征服计划',
    skillDesc: '掏出高科技道具启动终极阴谋，对全体敌人造成 300 伤害，本回合每有 1 名友军行动则追加 60 伤害',
  }
];

// Spire Monster Waves
export const ENEMY_WAVES: EnemyWave[] = [
  {
    wave: 1,
    title: '第 1 波 · 尖塔地窟蠕虫',
    desc: '遭遇两只饥饿的咬咬虫，小心它们的尖牙！',
    enemies: [
      {
        configId: 'jaw_worm_1',
        name: '下颚蠕虫',
        avatar: jawWormSvg,
        stars: 1,
        hp: 350,
        maxHp: 350,
        atk: 32,
        def: 10,
        spd: 95,
        maxMana: 60,
        range: 1,
        slot: 1,
        skillName: '下颚撕咬'
      },
      {
        configId: 'jaw_worm_2',
        name: '下颚蠕虫',
        avatar: jawWormSvg,
        stars: 1,
        hp: 350,
        maxHp: 350,
        atk: 32,
        def: 10,
        spd: 95,
        maxMana: 60,
        range: 1,
        slot: 2,
        skillName: '下颚撕咬'
      }
    ]
  },
  {
    wave: 2,
    title: '第 2 波 · 鸟人邪教徒仪式',
    desc: '「咔——咔！」狂热的邪教徒正在祈求邪神赐予力量！',
    enemies: [
      {
        configId: 'cultist_1',
        name: '狂热教徒',
        avatar: cultistSvg,
        stars: 1,
        hp: 420,
        maxHp: 420,
        atk: 40,
        def: 12,
        spd: 100,
        maxMana: 70,
        range: 2,
        slot: 0,
        skillName: '邪神之怒'
      },
      {
        configId: 'jaw_worm_guard',
        name: '护卫蠕虫',
        avatar: jawWormSvg,
        stars: 1,
        hp: 480,
        maxHp: 480,
        atk: 35,
        def: 15,
        spd: 88,
        maxMana: 80,
        range: 1,
        slot: 1,
        skillName: '坚固防壁'
      },
      {
        configId: 'cultist_2',
        name: '狂热教徒',
        avatar: cultistSvg,
        stars: 1,
        hp: 420,
        maxHp: 420,
        atk: 40,
        def: 12,
        spd: 100,
        maxMana: 70,
        range: 2,
        slot: 3,
        skillName: '邪神之怒'
      }
    ]
  },
  {
    wave: 3,
    title: '第 3 波 · 菁英地精大暴君 (Gremlin Nob)',
    desc: '浑身血红的地精暴君挥舞巨木狼牙棒冲锋！',
    enemies: [
      {
        configId: 'gremlin_nob',
        name: '地精暴君',
        avatar: gremlinNobSvg,
        stars: 2,
        hp: 1200,
        maxHp: 1200,
        atk: 75,
        def: 25,
        spd: 88,
        maxMana: 90,
        range: 1,
        slot: 1,
        skillName: '暴怒重击'
      },
      {
        configId: 'cultist_supporter',
        name: '附魔教徒',
        avatar: cultistSvg,
        stars: 1,
        hp: 450,
        maxHp: 450,
        atk: 45,
        def: 15,
        spd: 100,
        maxMana: 70,
        range: 2,
        slot: 3,
        skillName: '力量狂热'
      }
    ]
  },
  {
    wave: 4,
    title: '第 4 波 · 首领六火亡魂 (Hexaghost)',
    desc: '幽灵烈焰升腾，六道幽灵火球准备灼烧一切！',
    enemies: [
      {
        configId: 'hexaghost',
        name: '六火亡魂',
        avatar: hexaghostSvg,
        stars: 3,
        hp: 2200,
        maxHp: 2200,
        atk: 95,
        def: 35,
        spd: 108,
        maxMana: 100,
        range: 2,
        slot: 2,
        skillName: '六火烈焰灭尽'
      }
    ]
  }
];
