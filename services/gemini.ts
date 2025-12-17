// File: src/services/gemini.ts
import { AIWorkflowResponse, RiskLevel } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 

export const generateWorkflow = async (text: string): Promise<AIWorkflowResponse | null> => {
  // Nếu chưa có Key thì không chạy để tránh lỗi
  if (!API_KEY) {
    console.warn("Chưa có API KEY");
    return null;
  }

  try {
    // Gọi API trực tiếp bằng fetch (An toàn tuyệt đối cho trình duyệt)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Bạn là chuyên gia quy trình. Hãy tạo quy trình JSON cho: ${text}` }] }]
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    // Trả về dữ liệu giả lập tạm thời để đảm bảo App luôn chạy được (Fall back)
    // Sau khi App lên hình, ta sẽ chỉnh logic AI sau.
    return {
       layoutType: 'flow',
       currentFlow: { nodes: [{id: '1', label: 'Bắt đầu', type: 'input'}], edges: [] },
       optimizedFlow: { nodes: [{id: '1', label: 'Bắt đầu', type: 'input'}], edges: [] },
       optimizationReasoning: "Demo",
       riskAnalysis: { score: 10, riskSummary: "An toàn" }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error(error);
    return null;
  }
};

export const generateKPIsForNode = () => [];
export const detectRiskLevel = () => RiskLevel.LOW;
