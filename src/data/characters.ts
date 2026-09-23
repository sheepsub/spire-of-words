import type { Card, Relic, VocabArchetype } from '../types/game';
import { VOCABULARY_CARDS } from './vocabulary';
import {
  RELIC_SCHOLAR_SCROLL,
  RELIC_GILGAMESH_KEY,
  RELIC_PALADIN_AEGIS,
  RELIC_JALTER_BANNER,
  RELIC_ALCHEMIST_FLASK,
  RELIC_WEAVER_FORK,
  RELIC_NECRO_HAND,
  RELIC_REGENT_CROWN,
} from './relics';

// Official Fate/Grand Order High-Definition Servant Artwork
import charSaberImg from '../assets/fate/artoria.png';
import charSaberCard from '../assets/fate/artoria_card.png';
import charGilgameshImg from '../assets/fate/gilgamesh.png';
import charGilgameshCard from '../assets/fate/gilgamesh_card.png';
import charMashImg from '../assets/fate/mash.png';
import charMashCard from '../assets/fate/mash_card.png';
import charJalterImg from '../assets/fate/jalter.png';
import charJalterCard from '../assets/fate/jalter_card.png';
import charSerenityImg from '../assets/fate/serenity.png';
import charSerenityCard from '../assets/fate/serenity_card.png';
import charRinImg from '../assets/fate/rin.png';
import charRinCard from '../assets/fate/rin_card.png';

export interface CharacterDefinition {
  id: string;
  name: string;
  enName: string;
  title: string;
  archetype: VocabArchetype;
  archetypeName: string;
  archetypeTag: string;
  archetypeColor: string;
  archetypeGlow: string;
  avatarSprite: string;
  cardSprite?: string;
  description: string;
  playstyle: string;
  servantClass: string;
  noblePhantasm: string;
  hp: number;
  maxHp: number;
  energy: number;
  gold: number;
  starterRelic: Relic;
  getStarterDeck: () => Card[];
}

export const CHARACTERS: CharacterDefinition[] = [
  // 1. 【Saber 剑士】阿尔托莉雅 · 骑士王
  {
    id: 'artoria',
    name: '阿尔托莉雅 (Artoria)',
    enName: 'Saber · King of Knights',
    title: '永恒之誓 · 骑士王',
    archetype: 'root',
    archetypeName: '词根连携破防流 · 风王破阵',
    archetypeTag: '⚔️ Saber · 誓约破防',
    archetypeColor: '#2563eb',
    archetypeGlow: 'rgba(37, 99, 235, 0.45)',
    avatarSprite: charSaberImg,
    cardSprite: charSaberCard,
    servantClass: 'Saber (剑士)',
    noblePhantasm: '誓约胜利之剑 (Excalibur)',
    description: '「遵从召唤而来，我问你，你是我的御主吗？」高洁坚毅的古不列颠骑士王，手持黄金圣剑誓约胜利之剑。',
    playstyle: '利用 de-、dis-、se- 等词根前缀剥离敌方护甲并赋予深度易伤，破尽坚阵，王者必胜！',
    hp: 75,
    maxHp: 75,
    energy: 3,
    gold: 99,
    starterRelic: RELIC_SCHOLAR_SCROLL,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_strike')!, id: 'artoria_strike_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_strike')!, id: 'artoria_strike_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_strike')!, id: 'artoria_strike_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_defend')!, id: 'artoria_defend_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_defend')!, id: 'artoria_defend_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_defend')!, id: 'artoria_defend_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_invisible_air')!, id: 'artoria_air_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_mana_burst')!, id: 'artoria_burst_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_charisma')!, id: 'artoria_charisma_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'saber_excalibur')!, id: 'artoria_excalibur_1' },
    ],
  },

  // 2. 【Archer 弓兵】吉尔伽美什 · 英雄王
  {
    id: 'gilgamesh',
    name: '吉尔伽美什 (Gilgamesh)',
    enName: 'Archer · King of Heroes',
    title: '万宝初开 · 英雄王',
    archetype: 'wealth',
    archetypeName: '王之财宝 · 黄金律多段爆发流',
    archetypeTag: '👑 Archer · 财宝轰炸',
    archetypeColor: '#eab308',
    archetypeGlow: 'rgba(234, 179, 8, 0.45)',
    avatarSprite: charGilgameshImg,
    cardSprite: charGilgameshCard,
    servantClass: 'Archer (弓兵)',
    noblePhantasm: '王之财宝 (Gate of Babylon)',
    description: '「杂修，见识这世间所有的珍宝吧！」身披璀璨黄金战铠的至高之王，展开无尽的金色王之财宝轰杀强敌。',
    playstyle: '开局拥有 180 巨额金币（黄金律）！金币越厚攻击越凶猛，多段宝具扫射配合雄厚财力直接碾碎敌人！',
    hp: 80,
    maxHp: 80,
    energy: 3,
    gold: 180,
    starterRelic: RELIC_GILGAMESH_KEY,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_vimana_raid')!, id: 'gil_vimana_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_vimana_raid')!, id: 'gil_vimana_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_treasury_shield')!, id: 'gil_shield_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_treasury_shield')!, id: 'gil_shield_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_treasury_shield')!, id: 'gil_shield_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_gate_of_babylon')!, id: 'gil_gate_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_gate_of_babylon')!, id: 'gil_gate_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_golden_rule')!, id: 'gil_gold_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_golden_rule')!, id: 'gil_gold_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'gil_enuma_elish')!, id: 'gil_ea_1' },
    ],
  },

  // 3. 【Shielder 盾兵】玛修 · 圆桌盾卫
  {
    id: 'mash',
    name: '玛修 (Mash)',
    enName: 'Shielder · Grand Guardian',
    title: '崇高之城 · 圆桌盾卫',
    archetype: 'shield',
    archetypeName: '坚城壁垒反击流 · 理想之城',
    archetypeTag: '🛡️ Shielder · 坚城盾击',
    archetypeColor: '#818cf8',
    archetypeGlow: 'rgba(129, 140, 248, 0.45)',
    avatarSprite: charMashImg,
    cardSprite: charMashCard,
    servantClass: 'Shielder (盾兵)',
    noblePhantasm: '已然遥远的理想之城 (Lord Camelot)',
    description: '「前辈，就由我来化作守护你的绝对之壁！」手擎巨型圆桌方碑重盾的从者少女，誓死捍卫前行之路。',
    playstyle: '构筑厚达百点的无敌坚盾，回合结束保留 50% 护甲，借由核心技能《坚韧主宰 (Body Slam)》反手秒杀全场！',
    hp: 84,
    maxHp: 84,
    energy: 3,
    gold: 90,
    starterRelic: RELIC_PALADIN_AEGIS,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_bunker_wall')!, id: 'mash_bunker_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_bunker_wall')!, id: 'mash_bunker_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_bunker_wall')!, id: 'mash_bunker_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_shield_slam')!, id: 'mash_slam_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_shield_slam')!, id: 'mash_slam_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_black_barrel')!, id: 'mash_barrel_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_black_barrel')!, id: 'mash_barrel_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_fortress_guard')!, id: 'mash_guard_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_fortress_guard')!, id: 'mash_guard_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'mash_lord_camelot')!, id: 'mash_camelot_1' },
    ],
  },

  // 4. 【Avenger 复仇者】贞德·Alter · 邪龙魔女
  {
    id: 'jalter',
    name: '贞德·Alter (Jeanne Alter)',
    enName: 'Avenger · Dragon Witch',
    title: '咆哮魔女 · 邪龙复仇者',
    archetype: 'fury',
    archetypeName: '邪龙复仇 · 绝境反击流',
    archetypeTag: '🚩 Avenger · 绝境反伤',
    archetypeColor: '#f43f5e',
    archetypeGlow: 'rgba(244, 63, 94, 0.45)',
    avatarSprite: charJalterImg,
    cardSprite: charJalterCard,
    servantClass: 'Avenger (复仇者)',
    noblePhantasm: '咆哮吧，吾之愤怒 (La Grondement)',
    description: '「别露出那种眼神，杂兵……被火烧成焦炭可是很痛苦的！」银发傲慢的邪龙魔女，手擎燃烧黑炎的邪恶战旗。',
    playstyle: '受到攻击立刻反弹真实烈焰！当自身生命低于 50% 绝境时，所有攻击伤害直接飙升 50%，愈战愈强！',
    hp: 68,
    maxHp: 68,
    energy: 3,
    gold: 95,
    starterRelic: RELIC_JALTER_BANNER,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_vengeance_strike')!, id: 'jalter_strike_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_vengeance_strike')!, id: 'jalter_strike_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_vengeance_strike')!, id: 'jalter_strike_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_blazing_spite')!, id: 'jalter_spite_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_blazing_spite')!, id: 'jalter_spite_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_blazing_spite')!, id: 'jalter_spite_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_la_grondement')!, id: 'jalter_grondement_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_la_grondement')!, id: 'jalter_grondement_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_self_oblation')!, id: 'jalter_oblation_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'jalter_dragon_witch')!, id: 'jalter_witch_1' },
    ],
  },

  // 5. 【Assassin 暗杀者】静谧的哈桑 · 幽冥毒刺
  {
    id: 'serenity',
    name: '静谧 (Serenity)',
    enName: 'Assassin · Silent Poison',
    title: '幽冥毒刺 · 绝界暗杀者',
    archetype: 'poison',
    archetypeName: '诡术剧毒催化流 · 妄想毒身',
    archetypeTag: '🧪 Assassin · 剧毒催化',
    archetypeColor: '#10b981',
    archetypeGlow: 'rgba(16, 185, 129, 0.45)',
    avatarSprite: charSerenityImg,
    cardSprite: charSerenityCard,
    servantClass: 'Assassin (暗杀者)',
    noblePhantasm: '妄想毒身 (Zabaniya)',
    description: '「我的触碰、呼吸……连眼泪都含有剧毒哦……」深紫兜帽轻纱覆盖的暗杀少女，指尖浸透着穿透一切护甲的致死之毒。',
    playstyle: '开局赋予敌人剧毒与虚弱，持续造成穿透真实伤害，配合《催化剂 (Catalyst)》让毒素层数成倍爆发！',
    hp: 70,
    maxHp: 70,
    energy: 3,
    gold: 105,
    starterRelic: RELIC_ALCHEMIST_FLASK,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_venom_dagger')!, id: 'serenity_dagger_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_venom_dagger')!, id: 'serenity_dagger_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_venom_dagger')!, id: 'serenity_dagger_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_shadow_cloak')!, id: 'serenity_cloak_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_shadow_cloak')!, id: 'serenity_cloak_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_shadow_cloak')!, id: 'serenity_cloak_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_corrosive_strike')!, id: 'serenity_corrosive_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_corrosive_strike')!, id: 'serenity_corrosive_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_noxious_fumes')!, id: 'serenity_fumes_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'serenity_catalyst')!, id: 'serenity_catalyst_1' },
    ],
  },

  // 6. 【Caster / Magus 魔术使】远坂凛 (伊什塔尔) · 宝石连弹
  {
    id: 'rin',
    name: '远坂凛 (Rin / Ishtar)',
    enName: 'Magus · Jewel Magus',
    title: '五大元素 · 宝石魔术使',
    archetype: 'combo',
    archetypeName: '狂澜过牌连击流 · 宝石连射',
    archetypeTag: '💎 Caster · 宝石连射',
    archetypeColor: '#f87171',
    archetypeGlow: 'rgba(248, 113, 113, 0.45)',
    avatarSprite: charRinImg,
    cardSprite: charRinCard,
    servantClass: 'Caster (魔术使)',
    noblePhantasm: '阿什托雷特魔术刻印 (Jewel Crest)',
    description: '「就让我用昂贵的宝石好好招待你吧！」黑发双马尾红衣的天才魔术使（金星女神容器），操纵五大元素宝石扫平一切。',
    playstyle: '极其充沛的 0 费抽牌与能量回复，单回合高速倾泻 5~8 张卡牌，狂澜连射倾覆敌阵！',
    hp: 68,
    maxHp: 68,
    energy: 3,
    gold: 110,
    starterRelic: RELIC_WEAVER_FORK,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_gandr_shot')!, id: 'rin_gandr_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_gandr_shot')!, id: 'rin_gandr_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_gandr_shot')!, id: 'rin_gandr_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_garnet_aegis')!, id: 'rin_aegis_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_garnet_aegis')!, id: 'rin_aegis_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_garnet_aegis')!, id: 'rin_aegis_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_mana_conversion')!, id: 'rin_conversion_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_mana_conversion')!, id: 'rin_conversion_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_jewel_burst')!, id: 'rin_burst_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'rin_jewel_sword')!, id: 'rin_sword_1' },
    ],
  },

  // 7. 【STS2 全新领军职业】亡灵契约师 (Necrobinder) · 奥斯提之契
  {
    id: 'necrobinder',
    name: '亡灵契约师 (Necrobinder)',
    enName: 'Necrobinder · Lich Queen',
    title: '幽冥誓约 · 尖塔巫妖',
    archetype: 'necro',
    archetypeName: '冥界契约与奥斯提之手 · 附魔注能',
    archetypeTag: '💀 STS2 · 亡灵召唤',
    archetypeColor: '#a855f7',
    archetypeGlow: 'rgba(168, 85, 247, 0.45)',
    avatarSprite: '/sts2/characters/character_icon_necrobinder.webp',
    cardSprite: '/sts2/characters/character_select_necrobinder_bg.webp',
    servantClass: 'STS2 原生巫妖 (Necromancer)',
    noblePhantasm: '奥斯提之灵 (Hand of Osti)',
    description: '《杀戮尖塔 2》官方全新登场的主角。出生在尖塔深处的巫妖王女，战斗中呼召她可靠的左手奥斯提协同作战，掌控附魔与幽冥死灵之力。',
    playstyle: '开局自带【注能】卡牌，每次消耗卡牌皆能反哺护甲与生命，附带强力易伤与虚弱撕裂敌人！',
    hp: 72,
    maxHp: 72,
    energy: 3,
    gold: 99,
    starterRelic: RELIC_NECRO_HAND,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_summon')!, id: 'necro_summon_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_summon')!, id: 'necro_summon_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_summon')!, id: 'necro_summon_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_bone_armor')!, id: 'necro_armor_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_bone_armor')!, id: 'necro_armor_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_bone_armor')!, id: 'necro_armor_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_grasp')!, id: 'necro_grasp_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_grasp')!, id: 'necro_grasp_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_soul_harvest')!, id: 'necro_harvest_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'necro_soul_harvest')!, id: 'necro_harvest_2' },
    ],
  },

  // 8. 【STS2 全新宇宙权能】储君 (Regent) · 群星王座
  {
    id: 'regent',
    name: '储君 (Regent)',
    enName: 'Regent · Crown Prince',
    title: '群星之冕 · 苍穹继承者',
    archetype: 'regent',
    archetypeName: '群星律动与王室召令 · 华彩重放',
    archetypeTag: '👑 STS2 · 星辰权能',
    archetypeColor: '#f59e0b',
    archetypeGlow: 'rgba(245, 158, 11, 0.45)',
    avatarSprite: '/sts2/characters/character_icon_regent.webp',
    cardSprite: '/sts2/characters/character_icon_regent.webp',
    servantClass: 'STS2 原生群星君主 (Sovereign)',
    noblePhantasm: '群星之冕 (Crown of Stars)',
    description: '《杀戮尖塔 2》官方全新主角。群星王座的继承人，掌管星辰回溯法则，高傲而优雅地降临尖塔，调动苍穹万象歼灭拦路强敌。',
    playstyle: '王室保留与华彩重放连携，开局手牌自带【王室认证】，单卡触发双倍判定，爆发力极致璀璨！',
    hp: 75,
    maxHp: 75,
    energy: 3,
    gold: 150,
    starterRelic: RELIC_REGENT_CROWN,
    getStarterDeck: () => [
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_stellar_beam')!, id: 'regent_beam_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_stellar_beam')!, id: 'regent_beam_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_stellar_beam')!, id: 'regent_beam_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_celestial_ward')!, id: 'regent_ward_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_celestial_ward')!, id: 'regent_ward_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_celestial_ward')!, id: 'regent_ward_3' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_chronicle')!, id: 'regent_chronicle_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_chronicle')!, id: 'regent_chronicle_2' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_supernova')!, id: 'regent_supernova_1' },
      { ...VOCABULARY_CARDS.find(c => c.id === 'regent_supernova')!, id: 'regent_supernova_2' },
    ],
  },
];

export const DEFAULT_CHARACTER = CHARACTERS[0];
