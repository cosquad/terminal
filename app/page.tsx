"use client"

import { useState, useEffect } from "react"
import { TerminalBody } from "@/components/terminal-body"

export default function Page() {
  const letters = ["C", "o", "s", "q", "u", "a", "d"]
  const [showTerminal, setShowTerminal] = useState(false)

  useEffect(() => {
    // Hello animation: last letter delay (0.3 + 5*0.08 = 0.7s) + 0.8s anim + 0.5s pause
    const timer = setTimeout(() => setShowTerminal(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="relative flex min-h-svh items-center justify-center overflow-hidden p-4 transition-colors duration-700"
      style={{ backgroundColor: showTerminal ? undefined : "#0a0a0a" }}
    >
      {/* Theme-aware background (visible after transition) */}
      <div
        className="absolute inset-0 bg-[#f5f5f5] transition-opacity duration-700 dark:bg-[#0a0a0a]"
        style={{ opacity: showTerminal ? 1 : 0 }}
      />

      {/* Grain texture overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noise)%22%2F%3E%3C%2Fsvg%3E')] bg-size-[128px_128px]" />

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(120,80,40,0.08),transparent)]" />

      {/* Hello intro — fades out */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-700"
        style={{
          opacity: showTerminal ? 0 : 1,
          transform: showTerminal ? "scale(0.95)" : "scale(1)",
          pointerEvents: showTerminal ? "none" : "auto",
        }}
      >
        {/* Decorative top line */}
        <div className="absolute top-12 left-1/2 h-px w-16 -translate-x-1/2 animate-[expand_1.2s_ease-out_0.2s_both] bg-linear-to-r from-transparent via-[#c4956a] to-transparent" />

        {/* Main hello text */}
        <h1 className="hello-display relative flex select-none text-[clamp(5rem,18vw,14rem)] leading-none tracking-[-0.02em] text-[#f5f0eb]">
          {letters.map((letter, i) => (
            <span
              key={i}
              className="inline-block animate-[letterIn_0.8s_ease-out_both]"
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
            >
              {letter}
            </span>
          ))}
          <span
            className="inline-block animate-[letterIn_0.8s_ease-out_both] italic text-[#c4956a]"
            style={{ animationDelay: `${0.3 + letters.length * 0.08}s` }}
          >
            .
          </span>
        </h1>

        {/* Decorative bottom line */}
        <div className="absolute bottom-12 left-1/2 h-px w-16 -translate-x-1/2 animate-[expand_1.2s_ease-out_0.8s_both] bg-linear-to-r from-transparent via-[#c4956a]/40 to-transparent" />

        {/* Subtle corner accent */}
        <div className="absolute right-8 bottom-8 animate-[fadeIn_1s_ease-out_1.2s_both] font-mono text-[10px] tracking-[0.3em] text-[#c4956a]/30 uppercase">
          terminal
        </div>
      </div>

      {/* Terminal — fades in */}
      <div
        className="relative z-10 mt-14 flex h-150 w-full max-w-5xl flex-col rounded-xl border border-black/8 bg-white shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15),0_0_40px_-8px_rgba(120,80,40,0.04)] transition-all duration-700 dark:border-white/8 dark:bg-[#1a1a1a] dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7),0_0_40px_-8px_rgba(120,80,40,0.08)]"
        style={{
          opacity: showTerminal ? 1 : 0,
          transform: showTerminal ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <TerminalBody />
      </div>
    </div>
  )
}
