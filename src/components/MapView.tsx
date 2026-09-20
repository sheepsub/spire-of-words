import React from 'react';
import type { MapNode, NodeType } from '../types/game';
import type { GeneratedFloor } from '../utils/mapGenerator';
import { Swords, Flame, ShoppingBag, HelpCircle, Skull, Crown } from 'lucide-react';
import { sound } from '../utils/audio';

interface MapViewProps {
  floors: GeneratedFloor[];
  currentFloor: number;
  currentNodeId: string | null;
  onSelectNode: (node: MapNode) => void;
  onClose?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  floors,
  currentFloor,
  currentNodeId,
  onSelectNode,
  onClose,
}) => {
  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'monster':
        return <Swords size={20} color="#f87171" />;
      case 'elite':
        return <Skull size={22} color="#fb7185" />;
      case 'rest':
        return <Flame size={20} color="#fbbf24" />;
      case 'shop':
        return <ShoppingBag size={20} color="#38bdf8" />;
      case 'event':
        return <HelpCircle size={20} color="#a855f7" />;
      case 'boss':
        return <Crown size={28} color="#eab308" />;
    }
  };

  const getNodeTitle = (type: NodeType) => {
    switch (type) {
      case 'monster': return '普通敌人';
      case 'elite': return '精英强敌';
      case 'rest': return '营火休息处';
      case 'shop': return '古董商贩';
      case 'event': return '未知书卷';
      case 'boss': return '第一幕领主';
    }
  };

  // Render from Floor 15 (Boss) down to Floor 1 (Start)
  const reversedFloors = [...floors].reverse();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#0a0b12',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: 'rgba(18, 20, 31, 0.95)',
        borderBottom: '1px solid var(--border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fbbf24', fontSize: '18px' }}>
            尖塔登攀路线 (Map of the Spire)
          </h2>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            选择一条路径勇攀尖塔，向顶端的词汇领主进军
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="spire-btn"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            返回
          </button>
        )}
      </div>

      {/* Map Scroll View */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '30px 20px 80px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        {reversedFloors.map((fl) => {
          const isCurrentFloor = fl.floorIndex === currentFloor;
          const isNextFloor = fl.floorIndex === currentFloor + 1;

          return (
            <div
              key={fl.floorIndex}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 48,
                position: 'relative',
                width: '100%',
                maxWidth: '420px',
              }}
            >
              {/* Floor index label */}
              <div style={{
                position: 'absolute',
                left: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: isCurrentFloor ? '#fbbf24' : '#475569',
                fontWeight: 700,
              }}>
                F{fl.floorIndex}
              </div>

              {/* Nodes in this floor */}
              <div style={{ display: 'flex', gap: 36, justifyContent: 'center' }}>
                {fl.nodes.map((node) => {
                  const isCurrent = node.id === currentNodeId;
                  const canChoose = (currentFloor === 0 && fl.floorIndex === 1) || 
                                    (isNextFloor && node.accessible);

                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        if (canChoose) {
                          sound.playSelect();
                          onSelectNode(node);
                        }
                      }}
                      disabled={!canChoose && !isCurrent}
                      title={`${getNodeTitle(node.type)} (第 ${node.floor} 层)`}
                      style={{
                        width: node.type === 'boss' ? 64 : 46,
                        height: node.type === 'boss' ? 64 : 46,
                        borderRadius: '50%',
                        backgroundColor: isCurrent 
                          ? 'rgba(234, 179, 8, 0.25)' 
                          : canChoose 
                          ? 'rgba(30, 41, 59, 0.9)' 
                          : 'rgba(15, 23, 42, 0.5)',
                        border: isCurrent
                          ? '3px solid #facc15'
                          : canChoose
                          ? '2px solid #60a5fa'
                          : '1px solid #334155',
                        boxShadow: canChoose
                          ? '0 0 16px rgba(96, 165, 250, 0.6)'
                          : isCurrent
                          ? '0 0 20px rgba(250, 204, 21, 0.7)'
                          : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: canChoose ? 'pointer' : 'default',
                        transform: canChoose ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {getNodeIcon(node.type)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
