"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppStore, getLevelFromXp } from "@/store/useAppStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart3, Activity, Sparkles, Award, Cpu, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { history, challenges } = useAppStore();
  const { levelName, progress } = getLevelFromXp(challenges.xp);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const scoreTrendData = useMemo(() => {
    return [...history].slice(0, 10).reverse().map((item, index) => ({
      label: `#${history.length - index}`,
      score: item.score,
      category: item.category
    }));
  }, [history]);

  const radarData = useMemo(() => {
    if (!history.length) return [];
    const latest = history[0];
    return [
      { name: "Clarity", value: latest.breakdown.clarity * 33.33 },
      { name: "Specificity", value: latest.breakdown.specificity * 33.33 },
      { name: "Context", value: latest.breakdown.context * 33.33 },
      { name: "Constraints", value: latest.breakdown.constraints * 50 },
      { name: "Structure", value: latest.breakdown.structure * 50 },
      { name: "Reasoning", value: latest.breakdown.reasoning * 50 },
      { name: "Educational", value: latest.breakdown.educational * 50 }
    ];
  }, [history]);

  const pieData = [
    { name: "Completed", value: challenges.completedChallengeIds.length },
    { name: "Remaining", value: Math.max(0, 15 - challenges.completedChallengeIds.length) }
  ];

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-outfit text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Track your prompt quality, XP progress, and challenge mastery with real data from your Learn2Prompt usage.
          </p>
        </div>
        <Link href="/arena" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-5 py-3 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/15 transition">
          <Award className="h-4 w-4" /> Open PromptArena
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel p-6 border border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Current Level</p>
          <h2 className="text-2xl font-bold text-white">{levelName}</h2>
          <p className="text-sm text-gray-400 mt-2">XP: {challenges.xp}</p>
          <div className="mt-5 bg-gray-950/60 rounded-full h-3 overflow-hidden border border-gray-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] mt-2">Progress to next level: {Math.round(progress)}%</p>
        </div>

        <div className="glass-panel p-6 border border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Prompt History</p>
          <h2 className="text-2xl font-bold text-white">{history.length}</h2>
          <p className="text-sm text-gray-400 mt-2">Total analyzed prompts</p>
          <div className="mt-5 space-y-2 text-[11px] text-gray-400">
            <p>Last prompt score: {history[0]?.score ?? "—"}</p>
            <p>Average score: {history.length ? Math.round(history.reduce((sum, record) => sum + record.score, 0) / history.length) : "—"}</p>
          </div>
        </div>

        <div className="glass-panel p-6 border border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Arena Progress</p>
          <h2 className="text-2xl font-bold text-white">{challenges.completedChallengeIds.length}/15</h2>
          <p className="text-sm text-gray-400 mt-2">Completed challenges</p>
          <div className="mt-5 flex flex-col gap-1 text-[11px] text-gray-400">
            <p>Streak: {challenges.streak || 0} days</p>
            <p>Badges: {challenges.unlockedAchievements.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Quality Trend</p>
              <h3 className="text-lg font-bold text-white">Prompt Score History</h3>
            </div>
            <BarChart3 className="h-5 w-5 text-indigo-400" />
          </div>
          {scoreTrendData.length > 0 ? (
            <div className="h-64 min-w-0" style={{ minHeight: 240 }}>
              {hydrated ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrendData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#2f2f45" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fill: '#8b95b3', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8b95b3', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#4338ca' }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-gray-500">Run a prompt analysis in Workspace to populate the score trend chart.</div>
          )}
        </div>

        <div className="glass-panel p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Latest Diagnostics</p>
              <h3 className="text-lg font-bold text-white">Latest Rubric Breakdown</h3>
            </div>
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          {radarData.length > 0 ? (
            <div className="h-72 min-w-0" style={{ minHeight: 280 }}>
              {hydrated ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="80%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="Latest" dataKey="value" stroke="#38bdf8" fill="#22d3ee" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-gray-500">Analyze a prompt first to see rubric feedback here.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="glass-panel p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Challenge Completion</p>
              <h3 className="text-lg font-bold text-white">PromptArena Summary</h3>
            </div>
            <Award className="h-5 w-5 text-amber-400" />
          </div>
          <div className="h-64 min-w-0" style={{ minHeight: 240 }}>
            {hydrated ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {pieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={idx === 0 ? '#818cf8' : '#475569'} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" align="center" iconSize={8} wrapperStyle={{ color: '#a5b4fc', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full" />
            )}
          </div>
        </div>

        <div className="glass-panel p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Key Metrics</p>
              <h3 className="text-lg font-bold text-white">Performance Insights</h3>
            </div>
            <Cpu className="h-5 w-5 text-violet-400" />
          </div>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex items-center justify-between rounded-xl bg-gray-950/60 p-4 border border-gray-800">
              <span>Average prompt score</span>
              <span className="font-bold text-white">{history.length ? Math.round(history.reduce((sum, record) => sum + record.score, 0) / history.length) : 0}/100</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-950/60 p-4 border border-gray-800">
              <span>Top challenge score</span>
              <span className="font-bold text-white">{Math.max(...Object.values(challenges.challengeScores), 0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-950/60 p-4 border border-gray-800">
              <span>Current streak</span>
              <span className="font-bold text-white">{challenges.streak || 0} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
