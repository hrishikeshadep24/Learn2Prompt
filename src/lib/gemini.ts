import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LiveAnalysisResult {
  score: number;
  breakdown: {
    clarity: number;
    specificity: number;
    context: number;
    constraints: number;
    structure: number;
    reasoning: number;
    educational: number;
  };
  complexity: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  hallucinationRisk: number;
  hallucinationWarnings: string[];
  educationNotes?: string[];
  explainability: {
    field: string;
    issue: string;
    aiInterpretation: string;
    insight: string;
    suggestion: string;
  }[];
  suggestionsList: string[];
}

export interface LiveOptimizationResult {
  optimizedPrompt: string;
  explanation: string;
}

export interface LiveValidationResult {
  reliabilityScore: number;
  consistencyScore: number;
  factualConfidence: number;
  hallucinationProbability?: number;
  confidenceAnalysis?: string;
  validationSummary?: string;
  riskyStatements?: string[];
  feedback: string[];
}

// System prompt to evaluate user prompts
const EVALUATION_SYSTEM_PROMPT = `
You are an advanced Explainable AI Rubric Evaluation Engine.
Your job is to analyze the user's provided prompt and score it objectively based on seven core prompt-engineering criteria.
You must output a single JSON object. Do not wrap in markdown code blocks like \`\`\`json. Output raw JSON text only.

Rubric Parameters:
1. Clarity (0-3): Are tasks and goals unambiguous?
2. Specificity (0-3): Are instructions and outcomes detailed?
3. Context Depth (0-3): Does it include background, audience, or role constraints?
4. Constraints (0-2): Does it define negative limits (what to avoid, length constraints)?
5. Output Structure (0-2): Does it command formatting layouts (markdown, JSON)?
6. Reasoning Guidance (0-2): Does it request step-by-step thinking or reasoning paths?
7. Educational Value (0-2): Does it offer insights, examples, or structural learning benefit?

Also calculate:
- overall score: 0-100 calculated as (Clarity*3.33 + Specificity*3.33 + Context*3.33 + Constraints*5 + Structure*5 + Reasoning*5 + Educational*5) scaled or rounded appropriately.
- complexity: "Beginner", "Intermediate", "Advanced", or "Expert" based on length and structure.
- hallucinationRisk: 0-100 score indicating how likely vague/unbounded items are to invite AI hallucinations.
- hallucinationWarnings: A list of specific warning descriptions detailing potential hallucination vectors.
- educationNotes: A simple list of beginner-friendly explanations for why hallucination risk is high and how to reduce it.
- explainability: For every criteria scored below its maximum limit, explain:
  * field: Parameter name
  * issue: What is weak about it
  * aiInterpretation: How an LLM reads/interprets the weak prompt
  * insight: Why it matters to prompt engineering theory
  * suggestion: Concrete instructions to fix it.

JSON structure:
{
  "score": 75,
  "breakdown": {
    "clarity": 2,
    "specificity": 2,
    "context": 2,
    "constraints": 1,
    "structure": 1,
    "reasoning": 1,
    "educational": 1
  },
  "complexity": "Intermediate",
  "hallucinationRisk": 30,
  "hallucinationWarnings": ["Warning 1", "Warning 2"],
  "educationNotes": ["The prompt is too vague, so the AI may guess missing information.", "Add constraints and context to reduce ambiguity."],
  "explainability": [
    {
      "field": "Constraints",
      "issue": "No output word limit defined.",
      "aiInterpretation": "Model will write excessively to satisfy default token outputs.",
      "insight": "Token-length limitations prevent verbose models from rambling or losing coherence.",
      "suggestion": "Specify a word limit like 'limit response to under 150 words'."
    }
  ],
  "suggestionsList": ["Add constraints", "Define persona"]
}
`;

// System prompt to optimize prompts
const OPTIMIZATION_SYSTEM_PROMPT = (mode: string) => `
You are an expert AI Prompt Optimizer.
Improve the user's prompt based on the selected mode: "${mode}".
- Simple Mode: Short, beginner-friendly, concise improvements.
- Balanced Mode: Practical improvements, moderate structure, moderate detail.
- Advanced Mode: Expert-level optimization, advanced constraints, reasoning workflows (e.g., chain of thought), role-playing, and structured format templates.

Important Rules:
- DO NOT unnecessarily generate giant prompts. Optimized prompts should remain readable, practical, concise, and human-friendly.
- Short prompts should not become massive unless Advanced Mode is specified.
- The output should contain the optimized prompt and a brief explanation of why the changes were made.
- Return a JSON object containing:
  {
    "optimizedPrompt": "...",
    "explanation": "..."
  }
Do not return markdown code blocks. Output raw JSON only.
`;

// System prompt to validate outputs
const VALIDATION_SYSTEM_PROMPT = `
You are a Secondary AI Validation Engine.
You will review the user's prompt, the primary AI's generated response, and evaluate reliability.
Evaluate:
1. Reliability Score (0-100)
2. Consistency Score (0-100)
3. Factual Confidence (0-100)
4. Hallucination Probability (0-100)
5. Confidence Analysis in simple language
6. Risky statements or unsupported claims
7. Validation summary of output quality and reliability
8. Feedback list of issues (factual contradictions, unsupported speculation, logical lapses, ambiguity risks).

Return a JSON object:
{
  "reliabilityScore": 85,
  "consistencyScore": 90,
  "factualConfidence": 80,
  "hallucinationProbability": 25,
  "confidenceAnalysis": "The response is mostly grounded and cites logic, but several assertions lack evidence.",
  "validationSummary": "The model generally followed instructions, but a few details appear speculative.",
  "riskyStatements": ["Claim about X being the only solution", "Prediction that Y will happen next year"],
  "feedback": ["Feedback item 1", "Feedback item 2"]
}
Do not return markdown code blocks. Output raw JSON only.
`;

const getFriendlyGeminiErrorMessage = (error: unknown): string => {
  const message = String((error as { message?: unknown })?.message || error || "An unknown Gemini error occurred.");
  if (message.toLowerCase().includes("high demand") || message.includes("503")) {
    return "Gemini is currently experiencing high demand. Please try again later.";
  }

  if (
    message.toLowerCase().includes("api_key_invalid") ||
    message.toLowerCase().includes("api key not found") ||
    message.toLowerCase().includes("invalid api key")
  ) {
    return "Gemini API key is invalid or missing. Please enter a valid key in Settings and try again.";
  }

  if (
    message.toLowerCase().includes("permission") ||
    message.toLowerCase().includes("permissions") ||
    message.toLowerCase().includes("unauthorized") ||
    message.includes("403")
  ) {
    return "Gemini API key permissions or billing access appear invalid. Please verify your key and try again.";
  }

  if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("429")) {
    return "Gemini is rate limited right now. Please wait a moment and retry.";
  }

  return message;
};

export const analyzePromptLive = async (
  apiKey: string,
  promptText: string,
  category: string
): Promise<LiveAnalysisResult | null> => {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const userMessage = `Evaluate this prompt of category "${category}":\n\n${promptText}`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: EVALUATION_SYSTEM_PROMPT
    });
    
    const text = result.response.text();
    return JSON.parse(text) as LiveAnalysisResult;
  } catch (error) {
    console.warn("Gemini Live Analysis skipped:", error);
    return null; // Force fallback
  }
};

export const optimizePromptLive = async (
  apiKey: string,
  promptText: string,
  mode: "simple" | "balanced" | "advanced",
  category: string
): Promise<LiveOptimizationResult | null> => {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const userMessage = `Optimize this prompt of category "${category}":\n\n${promptText}`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: OPTIMIZATION_SYSTEM_PROMPT(mode)
    });
    
    const text = result.response.text();
    return JSON.parse(text) as LiveOptimizationResult;
  } catch (error) {
    console.warn("Gemini Live Optimization skipped:", error);
    return null; // Force fallback
  }
};

export const generateOutputLive = async (
  apiKey: string,
  promptText: string
): Promise<string | null> => {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(promptText);
    const text = result?.response?.text?.();

    if (!text || !text.trim()) {
      console.warn("Gemini Live Text Generation returned empty text.");
      return null;
    }

    return text;
  } catch (error: any) {
    console.warn("Gemini Live Text Generation Error:", error);
    const message = getFriendlyGeminiErrorMessage(error);
    throw new Error(message);
  }
};

export const validateOutputLive = async (
  apiKey: string,
  promptText: string,
  generatedOutput: string
): Promise<LiveValidationResult | null> => {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const userMessage = `User Prompt:\n${promptText}\n\nGenerated Response:\n${generatedOutput}`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: VALIDATION_SYSTEM_PROMPT
    });
    
    const text = result.response.text();
    return JSON.parse(text) as LiveValidationResult;
  } catch (error) {
    console.warn("Gemini Live Validation skipped:", error);
    return null;
  }
};
