import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a world-class LaTeX expert and document designer. 
Your task is to convert the user's request into a complete, high-quality, compilable LaTeX document.

RULES:
1. Output ONLY the raw LaTeX code. Do not output markdown code fences (like \`\`\`latex ... \`\`\`). Do not output any conversational text before or after the code.
2. Ensure the LaTeX is self-contained. It must start with \\documentclass and end with \\end{document}.
3. ALWAYS STYLE THE DOCUMENT BEAUTIFULLY.
   - Use the 'geometry' package to ensure professional margins (e.g., margin=1in).
   - Use 'titlesec' or similar to make headings look professional if applicable.
   - Ensure clean vertical spacing (\\setlength{\\parskip}{1em}, \\setlength{\\parindent}{0pt} is often preferred for modern docs).
   - Use modern font packages if appropriate (e.g., lmodern, helvet).
4. Use modern packages (e.g., graphicx, hyperref, amsmath, enumitem).
5. For placeholder images, use the 'graphicx' package and 'example-image' from the 'mwe' package.
6. Ensure the document compiles without errors on a standard TeX Live distribution.
7. If the user asks for a resume, CV, or specific format, use a clean, modern layout.
8. If the user provides a follow-up request (e.g., "Make it two columns"), modify the PREVIOUS LaTeX code accordingly and output the FULL updated document.
`;

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      thinkingConfig: {
        thinkingBudget: 2048,
      },
    },
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({
      message: message
    });

    let text = response.text;

    // Cleanup if the model accidentally includes fences despite instructions
    if (text) {
      text = text.replace(/^```latex\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
    }

    return text || "% No output generated.";
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate LaTeX.");
  }
};
