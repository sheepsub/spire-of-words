import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MapNode, NodeType } from '../types/game';
import type { GeneratedFloor } from '../utils/mapGenerator';
import { PixelIcon } from './PixelIcon';
import { sound } from '../utils/audio';

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

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#07080d',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* MAP HEADER BANNER (Authentic STS Spire Aesthetic) */}
      <div style={{
        padding: 'max(6px, env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) 6px max(18px, env(safe-area-inset-left))',
        backgroundColor: 'rgba(12, 14, 20, 0.96)',
        borderBottom: '2px solid #000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.8), inset 0 -1px 0 rgba(197, 160, 89, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img 
            src="/sts2/ui/top_bar_floor.png" 
            alt="Spire" 
            style={{ width: 28, height: 28, objectFit: 'contain' }} 
          />
          <div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              color: '#facc15',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '1px',
              textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(250, 204, 21, 0.4)',
              margin: 0,
            }}>
              尖塔登攀路线 · ACT I EXORDIUM
            </h2>
            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              fontFamily: 'var(--font-serif)',
            }}>
              {currentFloor === 0 
                ? '★ 请在底层选择一个初始房间启程' 
                : `当前位于第 ${currentFloor} 层 · 请选择下一间相连的房间进行突破`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Legend Toggle Button */}
          <button
            onClick={() => setShowLegend(prev => !prev)}
            className="spire-btn"
            title="查看地图图例"
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-serif)',
              color: showLegend ? '#facc15' : '#e2e8f0',
              backgroundColor: showLegend ? 'rgba(250, 204, 21, 0.15)' : 'rgba(25, 20, 15, 0.85)',
              border: `1px solid ${showLegend ? '#facc15' : 'rgba(197, 160, 89, 0.5)'}`,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
            }}
          >
            <PixelIcon name="compass" size={14} color={showLegend ? '#facc15' : '#cbd5e1'} />
            <span>图例</span>
          </button>

          {/* Return / Close Button (if available) */}
          {onClose && (
            <button
              onClick={() => { sound.playSelect(); onClose(); }}
              className="spire-btn"
              style={{
                padding: '5px 14px',
                fontSize: '12px',
                fontFamily: 'var(--font-serif)',
                color: '#fff',
                backgroundColor: 'rgba(220, 38, 38, 0.25)',
                border: '1px solid #ef4444',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              返回
            </button>
          )}
        </div>
      </div>

      {/* MAP VIEWPORT (Vertical Scrollable Parchment) */}
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
          backgroundColor: '#050608',
          background: 'radial-gradient(ellipse at center, #111420 0%, #050608 100%)',
        }}
      >
        {/* PARCHMENT MAP CANVAS CONTAINER */}
        <div style={{
          width: '100%',
          maxWidth: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          position: 'relative',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.95), -15px 0 35px rgba(0, 0, 0, 0.8), 15px 0 35px rgba(0, 0, 0, 0.8)',
          backgroundColor: '#1c1917',
          flexShrink: 0,
        }}>
          {/* THREE-PIECE EXORDIUM MAP BACKGROUND (Top, Middle, Bottom) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'none',
            zIndex: 1,
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

          {/* PARCHMENT VIGNETTE & WORN EDGES OVERLAY */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(5,6,8,0.7) 0%, transparent 8%, transparent 92%, rgba(5,6,8,0.7) 100%), linear-gradient(180deg, rgba(5,6,8,0.6) 0%, transparent 5%, transparent 95%, rgba(5,6,8,0.85) 100%)',
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
        </div>
      </div>

      {/* FLOATING LEGEND PANEL (Top Right Overlay) */}
      {showLegend && (
        <div style={{
          position: 'absolute',
          top: '64px',
          right: '16px',
          zIndex: 50,
          width: '210px',
          backgroundImage: 'url(/sts2/map/map_legend.png)',
          backgroundSize: '100% 100%',
          backgroundColor: '#1c1917',
          border: '2px solid rgba(197, 160, 89, 0.8)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.95), 0 0 20px rgba(197, 160, 89, 0.3)',
          borderRadius: 6,
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
            borderBottom: '1px solid rgba(197, 160, 89, 0.4)',
            paddingBottom: '6px',
          }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: 800,
              color: '#facc15',
              letterSpacing: '1px',
            }}>
              图例 (LEGEND)
            </span>
            <button
              onClick={() => setShowLegend(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <PixelIcon name="close" size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  padding: '3px 6px',
                  borderRadius: 4,
                  backgroundColor: highlightedType === item.type ? 'rgba(250, 204, 21, 0.2)' : 'transparent',
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
                  fontFamily: 'var(--font-serif)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: highlightedType === item.type ? '#fde047' : '#e2e8f0',
                }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#94a3b8',
            borderTop: '1px solid rgba(197, 160, 89, 0.2)',
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
          backgroundColor: 'rgba(15, 12, 10, 0.94)',
          border: '2px solid #facc15',
          boxShadow: '0 0 25px rgba(250, 204, 21, 0.6), 0 4px 15px rgba(0,0,0,0.9)',
          borderRadius: 6,
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
            style={{ width: 20, height: 24, objectFit: 'contain' }} 
          />
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            fontWeight: 800,
            color: '#facc15',
            letterSpacing: '1px',
            textShadow: '0 1px 2px #000',
          }}>
            点击底部的任意发光房间，开启你的爬塔征程！
          </div>
        </div>
      )}
    </div>
  );
};
