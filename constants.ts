import { ProcessNodeData, NodeType, RiskLevel, CustomNode, CustomEdge } from './types';

// Hardcoded Demo Data
export const DEMO_NODES: CustomNode[] = [
  {
    id: '1',
    type: 'processNode', // Will be overridden by NanoNode in Editor
    position: { x: 0, y: 0 },
    data: {
      label: 'Khởi tạo Dự án',
      type: NodeType.START,
      riskLevel: RiskLevel.LOW,
      kpis: [],
      auditStep: 'Xác định mục tiêu',
      iconName: 'PlayCircle',
      design: { colorTheme: 'green', styleVariant: 'glass' }
    },
  },
  {
    id: '2',
    type: 'processNode',
    position: { x: 300, y: 0 },
    data: {
      label: 'Phân tích Yêu cầu',
      type: NodeType.PROCESS,
      riskLevel: RiskLevel.MEDIUM,
      kpis: [],
      auditStep: 'Review tài liệu BRD',
      iconName: 'FileSearch',
      design: { colorTheme: 'blue', styleVariant: 'solid' }
    },
  },
  {
    id: '3',
    type: 'processNode',
    position: { x: 600, y: 0 },
    data: {
      label: 'Phê duyệt?',
      type: NodeType.DECISION,
      riskLevel: RiskLevel.HIGH,
      kpis: [],
      auditStep: 'Ký xác nhận',
      iconName: 'Stamp',
      design: { colorTheme: 'yellow', styleVariant: 'outline' }
    },
  },
];

export const DEMO_EDGES: CustomEdge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, data: { sentiment: 'neutral' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, data: { sentiment: 'neutral' } },
];

export const SYSTEM_INSTRUCTION = `
Bạn là "Visual Process Consultant" & "Nano Banana Art Director".

Nhiệm vụ:
1. Phân tích văn bản quy trình của người dùng.
2. Xác định "layoutType".
3. Tạo ra 2 phiên bản: "currentFlow" và "optimizedFlow".
4. Đề xuất Icon Lucide React.
5. **CHỈ ĐỊNH DESIGN TOKENS** cho mỗi node để tạo giao diện "Nano Banana":
   - "design": { 
        "colorTheme": "blue" (Quy trình) | "red" (Rủi ro) | "yellow" (Quyết định) | "green" (Bắt đầu/Kết thúc) | "purple" (Sáng tạo),
        "styleVariant": "glass" (Mặc định) | "solid" (Bước quan trọng) | "outline" (Bước phụ)
     }

QUAN TRỌNG VỀ ĐƯỜNG NỐI (EDGES):
Khi nối từ một bước "DECISION", PHẢI cung cấp:
- "label": Điều kiện.
- "sentiment": "positive" (Xanh), "negative" (Đỏ), "neutral" (Xám).

Output Format (JSON Only):
{
  "layoutType": "linear" | "cyclic" | "hierarchy",
  "optimizationReasoning": "...",
  "riskAnalysis": { "score": 90, "riskSummary": "..." },
  "currentFlow": { 
     "nodes": [ { 
        "id": "1", 
        "label": "...", 
        "type": "...", 
        "iconName": "...",
        "design": { "colorTheme": "blue", "styleVariant": "glass" } 
     } ], 
     "edges": [] 
  },
  "optimizedFlow": { "nodes": [], "edges": [] }
}
`;