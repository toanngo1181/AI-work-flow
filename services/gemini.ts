import { AIWorkflowResponse, RiskLevel } from '../types';

// CẤU HÌNH: Dùng import.meta.env cho Vite
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 
const MODEL_NAME = 'gemini-1.5-flash';

export const SYSTEM_INSTRUCTION = `
Bạn là "Senior Process Architect".
Nhiệm vụ: Phân tích quy trình và trả về JSON chuẩn.
Output Format (JSON Only):
{
  "layoutType": "flow",
  "optimizationReasoning": "...",
  "riskAnalysis": { "score": 0, "riskSummary": "..." },
  "currentFlow": { "nodes": [], "edges": [] },
  "optimizedFlow": { "nodes": [], "edges": [] }
}
`;

export const generateWorkflow = async (text: string): Promise<AIWorkflowResponse | null> => {
  if (!API_KEY) {
    console.error("❌ Thiếu API Key VITE_GOOGLE_API_KEY");
    alert("Lỗi cấu hình: Chưa có API Key.");
    return null;
  }

  try {
    // GỌI API TRỰC TIẾP (Không dùng thư viện để tránh lỗi màn hình trắng)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser Input: " + text }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) throw new Error("Lỗi kết nối AI: " + response.statusText);

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) throw new Error("AI không trả lời.");

    const data = JSON.parse(jsonText);
    return {
        layoutType: data.layoutType || 'flow',
        currentFlow: data.currentFlow,
        optimizedFlow: data.optimizedFlow,
        optimizationReasoning: data.optimizationReasoning || "Tối ưu hóa tiêu chuẩn.",
        riskAnalysis: data.riskAnalysis || { score: 50, riskSummary: 'Chưa có đánh giá.' }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error("Gemini Error:", error);
    alert("Lỗi AI: " + (error as Error).message);
    return null;
  }
};

// Hàm phụ trợ (Giữ nguyên để App không lỗi import)
export const generateKPIsForNode = (label: string) => [
  { label: 'Thời gian', value: '30p' }, { label: 'Chi phí', value: '50$' }
];
export const detectRiskLevel = (text: string): RiskLevel => RiskLevel.LOW;
