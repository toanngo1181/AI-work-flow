import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';
import { LayoutPattern } from '../types';

// Constants
const NODE_WIDTH = 280;
const NODE_HEIGHT = 160;
const GAP_X = 100;
const GAP_Y = 100;

// Helper for Dagre (Flow & Tree)
const getDagreLayout = (nodes: Node[], edges: Edge[], rankDir: 'LR' | 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: rankDir, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: rankDir === 'LR' ? Position.Left : Position.Top,
      sourcePosition: rankDir === 'LR' ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
};

// --- STRATEGIES ---

const getStepsLayout = (nodes: Node[]) => {
  return nodes.map((node, index) => ({
    ...node,
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
    position: {
      x: index * (NODE_WIDTH * 0.8), // Slight overlap horizontally looks cool
      y: index * (NODE_HEIGHT + 40),
    },
  }));
};

const getCycleLayout = (nodes: Node[]) => {
  const count = nodes.length;
  const radius = Math.max(350, 200 + count * 50);
  const centerX = 500; 
  const centerY = 400;

  return nodes.map((node, index) => {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: centerX + radius * Math.cos(angle) - NODE_WIDTH / 2,
        y: centerY + radius * Math.sin(angle) - NODE_HEIGHT / 2,
      },
    };
  });
};

const getPyramidLayout = (nodes: Node[]) => {
  const newNodes = [...nodes];
  let idx = 0;
  let row = 0;
  
  while (idx < newNodes.length) {
    const nodesInRow = row + 1;
    const rowWidth = nodesInRow * NODE_WIDTH + (nodesInRow - 1) * 40;
    const startX = 500 - (rowWidth / 2); // Center around X=500

    for (let i = 0; i < nodesInRow; i++) {
      if (idx >= newNodes.length) break;
      newNodes[idx] = {
        ...newNodes[idx],
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: {
          x: startX + i * (NODE_WIDTH + 40),
          y: row * (NODE_HEIGHT + 80),
        },
      };
      idx++;
    }
    row++;
  }
  return newNodes;
};

// --- MAIN FACADE ---

export const applyLayoutStrategy = (
  nodes: Node[], 
  edges: Edge[], 
  pattern: LayoutPattern
): { nodes: Node[]; edges: Edge[] } => {
  
  // Remove Template Nodes if switching layouts
  const contentNodes = nodes.filter(n => n.type !== 'templateNode');
  let layoutedNodes: Node[] = [];

  switch (pattern) {
    case 'flow':
      layoutedNodes = getDagreLayout(contentNodes, edges, 'LR');
      break;
    case 'tree':
      layoutedNodes = getDagreLayout(contentNodes, edges, 'TB');
      break;
    case 'steps':
      layoutedNodes = getStepsLayout(contentNodes);
      break;
    case 'cycle':
      layoutedNodes = getCycleLayout(contentNodes);
      break;
    case 'pyramid':
      layoutedNodes = getPyramidLayout(contentNodes);
      break;
    default:
      layoutedNodes = getDagreLayout(contentNodes, edges, 'LR');
  }

  return { nodes: layoutedNodes, edges };
};