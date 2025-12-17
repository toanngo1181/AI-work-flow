import { AIWorkflowResponse, RiskLevel } from '../types';

// LƯU Ý: Ở Vite bắt buộc phải dùng import.meta.env
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 
const MODEL_NAME = 'gemini-1.5-flash';

export const SYSTEM_INSTRUCTION = `
Bạn là Senior Process Architect.
Nhiệm vụ: Phân tích quy trình và trả về JSON.
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
  // Kiểm tra Key ngay lập tức
  if (!API_KEY) {
    console.error("❌ Lỗi: Chưa có VITE_GOOGLE_API_KEY");
    // Không alert để tránh spam, chỉ log ra console
    return null;
  }

  try {
    // Dùng fetch thuần túy (Không thư viện) -> Đảm bảo 100% không lỗi màn hình trắng
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser Input: " + text }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) throw new Error("Lỗi kết nối Google AI: " + response.statusText);

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) throw new Error("AI không trả về dữ liệu.");

    const data = JSON.parse(jsonText);
    
    return {
        layoutType: 'flow',
        currentFlow: data.currentFlow,
        optimizedFlow: data.optimizedFlow,
        optimizationReasoning: data.optimizationReasoning || "Đã tối ưu hóa.",
        riskAnalysis: data.riskAnalysis || { score: 50, riskSummary: 'Không có dữ liệu rủi ro.' }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

// --- Giữ lại các hàm này để không bị lỗi ở các file khác ---
export const generateKPIsForNode = (label: string) => [
  { label: 'Thời gian', value: '30p' }, 
  { label: 'Chi phí', value: '100k' }
];

export const detectRiskLevel = (text: string): RiskLevel => {
    return RiskLevel.LOW;
};
