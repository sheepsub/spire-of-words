import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MapNode, NodeType } from '../types/game';
import type { GeneratedFloor } from '../utils/mapGenerator';
import { PixelIcon } from './PixelIcon';
import { AtmosphericParticles } from './AtmosphericParticles';
import { sound } from '../utils/audio';

// Scenery themes matching TitleView
const SCENERY_THEMES = [
  {
    id: 'summer',
    name: '晴空花海',
    url: '/assets/backgrounds/title_bg_bright_pixel.png',
    particleColor: '#fef08a',
  },
  {
    id: 'prairie',
    name: '浮空圣塔',
    url: '/assets/backgrounds/title_bg_prairie_pixel.jpg',
    particleColor: '#e0e7ff',
  },
  {
    id: 'meadow',
    name: '翠绿密林',
    url: '/assets/backgrounds/title_bg_meadow_pixel.png',
    particleColor: '#86efac',
  },
];

interface MapViewProps {
  floors: GeneratedFloor[];
  currentFloor: number;
  currentNodeId: string | null;
  onSelectNode: (node: MapNode) => void;
  onClose?: () => void;
  characterMarker?: string;
}

// Fixed dimensions for the parchment map canvas
const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 2200;

// Deterministic jitter based on node ID to recreate authentic hand-drawn feel
function getNodeJitter(id: string): { jx: number; jy: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const jx = ((Math.abs(hash) % 100) / 100 - 0.5) * 3; // -1.5% to +1.5%
  const jy = ((Math.abs(hash >> 3) % 100) / 100 - 0.5) * 2; // -1.0% to +1.0%
  return { jx, jy };
}

export const MapView: React.FC<MapViewProps> = ({
  floors,
  currentFloor,
  currentNodeId,
  onSelectNode,
  onClose,
  characterMarker = '/sts2/map/map_marker_ironclad.png',
}) => {
  const [showLegend, setShowLegend] = useState(false);
  const [highlightedType, setHighlightedType] = useState<NodeType | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);
  const firstFloorRef = useRef<HTMLDivElement>(null);

  // Map of node positions: nodeId -> { xPx, yPx, xPercent, yPercent }
  const nodePositions = useMemo(() => {
    const map = new Map<string, { xPx: number; yPx: number; xPercent: number; yPercent: number }>();
    const totalFloors = floors.length;

    floors.forEach((fl) => {
      // f=1 -> bottom (90%), f=15 -> top (8%)
      const yPercentBase = 90 - ((fl.floorIndex - 1) / (totalFloors - 1 || 1)) * 82;

      fl.nodes.forEach((node) => {
        let baseLaneX = 32 + node.lane * 18;
        if (node.type === 'boss') {
          baseLaneX = 50;
        }

        const { jx, jy } = getNodeJitter(node.id);
        const xPercent = baseLaneX + jx;
        const yPercent = yPercentBase + jy;

        const xPx = (xPercent / 100) * CANVAS_WIDTH;
        const yPx = (yPercent / 100) * CANVAS_HEIGHT;

        map.set(node.id, { xPx, yPx, xPercent, yPercent });
      });
    });

    return map;
  }, [floors]);

  // Auto-scroll to player's current floor or starting floor on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentNodeRef.current) {
        currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstFloorRef.current) {
        firstFloorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (scrollContainerRef.current) {
        // Default scroll to bottom where climbing begins
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [currentFloor, currentNodeId]);

  // Node Icon mapping using authentic extracted STS2 sprites
  const getNodeIconSrc = (type: NodeType) => {
    switch (type) {
      case 'monster':
        return '/sts2/map/map_monster.png';
      case 'elite':
        return '/sts2/map/map_elite.png';
      case 'rest':
        return '/sts2/map/map_rest.png';
      case 'shop':
        return '/sts2/map/map_shop.png';
      case 'event':
        return '/sts2/map/map_unknown.png';
      case 'boss':
        return '/sts2/map/slime_boss.webp';
      default:
        return '/sts2/map/map_monster.png';
    }
  };

  const getNodeTitle = (type: NodeType) => {
    switch (type) {
      case 'monster': return '普通敌人 (Enemy)';
      case 'elite': return '精英强敌 (Elite)';
      case 'rest': return '营火休息处 (Rest Site)';
      case 'shop': return '古董商贩 (Merchant)';
      case 'event': return '未知书卷 (Unknown)';
      case 'boss': return '第一幕领主 · 史莱姆老大 (Boss)';
    }
  };

  // Compile all path connections: [fromNode, toNode, isAccessible, isTraveled]
  const paths = useMemo(() => {
    const list: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isTraveled: boolean;
      isAccessible: boolean;
    }> = [];

    floors.forEach((fl) => {
      fl.nodes.forEach((node) => {
        const fromPos = nodePositions.get(node.id);
        if (!fromPos) return;

        node.nextNodes.forEach((targetId) => {
          const toPos = nodePositions.get(targetId);
          if (!toPos) return;

          // Find target node object
          const targetFloor = floors.find((f) => f.floorIndex === node.floor + 1);
          const targetNode = targetFloor?.nodes.find((n) => n.id === targetId);

          const isTraveled = node.visited && (targetNode?.visited ?? false);
          const isAccessible = (node.id === currentNodeId || (currentFloor === 0 && node.floor === 1)) && (targetNode?.accessible ?? false);

          list.push({
            id: `${node.id}->${targetId}`,
            x1: fromPos.xPx,
            y1: fromPos.yPx,
            x2: toPos.xPx,
            y2: toPos.yPx,
            isTraveled,
            isAccessible,
          });
        });
      });
    });

    return list;
  }, [floors, nodePositions, currentNodeId, currentFloor]);

  // Read the active scenery theme selected on TitleView
  const currentTheme = useMemo(() => {
    if (typeof window === 'undefined') return SCENERY_THEMES[0];
    const saved = localStorage.getItem('spire_title_scenery_idx');
    const idx = saved ? parseInt(saved, 10) : 0;
    return SCENERY_THEMES[idx] || SCENERY_THEMES[0];
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#174854',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* MAP HEADER BANNER (Harmonized with Stardew Tavern Signboard Palette) */}
      <div style={{
        padding: 'max(6px, env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) 8px max(18px, env(safe-area-inset-left))',
        background: 'linear-gradient(180deg, #3f92a8 0%, #2f7a8c 60%, #1e5866 100%)',
        borderBottom: '3px solid #143f49',
        boxShadow: '0 4px 16px rgba(10, 40, 46, 0.45), inset 0 2px 0 #7ccadd, inset 0 -2px 0 #143f49',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
        gap: 12,
        position: 'relative',
      }}>
        {/* Brass Rivets on Header corners */}
        <div className="stardew-rivet stardew-rivet-tl" style={{ top: 4, left: 4 }} />
        <div className="stardew-rivet stardew-rivet-tr" style={{ top: 4, right: 4 }} />
        <div className="stardew-rivet stardew-rivet-bl" style={{ bottom: 4, left: 4 }} />
        <div className="stardew-rivet stardew-rivet-br" style={{ bottom: 4, right: 4 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12 }}>
          <img 
            src="/sts2/ui/top_bar_floor.png" 
            alt="Spire" 
            style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} 
          />
          <div>
            <h2 className="stardew-pixel-title" style={{
              fontSize: '16px',
              margin: 0,
              letterSpacing: '1px',
              textShadow: '2px 2px 0 #174854, -1px -1px 0 #174854, 1px -1px 0 #174854, -1px 1px 0 #174854',
            }}>
              尖塔登攀路线 · ACT I EXORDIUM
            </h2>
            <div style={{
              fontSize: '11px',
              color: '#dcfce7',
              fontFamily: 'var(--font-pixel)',
              marginTop: '2px',
              textShadow: '0 1px 2px rgba(15, 51, 60, 0.9)',
            }}>
              {currentFloor === 0 
                ? '★ 请在底层选择一个初始房间启程' 
                : `当前位于第 ${currentFloor} 层 · 请选择下一间相连的房间进行突破`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
          {/* Legend Toggle Button */}
          <button
            onClick={() => setShowLegend(prev => !prev)}
            className="stardew-btn stardew-btn-wood"
            title="查看地图图例"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              gap: 5,
            }}
          >
            <PixelIcon name="compass" size={14} color="#fde047" />
            <span>图例</span>
          </button>

          {/* Return / Close Button (if available) */}
          {onClose && (
            <button
              onClick={() => { sound.playSelect(); onClose(); }}
              className="stardew-btn stardew-btn-red"
              style={{
                padding: '5px 14px',
                fontSize: '11px',
              }}
            >
              返回
            </button>
          )}
        </div>
      </div>

      {/* MAP VIEWPORT (Vertical Scrollable Parchment with Vibrant World Backdrop) */}
      <div 
        ref={scrollContainerRef}
        className="spire-map-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(180deg, rgba(8, 28, 34, 0.72) 0%, rgba(12, 38, 46, 0.65) 50%, rgba(6, 20, 24, 0.82) 100%), url('${currentTheme.url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dynamic Ambient Particles from the scenery world */}
        <AtmosphericParticles color={currentTheme.particleColor} density={18} />

        {/* PARCHMENT MAP CANVAS CONTAINER (Carved Timber Scroll with Stardew Teal & Gold Accents) */}
        <div style={{
          width: '100%',
          maxWidth: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          position: 'relative',
          boxShadow: '0 8px 36px rgba(4, 18, 22, 0.75), -12px 0 28px rgba(4, 18, 22, 0.6), 12px 0 28px rgba(4, 18, 22, 0.6)',
          backgroundColor: '#f7f0de',
          flexShrink: 0,
          margin: '0 auto',
        }}>
          {/* TOP CARVED TIMBER SCROLL ROD */}
          <div style={{
            width: 'calc(100% + 36px)',
            marginLeft: '-18px',
            height: '16px',
            background: 'linear-gradient(180deg, #5cb3cc 0%, #36849a 30%, #1e5866 70%, #0f333c 100%)',
            border: '2px solid #0c2b33',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.4)',
            position: 'sticky',
            top: 0,
            zIndex: 15,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 6px',
            boxSizing: 'border-box',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #fef08a 0%, #eab54a 50%, #854d0e 100%)', border: '1px solid #78350f', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
            <div style={{ height: 2, flex: 1, margin: '0 10px', background: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #fef08a 0%, #eab54a 50%, #854d0e 100%)', border: '1px solid #78350f', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
          </div>

          {/* THREE-PIECE EXORDIUM MAP BACKGROUND (Top, Middle, Bottom) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'none',
            zIndex: 1,
            filter: 'sepia(0.06) saturate(1.18) hue-rotate(-8deg) contrast(1.03)',
          }}>
            {/* Top section: Boss Arena & Thorns */}
            <div style={{
              width: '100%',
              height: '33.33%',
              backgroundImage: 'url(/sts2/map/map_top_exordium_act.webp)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }} />
            {/* Middle section: Ancient Overgrown Vines */}
            <div style={{
              width: '100%',
              height: '33.34%',
              backgroundImage: 'url(/sts2/map/map_middle_exordium_act.webp)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }} />
            {/* Bottom section: Spire Base & Entrance */}
            <div style={{
              width: '100%',
              height: '33.33%',
              backgroundImage: 'url(/sts2/map/map_bottom_exordium_act.webp)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>

          {/* Subtle Stardew Mint-Parchment Luminous Tint */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 15%, rgba(255, 252, 240, 0.12) 0%, transparent 65%), linear-gradient(180deg, rgba(246, 253, 252, 0.08) 0%, rgba(221, 242, 239, 0.04) 50%, rgba(54, 132, 154, 0.06) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* PARCHMENT VIGNETTE & WORN EDGES OVERLAY (Softened teal shadow) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(15,51,60,0.3) 0%, transparent 8%, transparent 92%, rgba(15,51,60,0.3) 100%), linear-gradient(180deg, rgba(15,51,60,0.25) 0%, transparent 4%, transparent 96%, rgba(15,51,60,0.38) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* FLOOR LABELS (Left margin ink tags) */}
          {floors.map((fl) => {
            const isBossFloor = fl.floorIndex === 15;
            const yPercent = 90 - ((fl.floorIndex - 1) / (floors.length - 1)) * 82;
            const isCurrent = fl.floorIndex === currentFloor;

            return (
              <div
                key={`floor-label-${fl.floorIndex}`}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: `${yPercent}%`,
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: isBossFloor ? '12px' : '11px',
                  fontWeight: 800,
                  color: isCurrent 
                    ? '#facc15' 
                    : isBossFloor 
                    ? '#f87171' 
                    : 'rgba(214, 180, 130, 0.45)',
                  textShadow: '0 1px 3px #000',
                  letterSpacing: '0.5px',
                  borderBottom: isCurrent ? '1.5px solid #facc15' : 'none',
                  paddingBottom: '1px',
                }}>
                  {isBossFloor ? 'F15 · 领主' : `F${fl.floorIndex}`}
                </div>
              </div>
            );
          })}

          {/* SVG DOTTED PATH LINES */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="activePathGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fde047" stopOpacity="1" />
              </linearGradient>
            </defs>

            {paths.map((p) => {
              // Smooth bezier curve between nodes
              const cy1 = p.y1 - (p.y1 - p.y2) * 0.5;
              const cy2 = p.y2 + (p.y1 - p.y2) * 0.5;
              const d = `M ${p.x1} ${p.y1} C ${p.x1} ${cy1}, ${p.x2} ${cy2}, ${p.x2} ${p.y2}`;

              if (p.isTraveled) {
                // Traveled solid ink line
                return (
                  <path
                    key={p.id}
                    d={d}
                    fill="none"
                    stroke="#1a140e"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    style={{ opacity: 0.9 }}
                  />
                );
              }

              if (p.isAccessible) {
                // Currently available forward path: glowing golden flowing dots
                return (
                  <g key={p.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke="rgba(251, 191, 36, 0.25)"
                      strokeWidth={8}
                      strokeLinecap="round"
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke="url(#activePathGrad)"
                      strokeWidth={3.8}
                      strokeDasharray="6, 8"
                      strokeLinecap="round"
                      className="spire-path-flow"
                      style={{
                        filter: 'drop-shadow(0 0 5px #f59e0b)',
                      }}
                    />
                  </g>
                );
              }

              // Inactive unreached path: dark sepia ink dots
              return (
                <path
                  key={p.id}
                  d={d}
                  fill="none"
                  stroke="rgba(35, 26, 18, 0.5)"
                  strokeWidth={2.8}
                  strokeDasharray="4, 7"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* NODES LAYER */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
          }}>
            {floors.map((fl) => {
              const isFirstFloor = fl.floorIndex === 1;

              return fl.nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;

                const isCurrent = node.id === currentNodeId;
                const isNextFloor = fl.floorIndex === currentFloor + 1;
                const canChoose = (currentFloor === 0 && isFirstFloor) || (isNextFloor && node.accessible);
                const isBoss = node.type === 'boss';
                const isHighlightedByLegend = highlightedType === node.type;

                // Set scroll anchor refs
                const ref = isCurrent ? currentNodeRef : isFirstFloor && node.lane === 1 ? firstFloorRef : undefined;

                return (
                  <div
                    key={node.id}
                    ref={ref}
                    style={{
                      position: 'absolute',
                      left: `${pos.xPercent}%`,
                      top: `${pos.yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Character Pin Marker above the current node */}
                    {isCurrent && (
                      <div
                        className="spire-marker-bob"
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: isBoss ? '-18px' : '-22px',
                          zIndex: 25,
                          pointerEvents: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <img 
                          src={characterMarker} 
                          alt="You are here" 
                          style={{
                            width: 32,
                            height: 38,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 8px #facc15)',
                          }} 
                        />
                        <div style={{
                          backgroundColor: '#facc15',
                          color: '#000',
                          fontFamily: 'var(--font-serif)',
                          fontSize: '9px',
                          fontWeight: 900,
                          padding: '1px 4px',
                          borderRadius: 2,
                          marginTop: '-3px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.8)',
                          whiteSpace: 'nowrap',
                        }}>
                          当前位置
                        </div>
                      </div>
                    )}

                    {/* Interactive Node Button */}
                    <button
                      onClick={() => {
                        if (canChoose) {
                          sound.playSelect();
                          onSelectNode(node);
                        }
                      }}
                      disabled={!canChoose && !isCurrent}
                      title={`${getNodeTitle(node.type)} · 第 ${node.floor} 层`}
                      className={`spire-map-node ${canChoose ? (isBoss ? 'spire-boss-pulse' : 'spire-node-pulse') : ''} ${isHighlightedByLegend ? 'spire-legend-highlight' : ''}`}
                      style={{
                        width: isBoss ? 76 : 52,
                        height: isBoss ? 76 : 52,
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: canChoose ? 'pointer' : 'default',
                        position: 'relative',
                        transition: 'transform 0.18s ease, filter 0.18s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (canChoose) {
                          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.32)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canChoose) {
                          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.15)';
                        }
                      }}
                    >
                      {/* Node background circle stamp */}
                      <img 
                        src="/sts2/map/map_node_background.png"
                        alt=""
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: node.visited ? 0.35 : canChoose ? 0.95 : 0.6,
                          pointerEvents: 'none',
                          filter: canChoose ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none',
                        }}
                      />

                      {/* Golden active selection ring */}
                      {canChoose && (
                        <div style={{
                          position: 'absolute',
                          inset: isBoss ? -4 : -3,
                          borderRadius: '50%',
                          border: isBoss ? '3px solid #ef4444' : '2.5px solid #facc15',
                          boxShadow: isBoss 
                            ? '0 0 20px rgba(239, 68, 68, 0.9), inset 0 0 10px rgba(239, 68, 68, 0.6)'
                            : '0 0 16px rgba(250, 204, 21, 0.9), inset 0 0 8px rgba(250, 204, 21, 0.5)',
                          pointerEvents: 'none',
                        }} />
                      )}

                      {/* Authentic STS2 Node Icon */}
                      <img 
                        src={getNodeIconSrc(node.type)} 
                        alt={node.type}
                        style={{
                          width: isBoss ? 56 : 38,
                          height: isBoss ? 56 : 38,
                          objectFit: 'contain',
                          zIndex: 2,
                          filter: node.visited 
                            ? 'grayscale(0.8) contrast(1.2) brightness(0.6)' 
                            : canChoose 
                            ? 'brightness(1.15) contrast(1.1)' 
                            : 'brightness(0.7) contrast(1.1) opacity(0.75)',
                          transition: 'filter 0.2s ease',
                        }}
                      />

                      {/* Visited Red Cross / Stamp Indicator */}
                      {node.visited && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#78350f',
                          fontSize: '18px',
                          fontWeight: 900,
                          zIndex: 3,
                          pointerEvents: 'none',
                          opacity: 0.85,
                        }}>
                          ✕
                        </div>
                      )}
                    </button>
                  </div>
                );
              });
            })}
          </div>

          {/* BOTTOM CARVED TIMBER SCROLL ROD */}
          <div style={{
            width: 'calc(100% + 36px)',
            marginLeft: '-18px',
            height: '16px',
            background: 'linear-gradient(180deg, #5cb3cc 0%, #36849a 30%, #1e5866 70%, #0f333c 100%)',
            border: '2px solid #0c2b33',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.4)',
            position: 'relative',
            zIndex: 15,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 6px',
            boxSizing: 'border-box',
            marginTop: '-8px',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #fef08a 0%, #eab54a 50%, #854d0e 100%)', border: '1px solid #78350f', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
            <div style={{ height: 2, flex: 1, margin: '0 10px', background: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #fef08a 0%, #eab54a 50%, #854d0e 100%)', border: '1px solid #78350f', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      </div>

      {/* FLOATING LEGEND PANEL (Top Right Stardew Noticeboard Overlay) */}
      {showLegend && (
        <div className="stardew-panel" style={{
          position: 'absolute',
          top: '64px',
          right: '16px',
          zIndex: 50,
          width: '220px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #2f7a8c',
            paddingBottom: '6px',
          }}>
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              fontWeight: 800,
              color: '#1c5260',
              letterSpacing: '1px',
            }}>
              图例 (LEGEND)
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="stardew-btn"
              style={{
                background: '#e05252',
                border: '2px solid #5a1414',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                width: 20,
                height: 20,
                borderRadius: 2,
              }}
            >
              <PixelIcon name="close" size={14} color="#fff" />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { type: 'monster' as NodeType, title: '怪物 (Enemy)', icon: '/sts2/map/map_monster.png' },
              { type: 'elite' as NodeType, title: '精英 (Elite)', icon: '/sts2/map/map_elite.png' },
              { type: 'rest' as NodeType, title: '休息处 (Rest Site)', icon: '/sts2/map/map_rest.png' },
              { type: 'shop' as NodeType, title: '商店 (Merchant)', icon: '/sts2/map/map_shop.png' },
              { type: 'event' as NodeType, title: '未知 (Unknown)', icon: '/sts2/map/map_unknown.png' },
              { type: 'boss' as NodeType, title: '领主 (Boss)', icon: '/sts2/map/slime_boss.webp' },
            ].map((item) => (
              <div
                key={item.type}
                onMouseEnter={() => setHighlightedType(item.type)}
                onMouseLeave={() => setHighlightedType(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '4px 6px',
                  borderRadius: 3,
                  backgroundColor: highlightedType === item.type ? 'rgba(54, 132, 154, 0.2)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <img 
                  src={item.icon} 
                  alt={item.title} 
                  style={{ width: 22, height: 22, objectFit: 'contain' }} 
                />
                <span style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: highlightedType === item.type ? '#0f333c' : '#226070',
                }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: '9.5px',
            color: '#475569',
            fontFamily: 'var(--font-pixel)',
            borderTop: '1px solid rgba(47, 122, 140, 0.3)',
            paddingTop: '6px',
            textAlign: 'center',
          }}>
            悬停图例项可高亮地图对应房间
          </div>
        </div>
      )}

      {/* BOTTOM STARTING ROOM PROMPT BANNER (When at Floor 0) */}
      {currentFloor === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          background: 'linear-gradient(180deg, #eab54a 0%, #d0932c 60%, #a9701c 100%)',
          border: '3px solid #452103',
          boxShadow: 'inset 2px 2px 0 #fbe6a2, inset -2px -2px 0 #6d4711, 0 6px 20px rgba(0,0,0,0.5)',
          borderRadius: 4,
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none',
          animation: 'fadeIn 0.3s ease',
        }}>
          <img 
            src="/sts2/map/map_marker_ironclad.png" 
            alt="" 
            style={{ width: 22, height: 26, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} 
          />
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '12.5px',
            fontWeight: 800,
            color: '#fffdf2',
            letterSpacing: '1px',
            textShadow: '2px 2px 0 #452103, -1px -1px 0 #452103, 1px -1px 0 #452103, -1px 1px 0 #452103',
          }}>
            点击底部的任意发光房间，开启你的爬塔征程！
          </div>
        </div>
      )}
    </div>
  );
};
