import { GoogleGenAI } from '@google/genai';
import { AIWorkflowResponse, RiskLevel } from '../types';

export const SYSTEM_INSTRUCTION = `
Bạn là "Senior Process Architect" & "Nano Banana Art Director".

NHIỆM VỤ CHÍNH:
1. Phân tích quy trình người dùng nhập.
2. Tạo ra 2 phiên bản: "currentFlow" (như mô tả) và "optimizedFlow" (phiên bản tối ưu hóa).

QUY TẮC TỐI ƯU HÓA (OPTIMIZED FLOW RULES) - QUAN TRỌNG:
Trong "optimizedFlow", bạn PHẢI bổ sung cơ chế Kiểm soát chất lượng (QC/Audit) chặt chẽ:
1. **CHÈN ĐIỂM KIỂM TRA:** Sau các bước thực thi quan trọng hoặc rủi ro cao, phải chèn một node loại "DECISION" (Ví dụ: "Kiểm tra chất lượng?", "Phê duyệt?", "Thẩm định?").
2. **PHÂN NHÁNH LOGIC (BRANCHING):** Từ node DECISION này, bắt buộc phải tạo 2 đường dẫn (Edges):
   - **Nhánh Đạt:** Label="Đạt" hoặc "OK", sentiment="positive". Dẫn đến bước tiếp theo.
   - **Nhánh Không Đạt:** Label="Không Đạt" hoặc "Reject", sentiment="negative". Dẫn đến một bước xử lý lỗi.
3. **HƯỚNG XỬ LÝ (REMEDIATION):** Nếu "Không Đạt", phải tạo ra một Node mới (Ví dụ: "Sửa lỗi", "Bổ sung hồ sơ", "Làm lại") sau đó nối ngược lại (Loop back) bước thực thi ban đầu.

YÊU CẦU VỀ DỮ LIỆU & GIAO DIỆN (NANO BANANA STYLE):
1. **Design Tokens:**
   - Node "DECISION": colorTheme="yellow", styleVariant="outline".
   - Node "REMEDIATION" (Sửa lỗi): colorTheme="red", styleVariant="solid".
   - Node "START/END": colorTheme="green".
2. **AI Image Prompt (QUAN TRỌNG):**
   - Với mỗi Node, hãy viết một "imagePrompt" bằng tiếng Anh.
   - Style: "3D isometric icon, claymorphism, cute, vibrant colors, white background".
   - Ví dụ: "cute 3D robot holding a checklist, isometric, clay style, blue and white".

Output Format (JSON Only):
{
  "layoutType": "flow" | "tree" | "cycle" | "steps" | "pyramid",
  "optimizationReasoning": "Giải thích ngắn gọn...",
  "riskAnalysis": { "score": 85, "riskSummary": "..." },
  "currentFlow": { ... },
  "optimizedFlow": { 
     "nodes": [
        { 
          "id": "1", 
          "label": "Nhập liệu", 
          "type": "PROCESS", 
          "riskLevel": "LOW", 
          "design": {"colorTheme": "blue", "styleVariant": "glass"},
          "imagePrompt": "cute 3D hands typing on a futuristic keyboard, isometric, claymorphism"
        },
        { 
          "id": "2", 
          "label": "Kiểm tra dữ liệu?", 
          "type": "DECISION", 
          "riskLevel": "MEDIUM", 
          "auditStep": "Check valid format", 
          "design": {"colorTheme": "yellow", "styleVariant": "outline"},
          "imagePrompt": "3D magnifying glass hovering over a document, isometric, clay style, yellow theme"
        }
     ], 
     "edges": [ ... ] 
  }
}
`;

export const generateWorkflow = async (text: string): Promise<AIWorkflowResponse | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const data = JSON.parse(jsonText);
    
    // Ensure data matches our type structure
    return {
        layoutType: data.layoutType || 'flow',
        currentFlow: data.currentFlow,
        optimizedFlow: data.optimizedFlow,
        optimizationReasoning: data.optimizationReasoning,
        riskAnalysis: data.riskAnalysis || { score: 50, riskSummary: 'Không có dữ liệu.' }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateKPIsForNode = (label: string): { label: string; value: string }[] => {
  const metrics = [
    { label: 'Thời gian', value: `${Math.floor(Math.random() * 60)}p` },
    { label: 'Chi phí', value: `${Math.floor(Math.random() * 100)}$` },
    { label: 'Nhân sự', value: `${Math.floor(Math.random() * 5) + 1}` },
    { label: 'Hiệu suất', value: `${Math.floor(Math.random() * 20) + 80}%` },
  ];
  return metrics.sort(() => 0.5 - Math.random()).slice(0, 2);
};

export const detectRiskLevel = (text: string): RiskLevel => {
  const highRiskKeywords = ['hóa chất', 'nhiệt độ', 'áp suất', 'cháy', 'nổ', 'độc hại', 'điện cao thế', 'decision', 'quyết định', 'nguy hiểm', 'fail', 'lỗi', 'critical'];
  const mediumRiskKeywords = ['kiểm tra', 'vận chuyển', 'lưu kho', 'đóng gói', 'nhập liệu', 'qc', 'audit', 'review'];
  const lowerText = text.toLowerCase();
  
  if (highRiskKeywords.some(k => lowerText.includes(k))) return RiskLevel.HIGH;
  if (mediumRiskKeywords.some(k => lowerText.includes(k))) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};