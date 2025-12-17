// File: services/gemini.ts

// Ép kiểu để chắc chắn lấy được Key từ Vercel hoặc IDX
const API_KEY = (import.meta.env.VITE_GOOGLE_API_KEY as string) || ""; 

export const generateWorkflow = async (text: string) => {
  // Nếu vẫn không tìm thấy Key, hãy log ra để kiểm tra
  if (!API_KEY || API_KEY === "") {
    console.error("🚨 Không tìm thấy API KEY trong biến môi trường!");
    // Thay vì hiện thông báo bắt chọn, ta có thể thử lấy từ localStorage nếu có
    const backupKey = localStorage.getItem('user_gemini_key');
    if (!backupKey) return null;
  }

  const finalKey = API_KEY || localStorage.getItem('user_gemini_key');

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${finalKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Tạo quy trình JSON cho: " + text }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const result = await response.json();
    return JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    console.error(error);
    return null;
  }
};
