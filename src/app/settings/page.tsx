"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Save, Trash2, RotateCcw, Download, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { settings, setGeminiApiKey, toggleTheme, clearHistory, resetArena, history, challenges } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [resetArenaStatus, setResetArenaStatus] = useState(false);
  const [clearHistoryStatus, setClearHistoryStatus] = useState(false);

  useEffect(() => {
    setApiKeyInput(settings.geminiApiKey);
  }, [settings.geminiApiKey]);

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput.trim());
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ settings, history, challenges }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'learn2prompt_backup.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.style.display = 'none';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const handleResetArena = () => {
    if (confirm("Are you sure you want to reset all PromptArena levels, XP, and streak progress? This cannot be undone.")) {
      resetArena();
      setResetArenaStatus(true);
      setTimeout(() => setResetArenaStatus(false), 2000);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your saved prompts and analysis history?")) {
      clearHistory();
      setClearHistoryStatus(true);
      setTimeout(() => setClearHistoryStatus(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-grow">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight font-outfit">Platform Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure your Gemini API access, themes, and manage local storage backup files.</p>
      </div>

      <div className="space-y-8">
        {/* Gemini API Section */}
        <section className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold font-outfit text-gray-100 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-400" />
              Gemini API Access
            </h2>
            <p className="text-xs text-gray-400">
              Provide your Gemini API key to run live evaluations, multi-mode optimizations, and secondary validation checks. Your key remains entirely in local browser storage.
            </p>
          </div>

          <form className="flex flex-col gap-2.5" onSubmit={(e) => e.preventDefault()}>
            <label className="text-xs font-semibold text-gray-400">Gemini API Key</label>
            <div className="flex gap-3">
              <div className="relative flex-grow">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key (AIzaSy...)"
                  autoComplete="off"
                  spellCheck={false}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-mono pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shrink-0 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              >
                {savedStatus ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{savedStatus ? "Saved" : "Save"}</span>
              </button>
            </div>
            
            {!settings.geminiApiKey && (
              <div className="mt-1 flex items-start gap-2 text-[11px] text-amber-500 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>No API Key Configured:</strong> The system is currently running on the <strong>Heuristic Fallback Engine</strong>. Basic scoring and optimization suggestions will run locally using rule-based metrics. Add a key to enable live AI comparisons!
                </span>
              </div>
            )}
          </form>
        </section>

        {/* Customization Section */}
        <section className="glass-panel p-6 flex flex-col gap-6">
          <h2 className="text-lg font-bold font-outfit text-gray-100">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-200">Color Theme</span>
              <span className="text-xs text-gray-500">Toggle between Light and Dark visual theme layouts.</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-5 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm font-semibold text-gray-200 hover:bg-gray-850 hover:text-white transition-all capitalize"
            >
              {settings.theme} Mode
            </button>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="glass-panel p-6 flex flex-col gap-6">
          <h2 className="text-lg font-bold font-outfit text-gray-100">Data Management</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Backup */}
            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-200">Backup Progress</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Export your complete analysis history, starred prompts, streak history, and XP metrics to a local file.</p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold self-start transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Progress JSON</span>
              </button>
            </div>

            {/* Clear History */}
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-rose-400">Clear Workspace History</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Deletes all saved prompt analysis reports, optimized drafts, and history cards in the dashboard.</p>
              </div>
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold self-start transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{clearHistoryStatus ? "Cleared!" : "Clear History"}</span>
              </button>
            </div>

            {/* Reset Arena */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-amber-400 font-outfit">Reset PromptArena Progress</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Resets your user level, streak, earned XP, and unlocks all challenges back to unsolved state.</p>
              </div>
              <button
                type="button"
                onClick={handleResetArena}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold self-start transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{resetArenaStatus ? "Reset!" : "Reset Arena Stats"}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
