// File: services/gemini.ts

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 

export const SYSTEM_INSTRUCTION = `
Bạn là chuyên gia quy trình. Nhiệm vụ của bạn là chuyển văn bản người dùng thành JSON.
BẮT BUỘC trả về JSON theo đúng cấu trúc này:
{
  "layoutType": "flow",
  "currentFlow": { 
    "nodes": [{"id": "1", "data": {"label": "Bước 1"}, "position": {"x": 0, "y": 0}}], 
    "edges": [] 
  },
  "optimizedFlow": { 
    "nodes": [{"id": "1", "data": {"label": "Bước 1"}, "position": {"x": 0, "y": 0}}], 
    "edges": [] 
  },
  "optimizationReasoning": "Lý do tối ưu...",
  "riskAnalysis": { "score": 10, "riskSummary": "Ổn định" }
}
`;

export const generateWorkflow = async (text: string) => {
  if (!API_KEY) return null;

  try {
    // Sử dụng endpoint chuẩn v1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: SYSTEM_INSTRUCTION + "\n\nQuy trình người dùng cần: " + text }] 
        }],
        // Loại bỏ response_mime_type nếu gây lỗi 400, thay bằng cấu hình an toàn
        generationConfig: {
          temperature: 0.1, // Giảm độ sáng tạo để AI bám sát JSON
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi Google API:", errorData);
      return null;
    }

    const result = await response.json();
    let jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) return null;

    // Làm sạch dữ liệu: Xóa các ký tự thừa như ```json ... ``` nếu AI tự thêm vào
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonText);

  } catch (error) {
    console.error("🚨 Lỗi xử lý:", error);
    return null;
  }
};

export const generateKPIsForNode = () => [];
export const detectRiskLevel = () => 'LOW';
