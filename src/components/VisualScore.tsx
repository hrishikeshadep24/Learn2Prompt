"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

interface VisualScoreProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function VisualScore({ score, size = "md", showLabel = true }: VisualScoreProps) {
  const sizeClasses = {
    sm: { container: "h-20 w-20", radius: 30, stroke: 6, fontScore: "text-lg", fontLabel: "text-[9px]" },
    md: { container: "h-32 w-32", radius: 48, stroke: 8, fontScore: "text-3xl", fontLabel: "text-xs" },
    lg: { container: "h-44 w-44", radius: 68, stroke: 12, fontScore: "text-5xl", fontLabel: "text-sm" }
  };

  const currentSize = sizeClasses[size];
  const circumference = 2 * Math.PI * currentSize.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine colors based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return { stroke: "stroke-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (s >= 50) return { stroke: "stroke-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { stroke: "stroke-rose-500", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  };

  const colors = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={currentSize.radius}
            className="stroke-gray-800/60 fill-none"
            strokeWidth={currentSize.stroke}
          />
          {/* Animated score circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={currentSize.radius}
            className={`fill-none ${colors.stroke}`}
            strokeWidth={currentSize.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Inner Score Label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold tracking-tight ${colors.text} ${currentSize.fontScore}`}>
            {score}
          </span>
          {showLabel && (
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {score >= 80 ? "Optimal" : score >= 50 ? "Moderate" : "Weak"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ParameterBarProps {
  label: string;
  value: number; // 0 to max
  max: number;
  description: string;
}

export function ParameterBar({ label, value, max, description }: ParameterBarProps) {
  const percentage = (value / max) * 100;
  
  const getBarColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    if (pct >= 50) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    return "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  };

  const getTextColor = (pct: number) => {
    if (pct >= 80) return "text-emerald-400";
    if (pct >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[rgba(99,102,241,0.02)] border border-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.04)] transition-all">
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-200">{label}</span>
          <span className="text-[10px] text-gray-500 mt-0.5">{description}</span>
        </div>
        <span className={`font-bold ${getTextColor(percentage)}`}>
          {value} / {max}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden border border-gray-700/50">
        <motion.div
          className={`h-full rounded-full ${getBarColor(percentage)}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface AlertCardProps {
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
}

export function AlertCard({ type, title, message }: AlertCardProps) {
  const styles = {
    warning: {
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
      icon: AlertTriangle,
    },
    error: {
      bg: "bg-rose-500/10 border-rose-500/20 text-rose-300",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      icon: CheckCircle2,
    },
    info: {
      bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
      icon: HelpCircle,
    }
  };

  const config = styles[type];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${config.bg} transition-all`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
