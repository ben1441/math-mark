
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, prompt, text } = request.body;
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

        if (!apiKey) {
            return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = 'gemini-2.5-flash';

        let result = "";

        if (action === 'enhance') {
             const enhancePrompt = `
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
            const aiResponse = await ai.models.generateContent({
                model: model,
                contents: enhancePrompt,
            });
            result = aiResponse.text?.trim() || "";

        } else if (action === 'generate') {
             const generatePrompt = `
            Context:
            ${text.slice(-1000)}

            User Request: ${prompt}

            Generate markdown content to fulfill the request. If it involves math, use LaTeX format (e.g., $E=mc^2$).
            Return only the generated content.
            `;
            const aiResponse = await ai.models.generateContent({
                model: model,
                contents: generatePrompt,
            });
            result = aiResponse.text?.trim() || "";

        } else if (action === 'edit') {
            const editPrompt = `
            You are an expert Markdown editor.
            User Instruction: ${prompt}

            Here is the content to modify:
            ${text}

            Return the modified markdown content based on the instruction.
            Do not include any conversational text.
            Do not wrap the output in markdown code fences unless the content itself is code.
            Return ONLY the result.
            `;
            const aiResponse = await ai.models.generateContent({
                model: model,
                contents: editPrompt,
            });
            result = aiResponse.text?.trim() || "";
        } else {
             return response.status(400).json({ error: 'Invalid action' });
        }

        return response.status(200).json({ result });

    } catch (error: any) {
        console.error("API Error:", error);
        return response.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
