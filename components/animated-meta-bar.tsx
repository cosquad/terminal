"use client"

import { useState, useEffect } from "react"

type MetaConfig = {
  startTime: string
  endTime: string
  startTokens: string
  endTokens: string
  label: string
}

function parseNum(s: string): number {
  const match = s.match(/([0-9]*\.?[0-9]+)/)
  return match ? parseFloat(match[1]) : 0
}

function parseTokens(s: string): number {
  const match = s.match(/^([0-9]*\.?[0-9]+)\s*(.*)$/)
  if (!match) return 0
  const num = parseFloat(match[1])
  const suffix = match[2].trim().toUpperCase()
  if (suffix === "K") return num * 1000
  if (suffix === "M") return num * 1000000
  return num
}

function formatTokens(num: number, endRaw: string): string {
  const suffix = endRaw.replace(/[0-9.\s]/g, "").toUpperCase()
  if (suffix === "K") {
    const v = num / 1000
    return v >= 10 ? `${Math.round(v)}K` : `${v.toFixed(1).replace(/\.0$/, "")}K`
  }
  if (suffix === "M") {
    const v = num / 1000000
    return `${v.toFixed(1).replace(/\.0$/, "")}M`
  }
  return `${Math.round(num)}`
}

export function AnimatedMetaBar({
  meta,
  createdAt,
  agentColor,
}: {
  meta: MetaConfig
  createdAt: number
  agentColor?: string
}) {
  const start = parseNum(meta.startTime)
  const end = parseNum(meta.endTime)
  const startTok = parseTokens(meta.startTokens)
  const endTok = parseTokens(meta.endTokens)

  const [seconds, setSeconds] = useState(start)

  useEffect(() => {
    setSeconds(start)
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= end) {
          clearInterval(interval)
          return end
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [start, end, createdAt])

  // Interpolate tokens based on timer progress
  const range = end - start
  const t = range > 0 ? (seconds - start) / range : 1
  const currentTokens = startTok + (endTok - startTok) * Math.min(Math.max(t, 0), 1)

  return (
    <span className="ml-auto flex items-center gap-1.5 text-xs text-black/30 dark:text-white/30">
      <span>{seconds}s</span>
      <span className="text-black/15 dark:text-white/15">&middot;</span>
      <span>&uarr;{formatTokens(currentTokens, meta.endTokens)}</span>
      <span className="text-black/15 dark:text-white/15">&middot;</span>
      <span>{meta.label}</span>
    </span>
  )
}
