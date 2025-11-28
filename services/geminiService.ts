import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateLoserExcuse = async (loserName: string, allParticipants: string[]): Promise<string> => {
  if (!ai) {
    return `Fate has decided! ${loserName} is paying today.`;
  }

  try {
    const prompt = `
      Context: A group of coworkers played a racing game to decide who pays for coffee.
      The loser is: ${loserName}.
      The other participants were: ${allParticipants.filter(p => p !== loserName).join(', ')}.
      
      Task: Write a hilarious, one-sentence "official reason" why ${loserName} lost and has to pay. 
      Use a playful, roasting tone. Mention things like slow reflexes, karma, bad luck, or specific coffee-related mishaps.
      Do not include the prompt in the output. Just the sentence.
      Keep it under 20 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed is priority
      }
    });

    return response.text?.trim() || `${loserName} was just too slow today!`;
  } catch (error) {
    console.error("Error generating excuse:", error);
    return `${loserName} lost fair and square! (AI is taking a coffee break).`;
  }
};
