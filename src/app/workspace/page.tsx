"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, AnalysisRecord } from "@/store/useAppStore";
import { evaluatePromptHeuristically } from "@/lib/heuristics";
import { analyzePromptLive, optimizePromptLive } from "@/lib/gemini";
import { promptTemplates } from "@/data/templates";
import { 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Trash2, 
  Play, 
  Copy, 
  Check, 
  Folder, 
  Cpu, 
  History, 
  FileText,
  AlertCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCard } from "@/components/VisualScore";

export default function WorkspacePage() {
  const router = useRouter();
  const { settings, addHistoryRecord, history, deleteHistoryRecord } = useAppStore();
  
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState("General");
  const [optMode, setOptMode] = useState<"simple" | "balanced" | "advanced">("balanced");
  const [model, setModel] = useState("gemini-2.5-flash");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadId = params.get("load");
    if (loadId) {
      const record = history.find((item) => item.id === loadId);
      if (record) {
        setPromptText(record.prompt);
        setCategory(record.category);
        setOptMode(record.optMode);
      }
    }
  }, [history]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [activeTab, setActiveTab] = useState<"templates" | "history">("templates");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    "General", "Coding", "Image", "Marketing", 
    "Research", "Resume", "Learning", "Storytelling", "AI Agents"
  ];

  const wordCount = promptText.split(/\s+/).filter(Boolean).length;
  const charCount = promptText.length;

  const handleCopyTemplate = (text: string, id: string) => {
    setPromptText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setPromptText("");
  };

  const handleAnalyze = async () => {
    if (!promptText.trim()) return;
    setIsAnalyzing(true);
    setLiveError("");

    try {
      let result;
      const apiKey = settings.geminiApiKey;

      if (apiKey) {
        // Try live analysis first
        const liveResult = await analyzePromptLive(apiKey, promptText, category);
        if (liveResult) {
          result = {
            ...liveResult,
            optimizedPrompt: liveResult.suggestionsList ? liveResult.suggestionsList.join(". ") : promptText
          };
        } else {
          setLiveError(
            "Live Gemini analysis is currently unavailable. The app is using the local heuristic analyzer instead."
          );
        }
      }

      // Fallback to local heuristic engine if live failed or no API key
      if (!result) {
        result = evaluatePromptHeuristically(promptText, category);
      }

      // Create record
      const recordId = Math.random().toString(36).substring(2, 9);
      const newRecord: AnalysisRecord = {
        id: recordId,
        prompt: promptText,
        category,
        model: apiKey ? "Gemini 2.5 Flash" : "Heuristic Engine (Local)",
        optMode,
        score: result.score,
        breakdown: result.breakdown,
        optimizedPrompt: result.optimizedPrompt,
        hallucinationRisk: result.hallucinationRisk,
        hallucinationWarnings: result.hallucinationWarnings,
        educationNotes: result.educationNotes || [],
        explainability: {
          lowScoreAreas: result.explainability || []
        },
        timestamp: Date.now()
      };

      addHistoryRecord(newRecord);
      router.push(`/analyze?id=${recordId}`);
    } catch (error: any) {
      console.error("Workspace Evaluation Error:", error);
      setLiveError(
        String(error?.message || "An unexpected error occurred during analysis. Please try again.")
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!promptText.trim()) return;
    setIsAnalyzing(true);
    setLiveError("");

    try {
      let result = evaluatePromptHeuristically(promptText, category, optMode);
      const apiKey = settings.geminiApiKey;

      if (apiKey) {
        const liveResult = await optimizePromptLive(apiKey, promptText, optMode, category);
        if (liveResult && liveResult.optimizedPrompt) {
          result.optimizedPrompt = liveResult.optimizedPrompt;
        } else {
          setLiveError(
            "Live Gemini optimization is currently unavailable. The app is using the local heuristic optimizer instead."
          );
        }
      }

      const recordId = Math.random().toString(36).substring(2, 9);
      const newRecord: AnalysisRecord = {
        id: recordId,
        prompt: promptText,
        category,
        model: apiKey ? "Gemini 2.5 Flash" : "Heuristic Engine (Local)",
        optMode,
        score: result.score,
        breakdown: result.breakdown,
        optimizedPrompt: result.optimizedPrompt,
        hallucinationRisk: result.hallucinationRisk,
        hallucinationWarnings: result.hallucinationWarnings,
        educationNotes: result.educationNotes || [],
        explainability: {
          lowScoreAreas: result.explainability || []
        },
        timestamp: Date.now()
      };

      addHistoryRecord(newRecord);
      router.push(`/optimize?id=${recordId}`);
    } catch (error) {
      console.error("Workspace Optimization Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-grow flex flex-col md:flex-row gap-6">
      {/* Left Workspace Panel */}
      <div className="flex-grow md:w-3/5 flex flex-col gap-6">
        <div className="glass-panel p-6 flex flex-col gap-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-outfit text-white flex items-center gap-2">
                <Terminal className="h-6 w-6 text-indigo-400" />
                Prompt Sandbox Workspace
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Draft your prompt, select execution controls, and run structural diagnostics.
              </p>
            </div>
            
            {/* API Warning badge */}
            {!settings.geminiApiKey && (
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Heuristic Engine Active
              </span>
            )}
          </div>

          {liveError && (
            <AlertCard
              type="warning"
              title="Live Gemini unavailable"
              message={liveError}
            />
          )}

          {/* Prompt input box */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-gray-400 px-1">
              <span className="font-semibold">Enter Draft Prompt</span>
              <span className="font-mono">{wordCount} words / {charCount} chars</span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., Explain quantum physics using simple analogies, avoid technical jargon, and keep it under 100 words."
              className="w-full min-h-[260px] bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-xl p-4 text-sm text-gray-200 focus:outline-none transition-all resize-y font-sans leading-relaxed"
            />
          </div>

          {/* Selectors grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-indigo-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Optimization Mode Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Optimize Mode
              </label>
              <select
                value={optMode}
                onChange={(e) => setOptMode(e.target.value as any)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="simple">Simple</option>
                <option value="balanced">Balanced</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Target Model Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Target Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                disabled={!settings.geminiApiKey}
              >
                {settings.geminiApiKey ? (
                  <>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </>
                ) : (
                  <option value="local-heuristic">Local Heuristics</option>
                )}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-900 justify-between">
            <button
              onClick={handleClear}
              disabled={!promptText.trim() || isAnalyzing}
              className="flex items-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-gray-800"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Draft</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleOptimize}
                disabled={!promptText.trim() || isAnalyzing}
                className="flex items-center gap-2 px-5 py-3 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-xs font-bold transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Optimize Sidebar</span>
              </button>

              <button
                onClick={handleAnalyze}
                disabled={!promptText.trim() || isAnalyzing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white rounded-xl text-xs font-bold transition-all"
              >
                {isAnalyzing ? (
                  <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isAnalyzing ? "Processing..." : "Analyze Prompt"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Panel */}
      <div className="md:w-2/5 flex flex-col gap-6 shrink-0">
        <div className="glass-panel p-5 flex flex-col gap-4 flex-grow min-h-[500px]">
          {/* Tab Controls */}
          <div className="flex border-b border-gray-850 pb-2">
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${
                activeTab === "templates" 
                  ? "border-indigo-500 text-white" 
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Templates Library
              </span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${
                activeTab === "history" 
                  ? "border-indigo-500 text-white" 
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                Saved & History
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-grow overflow-y-auto max-h-[500px] pr-1">
            {activeTab === "templates" ? (
              <div className="flex flex-col gap-3">
                {promptTemplates.map((template) => (
                  <div 
                    key={template.id} 
                    className="p-3.5 rounded-xl bg-gray-900/30 border border-gray-850/60 flex flex-col gap-2 hover:bg-gray-900/60 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {template.category}
                        </span>
                        <h3 className="text-xs font-extrabold text-gray-200 mt-1.5 tracking-tight font-outfit">
                          {template.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleCopyTemplate(template.prompt, template.id)}
                        className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all group-hover:border-indigo-500/30"
                        title="Load Template"
                      >
                        {copiedId === template.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-[11px] text-gray-400 leading-relaxed italic border-l border-indigo-500/30 pl-2 mt-1">
                      "{template.prompt.length > 90 ? template.prompt.substring(0, 90) + '...' : template.prompt}"
                    </p>

                    <div className="mt-1 flex flex-col gap-1 text-[10px] text-gray-500 leading-relaxed bg-gray-950/40 p-2.5 rounded-lg border border-gray-900">
                      <strong>Why it works:</strong> {template.whyItWorks}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Clock className="h-8 w-8 text-gray-600 mb-3" />
                    <p className="text-xs text-gray-400">No prompt analysis history found.</p>
                    <p className="text-[10px] text-gray-500 mt-1">Run your first prompt evaluation to populate history.</p>
                  </div>
                ) : (
                  history.map((record) => (
                    <div 
                      key={record.id}
                      className="p-3 rounded-xl bg-gray-900/20 border border-gray-850 flex flex-col gap-2 hover:bg-gray-900/40 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] bg-gray-800 text-gray-300 font-bold px-2 py-0.5 rounded">
                              {record.category}
                            </span>
                            <span className={`text-[10px] font-bold ${
                              record.score >= 80 ? "text-emerald-400" : record.score >= 50 ? "text-amber-400" : "text-rose-400"
                            }`}>
                              Score: {record.score}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1">
                            {new Date(record.timestamp).toLocaleDateString()} at {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPromptText(record.prompt)}
                            className="p-1 rounded bg-gray-900 border border-gray-850 hover:bg-gray-800 text-[10px] text-indigo-400 font-semibold px-2 py-1 transition-all"
                            title="Load Prompt"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => router.push(`/analyze?id=${record.id}`)}
                            className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-[10px] text-indigo-400 font-semibold px-2 py-1 transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteHistoryRecord(record.id)}
                            className="p-1 rounded bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-[10px] text-rose-400 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed bg-gray-950/40 p-2 rounded-lg border border-gray-900 font-mono">
                        "{record.prompt}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
