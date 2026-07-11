"use client";

import { useAppStore } from "@/store/useAppStore";
import { lessons } from "@/data/lessons";
import Link from "next/link";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function LearnPage() {
  const { learning, completeLesson } = useAppStore();
  const completedCount = learning.completedLessonIds.length;
  const completionRate = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <div className="mb-10 flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 uppercase tracking-[0.2em]">
          <Sparkles className="h-4 w-4" />
          Prompt Learning Path
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit text-white">Learn Prompt Engineering</h1>
            <p className="text-sm text-gray-400 max-w-2xl mt-2">
              Explore practical lessons that explain role prompting, few-shot strategies, output structure, hallucination prevention, and prompt optimization theory.
            </p>
          </div>
          <Link href="/workspace" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/10 transition hover:-translate-y-0.5">
            <BookOpen className="h-4 w-4" />
            Go to Workspace
          </Link>
        </div>
      </div>

      <div className="glass-panel p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Learning progress recorded automatically in your profile and used to unlock achievements in PromptArena.</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-3">{completedCount}/{lessons.length} lessons completed</h2>
          </div>
          <div className="w-full md:w-80 bg-gray-950/60 rounded-full h-4 overflow-hidden border border-gray-800">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {lessons.map((lesson) => {
          const completed = learning.completedLessonIds.includes(lesson.id);
          return (
            <div key={lesson.id} className="glass-panel p-6 border border-gray-800 transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">{lesson.category}</span>
                  <h3 className="text-xl font-semibold text-white mt-3">{lesson.title}</h3>
                </div>
                <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${completed ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-gray-900/70 text-gray-300 border border-gray-800"}`}>
                  {lesson.difficulty}
                </span>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-4">{lesson.summary}</p>

              <div className="space-y-3 mb-5">
                {lesson.takeaways.slice(0, 3).map((takeaway) => (
                  <p key={takeaway} className="text-xs text-gray-500 leading-relaxed">• {takeaway}</p>
                ))}
              </div>

              <button
                onClick={() => completeLesson(lesson.id)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${completed ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-indigo-500 text-white hover:bg-indigo-400"}`}
              >
                {completed ? (
                  <><CheckCircle2 className="h-4 w-4" /> Completed</>
                ) : (
                  <><ArrowRight className="h-4 w-4" /> Mark Complete</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
