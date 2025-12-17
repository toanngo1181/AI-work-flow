import { Node, Edge } from 'reactflow';

export enum NodeType {
  START = 'START',
  PROCESS = 'PROCESS',
  DECISION = 'DECISION',
  END = 'END',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface KPI {
  label: string;
  value: string;
}

// --- NEW VIEW ARCHITECTURE ---
export type ViewMode = 'technical' | 'infographic' | 'nano_3d' | 'sop_template';
export type LayoutPattern = 'flow' | 'tree' | 'cycle' | 'steps' | 'pyramid';
export type FunctionalMode = 'execution' | 'supervisor';

// Legacy/Alternative Layout Types
export type LayoutType = 'linear' | 'cyclic' | 'hierarchy';
export type LayoutArchetype = 'timeline' | 'cycle' | 'pyramid';

export interface NanoDesignTokens {
  colorTheme: 'blue' | 'red' | 'yellow' | 'green' | 'purple' | 'slate';
  styleVariant: 'glass' | 'solid' | 'outline';
}

export type NodeShape = 'rectangle' | 'round' | 'diamond' | 'hexagon' | 'parallelogram' | 'star' | 'heart' | 'trapezoid';

export interface ProcessNodeData {
  label: string;
  type: NodeType;
  description?: string;
  riskLevel: RiskLevel;
  kpis: KPI[];
  auditStep: string; 
  isBottleneck?: boolean;
  isOverloaded?: boolean;
  iconName?: string;
  
  // AI Illustration Data
  imagePrompt?: string; 
  imageUrl?: string;    

  // Visual & Layout State
  viewMode?: ViewMode; 
  functionalMode?: FunctionalMode; 
  illustration?: string;
  design?: NanoDesignTokens;
  
  // Custom Styling
  customShape?: NodeShape;
  customBackgroundColor?: string; // NEW
  customBorderColor?: string;     // NEW

  isOverlay?: boolean; 
  
  layoutType?: LayoutType | string;
  archetype?: LayoutArchetype;
}

export type CustomNode = Node<ProcessNodeData>;

export type EdgePathType = 'bezier' | 'straight' | 'step'; // NEW

export interface ProcessEdgeData {
  label?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  viewMode?: ViewMode; 
  
  // Custom Styling
  pathType?: EdgePathType; // NEW
  strokeColor?: string;    // NEW
}

export type CustomEdge = Edge<ProcessEdgeData>;

export interface ProcessGraph {
  nodes: {
    id: string;
    label: string;
    type: NodeType;
    description: string;
    auditStep: string;
    riskLevel?: RiskLevel;
    kpis?: KPI[];
    isBottleneck?: boolean;
    iconName?: string;
    imagePrompt?: string;
    design?: NanoDesignTokens;
  }[];
  edges: {
    source: string;
    target: string;
    label?: string;
    sentiment?: 'positive' | 'negative' | 'neutral'; 
  }[];
}

export interface AIWorkflowResponse {
  layoutType: LayoutPattern; // Use strict LayoutPattern
  currentFlow: ProcessGraph;
  optimizedFlow: ProcessGraph;
  optimizationReasoning: string;
  riskAnalysis: {
    score: number;
    riskSummary: string;
  };
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
  joinedAt: string;
}

export interface SavedDiagram {
  id: string;
  userId: string;
  title: string;
  updatedAt: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
  aiAnalysis?: AIWorkflowResponse;
  thumbnail?: string;
}

export interface SystemSettings {
  appLogoUrl: string;
  enableKPIs: boolean;
  enableExport: boolean;
  enableAI: boolean;
}