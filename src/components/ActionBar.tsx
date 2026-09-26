import React, { useMemo } from 'react';
import type { ActiveChessUnit } from '../types/autoChess';
import { predictOrder, avProgress } from '../utils/actionTimeline';

interface ActionBarProps {
  /** 场上所有单位（双方混在一起，靠 isEnemy 区分阵营） */
  units: ActiveChessUnit[];
  /** 往后预测多少步行动 */
  steps?: number;
  /** 当前正在行动的单位 id，用于高亮 */
  currentActorId?: string | null;
}

const SLOT_W = 58;
const CHIP_W = 50;

/**
 * 行动条 —— 排轴的可视化载体。
 *
 * 按行动值从小到大横向排列，越靠左越先行动。
 * 拉条 / 推条时，棋子会沿着条子平移，这个位移动画就是「爽感」的来源。
 */
export const ActionBar: React.FC<ActionBarProps> = ({ units, steps = 8, currentActorId }) => {
  const order = useMemo(
    () => predictOrder(units, steps, (u) => u.hp > 0),
    [units, steps],
  );

  // 同一单位可能在预测窗口内出现多次，需要给每次出现编个号当稳定 key
  const seen = new Map<string, number>();
  const entries = order.map((u) => {
    const occ = seen.get(u.instanceId) ?? 0;
    seen.set(u.instanceId, occ + 1);
    return { unit: u, occ, key: `${u.instanceId}#${occ}` };
  });

  const nextUp = entries[0]?.unit ?? null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 12px',
        backgroundColor: 'rgba(8, 10, 18, 0.92)',
        border: '1px solid #334155',
        borderRadius: 6,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
          minWidth: 54,
        }}
      >
        <span style={{ fontSize: 14 }}>⏱</span>
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: '#94a3b8',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          行动顺序
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          flex: 1,
          height: 62,
          overflow: 'hidden',
        }}
      >
        {entries.length === 0 && (
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: '#475569',
              lineHeight: '62px',
            }}
          >
            暂无行动单位
          </div>
        )}

        {entries.map(({ unit, occ, key }, i) => {
          const isEnemy = !!unit.isEnemy;
          const isNext = i === 0;
          const isActing = currentActorId === unit.instanceId;
          const accent = isEnemy ? '#ef4444' : '#38bdf8';
          const progress = avProgress(unit);

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: i * SLOT_W,
                top: 0,
                width: CHIP_W,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                transition: 'left 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: isNext ? 46 : 40,
                  height: isNext ? 46 : 40,
                  borderRadius: 8,
                  backgroundColor: isEnemy ? 'rgba(69, 10, 10, 0.85)' : 'rgba(8, 47, 73, 0.85)',
                  border: `${isNext ? 2 : 1}px solid ${accent}`,
                  boxShadow: isActing
                    ? `0 0 12px ${accent}, 0 0 0 2px #fde047`
                    : isNext
                      ? `0 0 8px ${accent}`
                      : undefined,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <img
                  src={unit.avatar}
                  alt={unit.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                />
                {occ > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#fde047',
                      color: '#1c1917',
                      fontFamily: 'var(--font-pixel-num)',
                      fontSize: '8px',
                      fontWeight: 700,
                      padding: '0 3px',
                      lineHeight: '10px',
                    }}
                  >
                    {occ + 1}
                  </div>
                )}
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: isNext ? '#f8fafc' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: CHIP_W,
                  textAlign: 'center',
                }}
              >
                {unit.name.split(' ')[0]}
              </span>

              {isNext && (
                <div
                  style={{
                    width: CHIP_W - 12,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(148, 163, 184, 0.25)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.round((1 - progress) * 100)}%`,
                      height: '100%',
                      backgroundColor: accent,
                      transition: 'width 0.12s linear',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {nextUp && (
        <div
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: nextUp.isEnemy ? '#f87171' : '#7dd3fc',
            textAlign: 'right',
            minWidth: 56,
            lineHeight: 1.4,
          }}
        >
          下一步
          <br />
          <strong style={{ fontSize: '10px' }}>{nextUp.name.split(' ')[0]}</strong>
        </div>
      )}
    </div>
  );
};
