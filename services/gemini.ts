// File: services/gemini.ts

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 

export const SYSTEM_INSTRUCTION = `
Bạn là chuyên gia về quy trình nghiệp vụ. 
NHIỆM VỤ: Phân tích yêu cầu và trả về DUY NHẤT một mã JSON để vẽ sơ đồ quy trình.

YÊU CẦU CẤU TRÚC JSON:
1. "currentFlow" và "optimizedFlow" phải chứa:
   - "nodes": Mỗi node có id (duy nhất), data: { label: "tên bước" }, position: { x: số, y: số }, type: "input/output/default".
   - "edges": Kết nối các node bằng id, có id riêng cho edge.
2. Màu sắc node: Dùng 'style' để phân biệt (ví dụ: background: '#ef4444' cho rủi ro).

MẪU JSON BẮT BUỘC:
{
  "layoutType": "flow",
  "currentFlow": { "nodes": [], "edges": [] },
  "optimizedFlow": { "nodes": [], "edges": [] },
  "optimizationReasoning": "Lý do tối ưu...",
  "riskAnalysis": { "score": 0, "riskSummary": "..." }
}
`;

export const generateWorkflow = async (text: string) => {
  if (!API_KEY) {
    console.error("❌ Lỗi: Thiếu API KEY trên Vercel.");
    return null;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: SYSTEM_INSTRUCTION + "\n\nYÊU CẦU CỦA NGƯỜI DÙNG: " + text }] 
        }],
        generationConfig: {
          response_mime_type: "application/json" // Ép AI chỉ trả về JSON
        }
      })
    });

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) throw new Error("AI không trả về kết quả.");

    // Chuyển đổi văn bản thành dữ liệu thực tế
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("🚨 Lỗi AI:", error);
    return null;
  }
};

export const generateKPIsForNode = () => [];
export const detectRiskLevel = () => 'LOW';
