"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppStore, getLevelFromXp } from "@/store/useAppStore";
import { 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Award, 
  BarChart3, 
  Settings, 
  Flame, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { settings, challenges, toggleTheme } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Apply theme
    const root = window.document.documentElement;
    root.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  if (!mounted) return null;

  const { levelName, progress } = getLevelFromXp(challenges.xp);

  const navLinks = [
    { name: "Workspace", href: "/workspace", icon: Terminal },
    { name: "Optimize", href: "/optimize", icon: Sparkles },
    { name: "Learn", href: "/learn", icon: BookOpen },
    { name: "PromptArena", href: "/arena", icon: Award },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[rgba(3,0,20,0.7)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#030014]">
                  <Cpu className="h-5 w-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="absolute -inset-1 -z-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 opacity-30 blur-sm group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Learn<span className="text-cyan-400">2</span>Prompt
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">Explainable AI</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white hover:bg-[rgba(99,102,241,0.06)]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-[rgba(99,102,241,0.12)] to-[rgba(168,85,247,0.12)] border border-[rgba(99,102,241,0.25)] rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Gamification Stats & Theme Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Streak */}
            {challenges.streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-500 animate-soft-pulse">
                <Flame className="h-3.5 w-3.5 fill-amber-500" />
                <span>{challenges.streak} Day Streak</span>
              </div>
            )}

            {/* XP Level progress */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">XP: <span className="font-semibold text-indigo-400">{challenges.xp}</span></span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                  Lv.{getLevelFromXp(challenges.xp).levelNum}
                </span>
              </div>
              <div className="mt-1 w-28 h-1.5 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] text-gray-500 italic">{levelName}</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[rgba(99,102,241,0.06)] border border-[var(--border-color)] text-gray-400 hover:text-white transition-all hover:scale-105"
              aria-label="Toggle theme"
            >
              {settings.theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>
          </div>

          {/* Mobile Menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[rgba(99,102,241,0.06)] border border-[var(--border-color)] text-gray-400"
            >
              {settings.theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-[rgba(99,102,241,0.06)] border border-[var(--border-color)] text-gray-400 hover:text-white"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border-color)] bg-[#030014]/95 backdrop-blur-lg"
          >
            <div className="space-y-1 px-2 pb-4 pt-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border-l-2 border-cyan-400" 
                        : "text-gray-400 hover:text-white hover:bg-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Gamification row in mobile */}
              <div className="mt-4 pt-4 border-t border-gray-800 px-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Level {getLevelFromXp(challenges.xp).levelNum}</span>
                    <span className="text-[10px] text-gray-500 font-semibold">({levelName})</span>
                  </div>
                  <span className="text-xs text-indigo-400 font-semibold">{challenges.xp} XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${progress}%` }} />
                </div>
                {challenges.streak > 0 && (
                  <div className="flex items-center gap-1.5 self-start bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold text-amber-500">
                    <Flame className="h-4 w-4 fill-amber-500" />
                    <span>{challenges.streak} Day Streak</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
