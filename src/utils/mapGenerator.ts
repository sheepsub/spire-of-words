import type { MapNode, NodeType } from '../types/game';

export interface GeneratedFloor {
  floorIndex: number;
  nodes: MapNode[];
}

export function generateActMap(totalFloors: number = 15): GeneratedFloor[] {
  const floors: GeneratedFloor[] = [];

  for (let f = 1; f <= totalFloors; f++) {
    const nodes: MapNode[] = [];

    if (f === 1) {
      // Floor 1: Always 3 starter monsters to choose from
      for (let lane = 0; lane < 3; lane++) {
        nodes.push({
          id: `node_${f}_${lane}`,
          floor: f,
          lane,
          type: 'monster',
          visited: false,
          accessible: true, // Floor 1 is always accessible
          nextNodes: [],
        });
      }
    } else if (f === totalFloors) {
      // Final Boss floor: 1 single centered node
      nodes.push({
        id: `node_${f}_1`,
        floor: f,
        lane: 1,
        type: 'boss',
        visited: false,
        accessible: false,
        nextNodes: [],
      });
    } else if (f === totalFloors - 1) {
      // Floor before boss: Rest site (Campfire)
      for (let lane = 0; lane < 3; lane++) {
        nodes.push({
          id: `node_${f}_${lane}`,
          floor: f,
          lane,
          type: 'rest',
          visited: false,
          accessible: false,
          nextNodes: [`node_${totalFloors}_1`],
        });
      }
    } else if (f === 8 || f === 12) {
      // Elite floors
      for (let lane = 0; lane < 3; lane++) {
        const type: NodeType = lane === 1 ? 'elite' : (lane === 0 ? 'monster' : 'event');
        nodes.push({
          id: `node_${f}_${lane}`,
          floor: f,
          lane,
          type,
          visited: false,
          accessible: false,
          nextNodes: [],
        });
      }
    } else if (f === 6 || f === 10) {
      // Guaranteed rest or shop options
      for (let lane = 0; lane < 3; lane++) {
        const type: NodeType = lane === 0 ? 'rest' : (lane === 1 ? 'shop' : 'event');
        nodes.push({
          id: `node_${f}_${lane}`,
          floor: f,
          lane,
          type,
          visited: false,
          accessible: false,
          nextNodes: [],
        });
      }
    } else {
      // Regular climbing floors: weighted distribution
      for (let lane = 0; lane < 3; lane++) {
        const rand = Math.random();
        let type: NodeType = 'monster';
        if (rand < 0.5) {
          type = 'monster';
        } else if (rand < 0.75) {
          type = 'event';
        } else if (rand < 0.9) {
          type = 'shop';
        } else {
          type = 'rest';
        }

        nodes.push({
          id: `node_${f}_${lane}`,
          floor: f,
          lane,
          type,
          visited: false,
          accessible: false,
          nextNodes: [],
        });
      }
    }

    floors.push({ floorIndex: f, nodes });
  }

  // Connect floors with paths
  for (let f = 0; f < floors.length - 1; f++) {
    const currentFloor = floors[f];
    const nextFloor = floors[f + 1];

    if (f + 1 === totalFloors - 1) {
      // Floor right before Boss (Rest sites) all connect to Boss
      currentFloor.nodes.forEach(n => {
        n.nextNodes = [`node_${totalFloors}_1`];
      });
      continue;
    }

    currentFloor.nodes.forEach(node => {
      // Connect to adjacent lanes: lane-1, lane, lane+1 (if exists)
      const possibleLanes = [node.lane - 1, node.lane, node.lane + 1].filter(l => l >= 0 && l <= 2);
      const targets = nextFloor.nodes.filter(next => possibleLanes.includes(next.lane));
      
      // Ensure at least one forward connection
      const chosen = targets.length > 0 
        ? targets.map(t => t.id)
        : [nextFloor.nodes[0].id];
        
      node.nextNodes = chosen;
    });
  }

  return floors;
}
