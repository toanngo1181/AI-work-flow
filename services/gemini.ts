import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIWorkflowResponse, RiskLevel } from '../types';

// Lấy API Key từ biến môi trường của Vite
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 
const MODEL_NAME = 'gemini-1.5-flash';

export const SYSTEM_INSTRUCTION = `
Bạn là "Senior Process Architect". Nhiệm vụ:
1. Phân tích quy trình.
2. Tạo 2 phiên bản: "currentFlow" (gốc) và "optimizedFlow" (tối ưu có QC/Audit).

QUY TẮC OPTIMIZED FLOW:
- Chèn node "DECISION" (Kiểm tra) sau các bước rủi ro.
- Node DECISION rẽ 2 nhánh: "Đạt" (tiếp tục) và "Không Đạt" (quay lại sửa).
- Node Style: DECISION=yellow, REMEDIATION=red, PROCESS=blue.

Output JSON format only.
`;

export const generateWorkflow = async (text: string): Promise<AIWorkflowResponse | null> => {
  // 1. Kiểm tra Key
  if (!API_KEY) {
    console.error("❌ Thiếu API Key! Hãy kiểm tra file .env hoặc Vercel Settings.");
    alert("Lỗi cấu hình: Chưa có API Key.");
    return null;
  }

  try {
    // 2. Khởi tạo Google AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION,
    });
    
    // 3. Gọi AI
    const result = await model.generateContent(text);
    const response = await result.response;
    const textData = response.text();

    if (!textData) throw new Error("AI không trả lời.");

    // 4. Xử lý JSON (Xóa dấu ```json nếu có)
    const cleanedJson = textData.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedJson);
    
    return {
        layoutType: data.layoutType || 'flow',
        currentFlow: data.currentFlow,
        optimizedFlow: data.optimizedFlow,
        optimizationReasoning: data.optimizationReasoning || "Tối ưu hóa tiêu chuẩn.",
        riskAnalysis: data.riskAnalysis || { score: 50, riskSummary: 'Chưa có đánh giá.' }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error("🚨 Gemini API Error:", error);
    alert("Lỗi khi gọi AI: " + (error as Error).message);
    return null;
  }
};

// --- Helper Functions giữ nguyên ---
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