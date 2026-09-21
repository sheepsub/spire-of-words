// Official Fate/Grand Order High-Definition Card Artwork
import imgSaberExcalibur from './saber_excalibur.png';
import imgSaberInvisibleAir from './saber_invisible_air.png';
import imgSaberManaBurst from './saber_mana_burst.png';
import imgSaberStrike from './saber_strike.png';
import imgSaberDefend from './saber_defend.png';
import imgSaberCharisma from './saber_charisma.png';

import imgGilGateOfBabylon from './gil_gate_of_babylon.png';
import imgGilEnumaElish from './gil_enuma_elish.png';
import imgGilGoldenRule from './gil_golden_rule.png';
import imgGilVimanaRaid from './gil_vimana_raid.png';
import imgGilTreasuryShield from './gil_treasury_shield.png';

import imgMashLordCamelot from './mash_lord_camelot.png';
import imgMashShieldSlam from './mash_shield_slam.png';
import imgMashBunkerWall from './mash_bunker_wall.png';
import imgMashBlackBarrel from './mash_black_barrel.png';
import imgMashFortressGuard from './mash_fortress_guard.png';

import imgJalterLaGrondement from './jalter_la_grondement.png';
import imgJalterSelfOblation from './jalter_self_oblation.png';
import imgJalterDragonWitch from './jalter_dragon_witch.png';
import imgJalterVengeanceStrike from './jalter_vengeance_strike.png';
import imgJalterBlazingSpite from './jalter_blazing_spite.png';

import imgSerenityCatalyst from './serenity_catalyst.png';
import imgSerenityVenomDagger from './serenity_venom_dagger.png';
import imgSerenityNoxiousFumes from './serenity_noxious_fumes.png';
import imgSerenityShadowCloak from './serenity_shadow_cloak.png';
import imgSerenityCorrosiveStrike from './serenity_corrosive_strike.png';

import imgRinJewelBurst from './rin_jewel_burst.png';
import imgRinGandrShot from './rin_gandr_shot.png';
import imgRinManaConversion from './rin_mana_conversion.png';
import imgRinJewelSword from './rin_jewel_sword.png';
import imgRinGarnetAegis from './rin_garnet_aegis.png';

export const CARD_ILLUSTRATIONS: Record<string, string> = {
  // Saber
  excalibur: imgSaberExcalibur,
  invisible_air: imgSaberInvisibleAir,
  mana_burst: imgSaberManaBurst,
  sever_strike: imgSaberStrike,
  royal_defend: imgSaberDefend,
  charisma: imgSaberCharisma,
  saber_excalibur: imgSaberExcalibur,
  saber_invisible_air: imgSaberInvisibleAir,
  saber_mana_burst: imgSaberManaBurst,
  saber_strike: imgSaberStrike,
  saber_defend: imgSaberDefend,
  saber_charisma: imgSaberCharisma,

  // Gilgamesh
  gate_of_babylon: imgGilGateOfBabylon,
  enuma_elish: imgGilEnumaElish,
  golden_rule: imgGilGoldenRule,
  vimana_raid: imgGilVimanaRaid,
  treasury_shield: imgGilTreasuryShield,
  gil_gate_of_babylon: imgGilGateOfBabylon,
  gil_enuma_elish: imgGilEnumaElish,
  gil_golden_rule: imgGilGoldenRule,
  gil_vimana_raid: imgGilVimanaRaid,
  gil_treasury_shield: imgGilTreasuryShield,

  // Mash
  lord_camelot: imgMashLordCamelot,
  shield_slam: imgMashShieldSlam,
  bunker_wall: imgMashBunkerWall,
  black_barrel: imgMashBlackBarrel,
  fortress_guard: imgMashFortressGuard,
  mash_lord_camelot: imgMashLordCamelot,
  mash_shield_slam: imgMashShieldSlam,
  mash_bunker_wall: imgMashBunkerWall,
  mash_black_barrel: imgMashBlackBarrel,
  mash_fortress_guard: imgMashFortressGuard,

  // Jeanne Alter
  la_grondement: imgJalterLaGrondement,
  self_oblation: imgJalterSelfOblation,
  dragon_witch: imgJalterDragonWitch,
  vengeance_strike: imgJalterVengeanceStrike,
  blazing_spite: imgJalterBlazingSpite,
  jalter_la_grondement: imgJalterLaGrondement,
  jalter_self_oblation: imgJalterSelfOblation,
  jalter_dragon_witch: imgJalterDragonWitch,
  jalter_vengeance_strike: imgJalterVengeanceStrike,
  jalter_blazing_spite: imgJalterBlazingSpite,

  // Serenity
  deadly_catalyst: imgSerenityCatalyst,
  catalyst: imgSerenityCatalyst,
  venom_dagger: imgSerenityVenomDagger,
  noxious_fumes: imgSerenityNoxiousFumes,
  shadow_cloak: imgSerenityShadowCloak,
  corrosive_strike: imgSerenityCorrosiveStrike,
  serenity_catalyst: imgSerenityCatalyst,
  serenity_venom_dagger: imgSerenityVenomDagger,
  serenity_noxious_fumes: imgSerenityNoxiousFumes,
  serenity_shadow_cloak: imgSerenityShadowCloak,
  serenity_corrosive_strike: imgSerenityCorrosiveStrike,

  // Rin
  jewel_burst: imgRinJewelBurst,
  gandr_shot: imgRinGandrShot,
  mana_conversion: imgRinManaConversion,
  jewel_sword: imgRinJewelSword,
  garnet_aegis: imgRinGarnetAegis,
  rin_jewel_burst: imgRinJewelBurst,
  rin_gandr_shot: imgRinGandrShot,
  rin_mana_conversion: imgRinManaConversion,
  rin_jewel_sword: imgRinJewelSword,
  rin_garnet_aegis: imgRinGarnetAegis,
};

export function getCardArtwork(key?: string): string | undefined {
  if (!key) return undefined;
  return CARD_ILLUSTRATIONS[key];
}
