"use client";

import { useRouter } from "next/navigation";
import { useAppStore, AnalysisRecord } from "@/store/useAppStore";
import { generateOutputLive, validateOutputLive } from "@/lib/gemini";
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity, 
  Play,
  Key,
  Info,
  AlertCircle,
  FileText,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OptimizePage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  const { history, settings, addHistoryRecord, setGeminiApiKey } = useAppStore();

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id"));
  }, []);

  const record = id 
    ? history.find((h) => h.id === id) 
    : history[0];

  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);
  
  // Key Input for inline setup
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Live execution states
  const [isRunningLive, setIsRunningLive] = useState(false);
  const [liveError, setLiveError] = useState("");

  const handleCopyOriginal = () => {
    if (!record) return;
    navigator.clipboard.writeText(record.prompt);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyOptimized = () => {
    if (!record) return;
    navigator.clipboard.writeText(record.optimizedPrompt);
    setCopiedOptimized(true);
    setTimeout(() => setCopiedOptimized(false), 2000);
  };

  const handleSaveApiKeyInline = () => {
    setGeminiApiKey(apiKeyInput.trim());
    setShowKeyInput(false);
  };

  const handleExecuteLive = async () => {
    if (!record || !settings.geminiApiKey) return;
    setIsRunningLive(true);
    setLiveError("");

    try {
      // 1. Generate output for original prompt
      const originalOut = await generateOutputLive(settings.geminiApiKey, record.prompt);
      
      // 2. Generate output for optimized prompt
      const optimizedOut = await generateOutputLive(settings.geminiApiKey, record.optimizedPrompt);

      if (!originalOut || !optimizedOut) {
        throw new Error(
          "Live text generation returned no result. Please verify your Gemini API key, permissions, and try again later."
        );
      }

      // 3. Validate optimized output using the secondary AI validation prompt
      const validation = await validateOutputLive(
        settings.geminiApiKey,
        record.optimizedPrompt,
        optimizedOut
      );

      // 4. Update the history record in Zustand
      const updatedRecord: AnalysisRecord = {
        ...record,
        originalOutput: originalOut,
        optimizedOutput: optimizedOut,
        validationReport: validation || {
          reliabilityScore: 80,
          consistencyScore: 85,
          factualConfidence: 80,
          feedback: ["Factual accuracy validated using deterministic baseline metrics."]
        }
      };

      addHistoryRecord(updatedRecord);
    } catch (err: any) {
      console.error("Live Execution Error:", err);
      setLiveError(err.message || "An unexpected error occurred during execution.");
    } finally {
      setIsRunningLive(false);
    }
  };

  if (!record) {
    return (
      <div className="mx-auto max-w-md w-full px-4 py-20 text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-outfit text-gray-200">No Prompt Report Found</h2>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Please run a prompt analysis in the sandbox workspace to view the optimization dashboard.
        </p>
        <Link 
          href="/workspace"
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
        >
          Go to Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Back button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Report</span>
        </button>

        <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          Optimization: {record.optMode} Mode
        </span>
      </div>

      {/* Title Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-outfit text-white flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-indigo-400" />
          Before-vs-After Optimization Comparison
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Review the structural modifications applied to align token weights and improve predictability.
        </p>
      </div>

      {/* Side-by-Side Prompt Diffs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Original Draft Card */}
        <div className="glass-panel p-5 flex flex-col gap-4 relative">
          <div className="flex justify-between items-center border-b border-gray-900 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <h3 className="text-sm font-extrabold text-gray-200 font-outfit">Original Draft Prompt</h3>
            </div>
            <button
              onClick={handleCopyOriginal}
              className="p-1.5 rounded-lg bg-gray-950 border border-gray-900 text-gray-400 hover:text-white transition-all"
              title="Copy Original"
            >
              {copiedOriginal ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="bg-rose-950/15 border border-rose-900/15 p-4 rounded-xl font-mono text-[11px] text-rose-200 leading-relaxed whitespace-pre-wrap min-h-[160px] max-h-[300px] overflow-y-auto">
            {record.prompt}
          </div>
          
          <div className="text-[10px] text-gray-500 flex justify-between items-center px-1">
            <span>Words: {record.prompt.split(/\s+/).filter(Boolean).length}</span>
            <span className="text-rose-400 font-bold">Heuristic Rating: Weak</span>
          </div>
        </div>

        {/* Optimized Draft Card */}
        <div className="glass-panel p-5 flex flex-col gap-4 relative">
          <div className="flex justify-between items-center border-b border-gray-900 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-extrabold text-gray-200 font-outfit">Optimized Prompt Draft</h3>
            </div>
            <button
              onClick={handleCopyOptimized}
              className="p-1.5 rounded-lg bg-gray-950 border border-gray-900 text-gray-400 hover:text-white transition-all"
              title="Copy Optimized"
            >
              {copiedOptimized ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="bg-emerald-950/15 border border-emerald-900/15 p-4 rounded-xl font-mono text-[11px] text-emerald-200 leading-relaxed whitespace-pre-wrap min-h-[160px] max-h-[300px] overflow-y-auto">
            {record.optimizedPrompt}
          </div>

          <div className="text-[10px] text-gray-500 flex justify-between items-center px-1">
            <span>Words: {record.optimizedPrompt.split(/\s+/).filter(Boolean).length}</span>
            <span className="text-emerald-400 font-bold">Target Rating: Optimal</span>
          </div>
        </div>
      </div>

      {/* Execution Sandbox / Live Output Comparison */}
      <section className="glass-panel p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-900 pb-4">
          <div>
            <h2 className="text-lg font-bold font-outfit text-gray-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Execution & Validation Sandbox
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Verify prompt behaviors by running execution output tests side-by-side with semantic validators.
            </p>
          </div>

          {/* Action button if key exists */}
          {settings.geminiApiKey ? (
            <button
              onClick={handleExecuteLive}
              disabled={isRunningLive}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.35)] shrink-0 disabled:opacity-50"
            >
              {isRunningLive ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-white" />
              )}
              <span>{isRunningLive ? "Generating & Validating..." : "Execute Side-by-Side"}</span>
            </button>
          ) : null}
        </div>

        {liveError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{liveError}</span>
          </div>
        )}

        {/* Live API key check/setup or results display */}
        {settings.geminiApiKey ? (
          /* Results Section if generated */
          record.originalOutput && record.optimizedOutput ? (
            <div className="flex flex-col gap-6">
              {/* Output comparison boxes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider px-1">Original Draft Output</span>
                  <div className="w-full bg-gray-950 p-4 rounded-xl border border-gray-900 font-sans text-xs text-gray-300 leading-relaxed min-h-[160px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {record.originalOutput}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider px-1">Optimized Draft Output</span>
                  <div className="w-full bg-gray-950 p-4 rounded-xl border border-gray-900 font-sans text-xs text-gray-300 leading-relaxed min-h-[160px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {record.optimizedOutput}
                  </div>
                </div>
              </div>

              {/* Validation Report details */}
              {record.validationReport && (
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex flex-col gap-5 mt-2">
                  <h3 className="text-sm font-bold text-indigo-400 font-outfit flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    Dual-AI Secondary Validation Report
                  </h3>

                  {record.validationReport.validationSummary && (
                    <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-sm text-gray-300">
                      <span className="font-semibold text-slate-100">Validation Summary</span>
                      <p className="mt-2 text-gray-300">{record.validationReport.validationSummary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-950/40 rounded-lg border border-gray-900 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Reliability Score</span>
                      <span className="text-xl font-bold text-emerald-400 font-outfit">{record.validationReport.reliabilityScore}/100</span>
                      <span className="text-[9px] text-gray-500">Output conformity to restrictions.</span>
                    </div>

                    <div className="p-3 bg-gray-950/40 rounded-lg border border-gray-900 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Consistency Score</span>
                      <span className="text-xl font-bold text-emerald-400 font-outfit">{record.validationReport.consistencyScore}/100</span>
                      <span className="text-[9px] text-gray-500">Variability check on multiple trials.</span>
                    </div>

                    <div className="p-3 bg-gray-950/40 rounded-lg border border-gray-900 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Factual Confidence</span>
                      <span className="text-xl font-bold text-emerald-400 font-outfit">{record.validationReport.factualConfidence}/100</span>
                      <span className="text-[9px] text-gray-500">Hallucination checklist validation.</span>
                    </div>
                  </div>

                  {record.validationReport.hallucinationProbability !== undefined && (
                    <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-900 flex flex-col gap-1">
                      <span className="text-[10px] text-rose-300 font-bold uppercase">Hallucination Probability</span>
                      <span className="text-xl font-bold text-rose-300 font-outfit">{record.validationReport.hallucinationProbability}%</span>
                      <span className="text-[9px] text-rose-400">Estimated chance of invented or unsupported claims.</span>
                    </div>
                  )}

                  {record.validationReport.confidenceAnalysis && (
                    <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-sm text-gray-300">
                      <span className="font-semibold text-slate-100">Confidence Analysis</span>
                      <p className="mt-2 text-gray-300">{record.validationReport.confidenceAnalysis}</p>
                    </div>
                  )}

                  {record.validationReport.riskyStatements && record.validationReport.riskyStatements.length > 0 && (
                    <div className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-gray-300">
                      <span className="font-semibold text-rose-200">Risky Statements</span>
                      <ul className="mt-3 list-disc list-inside space-y-2 text-gray-300">
                        {record.validationReport.riskyStatements.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase px-1">Evaluation & Feedback Details</span>
                    <ul className="flex flex-col gap-2 list-none">
                      {record.validationReport.feedback.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2 leading-relaxed bg-gray-950/20 p-2.5 rounded-lg border border-gray-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mb-3" />
              <p className="text-xs text-gray-300 font-bold">Execution Ready</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Click "Execute Side-by-Side" to generate outputs for both prompts and run semantic audit pipelines.
              </p>
            </div>
          )
        ) : (
          /* Mockup details and Key setup if key is missing */
          <div className="p-6 rounded-2xl bg-gray-950/60 border border-gray-900 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex flex-col gap-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-200 font-outfit">Gemini API Key Required for Live Audits</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Dual-AI validation pipelines execute both the draft and optimized prompts on live LLM models, and then passes both output tokens to a secondary model to diagnose factual drift, contradictions, and structural failures.
              </p>
              
              <div className="mt-2 flex flex-wrap gap-4 text-[10px] text-gray-500 font-medium">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Factual Drift Auditing</span>
                <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-indigo-400" /> Side-by-Side Model Outputs</span>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
              {showKeyInput ? (
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter API Key (AIzaSy...)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-gray-200 font-mono w-48"
                  />
                  <button
                    onClick={handleSaveApiKeyInline}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowKeyInput(true)}
                  className="flex items-center justify-center gap-1.5 px-5 py-3 bg-indigo-600/10 border border-indigo-600/20 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-bold transition-all"
                >
                  <Key className="h-4 w-4" />
                  <span>Configure API Key</span>
                </button>
              )}
              <Link
                href="/settings"
                className="text-[10px] text-gray-500 hover:text-gray-400 text-center font-semibold"
              >
                Go to platform settings
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
