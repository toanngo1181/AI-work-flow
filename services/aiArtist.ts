import { GoogleGenAI } from '@google/genai';

const ARTIST_SYSTEM_INSTRUCTION = `
You are an elite Digital Illustrator specializing in the "Nano Banana Pro" aesthetic.
Your goal is to generate high-fidelity, Isometric 3D Vector Graphics in SVG format.

### AESTHETIC RULES (Nano Banana Style):
1. **Perspective:** Isometric Projection (strictly 30-degree angles).
2. **Vibe:** Cute, Professional, High-Tech, Playful.
3. **Color Palette:** Vibrant Gradients. Use <linearGradient> heavily.
   - Primary: Deep Purples, Electric Blues, Neon Cyans.
   - Accents: Hot Pink, Sunny Amber, Lime Green.
   - Background: Transparent (or subtle glow).
4. **Shapes:** Rounded corners, soft edges, "squircle" forms. Avoid sharp/harsh lines.
5. **Lighting:** Soft shading, highlights on top-left, shadows on bottom-right.
6. **Composition:** The subject should be centered and fill about 80% of the canvas.

### OUTPUT FORMAT:
- Return ONLY the raw string of the <svg> code.
- Do NOT wrap in \`\`\`xml or markdown blocks.
- The SVG root element must have \`viewBox="0 0 100 100"\` and \`xmlns="http://www.w3.org/2000/svg"\`.
- Ensure all IDs in definitions (gradients/filters) are unique (e.g., append a random suffix or use specific names based on the content) to avoid conflicts when multiple SVGs are on the same page.

### TASK:
Create an illustration for a Process Diagram node labeled: "{{LABEL}}".
Context/Description: "{{DESCRIPTION}}".
`;

export const generateNodeIllustration = async (label: string, description: string = ''): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Customize prompt
    const prompt = `Draw an isometric 3D icon for: "${label}". Context: ${description || 'A business process step'}. Make it colorful and gradient-heavy.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is sufficient for vector generation and faster
      contents: prompt,
      config: {
        systemInstruction: ARTIST_SYSTEM_INSTRUCTION.replace('{{LABEL}}', label).replace('{{DESCRIPTION}}', description),
        responseMimeType: 'text/plain', // We want raw SVG text
        temperature: 1.2, // High creativity for art
      },
    });

    let svgText = response.text;
    
    // Cleanup if model adds markdown despite instructions
    if (svgText) {
      svgText = svgText.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
      // Ensure it starts with <svg
      const startIndex = svgText.indexOf('<svg');
      const endIndex = svgText.lastIndexOf('</svg>');
      if (startIndex !== -1 && endIndex !== -1) {
        return svgText.substring(startIndex, endIndex + 6);
      }
    }

    return svgText || null;

  } catch (error) {
    console.error("AI Artist Error:", error);
    return null;
  }
};