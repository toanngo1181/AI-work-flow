const API_URL = "https://script.google.com/macros/s/AKfycbxqtrxf42HuYOOC5OvpACWv_WdXYZsXJSkwD-W1HctlPKtEwEc4W7jEMsWrcrcZzTS_/exec";

export const callSheetAPI = async (action: string, payload: any = {}, method = 'POST') => {
  try {
    let url = `${API_URL}?action=${action}`;
    
    // Handle GET params
    if (method === 'GET' && payload) {
      const params = new URLSearchParams(payload).toString();
      url += `&${params}`;
    }

    const options: RequestInit = {
      method: method,
    };

    // Handle POST body (CRITICAL FOR GAS CORS)
    if (method === 'POST') {
      options.body = JSON.stringify(payload);
      options.headers = {
        // Must be text/plain to avoid OPTIONS preflight which GAS doesn't support
        "Content-Type": "text/plain;charset=utf-8", 
      };
    }

    const response = await fetch(url, options);
    
    // Robust Error Handling
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;

  } catch (error: any) {
    console.error("API Connection Error:", error);
    return { success: false, message: "Lỗi kết nối Server: " + error.message };
  }
};