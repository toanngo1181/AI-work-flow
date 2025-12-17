// File: services/gemini.ts

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 

export const SYSTEM_INSTRUCTION = `
Bạn là chuyên gia quy trình. BẮT BUỘC trả về JSON theo cấu trúc sau:
{
  "layoutType": "flow",
  "currentFlow": { "nodes": [], "edges": [] },
  "optimizedFlow": { "nodes": [], "edges": [] },
  "optimizationReasoning": "...",
  "riskAnalysis": { "score": 0, "riskSummary": "..." }
}
Ghi chú: Mỗi node cần có id, data: { label: "tên" }, position: { x: 0, y: 0 }.
`;

export const generateWorkflow = async (text: string) => {
  if (!API_KEY) return null;

  try {
    // Sửa lại URL chuẩn xác để tránh lỗi 404
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: SYSTEM_INSTRUCTION + "\n\nQuy trình cần vẽ: " + text }] 
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi Google API:", errorData);
      return null;
    }

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) return null;

    return JSON.parse(jsonText);

  } catch (error) {
    console.error("🚨 Lỗi hệ thống:", error);
    return null;
  }
};

// Giữ các hàm này để App không bị lỗi crash
export const generateKPIsForNode = () => [];
export const detectRiskLevel = () => 'LOW';
