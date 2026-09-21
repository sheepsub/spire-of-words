import React from 'react';
import type { CardType, VocabArchetype } from '../types/game';

interface CardIllustrationProps {
  illustrationKey?: string;
  type: CardType;
  archetype?: VocabArchetype;
}

export const CardIllustration: React.FC<CardIllustrationProps> = ({
  illustrationKey,
  type,
}) => {
  const key = (illustrationKey || '').toLowerCase();

  // 1. 【阿尔托莉雅】誓约胜利之剑 (Excalibur) - 冲天黄金光柱与神圣剑气
  if (key === 'excalibur') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%" className="w-full h-full">
        <defs>
          <linearGradient id="excalSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1b3d" />
            <stop offset="100%" stopColor="#050814" />
          </linearGradient>
          <linearGradient id="holyBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(250,204,21,0)" />
            <stop offset="40%" stopColor="rgba(254,240,138,0.95)" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="rgba(250,204,21,0.95)" />
            <stop offset="100%" stopColor="rgba(250,204,21,0)" />
          </linearGradient>
          <linearGradient id="bladeGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>
        <rect width="120" height="70" fill="url(#excalSky)" />
        {/* Divine vertical light pillar */}
        <polygon points="40,0 80,0 95,70 25,70" fill="url(#holyBeam)" opacity="0.85" />
        <circle cx="60" cy="20" r="30" fill="rgba(234,179,8,0.25)" filter="blur(4px)" />
        {/* Golden Sword Blade */}
        <path d="M60,6 L64,48 L60,54 L56,48 Z" fill="url(#bladeGold)" stroke="#fef08a" strokeWidth="0.8" />
        {/* Crossguard & Hilt */}
        <rect x="51" y="52" width="18" height="3.5" rx="1" fill="#eab308" stroke="#fef08a" strokeWidth="0.5" />
        <line x1="60" y1="55.5" x2="60" y2="64" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="65.5" r="2" fill="#eab308" />
        {/* Holy particle sparks */}
        <circle cx="48" cy="18" r="1.5" fill="#ffffff" />
        <circle cx="72" cy="14" r="1" fill="#fde047" />
        <circle cx="53" cy="36" r="1.2" fill="#ffffff" />
        <circle cx="68" cy="38" r="1.5" fill="#fde047" />
      </svg>
    );
  }

  // 2. 【阿尔托莉雅】风王结界 (Invisible Air) - 呼啸青色风旋
  if (key === 'invisible_air') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <defs>
          <radialGradient id="windCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>
        <rect width="120" height="70" fill="url(#windCenter)" />
        {/* Whirling Wind Vortex Curves */}
        <path d="M20,55 Q60,10 100,25 Q115,35 85,50 Q45,60 30,40 Q20,20 60,18" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M35,62 Q75,18 105,38 Q85,62 45,52 Q30,35 65,28" fill="none" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <path d="M15,30 Q50,60 90,45" fill="none" stroke="#bae6fd" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
        {/* Faint concealed blade outline */}
        <line x1="30" y1="58" x2="90" y2="12" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4,2" />
      </svg>
    );
  }

  // 3. 【阿尔托莉雅】魔力放出 (Mana Burst) - 蓝白烈性魔能爆发
  if (key === 'mana_burst') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#030712" />
        <circle cx="60" cy="35" r="28" fill="rgba(37,99,235,0.3)" filter="blur(6px)" />
        {/* Shockwave Bursts */}
        <polygon points="60,8 66,28 88,20 72,35 94,48 68,46 64,66 54,48 28,58 45,38 22,25 48,28" fill="#60a5fa" opacity="0.75" />
        <polygon points="60,16 64,30 78,24 68,35 82,44 65,42 60,56 55,44 40,50 50,36 36,28 52,30" fill="#ffffff" opacity="0.9" />
        {/* Core glow */}
        <circle cx="60" cy="35" r="8" fill="#dbeafe" />
        <circle cx="60" cy="35" r="4" fill="#ffffff" />
      </svg>
    );
  }

  // 4. 【阿尔托莉雅】风王破空斩 (Strike) - 锐利断岩风斩
  if (key === 'sever_strike' || key === 'strike') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#0f172a" />
        {/* Cleaved rocks */}
        <polygon points="10,65 48,65 42,28 15,35" fill="#1e293b" />
        <polygon points="62,65 110,65 105,38 68,26" fill="#1e293b" />
        {/* Neon slash arc */}
        <path d="M18,12 Q60,35 105,58" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <path d="M22,15 Q60,35 100,55" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="50" y1="20" x2="68" y2="48" stroke="#e0f2fe" strokeWidth="1.5" opacity="0.8" />
      </svg>
    );
  }

  // 5. 【阿尔托莉雅】骑士壁垒 (Defend) - 圆桌骑士重盾
  if (key === 'royal_defend' || key === 'defend') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#0c1222" />
        {/* Heavy Kite Shield */}
        <path d="M60,10 L84,18 C84,45 60,62 60,62 C60,62 36,45 36,18 Z" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="2" />
        <path d="M60,15 L78,21 C78,42 60,56 60,56 C60,56 42,42 42,21 Z" fill="#1d4ed8" />
        {/* Shield Cross / Emblem */}
        <line x1="60" y1="18" x2="60" y2="52" stroke="#fef08a" strokeWidth="2.5" />
        <line x1="46" y1="28" x2="74" y2="28" stroke="#fef08a" strokeWidth="2.5" />
        <circle cx="60" cy="28" r="4" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
      </svg>
    );
  }

  // 6. 【阿尔托莉雅】王者领导力 (Charisma) - 皇冠与金光城堡
  if (key === 'charisma') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#090d16" />
        {/* Golden Crown */}
        <path d="M42,48 L46,26 L54,36 L60,22 L66,36 L74,26 L78,48 Z" fill="#facc15" stroke="#fef08a" strokeWidth="1.5" />
        <rect x="42" y="48" width="36" height="6" rx="2" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
        {/* Crown Gems */}
        <circle cx="46" cy="26" r="2.5" fill="#ef4444" />
        <circle cx="60" cy="22" r="3" fill="#3b82f6" />
        <circle cx="74" cy="26" r="2.5" fill="#22c55e" />
        <circle cx="60" cy="51" r="2" fill="#ef4444" />
        {/* Radiating Light */}
        <line x1="60" y1="8" x2="60" y2="16" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="42" y1="14" x2="48" y2="20" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="78" y1="14" x2="72" y2="20" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 7. 【吉尔伽美什】王之财宝 (Gate of Babylon) - 金色次元涟漪与飞剑弹雨
  if (key === 'gate_of_babylon') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#140f02" />
        {/* Gate Ripples */}
        <ellipse cx="35" cy="25" rx="18" ry="14" fill="rgba(234,179,8,0.25)" stroke="#facc15" strokeWidth="1.5" />
        <ellipse cx="35" cy="25" rx="10" ry="8" fill="rgba(254,240,138,0.4)" stroke="#fde047" strokeWidth="1" />
        <ellipse cx="85" cy="45" rx="22" ry="16" fill="rgba(234,179,8,0.25)" stroke="#facc15" strokeWidth="1.5" />
        <ellipse cx="85" cy="45" rx="12" ry="9" fill="rgba(254,240,138,0.4)" stroke="#fde047" strokeWidth="1" />
        <ellipse cx="65" cy="18" rx="14" ry="10" fill="rgba(234,179,8,0.25)" stroke="#facc15" strokeWidth="1.5" />
        {/* Fired Noble Phantasms */}
        <line x1="35" y1="25" x2="95" y2="55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="95,55 86,48 98,46" fill="#facc15" />
        <line x1="85" y1="45" x2="115" y2="60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <line x1="65" y1="18" x2="110" y2="35" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. 【吉尔伽美什】开天辟地乖离之星 (Enuma Elish) - 乖离剑三段旋转风暴
  if (key === 'enuma_elish') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#1a0505" />
        {/* Red Space Distortion Vortex */}
        <circle cx="60" cy="35" r="30" fill="rgba(239,68,68,0.25)" filter="blur(6px)" />
        <path d="M30,35 C30,15 90,15 90,35 C90,55 30,55 30,35" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8,4" opacity="0.8" />
        <path d="M40,35 C40,22 80,22 80,35 C80,48 40,48 40,35" fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="6,3" />
        {/* Ea Tri-Cylinder Blade */}
        <rect x="52" y="10" width="16" height="12" rx="2" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
        <rect x="51" y="24" width="18" height="12" rx="2" fill="#7f1d1d" stroke="#f87171" strokeWidth="1" />
        <rect x="53" y="38" width="14" height="12" rx="2" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
        {/* Golden Hilt */}
        <rect x="46" y="50" width="28" height="4" rx="1" fill="#eab308" stroke="#fde047" strokeWidth="1" />
        <rect x="57" y="54" width="6" height="12" fill="#713f12" />
        {/* Red lightning tears */}
        <path d="M15,20 L35,32 L25,48" stroke="#fca5a5" strokeWidth="1.2" fill="none" />
        <path d="M105,18 L88,32 L98,52" stroke="#fca5a5" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }

  // 9. 【吉尔伽美什】黄金律 (Golden Rule) - 金币与宝藏溢出圣杯
  if (key === 'golden_rule') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#181303" />
        {/* Golden Chalice */}
        <path d="M48,22 C48,42 72,42 72,22 Z" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" />
        <rect x="58" y="38" width="4" height="16" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
        <ellipse cx="60" cy="56" rx="14" ry="4" fill="#a16207" stroke="#fef08a" strokeWidth="1" />
        {/* Gleaming Coins Rain */}
        <circle cx="60" cy="18" r="4.5" fill="#fde047" stroke="#854d0e" strokeWidth="0.8" />
        <circle cx="52" cy="15" r="4" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
        <circle cx="68" cy="14" r="4.2" fill="#fde047" stroke="#854d0e" strokeWidth="0.8" />
        <circle cx="44" cy="24" r="3.8" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
        <circle cx="76" cy="22" r="3.8" fill="#fde047" stroke="#854d0e" strokeWidth="0.8" />
        <circle cx="38" cy="38" r="3.2" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
        <circle cx="82" cy="36" r="3.5" fill="#fde047" stroke="#854d0e" strokeWidth="0.8" />
      </svg>
    );
  }

  // 10. 【吉尔伽美什】维摩那俯冲 (Vimana Raid) - 黄金神舟与光炮
  if (key === 'vimana_raid') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#080c18" />
        {/* Winged Golden Vimana silhouette */}
        <polygon points="60,12 85,28 108,22 80,38 60,34 40,38 12,22 35,28" fill="#eab308" stroke="#fef08a" strokeWidth="1.2" />
        <polygon points="60,18 72,28 60,32 48,28" fill="#fef08a" />
        {/* Solar Lasers Beam Down */}
        <line x1="45" y1="35" x2="25" y2="65" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="34" x2="60" y2="68" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="75" y1="35" x2="95" y2="65" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 11. 【吉尔伽美什】财宝护壁 (Treasury Shield) - 六角黄金壁垒
  if (key === 'treasury_shield') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#140f04" />
        {/* Interlocking Hexagonal Gold Shields */}
        <polygon points="60,12 75,21 75,39 60,48 45,39 45,21" fill="rgba(234,179,8,0.4)" stroke="#fde047" strokeWidth="2" />
        <polygon points="38,28 50,35 50,49 38,56 26,49 26,35" fill="rgba(202,138,4,0.3)" stroke="#facc15" strokeWidth="1.5" />
        <polygon points="82,28 94,35 94,49 82,56 70,49 70,35" fill="rgba(202,138,4,0.3)" stroke="#facc15" strokeWidth="1.5" />
        <circle cx="60" cy="30" r="4" fill="#ffffff" />
      </svg>
    );
  }

  // 12. 【玛修】饭桌盾冲撞 (Shield Slam) - 十字巨盾裂地
  if (key === 'shield_slam') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#0f0c1b" />
        {/* Massive Spiked Pavise Shield */}
        <path d="M38,10 L82,10 L76,55 L60,65 L44,55 Z" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
        {/* Cross Pattern */}
        <rect x="56" y="16" width="8" height="38" fill="#818cf8" />
        <rect x="44" y="26" width="32" height="8" fill="#818cf8" />
        <circle cx="60" cy="30" r="6" fill="#c084fc" stroke="#ffffff" strokeWidth="1" />
        {/* Ground Impact Cracks & Shockwave */}
        <path d="M60,65 L50,69 M60,65 L70,69 M60,65 L35,67 M60,65 L85,67" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="60" cy="65" rx="30" ry="4" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
      </svg>
    );
  }

  // 13. 【玛修】遥远的理想之城 (Lord Camelot) - 巍峨白垩城墙与城门
  if (key === 'lord_camelot') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#061226" />
        {/* Holy Light Dome */}
        <circle cx="60" cy="55" r="45" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.5" />
        {/* White Castle Ramparts */}
        <rect x="35" y="26" width="50" height="34" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Castle Towers */}
        <polygon points="30,26 35,16 40,26" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <polygon points="80,26 85,16 90,26" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <polygon points="55,22 60,12 65,22" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        {/* Castle Gate */}
        <path d="M54,60 L54,42 C54,38 66,38 66,42 L66,60 Z" fill="#1e293b" />
        {/* Glowing Banner */}
        <line x1="60" y1="12" x2="60" y2="4" stroke="#fbbf24" strokeWidth="1.5" />
        <polygon points="60,4 68,7 60,10" fill="#3b82f6" />
      </svg>
    );
  }

  // 14. 【玛修】决意壁垒 (Bunker Wall) - 坚实淡紫护盾
  if (key === 'bunker_wall') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#170c26" />
        {/* Layered Energy Barrier Grids */}
        <path d="M25,15 L95,15 L85,58 L60,65 L35,58 Z" fill="rgba(168,85,247,0.25)" stroke="#c084fc" strokeWidth="2" />
        <path d="M35,22 L85,22 L78,52 L60,58 L42,52 Z" fill="rgba(192,132,252,0.3)" stroke="#e9d5ff" strokeWidth="1" />
        <circle cx="60" cy="38" r="8" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    );
  }

  // 15. 【玛修】黑枪狙击 (Black Barrel) - 神代重炮聚合充能
  if (key === 'black_barrel') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#030712" />
        {/* Heavy Railgun Barrel */}
        <rect x="15" y="31" width="75" height="8" rx="2" fill="#334155" stroke="#0ea5e9" strokeWidth="1.5" />
        <rect x="65" y="27" width="22" height="16" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
        {/* Cyan Plasma Charge Beam */}
        <line x1="90" y1="35" x2="118" y2="35" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <line x1="90" y1="35" x2="118" y2="35" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="90" cy="35" r="7" fill="rgba(56,189,248,0.6)" />
      </svg>
    );
  }

  // 16. 【玛修】白垩守卫 (Fortress Guard) - 浮空羽盾环绕
  if (key === 'fortress_guard') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#081020" />
        <ellipse cx="60" cy="40" rx="42" ry="16" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,4" />
        {/* 3 Floating Miniature Shields */}
        <polygon points="30,35 38,32 36,44 30,48 24,44 22,32" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
        <polygon points="60,20 68,17 66,29 60,33 54,29 52,17" fill="#818cf8" stroke="#ffffff" strokeWidth="1" />
        <polygon points="90,35 98,32 96,44 90,48 84,44 82,32" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
      </svg>
    );
  }

  // 17. 【黑贞德】咆哮吧吾之愤怒 (La Grondement) - 地底穿刺黑刺与血海
  if (key === 'la_grondement') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#180404" />
        {/* Blood Ocean */}
        <path d="M0,52 Q30,48 60,52 Q90,56 120,52 L120,70 L0,70 Z" fill="#7f1d1d" />
        {/* Iron Execution Stakes Piercing Upward */}
        <polygon points="30,65 38,12 43,65" fill="#1c1917" stroke="#ef4444" strokeWidth="1" />
        <polygon points="56,65 62,6 68,65" fill="#292524" stroke="#f87171" strokeWidth="1.5" />
        <polygon points="80,65 87,18 92,65" fill="#1c1917" stroke="#ef4444" strokeWidth="1" />
        <polygon points="12,65 18,30 22,65" fill="#292524" stroke="#dc2626" strokeWidth="0.8" />
        <polygon points="98,65 104,26 108,65" fill="#292524" stroke="#dc2626" strokeWidth="0.8" />
      </svg>
    );
  }

  // 18. 【黑贞德】鲜血献祭 (Self-Oblation) - 泣血黑玫瑰与红莲火
  if (key === 'self_oblation') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#160303" />
        <circle cx="60" cy="35" r="22" fill="rgba(220,38,38,0.25)" filter="blur(4px)" />
        {/* Black Thorned Rose */}
        <circle cx="60" cy="30" r="14" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
        <circle cx="60" cy="30" r="8" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1" />
        <circle cx="60" cy="30" r="3" fill="#dc2626" />
        {/* Blood Drops Falling */}
        <path d="M50,42 Q48,50 50,54 Q52,50 50,42 Z" fill="#ef4444" />
        <path d="M60,46 Q58,56 60,60 Q62,56 60,46 Z" fill="#ef4444" />
        <path d="M70,44 Q68,52 70,56 Q72,52 70,44 Z" fill="#ef4444" />
      </svg>
    );
  }

  // 19. 【黑贞德】龙之魔女 (Dragon Witch) - 咆哮黑龙首与魔焰
  if (key === 'dragon_witch') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#100305" />
        {/* Dragon Head Silhouette */}
        <path d="M25,50 L45,35 L65,30 L95,15 L80,28 L105,25 L85,38 L100,42 L75,48 L55,60 Z" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
        {/* Burning Eye */}
        <circle cx="70" cy="32" r="3" fill="#facc15" stroke="#ef4444" strokeWidth="1" />
        {/* Dragon Fire Breath */}
        <path d="M95,42 Q115,35 120,48 Q110,60 85,46" fill="#dc2626" opacity="0.85" />
        <path d="M95,42 Q110,38 116,46 Q108,54 88,44" fill="#fef08a" opacity="0.9" />
      </svg>
    );
  }

  // 20. 【黑贞德】复仇之刺 (Vengeance Strike) - 黑铁旗枪突刺
  if (key === 'vengeance_strike') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#120404" />
        {/* Banner Spear */}
        <line x1="15" y1="58" x2="98" y2="18" stroke="#44403c" strokeWidth="4" strokeLinecap="round" />
        <polygon points="98,18 90,26 108,12 102,30" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1.5" />
        {/* Tattered Black Pennant */}
        <path d="M75,28 Q60,45 80,55 Q50,42 62,35" fill="#292524" stroke="#dc2626" strokeWidth="1" />
      </svg>
    );
  }

  // 21. 【黑贞德】业火护持 (Blazing Spite) - 荆棘火环
  if (key === 'blazing_spite') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#1c0707" />
        <ellipse cx="60" cy="35" rx="35" ry="20" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="6,4" />
        <ellipse cx="60" cy="35" rx="28" ry="14" fill="none" stroke="#facc15" strokeWidth="2" />
        <circle cx="35" cy="25" r="4" fill="#dc2626" />
        <circle cx="85" cy="45" r="4" fill="#dc2626" />
        <circle cx="60" cy="15" r="3" fill="#fde047" />
      </svg>
    );
  }

  // 22. 【静谧】致命催化 (Deadly Catalyst) - 翠绿毒液烧杯与骷髅幽雾
  if (key === 'deadly_catalyst' || key === 'catalyst') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#04140c" />
        {/* Toxic Green Alchemy Flask */}
        <path d="M54,15 L66,15 L66,26 L78,52 C80,58 74,62 60,62 C46,62 40,58 42,52 L54,26 Z" fill="rgba(34,197,94,0.3)" stroke="#4ade80" strokeWidth="1.8" />
        {/* Bubbling Emerald Liquid */}
        <path d="M44,50 Q60,46 76,50 L76,54 C74,58 60,60 60,60 C60,60 46,58 44,54 Z" fill="#22c55e" />
        <circle cx="53" cy="42" r="2.5" fill="#86efac" />
        <circle cx="66" cy="38" r="2" fill="#86efac" />
        {/* Toxic Skull Vapor */}
        <circle cx="60" cy="18" r="6" fill="rgba(168,85,247,0.7)" />
        <circle cx="58" cy="17" r="1.2" fill="#000" />
        <circle cx="62" cy="17" r="1.2" fill="#000" />
      </svg>
    );
  }

  // 23. 【静谧】剧毒毒刃 (Venom Dagger) - 幽绿淬毒双刃
  if (key === 'venom_dagger') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#021008" />
        {/* Curved Assassin Daggers */}
        <path d="M30,55 Q55,40 75,18 Q62,35 45,45 Z" fill="#22c55e" stroke="#86efac" strokeWidth="1.5" />
        <rect x="25" y="52" width="12" height="4" rx="1" fill="#713f12" transform="rotate(-35, 25, 52)" />
        <path d="M85,55 Q60,40 40,18 Q53,35 70,45 Z" fill="#16a34a" stroke="#86efac" strokeWidth="1.5" />
        {/* Poison Dripping */}
        <circle cx="75" cy="22" r="2" fill="#4ade80" />
        <circle cx="40" cy="22" r="2" fill="#4ade80" />
      </svg>
    );
  }

  // 24. 【静谧】万毒迷雾 (Noxious Fumes) - 弥漫紫绿毒瘴
  if (key === 'noxious_fumes') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#090514" />
        {/* Swirling Poison Mist Clouds */}
        <path d="M15,45 Q35,20 65,35 Q95,15 110,40 Q90,65 55,55 Q25,65 15,45 Z" fill="rgba(34,197,94,0.4)" filter="blur(4px)" />
        <path d="M25,35 Q50,15 80,28 Q100,22 105,48 Q85,58 60,48 Q35,58 25,35 Z" fill="rgba(168,85,247,0.45)" filter="blur(3px)" />
        <circle cx="45" cy="38" r="3" fill="#86efac" opacity="0.8" />
        <circle cx="75" cy="32" r="2.5" fill="#d8b4fe" opacity="0.8" />
      </svg>
    );
  }

  // 25. 【静谧】烟幕潜行 (Shadow Cloak) - 暗夜面纱与磷光
  if (key === 'shadow_cloak') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#020617" />
        <path d="M20,65 Q60,25 100,65 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        {/* Glowing Assassin Eyes */}
        <ellipse cx="52" cy="40" rx="3.5" ry="1.8" fill="#38bdf8" />
        <ellipse cx="68" cy="40" rx="3.5" ry="1.8" fill="#38bdf8" />
        {/* Crescent Moon */}
        <path d="M85,12 A10,10 0 0 0 95,24 A8,8 0 0 1 85,12 Z" fill="#e2e8f0" />
      </svg>
    );
  }

  // 26. 【静谧】腐蚀绝杀 (Corrosive Strike) - 强酸融蚀金属
  if (key === 'corrosive_strike') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#07130a" />
        {/* Melting Armor Plate */}
        <rect x="35" y="20" width="50" height="35" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Acid Splash Eating Holes */}
        <circle cx="50" cy="32" r="7" fill="#15803d" stroke="#4ade80" strokeWidth="1.5" />
        <circle cx="68" cy="42" r="6" fill="#15803d" stroke="#4ade80" strokeWidth="1.5" />
        <circle cx="58" cy="24" r="4" fill="#22c55e" />
        <path d="M48,40 L45,55 M72,48 L75,62" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 27. 【远坂凛】五大元素宝石连爆 (Jewel Burst) - 五彩宝石碎裂爆发
  if (key === 'jewel_burst') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#080816" />
        {/* Prismatic Blast Center */}
        <circle cx="60" cy="35" r="22" fill="rgba(239,68,68,0.25)" filter="blur(5px)" />
        {/* Ruby Gem */}
        <polygon points="40,24 50,16 54,26 44,32" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
        {/* Sapphire Gem */}
        <polygon points="76,22 84,15 90,25 80,30" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
        {/* Emerald Gem */}
        <polygon points="32,44 42,40 46,50 36,54" fill="#22c55e" stroke="#86efac" strokeWidth="1" />
        {/* Topaz Gem */}
        <polygon points="78,44 86,38 92,48 84,54" fill="#eab308" stroke="#fef08a" strokeWidth="1" />
        {/* Center Jewel Impact */}
        <polygon points="60,25 68,35 60,45 52,35" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    );
  }

  // 28. 【远坂凛】原初魔弹 (Gandr Shot) - 极恶红黑诅咒雷球
  if (key === 'gandr_shot') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#140205" />
        {/* Concentrated Dark Core */}
        <circle cx="60" cy="35" r="16" fill="#000000" stroke="#ef4444" strokeWidth="2.5" />
        <circle cx="60" cy="35" r="8" fill="#450a0a" stroke="#f87171" strokeWidth="1" />
        {/* Crackling Red Lightning Bolts */}
        <path d="M44,35 L25,28 M76,35 L95,42 M60,19 L68,6 M60,51 L52,64" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        <path d="M48,23 L32,12 M72,47 L88,58" stroke="#fecdd3" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 29. 【远坂凛】魔力转化 (Mana Conversion) - 水银齿轮与回路
  if (key === 'mana_conversion') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#030b14" />
        {/* Magic Circuit Lines */}
        <line x1="10" y1="35" x2="45" y2="35" stroke="#38bdf8" strokeWidth="2" />
        <line x1="75" y1="35" x2="110" y2="35" stroke="#38bdf8" strokeWidth="2" />
        {/* Mercury Clockwork Core */}
        <circle cx="60" cy="35" r="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="60" cy="35" r="12" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="4,2" />
        <circle cx="60" cy="35" r="5" fill="#38bdf8" />
      </svg>
    );
  }

  // 30. 【远坂凛】宝石剑泽尔里奇 (Jewel Sword) - 平行世界干涉彩虹光剑
  if (key === 'jewel_sword') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#070514" />
        {/* Crystalline Blade Refracting Spectrum */}
        <polygon points="60,8 68,48 60,54 52,48" fill="#c084fc" stroke="#f43f5e" strokeWidth="1.5" />
        <line x1="60" y1="8" x2="60" y2="52" stroke="#ffffff" strokeWidth="1.5" />
        {/* Rainbow Dispersion Beams */}
        <line x1="60" y1="20" x2="20" y2="10" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
        <line x1="60" y1="25" x2="15" y2="35" stroke="#eab308" strokeWidth="1.5" opacity="0.8" />
        <line x1="60" y1="20" x2="100" y2="10" stroke="#3b82f6" strokeWidth="1.5" opacity="0.8" />
        <line x1="60" y1="25" x2="105" y2="35" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" />
        {/* Hilt */}
        <rect x="50" y="52" width="20" height="4" fill="#fbbf24" />
        <line x1="60" y1="56" x2="60" y2="65" stroke="#713f12" strokeWidth="3" />
      </svg>
    );
  }

  // 31. 【远坂凛】石榴石屏障 (Garnet Aegis) - 晶石菱形护盾
  if (key === 'garnet_aegis') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#140608" />
        {/* Floating Faceted Garnet Rhombuses */}
        <polygon points="60,10 82,35 60,60 38,35" fill="rgba(225,29,72,0.35)" stroke="#fb7185" strokeWidth="2" />
        <polygon points="60,18 74,35 60,52 46,35" fill="rgba(244,63,94,0.4)" stroke="#fecdd3" strokeWidth="1" />
        <circle cx="60" cy="35" r="4" fill="#ffffff" />
      </svg>
    );
  }

  // Fallback by Card Type if no specific key
  if (type === 'attack') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#180c0e" />
        <path d="M25,15 L95,55 M25,55 L95,15" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        <circle cx="60" cy="35" r="14" fill="#991b1b" stroke="#fca5a5" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'skill') {
    return (
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <rect width="120" height="70" fill="#081426" />
        <path d="M60,12 L85,22 C85,46 60,60 60,60 C60,60 35,46 35,22 Z" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 70" width="100%" height="100%">
      <rect width="120" height="70" fill="#1c1606" />
      <polygon points="60,10 80,35 60,60 40,35" fill="#ca8a04" stroke="#fde047" strokeWidth="2" />
      <circle cx="60" cy="35" r="6" fill="#ffffff" />
    </svg>
  );
};
