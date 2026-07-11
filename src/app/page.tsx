"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Activity, 
  ChevronRight,
  Zap,
  Info
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");

  const features = [
    {
      icon: Terminal,
      title: "Workspace & Category Selector",
      desc: "Draft prompts in specialized sandboxes like Coding, Image, Marketing, Research, and Education."
    },
    {
      icon: Activity,
      title: "Rubric Evaluation Engine",
      desc: "Deterministic, weighted scoring scales evaluating Clarity, Specificity, Context, Constraints, and Structure."
    },
    {
      icon: Info,
      title: "Explainability Engine",
      desc: "Learn exactly how LLMs interpret your instructions, including pitfalls, risks, and educational improvement insights."
    },
    {
      icon: Zap,
      title: "Multi-Mode Optimization",
      desc: "Improve prompts using Simple, Balanced, or Advanced modes for optimal token usage and direct outputs."
    },
    {
      icon: ShieldCheck,
      title: "Hallucination Warning System",
      desc: "Identify vague requests, conflicting guidelines, and speculative assertions that trigger inaccurate AI responses."
    },
    {
      icon: Award,
      title: "PromptArena System",
      desc: "LeetCode for Prompt Engineering. Resolve Easy, Medium, and Hard coding, writing, and research scenarios with scoring thresholds."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        {/* Glow */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        {/* Tagline */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-6"
        >
          <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Explainable AI & Prompt Analytics</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-[1.1] font-outfit"
        >
          Learn2Prompt — Explainable AI <span className="text-gradient">Prompt Intelligence</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
        >
          Analyze, optimize, validate, and master prompt engineering through deterministic heuristics, explainability insights, and interactive PromptArena challenges.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-20"
        >
          <Link 
            href="/workspace" 
            className="flex items-center gap-1.5 px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl font-semibold hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5 text-white"
          >
            <span>Analyze Prompt</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          
          <Link 
            href="/learn" 
            className="flex items-center gap-1.5 px-8 py-4 bg-gray-900 border border-gray-800 rounded-xl font-semibold hover:bg-gray-800/80 transition-all text-gray-200"
          >
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Start Learning</span>
          </Link>
        </motion.div>
      </section>

      {/* Before-vs-After Demonstration Section */}
      <section className="w-full max-w-5xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-outfit mb-3">
            Before-vs-After Prompt Optimization
          </h2>
          <p className="text-sm text-gray-400">
            See how small structural details radically transform the clarity and reliability of LLM outputs.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-stretch">
          {/* Controls */}
          <div className="md:w-1/3 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase text-indigo-400 tracking-wider font-semibold">Demo Toggle</span>
              <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
                <button
                  onClick={() => setActiveTab("before")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "before" 
                      ? "bg-rose-500/10 border border-rose-500/30 text-rose-400" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Vague Prompt
                </button>
                <button
                  onClick={() => setActiveTab("after")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "after" 
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Optimized Prompt
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-400 leading-relaxed">
              {activeTab === "before" ? (
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-rose-400">🚨 Score: 25/100 (Weak)</span>
                  <span><strong>AI Pitfall:</strong> Lack of context and formatting rules forces the model to assume boundaries, raising the likelihood of generic, long-winded answers and hallucinated advice.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-emerald-400">✅ Score: 95/100 (Optimal)</span>
                  <span><strong>Prompt Advantage:</strong> Persona mapping anchors the token weights. Formatting rules structure the layout, and explicit limits act as safety guardrails against AI drift.</span>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Code View */}
          <div className="flex-1 flex flex-col justify-between min-h-[220px] rounded-xl bg-gray-950/80 p-5 border border-gray-850 font-mono text-xs leading-relaxed overflow-hidden">
            {activeTab === "before" ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-300"
              >
                <span className="text-gray-500">// Vague request</span>
                <p className="mt-2 text-rose-300 font-semibold">"Tell me how to make a resume better and stand out for database administrator jobs."</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-300 flex flex-col gap-2"
              >
                <span className="text-gray-500">// Structured Prompt (Balanced Mode)</span>
                <p className="text-emerald-300">
                  <span className="text-indigo-400">"You are a Senior Technical Recruiter.</span> Review the following details of my resume against a junior database administrator position. 
                </p>
                <p className="text-emerald-300">
                  <span className="text-cyan-400">Identify the top 3 missing keywords</span> and construct 3 resume bullets explaining my past projects using the STAR framework.
                </p>
                <p className="text-emerald-300">
                  <span className="text-purple-400">Format:</span> bullet lists withSituation, Action, Result markers. Avoid fluff."
                </p>
              </motion.div>
            )}
            
            <div className="mt-4 pt-3 border-t border-gray-900 flex justify-between items-center text-[10px] text-gray-500">
              <span>Category: Resume / Job Prep</span>
              <span>Length: {activeTab === "before" ? "14 words" : "55 words"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-outfit mb-4">
            Ecosystem Core Capabilities
          </h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            A comprehensive suite of tools built to evaluate prompt quality, diagnose flaws, optimize structure, and validate outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="glow-border p-6 flex flex-col gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-100 font-outfit">{feat.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
