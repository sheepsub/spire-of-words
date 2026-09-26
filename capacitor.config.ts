import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // 注意：appId 改动会导致 android/ 与 ios/ 原生工程失联，需重新 sync；此处仅更新展示名
  appId: 'com.spireofwords.app',
  appName: 'Reversal Day',
  webDir: 'dist'
};

export default config;
