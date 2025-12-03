import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is missing");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Uses Gemini to improve the markdown formatting, specifically focusing on fixing
 * LaTeX math equations and standardizing structure.
 */
export const enhanceMarkdown = async (text: string): Promise<string> => {
    const ai = getAiClient();
    
    // Using flash for speed on text formatting tasks
    const model = 'gemini-2.5-flash';

    const prompt = `
    You are an expert Markdown and LaTeX editor. 
    Review the following markdown text. 
    1. Correct any malformed LaTeX equations (ensure proper use of $ for inline and $$ for block).
    2. Ensure the LaTeX syntax is compatible with KaTeX.
    3. Fix major grammar or spelling errors but keep the tone and content identical.
    4. Improve table formatting if present.
    5. Return ONLY the corrected markdown. Do not add conversational text.

    Here is the text:
    ${text}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Gemini Enhancement Error:", error);
        throw error;
    }
};

/**
 * Generate a new section or continue text based on a prompt
 */
export const generateContent = async (prompt: string, currentContext: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';

    const fullPrompt = `
    Context:
    ${currentContext.slice(-1000)} 
    
    User Request: ${prompt}
    
    Generate markdown content to fulfill the request. If it involves math, use LaTeX format (e.g., $E=mc^2$).
    Return only the generated content.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw error;
    }
};