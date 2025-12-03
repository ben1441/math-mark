
/**
 * Calls the Vercel serverless function to perform AI operations.
 */
async function callAiApi(action: 'enhance' | 'generate' | 'edit', text: string, prompt?: string): Promise<string> {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, text, prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error(`AI Service Error (${action}):`, error);
        throw error;
    }
}

/**
 * Uses Gemini to improve the markdown formatting.
 */
export const enhanceMarkdown = async (text: string): Promise<string> => {
    return callAiApi('enhance', text);
};

/**
 * Generate a new section or continue text based on a prompt.
 */
export const generateContent = async (prompt: string, currentContext: string): Promise<string> => {
    return callAiApi('generate', currentContext, prompt);
};

/**
 * Edit the existing content based on a prompt.
 */
export const editMarkdown = async (prompt: string, currentContent: string): Promise<string> => {
    return callAiApi('edit', currentContent, prompt);
};
