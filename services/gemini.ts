// File: services/gemini.ts

// 1. Đảm bảo API Key được lấy đúng từ Vercel
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 

// 2. Prompt hướng dẫn AI (Đây là phần quan trọng nhất)
export const SYSTEM_INSTRUCTION = `
Nhiệm vụ: Chuyển đổi mô tả quy trình của người dùng thành cấu hình React Flow JSON.
BẮT BUỘC trả về duy nhất định dạng JSON sau:
{
  "layoutType": "flow",
  "currentFlow": {
    "nodes": [{"id": "1", "data": {"label": "Bước 1"}, "position": {"x": 0, "y": 0}, "type": "input"}],
    "edges": []
  },
  "optimizedFlow": {
    "nodes": [{"id": "1", "data": {"label": "Bước 1"}, "position": {"x": 0, "y": 0}, "type": "input"}],
    "edges": []
  },
  "optimizationReasoning": "Mô tả lý do tối ưu hóa tại đây.",
  "riskAnalysis": {"score": 20, "riskSummary": "Đánh giá rủi ro sơ bộ."}
}
Quy tắc: Không thêm văn bản thừa, không dùng dấu ngoặc đơn ngoài JSON.
`;

export const generateWorkflow = async (text: string) => {
  if (!API_KEY) {
    console.error("🚨 API Key bị thiếu!");
    return null;
  }

  try {
    // Sửa lại đường dẫn API chuẩn của Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: SYSTEM_INSTRUCTION + "\n\nNgười dùng yêu cầu quy trình: " + text }] 
        }],
        // Ép AI chỉ trả về JSON để tránh lỗi SyntaxError: "undefined" is not valid JSON
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("Lỗi API API:", errorMsg);
      throw new Error(`Google API trả về lỗi ${response.status}`);
    }

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) throw new Error("AI không trả về dữ liệu.");

    // Chuyển đổi chuỗi text thành đối tượng JSON thật sự
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("🚨 Lỗi khi tạo quy trình:", error);
    // Trả về một quy trình mặc định nếu AI lỗi để giao diện không bị trắng
    return {
      layoutType: 'flow',
      currentFlow: { nodes: [{ id: 'error', data: { label: 'Lỗi AI: Hãy thử lại' }, position: { x: 0, y: 0 } }], edges: [] },
      optimizedFlow: { nodes: [], edges: [] },
      optimizationReasoning: "Có lỗi xảy ra khi gọi AI.",
      riskAnalysis: { score: 0, riskSummary: "Lỗi." }
    };
  }
};

// Các hàm bổ trợ giữ nguyên để không lỗi App
export const generateKPIsForNode = () => [];
export const detectRiskLevel = () => 'LOW';
