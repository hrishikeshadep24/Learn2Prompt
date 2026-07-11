export interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  prompt: string;
  whyItWorks: string;
  bestPractices: string[];
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: "code_review",
    category: "Coding",
    title: "Expert Code Quality Reviewer",
    prompt: "Act as an expert Senior Software Engineer and Code Security Auditor. Review the following code snippet for potential performance bottlenecks, security vulnerabilities (like SQL injection or XSS), and style issues. For each issue identified, explain the risk, suggest a refactored alternative, and state the reasoning behind your fix:\n\n[INSERT CODE HERE]",
    whyItWorks: "It uses role-prompting ('expert Senior Software Engineer') to set a persona, sets a clear scope of work (performance, security, style), and enforces a structured output schema (risk, fix, reasoning) which forces logical consistency.",
    bestPractices: [
      "Explicitly specify what security risks to scan for.",
      "Ask for a structured table or bullet-point output.",
      "Provide a specific language version (e.g., ES6, Python 3.10) for maximum accuracy."
    ]
  },
  {
    id: "few_shot_research",
    category: "Research",
    title: "Systematic Literature Review Summarizer",
    prompt: "You are a research assistant compiling a summary matrix of academic abstracts. For each abstract provided, extract: 1) Research Goal, 2) Methodology, 3) Key Findings, 4) Limitations. \n\nExample:\nAbstract: 'This study evaluated X using Y method. We found Z.'\nOutput:\n- Goal: Evaluate X\n- Method: Y method\n- Findings: Z\n- Limitations: Sample size not stated.\n\nNow extract the same structure for this abstract: [INSERT ABSTRACT HERE]",
    whyItWorks: "This is a few-shot prompt that uses concrete examples to establish the target formatting schema and structural boundaries, significantly reducing formatting drift.",
    bestPractices: [
      "Include realistic, high-quality examples in the few-shot demonstrations.",
      "Keep the output structure consistent between your examples and the instructions.",
      "Define what should be done if information is missing."
    ]
  },
  {
    id: "marketing_copy",
    category: "Marketing",
    title: "AIDA Framework Copywriter",
    prompt: "Create an engaging social media ad copy for a new eco-friendly water bottle using the AIDA framework (Attention, Interest, Desire, Action). Target active college students. Keep the tone enthusiastic, modern, and punchy. Limit the total copy to 150 words and include a clear call-to-action (CTA).",
    whyItWorks: "It references a proven marketing framework (AIDA), sets a precise audience (active college students), provides tone constraints (enthusiastic, modern, punchy), and defines length boundaries.",
    bestPractices: [
      "Always specify the target demographic/audience.",
      "Explicitly state the desired length constraint (word limit, sentence count).",
      "Mention specific copywriting frameworks like AIDA, PAS (Problem-Agitate-Solve), or BAB."
    ]
  },
  {
    id: "resume_aligner",
    category: "Resume",
    title: "Job-to-Resume Keyword Optimizer",
    prompt: "You are a professional career coach. Review my resume details against this target job description. Identify the top 5 missing skills or keywords in my resume that are highly relevant to the job, and write 3 tailored resume bullet points highlighting my experience in these areas using the STAR method (Situation, Task, Action, Result).\n\nMy Resume: [INSERT RESUME]\nJob Description: [INSERT JOB DESCRIPTION]",
    whyItWorks: "It defines a targeted matching task, instructs the model to use the STAR method for generating content, and constrains output to 5 keywords and 3 bullets.",
    bestPractices: [
      "Provide clear input separators (e.g. My Resume: and Job Description:).",
      "Ask for actionable adjustments instead of general feedback.",
      "Direct the AI to preserve factual truth and avoid inventing projects."
    ]
  },
  {
    id: "concept_learning",
    category: "Learning",
    title: "Feynman Technique Teacher",
    prompt: "Explain the concept of '[INSERT CONCEPT]' using the Feynman Technique. First, explain it to a 10-year-old child using simple analogies (avoiding jargon). Second, explain it to a college freshman using formal scientific terms. Third, highlight the key gaps where the child analogy simplifies the real scientific details.",
    whyItWorks: "It prompts the model to generate multiple levels of explanations (progressive disclosure) and compare them, prompting deeper contextual understanding.",
    bestPractices: [
      "Provide specific age-targets for the analogies.",
      "Ask the model to list what the analogies leave out to avoid forming misconceptions.",
      "Request summaries of key terms."
    ]
  },
  {
    id: "storytelling_outline",
    category: "Storytelling",
    title: "Hero's Journey Narrative Arc Planner",
    prompt: "Outline a sci-fi short story plot about a technician discovering a signal from a dead star, following the 3-act structure based on the Hero's Journey. For each major stage (Ordinary World, Call to Adventure, Ordeal, Resurrection), write a 2-sentence summary and describe the emotional conflict of the main character.",
    whyItWorks: "It anchors the storytelling in a specific structure (3-act, Hero's Journey) and enforces length and depth parameters for each stage.",
    bestPractices: [
      "Establish the specific genre and character motivations.",
      "Divide the story outline into explicit acts or stages.",
      "Instruct the model to focus on character development alongside plot points."
    ]
  },
  {
    id: "ai_agent_reasoning",
    category: "AI Agents",
    title: "ReAct System Prompt Executor",
    prompt: "You are an AI Agent resolving a user query. Follow a Thought-Action-Observation cycle to determine the answer. For every step:\n1. Write a 'Thought' explaining what information is needed.\n2. Write an 'Action' indicating what tool or step to take next.\n3. Stop for 'Observation' (simulated context).\n\nUser Query: Find the optimal temperature settings for storing raw coffee beans and explain why.",
    whyItWorks: "It implements ReAct (Reasoning and Acting) formatting directly, encouraging step-by-step logical planning and preventing hallucination.",
    bestPractices: [
      "Define exactly what tools or steps are available.",
      "Ensure the model labels each stage explicitly ('Thought:', 'Action:', 'Observation:').",
      "Keep instructions strictly separated from execution data."
    ]
  },
  {
    id: "image_generation_prompt",
    category: "Image Generation",
    title: "Photorealistic Midjourney Prompt Crafter",
    prompt: "Generate a detailed descriptive prompt for a text-to-image AI model. The subject should be a futuristic laboratory. Include details about: 1) Composition (wide-angle, cinematic), 2) Lighting (glowing cyan neon accents, dramatic shadows), 3) Textures and style (photorealistic, clean glass surfaces, sleek metallic panels), 4) Camera details (shot on 35mm lens, f/1.8). Join these details into a single cohesive paragraph followed by typical generation tags like '--ar 16:9 --style raw'.",
    whyItWorks: "Text-to-image models depend on visual details (lighting, composition, camera parameters) rather than abstract ideas. This template structures these parameters precisely.",
    bestPractices: [
      "Specify styling categories: lighting, camera gear, atmosphere, and composition.",
      "Avoid vague quality words like 'beautiful' or 'hyperrealistic'; instead describe tangible objects and textures.",
      "Specify aspect ratios or style seeds clearly."
    ]
  }
];
