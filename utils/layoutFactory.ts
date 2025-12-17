import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';
import { LayoutType } from '../types';

// Dimensions must match the CSS in InfographicNode
const STANDARD_WIDTH = 300;
const COMPACT_WIDTH = 220; 
const NODE_HEIGHT = 150;

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  type: LayoutType = 'linear'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Dynamic Spacing based on density
  const nodeCount = nodes.length;
  const isCrowded = nodeCount > 8;

  // Helper to apply positions back to nodes using Dagre
  const applyDagreLayout = (rankdir: 'LR' | 'TB') => {
    dagreGraph.setGraph({ 
        rankdir, 
        nodesep: isCrowded ? 40 : 60, 
        ranksep: isCrowded ? 70 : 100 
    });

    const nodeWidth = type === 'cyclic' ? COMPACT_WIDTH : STANDARD_WIDTH;

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        targetPosition: rankdir === 'LR' ? Position.Left : Position.Top,
        sourcePosition: rankdir === 'LR' ? Position.Right : Position.Bottom,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
      };
    });
  };

  if (type === 'cyclic') {
    // Mathematical Layout for Perfect Circle with DYNAMIC RADIUS
    const centerX = 500;
    const centerY = 400;
    
    // Scale radius: Base 350px, add 80px per node after the 5th node
    const baseRadius = 350;
    const dynamicRadius = Math.max(baseRadius, baseRadius + (nodeCount - 5) * 80);

    return {
      nodes: nodes.map((node, index) => {
        // Start from -90deg (Top)
        const angle = (index / nodes.length) * 2 * Math.PI - (Math.PI / 2);
        
        return {
          ...node,
          sourcePosition: Position.Right, // Generic handle strategy for circles
          targetPosition: Position.Left,
          position: {
            x: centerX + dynamicRadius * Math.cos(angle),
            y: centerY + dynamicRadius * Math.sin(angle),
          },
        };
      }),
      edges,
    };
  } else if (type === 'hierarchy') {
    return { nodes: applyDagreLayout('TB'), edges };
  } else {
    // Default Linear (LR)
    return { nodes: applyDagreLayout('LR'), edges };
  }
};