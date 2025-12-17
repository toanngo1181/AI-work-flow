import { AIWorkflowResponse, RiskLevel } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 
const MODEL_NAME = 'gemini-1.5-flash';

export const SYSTEM_INSTRUCTION = `Bạn là Senior Process Architect.`;

export const generateWorkflow = async (text: string): Promise<AIWorkflowResponse | null> => {
  if (!API_KEY) return null;

  try {
    // Dùng fetch trực tiếp để không bao giờ bị lỗi thư viện
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_INSTRUCTION + "\nInput: " + text }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) return null;
    
    const data = JSON.parse(jsonText);
    return {
        layoutType: 'flow',
        currentFlow: data.currentFlow,
        optimizedFlow: data.optimizedFlow,
        optimizationReasoning: data.optimizationReasoning || "Done",
        riskAnalysis: { score: 0, riskSummary: '' }
    } as AIWorkflowResponse;

  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

// Mock functions để tránh lỗi import
export const generateKPIsForNode = () => [];
export const detectRiskLevel = () => RiskLevel.LOW;
