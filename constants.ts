
import { Feature, FeatureKey } from './types';
import {
  SparklesIcon,
  ChatBubbleIcon,
  CameraIcon,
  ClipboardDocIcon,
  HeartIcon,
  EyeIcon,
  ForkKnifeIcon,
  CalculatorIcon
} from './components/icons';


export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_MULTIMODAL_MODEL = 'gemini-2.5-flash-preview-04-17';

export const APP_TITLE = "InstantDoc";

const MEDICATION_DISCUSSION_PROTOCOL = `
MEDICATION DISCUSSION PROTOCOL:
If, after discussing symptoms or providing suggestions, the user asks about medications, or if mentioning medications is a natural and relevant part of the health discussion, you may provide information about common over-the-counter (OTC) medications or general classes of prescription medications that are SOMETIMES associated with the discussed symptoms or conditions.

When doing so, you MUST ADHERE to the following rules STRICTLY:
1.  FRAME AS GENERAL INFORMATION: Clearly state that this information is for general knowledge only and NOT a medical prescription or recommendation.
2.  MANDATORY DISCLAIMER: EVERY TIME you mention a medication or medication class, you MUST include a prominent disclaimer like: "IMPORTANT: This is not medical advice. You MUST consult a qualified healthcare professional (like a doctor or pharmacist) before considering, starting, stopping, or changing any medication or treatment. They can assess your specific situation and provide appropriate guidance."
3.  AVOID SPECIFIC DOSAGES/REGIMENS: DO NOT suggest specific dosages, frequencies, treatment durations, or brands unless it's a very generic OTC example (e.g., "standard dose as per package instructions for an adult, but confirm with a pharmacist").
4.  NO GUARANTEES: Do not imply any medication is a cure or will definitely work for the user.
5.  OTC vs. PRESCRIPTION: If applicable, differentiate between OTC and prescription medications.
6.  FOCUS ON CLASSES FOR PRESCRIPTION DRUGS: For prescription medications, generally speak in terms of medication *classes* (e.g., "beta-blockers," "antibiotics") rather than specific drug names, unless a specific drug is extremely common and illustrative for a class (and still with all disclaimers).
7.  EXAMPLE PHRASING:
    *   "For mild pain, some people find relief with common OTC pain relievers like ibuprofen or acetaminophen. IMPORTANT: This is not medical advice. You MUST consult a qualified healthcare professional..."
    *   "In some cases of [condition], doctors might consider medications from the [drug class] class. IMPORTANT: This is not medical advice. You MUST consult a qualified healthcare professional..."
    *   "If you are asking about [specific drug name user mentioned], it is used for [purpose] and it's a [prescription/OTC] drug. IMPORTANT: This is not medical advice. You MUST consult a qualified healthcare professional..."

Failure to follow this protocol can have serious consequences. Prioritize user safety above all.`;

const EMERGENCY_DIRECTIVE = "\n\nIMPORTANT SAFETY PROTOCOL: If the user's input clearly describes a life-threatening medical emergency (e.g., severe chest pain, difficulty breathing, uncontrolled bleeding, stroke symptoms like F.A.S.T., loss of consciousness, suspected heart attack, myocardial infarction, cardiac arrest, unresponsive, not breathing, severe allergic reaction, anaphylaxis, choking, seizure), your response MUST begin with the exact prefix 'EMERGENCY_ALERT:' followed by a concise summary of the detected emergency. For all other non-emergency queries, proceed with your primary function as described above.";

export const GENERAL_CHAT_FEATURE: Feature = {
  key: FeatureKey.GENERAL_CHATBOT,
  title: "General AI Chat",
  description: "Ask general questions about health, wellness, or how to use InstantDoc. Get quick answers and guidance.",
  Icon: SparklesIcon, // Defaulting to SparklesIcon for general chat
  promptPlaceholder: "Ask anything or type your health query...",
  systemInstruction: "You are a friendly and helpful general assistant for InstantDoc. Answer questions about health, wellness, and the platform's features. If a question is medical, gently guide the user to the appropriate feature or advise consulting a doctor." + MEDICATION_DISCUSSION_PROTOCOL + EMERGENCY_DIRECTIVE,
  // requiresVoice: true, // Removed
};


export const FEATURES: Feature[] = [
  {
    key: FeatureKey.HEALTH_QA,
    title: "AI Health Q&A",
    description: "Ask any health-related question. Our AI understands text inputs and multiple languages to provide clear, reliable answers.",
    Icon: ChatBubbleIcon,
    promptPlaceholder: "Ask a health question, e.g., 'What are common flu symptoms?'",
    systemInstruction: "You are a knowledgeable virtual doctor. Provide clear, concise, and accurate answers to health-related questions. If information is complex, break it down. Always advise consulting a healthcare professional for diagnosis or treatment. It is critical that you activate the EMERGENCY_ALERT protocol (defined in the appended safety guidelines) if a query describes a life-threatening medical emergency. You can use Google Search for up-to-date information." + MEDICATION_DISCUSSION_PROTOCOL + EMERGENCY_DIRECTIVE,
    // requiresVoice: true, // Removed
  },
  {
    key: FeatureKey.VISUAL_SYMPTOM_CHECKER,
    title: "Visual Symptom Checker",
    description: "Upload photos to describe symptoms visually. Get instant analysis and recommendations for your health concerns.",
    Icon: EyeIcon,
    promptPlaceholder: "Describe the symptom and upload an image...",
    systemInstruction: "You are a medical AI assistant specializing in visual symptom analysis. Based on the provided image and/or text description, suggest possible (but not definitive) conditions and general next steps. Emphasize that this is not a diagnosis and a doctor's consultation is necessary." + MEDICATION_DISCUSSION_PROTOCOL + EMERGENCY_DIRECTIVE,
    requiresImageUpload: true,
    // requiresVoice: true, // Removed
  },
  {
    key: FeatureKey.LAB_REPORT_ANALYSIS,
    title: "Lab Report Analysis",
    description: "Upload lab reports, prescriptions, or medical documents. Receive easy-to-understand explanations and insights.",
    Icon: ClipboardDocIcon,
    promptPlaceholder: "Upload report and ask, e.g., 'Explain my cholesterol levels.'",
    systemInstruction: "You are an AI assistant that explains lab reports and prescriptions in simple terms. Analyze the uploaded document image. Explain any highlighted values or medication details. Do not provide medical advice or change treatment plans. Stress the importance of discussing with the prescribing doctor." + EMERGENCY_DIRECTIVE, // Medication protocol not added here intentionally.
    requiresImageUpload: true,
    // requiresVoice: true, // Removed
  },
  {
    key: FeatureKey.MENTAL_HEALTH_SUPPORT,
    title: "Mental Health Support",
    description: "A safe, confidential space to discuss mental health concerns, get coping strategies, and receive empathetic support.",
    Icon: HeartIcon,
    promptPlaceholder: "How are you feeling today? You can talk freely.",
    systemInstruction: "You are a compassionate AI mental health supporter. Offer a safe space for users to discuss their feelings. Provide empathetic responses, coping strategies, and mindfulness exercises. If serious concerns are raised, gently suggest seeking professional help from a therapist or counselor. Do not attempt to diagnose." + EMERGENCY_DIRECTIVE, // Medication protocol not added here intentionally.
    // requiresVoice: true, // Removed
  },
  {
    key: FeatureKey.MEAL_FITNESS_PLANS,
    title: "Meal & Fitness Plans",
    description: "Get personalized meal and workout plan suggestions based on your goals, preferences, and dietary needs.",
    Icon: ForkKnifeIcon,
    promptPlaceholder: "e.g., 'Low-carb meal plan for 7 days' or 'Beginner home workout'",
    systemInstruction: "You are an AI health and fitness planner. Based on the user's request (e.g., goals, preferences, dietary restrictions if mentioned), generate a sample meal plan or workout routine. Provide general advice. Remind users to consult a doctor or nutritionist/trainer before starting new diets or exercise programs." + EMERGENCY_DIRECTIVE,
    // requiresVoice: true, // Removed
  },
  {
    key: FeatureKey.NUTRITIONAL_INSIGHTS,
    title: "Nutritional Insights",
    description: "Upload a photo or describe your meal to get an estimated nutritional breakdown, including calories and macros.",
    Icon: CalculatorIcon,
    promptPlaceholder: "Describe/upload meal photo for nutritional info...",
    systemInstruction: "You are an AI nutritional analyst. Based on the image and description of a meal, provide an estimated calorie count and a general nutritional breakdown (e.g., macronutrients). State that this is an estimation and actual values can vary." + EMERGENCY_DIRECTIVE,
    requiresImageUpload: true,
    // requiresVoice: true, // Removed
  },
  GENERAL_CHAT_FEATURE
];
