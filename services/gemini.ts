import { GoogleGenAI } from "@google/genai";
import { AIWorkflowResponse, RiskLevel } from '../types';

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
  // Fix: Access API key from process.env.API_KEY as per environment standards
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("❌ Thiếu API Key! Vui lòng chọn API Key trong cài đặt.");
    alert("Lỗi cấu hình: Chưa có API Key. Hãy nhấn vào 'Cài đặt API Key' ở thanh bên.");
    return null;
  }

  try {
    // Initialize GoogleGenAI with the new SDK
    const ai = new GoogleGenAI({ apiKey });
    
    // Use gemini-2.5-flash as per guidelines (replacing 1.5-flash)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      }
    });

    const textData = response.text;

    if (!textData) throw new Error("AI không trả lời.");

    // Clean and Parse JSON
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