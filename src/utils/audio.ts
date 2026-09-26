// Web Audio API Sound Synthesizer + iOS Haptic Feedback

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmOsc1: OscillatorNode | null = null;
  private bgmOsc2: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  public isBgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // iOS Taptic Vibration / Haptic Feedback
  public haptic(type: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        if (type === 'light') navigator.vibrate(15);
        else if (type === 'medium') navigator.vibrate(30);
        else if (type === 'heavy') navigator.vibrate([40, 30, 60]);
        else if (type === 'success') navigator.vibrate([20, 40, 20]);
      } catch {
        // Ignore haptics error if not permitted
      }
    }
  }

  // Ambient Dark Fantasy Dungeon Drone (BGM)
  public startBgm() {
    if (!this.enabled || this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Subtle background drone

      // Low harmonic drone
      this.bgmOsc1 = this.ctx.createOscillator();
      this.bgmOsc1.type = 'triangle';
      this.bgmOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

      this.bgmOsc2 = this.ctx.createOscillator();
      this.bgmOsc2.type = 'sine';
      this.bgmOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // E2 note

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      this.bgmOsc1.connect(filter);
      this.bgmOsc2.connect(filter);
      filter.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);

      this.bgmOsc1.start();
      this.bgmOsc2.start();
      this.isBgmPlaying = true;
    } catch {
      // Ignore audio start issue
    }
  }

  public stopBgm() {
    if (!this.isBgmPlaying) return;
    try {
      this.bgmOsc1?.stop();
      this.bgmOsc2?.stop();
      this.bgmOsc1?.disconnect();
      this.bgmOsc2?.disconnect();
      this.isBgmPlaying = false;
    } catch {
      // Ignore
    }
  }

  // Card Draw / Whoosh
  public playDraw() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Card Select / Hover
  public playSelect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  // Sword Slash / Attack
  public playSlash() {
    this.haptic('medium');
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.18);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.2);
  }

  // Shield Block
  public playBlock() {
    this.haptic('light');
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(85, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  // Critical Recall Strike (Sparkle + hit chime)
  public playCritical() {
    this.haptic('success');
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.04 + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.04);
      osc.stop(this.ctx!.currentTime + idx * 0.04 + 0.4);
    });
  }

  // Power Up / Buff
  public playBuff() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // Enemy Hit / Thud
  public playEnemyHit() {
    this.haptic('heavy');
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Gold Clink
  public playGold() {
    this.haptic('light');
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    [1600, 2400].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.22);
    });
  }

  // Victory Jingle
  public playVictory() {
    this.haptic('success');
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);

      gain.gain.setValueAtTime(0.14, this.ctx!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.1 + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.1);
      osc.stop(this.ctx!.currentTime + i * 0.1 + 0.9);
    });
  }

  // Defeat Drone
  public playDefeat() {
    this.haptic('heavy');
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    [220, 185, 146, 110].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.18);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx!.currentTime + i * 0.18 + 0.4);

      gain.gain.setValueAtTime(0.18, this.ctx!.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.18 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.18);
      osc.stop(this.ctx!.currentTime + i * 0.18 + 0.45);
    });
  }

  // --- STS2 真实原生音频支持 ---
  public playSTS2Click() {
    this.haptic('light');
    if (!this.enabled) return;
    try {
      const audio = new Audio('/sts2/audio/ui_click.wav');
      audio.volume = 0.45;
      audio.play().catch(() => this.playSelect());
    } catch {
      this.playSelect();
    }
  }

  public playSTS2Tarot() {
    this.haptic('medium');
    if (!this.enabled) return;
    try {
      const audio = new Audio('/sts2/audio/tarot_open.ogg');
      audio.volume = 0.55;
      audio.play().catch(() => {});
    } catch {}
  }

  public playSTS2Divinity() {
    this.haptic('success');
    if (!this.enabled) return;
    try {
      const audio = new Audio('/sts2/audio/divinity_enter.ogg');
      audio.volume = 0.6;
      audio.play().catch(() => this.playVictory());
    } catch {}
  }
}

export const sound = new SoundFX();
