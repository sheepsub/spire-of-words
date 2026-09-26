import React from 'react';
import { PIXEL_ICONS, type PixelIconName } from '../data/pixelIcons';

export interface PixelIconProps {
  /** 图标名，取自 src/data/pixelIcons.ts（pixelarticons 命名法） */
  name: PixelIconName;
  /**
   * 渲染边长（px）。
   * 图标原生网格为 24×24，取 24 的整数倍最锐利；
   * 其余尺寸由 shapeRendering="crispEdges" 保证硬边像素感，不会糊。
   */
  size?: number;
  /** 填充色，默认继承 currentColor（可随父级文字色变化） */
  color?: string;
  /** 旋转动画，用于刷新 / 加载态 */
  spin?: boolean;
  /** 无障碍标题。提供时图标作为独立语义暴露给读屏，否则视为纯装饰隐藏 */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 像素风格图标。
 *
 * 全项目所有图标统一走这个组件 —— 不再使用 lucide 线性图标或 emoji。
 * 图标数据是 vendor 进项目的（MIT，见 THIRD_PARTY_NOTICES.md），零运行时依赖。
 */
export const PixelIcon: React.FC<PixelIconProps> = ({
  name,
  size = 20,
  color = 'currentColor',
  spin = false,
  title,
  className,
  style,
}) => {
  const d = PIXEL_ICONS[name];

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      shapeRendering="crispEdges"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{
        display: 'inline-block',
        verticalAlign: '-0.15em',
        flexShrink: 0,
        animation: spin ? 'pixelIconSpin 1.1s linear infinite' : undefined,
        ...style,
      }}
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
};
