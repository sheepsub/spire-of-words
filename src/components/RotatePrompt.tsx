import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface RotatePromptProps {
  isVirtualLandscape: boolean;
  onToggleVirtualLandscape: () => void;
}

export const RotatePrompt: React.FC<RotatePromptProps> = ({
  isVirtualLandscape,
  onToggleVirtualLandscape,
}) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if width is smaller than height and screen is mobile-sized
      const isNarrowPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
      setIsPortrait(isNarrowPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Attempt screen.orientation lock if available on mount
  useEffect(() => {
    try {
      if (screen?.orientation && 'lock' in screen.orientation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (screen.orientation as any).lock('landscape').catch(() => {
          // Silent catch: browsers require user gesture or fullscreen for lock
        });
      }
    } catch {
      // Ignore
    }
  }, []);

  // Do not render if in landscape, or if virtual landscape is already active, or user dismissed
  if (!isPortrait || isVirtualLandscape || dismissed) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6, 8, 14, 0.94)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        textAlign: 'center',
        color: '#f8fafc',
      }}
    >
      {/* Dismiss top-right button */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top))',
          right: 'max(16px, env(safe-area-inset-right))',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#94a3b8',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="暂不旋转，直接游玩"
      >
        <X size={18} />
      </button>

      {/* Animated Phone Rotation Graphic */}
      <div
        style={{
          position: 'relative',
          width: 90,
          height: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            animation: 'phone-rotate-anim 2.2s infinite ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            filter: 'drop-shadow(0 0 16px rgba(251, 191, 36, 0.6))',
          }}
        >
          <Smartphone size={54} strokeWidth={1.75} />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: 4,
            animation: 'spin 3s linear infinite',
            color: '#38bdf8',
          }}
        >
          <RotateCw size={22} />
        </div>
      </div>

      <style>{`
        @keyframes phone-rotate-anim {
          0%, 20% { transform: rotate(0deg); }
          50%, 80% { transform: rotate(90deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* Main Title */}
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '21px',
          fontWeight: 900,
          color: '#fbbf24',
          letterSpacing: '1px',
          marginBottom: 8,
          textShadow: '0 2px 10px rgba(251, 191, 36, 0.5)',
        }}
      >
        建议横屏体验 · 最佳尖塔冒险
      </h2>

      <p
        style={{
          fontSize: '13px',
          color: '#cbd5e1',
          maxWidth: '320px',
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        《尖塔单词 · 语言狂潮》针对<strong>横屏卡牌构筑</strong>精心调优。请将手机横置，享受完整战斗视野与全息英灵立绘！
      </p>

      {/* Dual Choice Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
        <button
          onClick={() => {
            sound.playSelect();
            onToggleVirtualLandscape();
          }}
          className="spire-btn"
          style={{
            padding: '12px 18px',
            fontSize: '13px',
            backgroundColor: '#854d0e',
            color: '#fef08a',
            borderColor: '#facc15',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(234, 179, 8, 0.4)',
          }}
        >
          <RotateCw size={16} />
          <span>一键强制虚拟横屏 (Virtual Landscape)</span>
        </button>

        <button
          onClick={() => {
            sound.playSelect();
            setDismissed(true);
          }}
          className="spire-btn"
          style={{
            padding: '10px 18px',
            fontSize: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            borderColor: '#475569',
            color: '#94a3b8',
            justifyContent: 'center',
          }}
        >
          <span>保持竖屏直接进入</span>
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          fontSize: '11px',
          color: '#64748b',
          fontFamily: 'var(--font-mono)',
        }}
      >
        （系统已开启方向锁定时，点击上方“强制虚拟横屏”即可畅玩）
      </div>
    </div>
  );
};
