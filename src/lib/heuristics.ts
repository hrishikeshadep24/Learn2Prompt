export interface ScoreBreakdown {
  clarity: number; // 0-3
  specificity: number; // 0-3
  context: number; // 0-3
  constraints: number; // 0-2 (or 0-3 depending on rubric, let's use normalized 0-10 internally and scale for UI)
  structure: number; // 0-2
  reasoning: number; // 0-2
  educational: number; // 0-2
}

export interface ExplainableItem {
  field: string;
  issue: string;
  aiInterpretation: string;
  insight: string;
  suggestion: string;
}

export interface HeuristicResult {
  score: number; // 0-100
  breakdown: ScoreBreakdown;
  complexity: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  hallucinationRisk: number; // 0-100
  hallucinationWarnings: string[];
  educationNotes: string[];
  explainability: ExplainableItem[];
  optimizedPrompt: string;
  suggestionsList: string[];
}

// Vague/ambiguous words that reduce clarity
const AMBIGUOUS_WORDS = [
  "better", "nice", "good", "beautiful", "optimize", "etc", "stuff", "things", 
  "approximate", "some", "quick", "simple", "easy", "make it pop", "perfect",
  "something", "anyone", "anyhow", "whatever", "random", "cool", "clean"
];

// Context markers (role-play, audience)
const ROLE_PLAY_MARKERS = [
  "act as", "you are", "role:", "expert", "specialist", "position", "analyst",
  "teacher", "coach", "auditor", "consultant", "engineer", "designer", "assistant"
];

const AUDIENCE_MARKERS = [
  "audience:", "for a", "target", "students", "child", "layman", "professionals",
  "executives", "beginners", "developers", "users", "clients", "customers"
];

// Formatting instructions
const FORMAT_MARKERS = [
  "bullet points", "table", "json", "markdown", "list", "csv", "xml", "chart",
  "paragraph", "headers", "subheadings", "format:", "output structure", "response format"
];

// Reasoning guidance
const REASONING_MARKERS = [
  "step-by-step", "step by step", "reasoning", "explain your", "chain of thought",
  "think through", "first,", "then,", "explain why", "logical steps", "walk me through"
];

// Constraint keywords
const CONSTRAINT_MARKERS = [
  "limit", "do not", "avoid", "only", "maximum", "max", "minimum", "min", "words",
  "sentences", "paragraphs", "restrict", "exclude", "do not include", "no jargon"
];

// Hallucination triggers (vague future, impossible claims, unverifiable, overconfidence)
const HALLUCINATION_TRIGGERS = [
  "predict exactly", "guarantee", "surely", "100% accurate", "real-time database",
  "latest information", "current stock price", "future price", "confidential source",
  "secret", "hack", "illegal", "tomorrow", "next week's", "always", "never", "definitely",
  "certainly", "for sure", "complete certainty", "guaranteed", "will happen", "forecast"
];

export const evaluatePromptHeuristically = (
  prompt: string,
  category: string,
  mode: "simple" | "balanced" | "advanced" = "balanced"
): HeuristicResult => {
  const normalized = prompt.toLowerCase();
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  
  // 1. Calculate Clarity (max 10 points)
  // Penalized by ambiguous words and extremely short length
  let clarityScore = 10;
  const foundAmbiguous = AMBIGUOUS_WORDS.filter((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(normalized)
  );
  clarityScore -= foundAmbiguous.length * 1.5;
  if (wordCount < 8) clarityScore -= 5;
  else if (wordCount < 15) clarityScore -= 2.5;
  clarityScore = Math.max(0, Math.min(10, clarityScore));
  
  // 2. Calculate Specificity (max 10 points)
  // Boosted by length, instruction verbs, and noun phrases
  let specificityScore = 2;
  if (wordCount >= 12) specificityScore += 2;
  if (wordCount >= 25) specificityScore += 3;
  if (wordCount >= 50) specificityScore += 2;
  
  const hasInstructionVerbs = ["create", "write", "analyze", "summarize", "explain", "review", "draft", "format", "compare", "list", "evaluate"].some((verb) =>
    normalized.includes(verb)
  );
  if (hasInstructionVerbs) specificityScore += 1;
  specificityScore = Math.min(10, specificityScore);
  
  // 3. Calculate Context Depth (max 10 points)
  // Boosted by role-play markers and audience definitions
  let contextScore = 1;
  const hasRolePlay = ROLE_PLAY_MARKERS.some((marker) => normalized.includes(marker));
  const hasAudience = AUDIENCE_MARKERS.some((marker) => normalized.includes(marker));
  if (hasRolePlay) contextScore += 4;
  if (hasAudience) contextScore += 3;
  if (wordCount > 30 && (hasRolePlay || hasAudience)) contextScore += 2;
  contextScore = Math.min(10, contextScore);
  
  // 4. Calculate Constraints (max 10 points)
  // Boosted by constraint keywords
  let constraintsScore = 0;
  const foundConstraints = CONSTRAINT_MARKERS.filter((marker) => normalized.includes(marker));
  constraintsScore += foundConstraints.length * 3;
  if (category === "Coding" && (normalized.includes("version") || normalized.includes("framework"))) {
    constraintsScore += 2;
  }
  constraintsScore = Math.min(10, constraintsScore);
  
  // 5. Calculate Output Structure (max 10 points)
  // Boosted by formatting markers
  let structureScore = 0;
  const foundFormat = FORMAT_MARKERS.filter((marker) => normalized.includes(marker));
  structureScore += foundFormat.length * 3.5;
  if (normalized.includes("example") || normalized.includes("template")) {
    structureScore += 3;
  }
  structureScore = Math.min(10, structureScore);
  
  // 6. Calculate Reasoning Guidance (max 10 points)
  // Boosted by reasoning instructions
  let reasoningScore = 0;
  const foundReasoning = REASONING_MARKERS.filter((marker) => normalized.includes(marker));
  reasoningScore += foundReasoning.length * 4;
  if (normalized.includes("why") && wordCount > 20) reasoningScore += 2;
  reasoningScore = Math.min(10, reasoningScore);
  
  // 7. Calculate Educational Value (max 10 points)
  // Boosted if prompt asks for explanations, details, summaries or includes examples
  let educationalScore = 2;
  if (normalized.includes("explain") || normalized.includes("teach") || normalized.includes("why")) {
    educationalScore += 3;
  }
  if (normalized.includes("example") || normalized.includes("scenario") || normalized.includes("case study")) {
    educationalScore += 3;
  }
  if (wordCount > 40) educationalScore += 2;
  educationalScore = Math.min(10, educationalScore);

  // Overall Score Calculation (weighted)
  // Clarity (20%), Specificity (20%), Context (15%), Constraints (15%), Structure (10%), Reasoning (10%), Educational (10%)
  const rawOverall = (
    clarityScore * 2.0 + 
    specificityScore * 2.0 + 
    contextScore * 1.5 + 
    constraintsScore * 1.5 + 
    structureScore * 1.0 + 
    reasoningScore * 1.0 + 
    educationalScore * 1.0
  );
  
  const score = Math.round(rawOverall);
  
  // Complexity Level
  let complexity: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Beginner";
  if (wordCount > 60 && score >= 85) complexity = "Expert";
  else if (wordCount > 35 && score >= 70) complexity = "Advanced";
  else if (wordCount > 15 && score >= 45) complexity = "Intermediate";
  
  // Hallucination Risk Heuristics
  let hallucinationRisk = 10; // baseline
  const warnings: string[] = [];
  const educationNotes: string[] = [];
  const foundTriggers = HALLUCINATION_TRIGGERS.filter((trigger) => normalized.includes(trigger));
  
  if (foundTriggers.length > 0) {
    hallucinationRisk += foundTriggers.length * 20;
    warnings.push(`Contains speculative triggers: "${foundTriggers.join(", ")}". Asking AI for absolute guarantees, exact predictions, or real-time info it cannot verify invites hallucinated dates, stats, or facts.`);
    educationNotes.push("Future prediction requests increase hallucination risk. The AI may invent outcomes it cannot verify.");
  }
  
  if (clarityScore < 5) {
    hallucinationRisk += 25;
    warnings.push("Vague prompt description detected. Lack of bounds allows the LLM to stray from facts and generate speculative contents.");
    educationNotes.push("The prompt is too vague, so the AI may guess missing information rather than follow a concrete plan.");
  }
  
  if (foundAmbiguous.length > 0) {
    educationNotes.push(`Vague terms like ${foundAmbiguous.slice(0, 3).map((word) => `"${word}"`).join(", ")} soften your instructions and let the model fill in the gaps.`);
  }
  
  if (constraintsScore < 3) {
    hallucinationRisk += 15;
    warnings.push("No explicit negative constraints ('avoid', 'do not include') detected. Without boundaries, models are highly prone to outputting filler material or unsupported side facts.");
    educationNotes.push("Adding constraints and context reduces ambiguity and helps the model stay grounded in the intended outcome.");
  }
  
  if (wordCount < 10) {
    hallucinationRisk += 20;
    warnings.push("Extremely short prompt. Brief requests force the model to fill in details randomly, dramatically increasing the rate of hallucinated context.");
    educationNotes.push("Extremely short prompts force the model to invent missing context, which raises hallucination probability.");
  }
  
  if (normalized.includes("always") || normalized.includes("never") || normalized.includes("definitely") || normalized.includes("guaranteed") || normalized.includes("100%")) {
    educationNotes.push("Unrealistic certainty invites the model to overcommit. Ask for best effort or evidence-backed reasoning instead.");
  }
  
  if (!hasRolePlay && !hasAudience) {
    educationNotes.push("Without clear persona or audience, the model defaults to generic phrasing and is more likely to drift from a precise answer.");
  }
  
  hallucinationRisk = Math.min(95, Math.max(5, hallucinationRisk));
  
  // Explainability Engine Details
  const explainability: ExplainableItem[] = [];
  const suggestionsList: string[] = [];
  
  if (clarityScore < 7) {
    explainability.push({
      field: "Clarity & Specificity",
      issue: foundAmbiguous.length > 0 
        ? `Ambiguous keywords detected: "${foundAmbiguous.slice(0, 3).join(", ")}".`
        : "Vague instruction set or brief wording.",
      aiInterpretation: "The model faces semantic ambiguity and must guess your specific expectations, often returning generic or off-target outputs.",
      insight: "LLMs perform poorly on open-ended quality statements like 'make it better'. They respond far more reliably to concrete instructional commands.",
      suggestion: `Remove subjective words. Instead of "${foundAmbiguous[0] || 'good'}", describe the exact traits you need (e.g. 'concise', 'structured', 'academic tone').`
    });
    suggestionsList.push("Replace vague qualitative terms with precise execution instructions.");
  }
  
  if (contextScore < 6) {
    explainability.push({
      field: "Context & Detail",
      issue: "Lack of background context, persona, or audience role-play guidelines.",
      aiInterpretation: "The AI defaults to its general base persona and targets a generic audience, diluting specialized expertise or tone.",
      insight: "Adding a role ('Act as a senior database developer') shifts the model's token weights toward professional domains, improving nomenclature accuracy.",
      suggestion: "Define a specific role/expertise for the AI and describe the target audience (e.g., 'explain to a business analyst')."
    });
    suggestionsList.push("Anchor the prompt with an expert role ('You are an expert X') and specify the target audience.");
  }
  
  if (constraintsScore < 4) {
    explainability.push({
      field: "Constraints",
      issue: "No explicit limits, word count restrictions, or negative constraints defined.",
      aiInterpretation: "The LLM will write continuously, adding fluff or speculative information to fill up its token response window.",
      insight: "Negative constraints ('do not mention X') and length boundaries ('limit to 100 words') act as guardrails, checking semantic drift.",
      suggestion: "Include clear boundary parameters, such as 'limit response to 3 sentences' or 'do not use technical jargon'."
    });
    suggestionsList.push("Add length limits (e.g., 'max 200 words') and structural constraints ('avoid mentioning pricing').");
  }
  
  if (structureScore < 4) {
    explainability.push({
      field: "Output Structure",
      issue: "No format templates, headers, or structured layout commands provided.",
      aiInterpretation: "The model outputs wall-of-text paragraphs which are hard to scan or parse programmatically.",
      insight: "Pre-defining structural slots (e.g., 'Format: [Concept] -> [Analogy]') anchors the text output token stream, improving layout predictability.",
      suggestion: "Instruct the AI to format its output specifically using headings, lists, tables, markdown, or JSON schemas."
    });
    suggestionsList.push("Specify a concrete format layout like markdown tables or JSON.");
  }
  
  if (reasoningScore < 4) {
    explainability.push({
      field: "Reasoning Guidance",
      issue: "Prompt demands immediate answers without forcing step-by-step thinking.",
      aiInterpretation: "The model calculates output tokens on the fly and is forced to predict final answers before processing intermediate logic, leading to calculation errors.",
      insight: "Allowing a model to write out its thoughts ('explain step by step before showing the final result') lets it store state in the context window, boosting calculation and logic accuracy.",
      suggestion: "Add instructions like 'think step-by-step' or 'explain your logic at each phase before displaying the output'."
    });
    suggestionsList.push("Request reasoning pathways using phrases like 'explain your logic step-by-step'.");
  }

  // Fallback heuristic prompt optimizer
  // Rewrites the user prompt locally based on standard heuristics and selected mode
  let optPrompt = prompt;
  const cleanBase = prompt.replace(/(please|can you|could you|write a prompt to|ask chatgpt to|have chatgpt|make sure to)\s+/gi, "").trim();
  const baseRole = hasRolePlay ? "" : "You are an expert advisor in this topic. ";
  const baseConstraint = foundConstraints.length > 0 ? "" : "\n\nAvoid speculation and keep the response grounded in facts.";

  if (mode === "simple") {
    optPrompt = `${baseRole}Summarize the following request clearly and provide a concise, user-ready prompt for an AI assistant:\n\n${cleanBase}${baseConstraint}`;
  } else if (mode === "advanced") {
    const advancedStructure = foundFormat.length > 0 ? "" : "\n\nStructure the answer with headers, bullet points, or JSON output as appropriate.";
    optPrompt = `${baseRole}Your task is to: ${cleanBase}${advancedStructure}${baseConstraint}\n\nUse a step-by-step reasoning approach and include explicit format instructions to maximize response reliability.`;
  } else {
    const balancedStructure = foundFormat.length > 0 ? "" : "\n\nUse clear headings or bullet points if it improves readability.";
    optPrompt = `${baseRole}Your task is to: ${cleanBase}${balancedStructure}${baseConstraint}\n\nThink through this step-by-step to keep the response accurate and well-structured.`;
  }

  // Mapping scores to rubric scales for UI
  const breakdown: ScoreBreakdown = {
    clarity: Math.round(clarityScore * 0.3), // scale to 0-3
    specificity: Math.round(specificityScore * 0.3), // scale to 0-3
    context: Math.round(contextScore * 0.3), // scale to 0-3
    constraints: Math.round(constraintsScore * 0.2), // scale to 0-2
    structure: Math.round(structureScore * 0.2), // scale to 0-2
    reasoning: Math.round(reasoningScore * 0.2), // scale to 0-2
    educational: Math.round(educationalScore * 0.2), // scale to 0-2
  };
  
  return {
    score,
    breakdown,
    complexity,
    hallucinationRisk,
    hallucinationWarnings: warnings,
    educationNotes,
    explainability,
    optimizedPrompt: optPrompt,
    suggestionsList: suggestionsList.length > 0 ? suggestionsList : ["Keep prompt clear and continue refining parameters."]
  };
};
