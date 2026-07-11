import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Learn2Prompt — Explainable AI Prompt Intelligence & Optimization",
  description: "Evaluate, optimize, validate, and master prompt engineering through explainable AI systems, interactive practice challenges, and reliability validation dashboards.",
  keywords: ["prompt engineering", "explainable AI", "AI optimization", "hallucination detection", "LLM tutoring", "prompt validation", "PromptArena"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body className="relative min-h-screen bg-[#030014] text-[#f8fafc] flex flex-col antialiased selection:bg-indigo-500/35 selection:text-white">
        {/* Glow backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[20%] -z-10 h-[600px] w-[600px] rounded-full bg-cyan-950/15 blur-[150px] pointer-events-none" />

        {/* Global Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[var(--border-color)] bg-[rgba(3,0,20,0.8)] py-8 text-center text-xs text-gray-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-2">© {new Date().getFullYear()} Learn2Prompt. All rights reserved.</p>
            <p className="text-[10px] text-gray-600">
              Built for explainable prompt engineering, dual-AI validation pipelines, and interactive AI literacy.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
