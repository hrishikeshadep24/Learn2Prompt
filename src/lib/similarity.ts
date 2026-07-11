import { evaluatePromptHeuristically } from "./heuristics";

export interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problem: string;
  hints: string;
  min_length: string;
  model_prompt: string;
  rubric_raw: string;
  rubric: { name: string; min: number; max: number }[];
}

export interface ChallengeEvaluationResult {
  score: number; // 0-100
  passed: boolean;
  rubricScorePct: number; // 0-100 (weighted 40%)
  semanticSimilarityPct: number; // 0-100 (weighted 40%)
  conceptCoveragePct: number; // 0-100 (weighted 20%)
  rubricScores: Record<string, number>; // parameter -> value
  strengths: string[];
  missingConcepts: string[];
  suggestions: string[];
  wordCount: number;
}

// Synonyms/Concept groupings to compute concept coverage without exact matching
const CONCEPT_GROUPINGS: Record<string, string[][]> = {
  "easy_1": [
    ["photosynthesis", "photo-synthesis", "plant", "sunlight", "carbon dioxide", "oxygen", "chlorophyll"],
    ["10-year-old", "10 year old", "child", "5th-grade", "5th grade", "kid", "son", "daughter", "young"],
    ["simple", "analogy", "analogies", "story", "explain", "friendly", "easy to understand"]
  ],
  "easy_2": [
    ["summarize", "summary", "brief", "shorten", "condense", "gist"],
    ["bullet points", "bullets", "list", "key points", "main facts", "conclusions"],
    ["article", "news", "text", "story", "report"]
  ],
  "easy_3": [
    ["omelette", "recipe", "cooking", "dish", "cook", "food", "egg", "eggs"],
    ["step-by-step", "step by step", "instructions", "guide", "steps", "how to"],
    ["beginner", "novice", "easy", "simple", "first time"]
  ],
  "easy_4": [
    ["trip", "travel", "itinerary", "weekend", "2-day", "2 day", "denver", "visit"],
    ["budget-friendly", "cheap", "budget", "low-cost", "affordable", "cost"],
    ["sightseeing", "activities", "dining", "restaurants", "schedule", "suggest"]
  ],
  "easy_5": [
    ["extension", "extend", "more time", "deadline", "postpone", "delay"],
    ["professor", "teacher", "instructor", "class", "assignment", "homework"],
    ["polite", "formal", "respectful", "apologize", "sincere"]
  ]
};

// Default concepts extractor based on model prompt keywords
const extractTargetKeywords = (modelPrompt: string): string[] => {
  // Remove common stop words and grab important nouns/verbs
  const stops = new Set(["the", "a", "an", "and", "or", "but", "if", "then", "of", "to", "in", "on", "for", "with", "as", "by", "about", "this", "that", "these", "those", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "my", "your", "his", "her", "its", "our", "their"]);
  const clean = modelPrompt.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const words = clean.split(/\s+/).filter(Boolean);
  return Array.from(new Set(words.filter(w => !stops.has(w) && w.length > 3)));
};

export const evaluateChallengePrompt = (
  userPrompt: string,
  challenge: Challenge
): ChallengeEvaluationResult => {
  const normalizedUser = userPrompt.toLowerCase().trim();
  const wordCount = userPrompt.split(/\s+/).filter(Boolean).length;
  
  // Parse minimum length threshold from string (e.g. "~10-15 words." -> 10)
  let minWordsRequired = 10;
  const lenMatch = challenge.min_length.match(/(\d+)/);
  if (lenMatch) {
    minWordsRequired = parseInt(lenMatch[1]);
  }
  
  // 1. Rubric Score (40% Weight)
  // Use our heuristic evaluator to score, then extract details
  const localEval = evaluatePromptHeuristically(userPrompt, "Educational");
  
  // Map specific challenge rubric items. 
  // e.g. challenge.rubric might be [{name: "Clarity", max: 3}, {name: "Context", max: 3}, {name: "Tone", max: 2}]
  const rubricScores: Record<string, number> = {};
  let userRubricPointsEarned = 0;
  let totalRubricPointsPossible = 0;
  
  challenge.rubric.forEach((item) => {
    const nameLower = item.name.toLowerCase();
    let val = 0;
    
    // Check match in heuristic breakdown
    if (nameLower.includes("clarity") || nameLower.includes("specific")) {
      val = Math.round((localEval.breakdown.clarity / 3) * item.max);
    } else if (nameLower.includes("context") || nameLower.includes("detail") || nameLower.includes("audience")) {
      val = Math.round((localEval.breakdown.context / 3) * item.max);
    } else if (nameLower.includes("tone") || nameLower.includes("format") || nameLower.includes("style")) {
      val = Math.round((localEval.breakdown.structure / 2) * item.max);
    } else if (nameLower.includes("constraint")) {
      val = Math.round((localEval.breakdown.constraints / 2) * item.max);
    } else if (nameLower.includes("reasoning") || nameLower.includes("structure")) {
      val = Math.round((localEval.breakdown.reasoning / 2) * item.max);
    } else {
      // Fallback
      val = Math.round((localEval.score / 100) * item.max);
    }
    
    val = Math.min(item.max, Math.max(0, val));
    rubricScores[item.name] = val;
    userRubricPointsEarned += val;
    totalRubricPointsPossible += item.max;
  });
  
  const rubricScorePct = totalRubricPointsPossible > 0 
    ? (userRubricPointsEarned / totalRubricPointsPossible) * 100 
    : 50;

  // 2. Concept Coverage (20% Weight)
  // Check if expected concepts are covered (via synonyms or word stems)
  let conceptCoveragePct = 0;
  const missingConcepts: string[] = [];
  const strengths: string[] = [];
  
  const predefinedGroups = CONCEPT_GROUPINGS[challenge.id];
  if (predefinedGroups) {
    let matchedCount = 0;
    predefinedGroups.forEach((group, idx) => {
      const match = group.some((synonym) => normalizedUser.includes(synonym));
      if (match) {
        matchedCount++;
      } else {
        missingConcepts.push(group[0]); // name of concept (first element)
      }
    });
    conceptCoveragePct = (matchedCount / predefinedGroups.length) * 100;
  } else {
    // Dynamic fallback: extract keywords from model prompt and check overlap
    const targetKeywords = extractTargetKeywords(challenge.model_prompt);
    let matched = 0;
    targetKeywords.forEach((kw) => {
      // simple stem check
      const stem = kw.substring(0, Math.max(4, kw.length - 2));
      if (normalizedUser.includes(stem)) {
        matched++;
      } else {
        missingConcepts.push(kw);
      }
    });
    conceptCoveragePct = targetKeywords.length > 0 ? (matched / targetKeywords.length) * 100 : 80;
  }

  // 3. Semantic Similarity (40% Weight)
  // Evaluates sentence structures, length match, intent overlap (role, format, details)
  let semanticSimilarityPct = 50; // baseline
  
  // A. Length match criteria
  const modelWordCount = challenge.model_prompt.split(/\s+/).filter(Boolean).length;
  const lengthRatio = Math.min(wordCount, modelWordCount) / Math.max(wordCount, modelWordCount);
  const lengthScore = lengthRatio * 30; // up to 30 points
  
  // B. Structural intent overlap
  let structurePoints = 20;
  const userHasQuestion = normalizedUser.includes("?");
  const modelHasQuestion = challenge.model_prompt.includes("?");
  if (userHasQuestion !== modelHasQuestion) structurePoints -= 5;
  
  // check action words
  const userVerbs = ["explain", "summarize", "write", "analyze", "list", "create"].filter(v => normalizedUser.includes(v));
  const modelVerbs = ["explain", "summarize", "write", "analyze", "list", "create"].filter(v => challenge.model_prompt.toLowerCase().includes(v));
  const verbOverlap = userVerbs.filter(v => modelVerbs.includes(v)).length;
  if (modelVerbs.length > 0 && verbOverlap === 0) structurePoints -= 10;
  
  // C. Keyword overlap factor (Dice coefficient on trigrams or words)
  const userWords = new Set(normalizedUser.replace(/[.,]/g, "").split(/\s+/));
  const modelWords = new Set(challenge.model_prompt.toLowerCase().replace(/[.,]/g, "").split(/\s+/));
  const intersection = new Set([...userWords].filter(x => modelWords.has(x)));
  const overlapScore = userWords.size + modelWords.size > 0 
    ? (2 * intersection.size / (userWords.size + modelWords.size)) * 50 
    : 0;
    
  semanticSimilarityPct = Math.round(lengthScore + structurePoints + overlapScore);
  semanticSimilarityPct = Math.min(100, Math.max(20, semanticSimilarityPct));

  // Compute final composite score
  // Rubric Score -> 40%
  // Semantic Similarity -> 40%
  // Concept Coverage -> 20%
  const finalScore = Math.round(
    (rubricScorePct * 0.40) + 
    (semanticSimilarityPct * 0.40) + 
    (conceptCoveragePct * 0.20)
  );

  // Passing Thresholds
  let threshold = 65;
  if (challenge.difficulty === "Medium") threshold = 75;
  if (challenge.difficulty === "Hard") threshold = 85;
  
  const passed = finalScore >= threshold && wordCount >= minWordsRequired;
  
  // Generate feedback details
  const suggestions: string[] = [];
  
  if (wordCount < minWordsRequired) {
    suggestions.push(`Your prompt is too brief (${wordCount} words). A professional prompt requires at least ${minWordsRequired} words to specify details.`);
  }
  
  if (rubricScorePct < 70) {
    suggestions.push("Focus on adding clear instructions, structural output formats (e.g. lists, bullet points), or reasoning parameters.");
  }
  
  if (missingConcepts.length > 0) {
    suggestions.push(`Include references to these missing concepts or keywords: "${missingConcepts.slice(0, 3).join(", ")}".`);
  } else {
    strengths.push("Excellent keyword coverage. You hit all the major semantic anchors required for the task.");
  }
  
  if (semanticSimilarityPct > 75) {
    strengths.push("Excellent alignment with the instructional layout and focus of the target model answer.");
  }
  
  if (rubricScores["Clarity"] && rubricScores["Clarity"] >= 2) {
    strengths.push("High prompt clarity. The core objective is clearly articulated without subjective filler words.");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Great work! Try to increase context specificity or test alternative roles for even higher accuracy.");
  }
  
  return {
    score: finalScore,
    passed,
    rubricScorePct,
    semanticSimilarityPct,
    conceptCoveragePct,
    rubricScores,
    strengths,
    missingConcepts,
    suggestions,
    wordCount
  };
};
