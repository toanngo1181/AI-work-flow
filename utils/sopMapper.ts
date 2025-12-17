import { Node, Edge } from 'reactflow';
import { ProcessNodeData, NodeType, RiskLevel } from '../types';

export interface SOPData {
  title: string;
  timestamp: string;
  steps: Node<ProcessNodeData>[];
  checkpoints: Node<ProcessNodeData>[]; // Decisions & High/Med Risks
  outcome: Node<ProcessNodeData> | null;
}

export const mapNodesToSOP = (nodes: Node<ProcessNodeData>[], edges: Edge[], diagramTitle: string): SOPData => {
  // 1. Sort nodes by X position (Left to Right) to emulate sequential order
  const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);

  // 2. Identify The Outcome (Last End Node or last node)
  const endNode = sortedNodes.find(n => n.data.type === NodeType.END) || sortedNodes[sortedNodes.length - 1];

  // 3. Filter Execution Steps (Start & Process nodes)
  const steps = sortedNodes.filter(n => 
    (n.data.type === NodeType.START || n.data.type === NodeType.PROCESS) && 
    n.id !== endNode?.id
  );

  // 4. Filter Checkpoints (Decisions or High/Medium Risk nodes)
  // Note: A node can be both a step and a high risk point, we might want to emphasize it in the Checkpoints section
  const checkpoints = sortedNodes.filter(n => 
    n.data.type === NodeType.DECISION || 
    n.data.riskLevel === RiskLevel.HIGH || 
    n.data.riskLevel === RiskLevel.MEDIUM
  );

  return {
    title: diagramTitle || 'QUY TRÌNH TIÊU CHUẨN (SOP)',
    timestamp: new Date().toLocaleDateString('vi-VN'),
    steps,
    checkpoints,
    outcome: endNode?.data.type === NodeType.END ? endNode : null
  };
};