import { GoogleGenAI } from "@google/genai";

/**
 * Enhances a product description using Gemini.
 * Instantiates the client immediately before the call to ensure the latest API configuration.
 */
export const enhanceProductDescription = async (name: string, currentDesc: string) => {
  try {
    // Always use the latest apiKey from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Generate content using the recommended pattern for Gemini models
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Melhore a descrição deste item de cardápio japonês para torná-lo mais apetitoso e profissional. Nome: ${name}. Descrição atual: ${currentDesc}. Mantenha curto (máximo 150 caracteres).`,
    });
    
    // Extract text from the response object directly using the text property
    return response.text?.trim() || currentDesc;
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentDesc;
  }
};