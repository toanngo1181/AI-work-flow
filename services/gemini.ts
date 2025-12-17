import { GoogleGenAI } from "@google/genai";
import { AIWorkflowResponse, RiskLevel } from '../types';

export const SYSTEM_INSTRUCTION = `
Bạn là chuyên gia về "Business Process Management" (BPMN) & Hệ thống hóa quy trình.

NHIỆM VỤ:
Phân tích yêu cầu của người dùng và trả về dữ liệu JSON để vẽ lưu đồ quy trình.

CẤU TRÚC JSON BẮT BUỘC (Strict JSON):
{
  "layoutType": "flow" | "cycle" | "tree" | "steps",
  "optimizationReasoning": "Giải thích ngắn gọn tại sao đề xuất cải tiến này...",
  "riskAnalysis": {
    "score": number (0-100),
    "riskSummary": "Tóm tắt rủi ro..."
  },
  "currentFlow": {
    "nodes": [
      {
        "id": "1",
        "label": "Tên bước (Ngắn gọn)",
        "type": "START" | "PROCESS" | "DECISION" | "END",
        "description": "Mô tả chi tiết bước này làm gì...",
        "riskLevel": "LOW" | "MEDIUM" | "HIGH",
        "kpis": [{"label": "Time", "value": "5m"}],
        "auditStep": "Nội dung cần kiểm tra (nếu có)",
        "iconName": "Tên Icon Lucide React phù hợp (VD: User, FileText, CheckCircle)"
      }
    ],
    "edges": [
      {
        "source": "1",
        "target": "2",
        "label": "Nhãn đường nối (nếu có, VD: 'Đồng ý')",
        "sentiment": "positive" | "negative" | "neutral"
      }
    ]
  },
  "optimizedFlow": { 
     // Cấu trúc tương tự currentFlow nhưng thêm các bước kiểm tra (DECISION) và xử lý lỗi
  }
}

QUY TẮC LOGIC:
1. Luôn bắt đầu bằng node START và kết thúc bằng node END.
2. Nếu quy trình có rủi ro (RiskLevel = HIGH), hãy thêm node DECISION ngay sau đó để kiểm tra (QC).
3. OptimizedFlow PHẢI khác CurrentFlow: thêm các bước kiểm soát, phê duyệt.

CHỈ TRẢ VỀ JSON, KHÔNG KÈM TEXT GIẢI THÍCH BÊN NGOÀI.
`;

export const generateWorkflow = async (text: string): Promise<AIWorkflowResponse | null> => {
  // Lấy API Key từ môi trường (được inject bởi Google AI Studio)
  const apiKey = process.env.API_KEY;
  
  // Lưu ý: Không alert ở đây để tránh làm phiền người dùng nếu key chưa sẵn sàng (UI sẽ xử lý việc hỏi key)
  if (!apiKey) {
    console.warn("⚠️ API Key chưa sẵn sàng trong process.env");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // responseMimeType: 'application/json', // Tắt tạm thời để tránh lỗi format strict của model, ta sẽ parse thủ công
        temperature: 0.4, // Giảm nhiệt độ để kết quả nhất quán hơn
      }
    });

    const textData = response.text;

    if (!textData) throw new Error("AI không trả về dữ liệu.");

    // --- ROBUST JSON PARSING ---
    // Tìm vị trí bắt đầu '{' và kết thúc '}' để loại bỏ text thừa (như ```json ...)
    const jsonMatch = textData.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Không tìm thấy cấu trúc JSON hợp lệ trong phản hồi của AI.");
    }
    
    const cleanedJson = jsonMatch[0];
    const data = JSON.parse(cleanedJson);
    
    // Validate data structure basic
    if (!data.currentFlow || !data.currentFlow.nodes) {
        throw new Error("Cấu trúc JSON thiếu currentFlow hoặc nodes.");
    }

    return {
        layoutType: data.layoutType || 'flow',
        currentFlow: data.currentFlow,
        optimizedFlow: data.optimizedFlow || data.currentFlow, // Fallback nếu không có optimized
        optimizationReasoning: data.optimizationReasoning || "Tối ưu hóa tiêu chuẩn.",
        riskAnalysis: data.riskAnalysis || { score: 50, riskSummary: 'Chưa có đánh giá chi tiết.' }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error("🚨 Gemini API Error:", error);
    // Throw error để UI nhận biết và hiển thị thông báo
    throw error;
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
  if (['cháy', 'nổ', 'độc', 'quyết định', 'phê duyệt', 'tiền'].some(k => t.includes(k))) return RiskLevel.HIGH;
  if (['kiểm tra', 'qc', 'nhập liệu', 'xác nhận'].some(k => t.includes(k))) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};