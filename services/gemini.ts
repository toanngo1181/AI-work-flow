import { AIWorkflowResponse, RiskLevel } from '../types';

// --- CẤU HÌNH ---
// Quan trọng: Vite bắt buộc dùng import.meta.env, không dùng process.env
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 
const MODEL_NAME = 'gemini-1.5-flash';

export const SYSTEM_INSTRUCTION = `
Bạn là "Senior Process Architect" & "Nano Banana Art Director".
NHIỆM VỤ: Phân tích quy trình và trả về JSON.
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
  // 1. Kiểm tra Key
  if (!API_KEY) {
    console.error("❌ Thiếu API Key! Kiểm tra file .env hoặc Vercel Settings.");
    alert("Lỗi cấu hình: Chưa có API Key (VITE_GOOGLE_API_KEY).");
    return null;
  }

  try {
    // 2. Gọi API trực tiếp bằng fetch (Không cần thư viện SDK)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser Input: " + text }]
        }],
        generationConfig: {
          response_mime_type: "application/json" // Ép buộc trả về JSON
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || response.statusText);
    }

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) throw new Error("AI không trả lời.");

    // 3. Xử lý dữ liệu
    const data = JSON.parse(jsonText);
    
    return {
        layoutType: data.layoutType || 'flow',
        currentFlow: data.currentFlow,
        optimizedFlow: data.optimizedFlow,
        optimizationReasoning: data.optimizationReasoning || "Tối ưu hóa tiêu chuẩn.",
        riskAnalysis: data.riskAnalysis || { score: 50, riskSummary: 'Chưa có đánh giá.' }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error("🚨 Gemini API Error:", error);
    alert("Lỗi AI: " + (error as Error).message);
    return null;
  }
};

// --- Helper Functions (Giữ nguyên) ---
export const generateKPIsForNode = (label: string) => {
  return [
    { label: 'Thời gian', value: `${Math.floor(Math.random() * 60)}p` },
    { label: 'Chi phí', value: `${Math.floor(Math.random() * 100)}$` }
  ];
};

export const detectRiskLevel = (text: string): RiskLevel => {
  const t = text.toLowerCase();
  if (['cháy', 'nổ', 'độc', 'quyết định'].some(k => t.includes(k))) return RiskLevel.HIGH;
  if (['kiểm tra', 'qc', 'nhập liệu'].some(k => t.includes(k))) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};
