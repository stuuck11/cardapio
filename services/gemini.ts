
import { GoogleGenAI } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceProductDescription = async (name: string, currentDesc: string) => {
  try {
    // Generate a response from the model using the recommended pattern.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Melhore a descrição deste item de cardápio japonês para torná-lo mais apetitoso e profissional. Nome: ${name}. Descrição atual: ${currentDesc}. Mantenha curto (máximo 150 caracteres).`,
    });
    // Use response.text directly (not as a function call).
    return response.text?.trim() || currentDesc;
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentDesc;
  }
};
