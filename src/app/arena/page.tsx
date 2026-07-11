"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Challenge, evaluateChallengePrompt } from "@/lib/similarity";
import challengeData from "@/data/challenges.json";
import Link from "next/link";
import { Award, Sparkles, Eye, ArrowRight, CheckCircle2, Bolt, ShieldCheck, Info, ClipboardCheck } from "lucide-react";

const challenges = challengeData as Challenge[];
const difficultyOptions = ["All", "Easy", "Medium", "Hard"] as const;

export default function ArenaPage() {
  const { challenges: challengeState, completeChallenge } = useAppStore();
  const [filter, setFilter] = useState<(typeof difficultyOptions)[number]>("All");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [evaluation, setEvaluation] = useState<ReturnType<typeof evaluateChallengePrompt> | null>(null);
  const [submissionSummary, setSubmissionSummary] = useState<string>("");

  const filteredChallenges = useMemo(() => {
    return filter === "All" ? challenges : challenges.filter((item) => item.difficulty === filter);
  }, [filter]);

  const challengeBestScore = selectedChallenge ? challengeState.challengeScores[selectedChallenge.id] ?? 0 : 0;

  const handleEvaluate = () => {
    if (!selectedChallenge || !userPrompt.trim()) return;
    const result = evaluateChallengePrompt(userPrompt, selectedChallenge);
    setEvaluation(result);
    setSubmissionSummary("");
  };

  const handleSubmit = () => {
    if (!selectedChallenge || !evaluation) return;
    const outcome = completeChallenge(selectedChallenge.id, evaluation.score);
    setSubmissionSummary(`Challenge submitted! Score: ${evaluation.score}. ${outcome.xpGained} XP gained${outcome.levelUp ? ", level up unlocked" : ""}${outcome.newStreak ? ", streak updated" : ""}${outcome.newBadge ? ", badge earned" : ""}.`);
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            <Sparkles className="h-4 w-4" />
            PromptArena Practice
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit text-white mt-4">Interactive Prompt Challenges</h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Solve graded prompt design tasks that evaluate relevance, coverage, structure, and semantic alignment.
          </p>
        </div>

        <Link href="/analytics" className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-5 py-3 text-xs font-semibold text-white/80 hover:bg-indigo-500/15 transition">
          <Award className="h-4 w-4 text-indigo-300" /> View Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-4">Filter by Difficulty</h2>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition ${filter === option ? "bg-cyan-500 text-slate-950" : "bg-gray-950/70 text-gray-300 hover:bg-gray-900"}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-gray-950/50 p-4 border border-gray-800">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">Challenge Mastery</p>
              <p className="text-3xl font-bold text-white">{challengeState.completedChallengeIds.length}</p>
              <p className="text-sm text-gray-400 mt-1">Completed challenges</p>
            </div>
            <div className="rounded-3xl bg-gray-950/50 p-4 border border-gray-800">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">Current Streak</p>
              <p className="text-3xl font-bold text-white">{challengeState.streak || 0}</p>
              <p className="text-sm text-gray-400 mt-1">Days with activity</p>
            </div>
            <div className="rounded-3xl bg-gray-950/50 p-4 border border-gray-800">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">Total XP</p>
              <p className="text-3xl font-bold text-white">{challengeState.xp}</p>
              <p className="text-sm text-gray-400 mt-1">Progress inside Learn2Prompt</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 border border-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Selected Challenge</h2>
              <p className="text-sm text-gray-400 mt-1">Pick a prompt challenge and submit your best draft for evaluation.</p>
            </div>
            {selectedChallenge && (
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-xs text-indigo-300 border border-indigo-500/20">
                <Award className="h-4 w-4" /> Best Score: {challengeBestScore}/100
              </span>
            )}
          </div>

          {selectedChallenge ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-gray-950/40 p-5 border border-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{selectedChallenge.difficulty} Challenge</span>
                    <h3 className="text-2xl font-bold text-white mt-3">{selectedChallenge.title}</h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Min length {selectedChallenge.min_length}</span>
                </div>
                <p className="text-sm text-gray-300 mt-4 whitespace-pre-line">{selectedChallenge.problem}</p>
                <p className="text-xs text-gray-400 mt-4">Hint: {selectedChallenge.hints}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-gray-950/50 p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Rubric</p>
                  <div className="space-y-3">
                    {selectedChallenge.rubric.map((item) => (
                      <div key={item.name} className="rounded-2xl bg-gray-900/70 p-3 border border-gray-800">
                        <p className="text-sm text-white font-semibold">{item.name}</p>
                        <p className="text-[11px] text-gray-400">Score range: {item.min}-{item.max}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-gray-950/50 p-4 border border-gray-800">
                  <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Your Prompt</p>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={9}
                    placeholder="Write your prompt here. Include the task, audience, format, and any constraints."
                    className="w-full bg-gray-950 border border-gray-900 rounded-3xl p-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleEvaluate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-indigo-400 transition"
                >
                  <Eye className="h-4 w-4" /> Evaluate Prompt
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!evaluation}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  <ClipboardCheck className="h-4 w-4" /> Submit Challenge
                </button>
              </div>

              {submissionSummary && (
                <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-200">
                  {submissionSummary}
                </div>
              )}

              {evaluation && (
                <div className="rounded-3xl bg-gray-950/40 p-5 border border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Evaluation Summary</h4>
                      <p className="text-xs text-gray-400">Score, coverage, and suggestions based on your submission.</p>
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${evaluation.passed ? "text-emerald-300" : "text-rose-300"}`}>
                      {evaluation.passed ? "Passed" : "Needs Improvement"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-gray-900/70 p-4 border border-gray-800">
                      <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Overall</p>
                      <p className="text-3xl font-bold text-white">{evaluation.score}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-900/70 p-4 border border-gray-800">
                      <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Similarity</p>
                      <p className="text-3xl font-bold text-white">{Math.round(evaluation.semanticSimilarityPct)}%</p>
                    </div>
                    <div className="rounded-2xl bg-gray-900/70 p-4 border border-gray-800">
                      <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Coverage</p>
                      <p className="text-3xl font-bold text-white">{Math.round(evaluation.conceptCoveragePct)}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-gray-950/60 p-4 border border-gray-800">
                      <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Strengths</p>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                        {evaluation.strengths.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-gray-950/60 p-4 border border-gray-800">
                      <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Suggestions</p>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                        {evaluation.suggestions.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-gray-950/40 p-8 border border-gray-800 text-center text-sm text-gray-400">
              <p className="text-white font-semibold">Select a challenge to begin.</p>
              <p className="mt-2">Make sure your prompt is detailed, specifies the task clearly, and includes formatting constraints.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => (
          <button
            key={challenge.id}
            onClick={() => {
              setSelectedChallenge(challenge);
              setUserPrompt("");
              setEvaluation(null);
              setSubmissionSummary("");
            }}
            className={`text-left rounded-3xl p-5 border transition ${selectedChallenge?.id === challenge.id ? "border-cyan-500 bg-cyan-500/10" : "border-gray-800 bg-gray-950/50 hover:border-gray-700 hover:bg-gray-900"}`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mt-1">{challenge.difficulty}</p>
              </div>
              <span className="text-[11px] text-gray-300 bg-gray-900/70 px-3 py-1 rounded-full">{challenge.min_length}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">{challenge.problem}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-cyan-300 font-semibold uppercase tracking-[0.18em]">
              <span>{challengeState.challengeScores[challenge.id] ?? 0}%</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
