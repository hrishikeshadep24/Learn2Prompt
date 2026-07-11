import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AnalysisRecord {
  id: string;
  prompt: string;
  category: string;
  model: string;
  optMode: "simple" | "balanced" | "advanced";
  score: number; // 0 to 100
  breakdown: {
    clarity: number;
    specificity: number;
    context: number;
    constraints: number;
    structure: number;
    reasoning: number;
    educational: number;
  };
  optimizedPrompt: string;
  originalOutput?: string;
  optimizedOutput?: string;
  hallucinationRisk: number; // 0 to 100
  hallucinationWarnings: string[];
  educationNotes?: string[];
  explainability: {
    lowScoreAreas: {
      field: string;
      issue: string;
      aiInterpretation: string;
      insight: string;
      suggestion: string;
    }[];
  };
  validationReport?: {
    reliabilityScore: number;
    consistencyScore: number;
    factualConfidence: number;
    hallucinationProbability?: number;
    confidenceAnalysis?: string;
    validationSummary?: string;
    riskyStatements?: string[];
    feedback: string[];
  };
  timestamp: number;
  saved?: boolean;
}

export interface ChallengeState {
  completedChallengeIds: string[];
  challengeScores: Record<string, number>; // id -> score
  xp: number;
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  unlockedAchievements: string[];
}

export interface LearnState {
  completedLessonIds: string[];
  quizScores: Record<string, number>; // lessonId -> score
}

interface AppSettings {
  geminiApiKey: string;
  theme: "dark" | "light";
}

interface AppStore {
  settings: AppSettings;
  history: AnalysisRecord[];
  challenges: ChallengeState;
  learning: LearnState;
  
  // Actions
  setGeminiApiKey: (key: string) => void;
  toggleTheme: () => void;
  addHistoryRecord: (record: AnalysisRecord) => void;
  toggleSavePrompt: (id: string) => void;
  deleteHistoryRecord: (id: string) => void;
  clearHistory: () => void;
  
  // Arena Actions
  completeChallenge: (challengeId: string, score: number) => { xpGained: number; levelUp: boolean; newStreak: boolean; newBadge: string | null };
  resetArena: () => void;
  
  // Learn Actions
  completeLesson: (lessonId: string) => void;
  saveQuizScore: (lessonId: string, score: number) => void;
}

// Gamification milestones
export const XP_PER_LEVEL = 1000;
export const LEVELS = [
  "Prompt Beginner",
  "Prompt Learner",
  "Prompt Crafter",
  "Prompt Engineer",
  "Prompt Architect",
  "Prompt Master"
];

export const getLevelFromXp = (xp: number): { levelName: string; levelNum: number; progress: number } => {
  const levelNum = Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, LEVELS.length);
  const levelName = LEVELS[levelNum - 1];
  const progress = Math.min(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100, 100);
  return { levelName, levelNum, progress };
};

export const ACHIEVEMENTS = [
  { id: "first_challenge", name: "First Challenge Completed", description: "Solved your first PromptArena practice challenge.", icon: "🎯" },
  { id: "perfect_score", name: "Perfect Score", description: "Achieved a score of 95+ on any challenge.", icon: "👑" },
  { id: "streak_3", name: "Consistency Crafter", description: "Maintained a 3-day prompting streak.", icon: "🔥" },
  { id: "hallucination_hunter", name: "Hallucination Hunter", description: "Ran prompt validation on 5 prompts.", icon: "👁️" },
  { id: "constraint_master", name: "Constraint Master", description: "Achieved maximum score in prompt constraints criteria.", icon: "⛓️" },
  { id: "academy_graduate", name: "Academy Graduate", description: "Completed all 15 educational prompting lessons.", icon: "🎓" }
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      settings: {
        geminiApiKey: "AIzaSyB000Z2CMC_k_uAkgTUvw_0Z_rT4Sj0Bqg",
        theme: "dark"
      },
      history: [],
      challenges: {
        completedChallengeIds: [],
        challengeScores: {},
        xp: 0,
        streak: 0,
        lastActiveDate: null,
        unlockedAchievements: []
      },
      learning: {
        completedLessonIds: [],
        quizScores: {}
      },
      
      setGeminiApiKey: (key) => set((state) => ({
        settings: { ...state.settings, geminiApiKey: key }
      })),
      
      toggleTheme: () => set((state) => ({
        settings: { ...state.settings, theme: state.settings.theme === "dark" ? "light" : "dark" }
      })),
      
      addHistoryRecord: (record) => set((state) => {
        // limit history to 50 items
        const newHistory = [record, ...state.history.filter(h => h.id !== record.id)].slice(0, 50);
        return { history: newHistory };
      }),
      
      toggleSavePrompt: (id) => set((state) => ({
        history: state.history.map((record) =>
          record.id === id ? { ...record, saved: !record.saved } : record
        )
      })),
      
      deleteHistoryRecord: (id) => set((state) => ({
        history: state.history.filter((record) => record.id !== id)
      })),
      
      clearHistory: () => set({ history: [] }),
      
      completeChallenge: (challengeId, score) => {
        const store = get();
        const currentChallenges = store.challenges;
        
        // Calculate XP gained: baseline 100XP + score-based bonus (e.g. 5 XP per point above passing threshold)
        const isFirstTime = !currentChallenges.completedChallengeIds.includes(challengeId);
        const prevScore = currentChallenges.challengeScores[challengeId] || 0;
        const scoreImproved = score > prevScore;
        
        let xpGained = 0;
        if (isFirstTime) {
          xpGained += 250; // Big bonus for first completion
          xpGained += Math.round(score * 2.5); // Score points
        } else if (scoreImproved) {
          // Gained XP for the score difference
          xpGained += Math.round((score - prevScore) * 2.5);
        }
        
        // Calculate streak
        const today = new Date().toISOString().split("T")[0];
        let newStreak = currentChallenges.streak;
        let streakUpdated = false;
        
        if (currentChallenges.lastActiveDate !== today) {
          if (currentChallenges.lastActiveDate) {
            const lastDate = new Date(currentChallenges.lastActiveDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreak += 1;
              streakUpdated = true;
            } else if (diffDays > 1) {
              newStreak = 1; // reset streak
              streakUpdated = true;
            }
          } else {
            newStreak = 1;
            streakUpdated = true;
          }
        }
        
        // Update achievements
        const newlyUnlockedBadges: string[] = [];
        const currentBadges = [...currentChallenges.unlockedAchievements];
        
        const checkAndUnlock = (id: string) => {
          if (!currentBadges.includes(id)) {
            currentBadges.push(id);
            newlyUnlockedBadges.push(id);
          }
        };
        
        checkAndUnlock("first_challenge");
        
        if (score >= 95) {
          checkAndUnlock("perfect_score");
        }
        if (newStreak >= 3) {
          checkAndUnlock("streak_3");
        }
        
        // Check constraint master criteria
        // Let's assume constraint master unlocks if they solve 3 Medium/Hard challenges
        const solvedCount = currentChallenges.completedChallengeIds.length + (isFirstTime ? 1 : 0);
        if (solvedCount >= 10) {
          checkAndUnlock("constraint_master");
        }
        
        const newXp = currentChallenges.xp + xpGained;
        const oldLevel = getLevelFromXp(currentChallenges.xp).levelNum;
        const newLevel = getLevelFromXp(newXp).levelNum;
        const levelUp = newLevel > oldLevel;
        
        set((state) => {
          const updatedIds = isFirstTime 
            ? [...state.challenges.completedChallengeIds, challengeId] 
            : state.challenges.completedChallengeIds;
            
          const updatedScores = {
            ...state.challenges.challengeScores,
            [challengeId]: Math.max(prevScore, score)
          };
          
          return {
            challenges: {
              completedChallengeIds: updatedIds,
              challengeScores: updatedScores,
              xp: newXp,
              streak: newStreak,
              lastActiveDate: today,
              unlockedAchievements: currentBadges
            }
          };
        });
        
        return {
          xpGained,
          levelUp,
          newStreak: streakUpdated,
          newBadge: newlyUnlockedBadges.length > 0 ? newlyUnlockedBadges[0] : null
        };
      },
      
      resetArena: () => set((state) => ({
        challenges: {
          completedChallengeIds: [],
          challengeScores: {},
          xp: 0,
          streak: 0,
          lastActiveDate: null,
          unlockedAchievements: []
        }
      })),
      
      completeLesson: (lessonId) => set((state) => {
        const completed = state.learning.completedLessonIds;
        const updated = completed.includes(lessonId) ? completed : [...completed, lessonId];
        
        // Check if all 15 lessons completed to unlock "academy_graduate"
        let badges = [...state.challenges.unlockedAchievements];
        if (updated.length >= 15 && !badges.includes("academy_graduate")) {
          badges.push("academy_graduate");
        }
        
        return {
          learning: {
            ...state.learning,
            completedLessonIds: updated
          },
          challenges: {
            ...state.challenges,
            unlockedAchievements: badges
          }
        };
      }),
      
      saveQuizScore: (lessonId, score) => set((state) => ({
        learning: {
          ...state.learning,
          quizScores: {
            ...state.learning.quizScores,
            [lessonId]: Math.max(state.learning.quizScores[lessonId] || 0, score)
          }
        }
      }))
    }),
    {
      name: "learn2prompt-storage",
      partialize: (state) => ({
        settings: state.settings,
        history: state.history,
        challenges: state.challenges,
        learning: state.learning
      })
    }
  )
);
