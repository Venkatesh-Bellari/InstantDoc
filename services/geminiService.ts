
import { GoogleGenAI, GenerateContentResponse, Content, Part, GenerateContentParameters } from "@google/genai";
import { FeatureKey, GroundingMetadata } from '../types';
import { FEATURES, GEMINI_TEXT_MODEL, GEMINI_MULTIMODAL_MODEL } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY }); 

interface AiResponse {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export const getAiResponse = async (
  prompt: string,
  featureKey: FeatureKey,
  languageCode: string, 
  image?: { base64: string; mimeType: string }
): Promise<AiResponse> => {
  if (!API_KEY) {
    return { text: "Error: API Key not configured. Please ensure the API_KEY environment variable is set and contact support if the issue persists." };
  }

  const currentFeature = FEATURES.find(f => f.key === featureKey);
  if (!currentFeature) {
    return { text: "Error: Invalid feature selected." };
  }

  const modelName = image ? GEMINI_MULTIMODAL_MODEL : GEMINI_TEXT_MODEL;
  
  const parts: Part[] = [{ text: prompt }];
  if (image && image.base64 && image.mimeType) {
    parts.unshift({ 
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64,
      },
    });
  }

  const contents: Content = { parts, role: "user" };

  const generateParams: GenerateContentParameters = {
    model: modelName,
    contents: contents,
    config: {}
  };

  const languageMap: { [key: string]: { name: string, instructionName: string } } = {
    'en-US': { name: 'English', instructionName: 'English' },
    'hi-IN': { name: 'Hindi', instructionName: "Hindi, written using English alphabet characters (Hinglish/Romanized Hindi). For example, if the answer is \"कैसे हो?\", you MUST write \"kaise ho?\" or a similar transliteration. If the answer is \"मैं ठीक हूँ\", you MUST write \"main theek hoon\"." },
    'te-IN': { name: 'Telugu', instructionName: "Telugu, written using English alphabet characters (Tanglish/Romanized Telugu). For example, if the answer is \"ఎలా ఉన్నారు?\", you MUST write \"ela unnaru?\" or a similar transliteration. If the answer is \"నేను బాగున్నాను\", you MUST write \"nenu bagunnanu\"." },
    'es-ES': { name: 'Spanish', instructionName: 'Spanish (Español)' },
  };
  const langDetails = languageMap[languageCode] || { 
    name: languageCode, 
    instructionName: languageCode 
  };
  const targetLanguageInstruction = langDetails.instructionName;
  
  let systemInstructionText = currentFeature.systemInstruction || '';
  systemInstructionText += `\n\nVERY IMPORTANT INSTRUCTION: Your entire response MUST be exclusively in the ${targetLanguageInstruction} language. Do not use any other languages or scripts in your response (e.g., no English if the target is Hindi, etc.).`;

  if (generateParams.config) { 
    generateParams.config.systemInstruction = systemInstructionText;
  }

  if (featureKey === FeatureKey.HEALTH_QA) {
     generateParams.config!.tools = [{googleSearch: {}}];
  }
  
  if (featureKey === FeatureKey.VOICE_ASSISTANCE || featureKey === FeatureKey.GENERAL_CHATBOT) {
    if (modelName === 'gemini-2.5-flash-preview-04-17') { 
        generateParams.config!.thinkingConfig = { thinkingBudget: 0 };
    }
  }

  try {
    console.log("Sending to Gemini:", JSON.stringify(generateParams, null, 2));
    const response: GenerateContentResponse = await ai.models.generateContent(generateParams);
    
    let text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    return { text, groundingMetadata };

  } catch (error) {
    let loggableError = error;
    if (error instanceof Error) {
        loggableError = error.message;
    } else if (typeof error === 'object' && error !== null && (error as any).message) {
        loggableError = (error as any).message;
    } else {
        try {
            loggableError = JSON.stringify(error);
        } catch (e) {
            loggableError = "Could not stringify error object for logging.";
        }
    }
    console.error("Error calling Gemini API:", loggableError, "\nOriginal error object:", error);

    let errorMessage = "An error occurred while processing your request. Please try again.";
    if (error instanceof Error) {
      errorMessage += ` Details: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += ` Details: ${error}`;
    } else if (typeof error === 'object' && error !== null && (error as any).message && typeof (error as any).message === 'string') {
      errorMessage += ` Details: ${(error as any).message}`;
    } else {
        try {
            const stringifiedError = JSON.stringify(error);
            errorMessage += ` Details: ${stringifiedError.substring(0, 200)}${stringifiedError.length > 200 ? '...' : ''}`;
        } catch (e) {
             errorMessage += ` Details: (Could not stringify error object)`;
        }
    }
    return { text: errorMessage };
  }
};
