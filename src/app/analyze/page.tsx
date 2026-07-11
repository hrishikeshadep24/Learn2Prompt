"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import VisualScore, { ParameterBar, AlertCard } from "@/components/VisualScore";
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck,
  HelpCircle, 
  CheckCircle2, 
  Info,
  Calendar,
  Cpu,
  Bookmark,
  Share2,
  Undo2,
  Settings,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AnalyzePage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  
  const { history, toggleSavePrompt } = useAppStore();
  
  // Find record in history, default to the latest if no id or not found
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id"));
  }, []);

  const record = id 
    ? history.find((h) => h.id === id) 
    : history[0];

  const [isSaved, setIsSaved] = useState(record?.saved || false);

  useEffect(() => {
    setIsSaved(record?.saved || false);
  }, [record]);

  if (!record) {
    return (
      <div className="mx-auto max-w-md w-full px-4 py-20 text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-outfit text-gray-200">No Prompt Report Found</h2>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Please run a prompt analysis in the sandbox workspace to view the explainable analytics dashboard.
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

  const handleToggleSave = () => {
    toggleSavePrompt(record.id);
    setIsSaved(!isSaved);
  };

  const formattedDate = new Date(record.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formattedTime = new Date(record.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Back button & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all border ${
              isSaved 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" 
                : "bg-gray-900 border-gray-850 text-gray-400 hover:text-white"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-indigo-500" : ""}`} />
            <span>{isSaved ? "Saved" : "Save Prompt"}</span>
          </button>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(record.prompt);
              alert("Original prompt copied to clipboard!");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 border border-gray-850 hover:bg-gray-850 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all"
          >
            <Share2 className="h-4 w-4" />
            <span>Copy Prompt</span>
          </button>
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className="glass-panel p-6 mb-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        {/* Info */}
        <div className="flex-grow flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="shrink-0">
            <VisualScore score={record.score} size="lg" />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold px-3 py-1 rounded-full w-fit mx-auto md:mx-0 uppercase tracking-wider">
              {record.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit text-white mt-1">
              Prompt Intelligence Report
            </h1>
            
            {/* Meta details */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-400 mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                {formattedDate} at {formattedTime}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-gray-800 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Model: <span className="font-semibold text-gray-200">{record.model}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick CTA */}
        <div className="shrink-0 flex flex-col gap-3 w-full lg:w-auto">
          <Link 
            href={`/optimize?id=${record.id}`}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white rounded-xl text-xs font-bold transition-all text-center"
          >
            <Sparkles className="h-4 w-4" />
            <span>Optimize Draft Prompt</span>
          </Link>
          <button
            onClick={() => router.push(`/workspace?load=${record.id}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 border border-gray-850 hover:bg-gray-850 text-gray-200 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <Undo2 className="h-4 w-4 text-cyan-400" />
            <span>Load & Edit in Sandbox</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Scores & Warnings & Insights */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Rubric Parameter Scores */}
          <section className="glass-panel p-6">
            <h2 className="text-lg font-bold font-outfit text-gray-100 mb-5 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              Rubric Parameter Scores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ParameterBar 
                label="Clarity & Specificity" 
                value={record.breakdown.clarity} 
                max={3} 
                description="Are instructions unambiguous and detailed?" 
              />
              <ParameterBar 
                label="Instructional Specificity" 
                value={record.breakdown.specificity} 
                max={3} 
                description="Presence of core instruction keywords and length." 
              />
              <ParameterBar 
                label="Context & Detail" 
                value={record.breakdown.context} 
                max={3} 
                description="Presence of personas, rules, and audience mapping." 
              />
              <ParameterBar 
                label="Constraints Definition" 
                value={record.breakdown.constraints} 
                max={2} 
                description="Includes negative constraints and boundaries." 
              />
              <ParameterBar 
                label="Output Structure" 
                value={record.breakdown.structure} 
                max={2} 
                description="Format guides: tables, bullet points, JSON." 
              />
              <ParameterBar 
                label="Reasoning Guidance" 
                value={record.breakdown.reasoning} 
                max={2} 
                description="Prompts step-by-step thinking (e.g. CoT)." 
              />
              <ParameterBar 
                label="Educational Value" 
                value={record.breakdown.educational} 
                max={2} 
                description="Presence of descriptive details, examples or teach commands." 
              />
            </div>
          </section>

          {/* Hallucination Risk Panel */}
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold font-outfit text-gray-100 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Hallucination Risk Assessment
              </h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                record.hallucinationRisk > 60 
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                  : record.hallucinationRisk > 30 
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                Risk Score: {record.hallucinationRisk}%
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {record.hallucinationWarnings && record.hallucinationWarnings.length > 0 ? (
                record.hallucinationWarnings.map((warning, idx) => (
                  <AlertCard 
                    key={idx} 
                    type={record.hallucinationRisk > 60 ? "error" : "warning"}
                    title={`AI Pitfall Warning #${idx + 1}`}
                    message={warning}
                  />
                ))
              ) : (
                <AlertCard 
                  type="success"
                  title="Optimal Prompt Boundaries"
                  message="No critical hallucination risk vectors detected. The prompt features sufficient negative boundaries and constraints."
                />
              )}
            </div>
          </section>

          {/* Hallucination Education Notes */}
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold font-outfit text-gray-100 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                Hallucination Education Notes
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-500/10 text-slate-200 border border-slate-700/60">
                {record.educationNotes && record.educationNotes.length > 0 ? `${record.educationNotes.length} insights` : "Pre-generation review"}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {record.educationNotes && record.educationNotes.length > 0 ? (
                record.educationNotes.map((note, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-gray-300">
                    <span className="font-semibold text-slate-100">{idx + 1}. </span>
                    {note}
                  </div>
                ))
              ) : (
                <AlertCard
                  type="success"
                  title="No obvious pre-generation risk drivers"
                  message="Your prompt includes enough structure and specificity to avoid the most common hallucination risk vectors."
                />
              )}
            </div>
          </section>

          {/* AI Reliability Report */}
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold font-outfit text-gray-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                AI Reliability Report
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-500/10 text-slate-200 border border-slate-700/60">
                Post-generation validation
              </span>
            </div>

            {record.validationReport ? (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-gray-300 leading-relaxed">
                  {record.validationReport.validationSummary || "This validation report was created by the post-generation judge and summarizes output reliability."}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">Reliability</span>
                    <div className="mt-2 text-2xl font-bold text-emerald-400">{record.validationReport.reliabilityScore}/100</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">Confidence</span>
                    <div className="mt-2 text-2xl font-bold text-emerald-400">{record.validationReport.factualConfidence}/100</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">Hallucination Risk</span>
                    <div className="mt-2 text-2xl font-bold text-amber-300">{record.validationReport.hallucinationProbability ?? 0}%</div>
                  </div>
                </div>

                {record.validationReport.confidenceAnalysis && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-gray-300">
                    <span className="font-semibold text-slate-100">Confidence Analysis:</span>
                    <p className="mt-2 text-gray-300">{record.validationReport.confidenceAnalysis}</p>
                  </div>
                )}

                {record.validationReport.riskyStatements && record.validationReport.riskyStatements.length > 0 && (
                  <div className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-gray-300">
                    <span className="font-semibold text-rose-200">Risky Statements Detected</span>
                    <ul className="mt-3 list-disc list-inside space-y-2 text-gray-300">
                      {record.validationReport.riskyStatements.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-gray-300">
                  <span className="font-semibold text-slate-100">Validation Feedback</span>
                  <ul className="mt-3 list-disc list-inside space-y-2 text-gray-300">
                    {record.validationReport.feedback.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <AlertCard
                type="warning"
                title="No post-generation judge report available"
                message="Run a live validation or execute prompt generation from the optimization sandbox to produce a reliability assessment."
              />
            )}
          </section>

          {/* Explainable AI Recommendations */}
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold font-outfit text-gray-100 flex items-center gap-2">
                <Info className="h-5 w-5 text-indigo-400" />
                Explainable AI Diagnostic Cards
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Deep-dive diagnostic breakdown showing how LLM token weights process your specific instructions.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {record.explainability.lowScoreAreas && record.explainability.lowScoreAreas.length > 0 ? (
                record.explainability.lowScoreAreas.map((item, idx) => (
                  <div key={idx} className="glass-panel p-5 border-l-4 border-l-indigo-500 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                          Parameter: {item.field}
                        </span>
                        <h3 className="text-sm font-extrabold text-gray-200 mt-1">
                          Issue: {item.issue}
                        </h3>
                      </div>
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 font-mono">
                        Rule #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-900">
                      {/* Interpretation */}
                      <div className="p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/10 flex flex-col gap-1.5">
                        <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                          ⚠️ How the AI Interprets This
                        </span>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                          {item.aiInterpretation}
                        </p>
                      </div>

                      {/* Insight */}
                      <div className="p-3.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10 flex flex-col gap-1.5">
                        <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                          💡 Prompt Engineering Theory
                        </span>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                          {item.insight}
                        </p>
                      </div>
                    </div>

                    {/* Suggestion */}
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-2">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                        ✨ Actionable Suggestion to Optimize
                      </span>
                      <p className="text-xs text-gray-300 font-semibold leading-relaxed">
                        {item.suggestion}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel p-6 text-center py-10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-200">No Low Scoring Areas Found!</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Your prompt achieves excellent ratings across all rubric criteria.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right 1 Column: Original Prompt & Suggestion List */}
        <div className="flex flex-col gap-6">
          
          {/* Original Prompt Text */}
          <div className="glass-panel p-5 flex flex-col gap-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider px-1">Original Draft Prompt</span>
            <div className="w-full bg-gray-950 p-4 rounded-xl border border-gray-900 font-mono text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {record.prompt}
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 px-1 pt-1">
              <span>Word Count: {record.prompt.split(/\s+/).filter(Boolean).length}</span>
              <span>Complexity: {record.score >= 80 ? "Expert" : record.score >= 50 ? "Intermediate" : "Beginner"}</span>
            </div>
          </div>

          {/* Quick Actions / Checklist */}
          <div className="glass-panel p-5 flex flex-col gap-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider px-1">Improvement Checklist</span>
            
            <div className="flex flex-col gap-3">
              {record.explainability.lowScoreAreas && record.explainability.lowScoreAreas.length > 0 ? (
                record.explainability.lowScoreAreas.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start bg-gray-900/30 p-2.5 rounded-lg border border-gray-850">
                    <div className="h-4 w-4 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-gray-300 leading-snug">{item.field} Adjustment</span>
                      <span className="text-[9px] text-gray-500 leading-snug">Requires clear criteria formatting.</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-2.5 items-start bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-emerald-400 leading-none">All checklist items optimal!</span>
                </div>
              )}
            </div>

            <Link 
              href={`/optimize?id=${record.id}`}
              className="flex items-center justify-center gap-1.5 w-full mt-2 py-2.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-xs font-semibold text-gray-200 hover:text-white rounded-lg transition-all"
            >
              <span>View Side-by-Side Comparison</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
