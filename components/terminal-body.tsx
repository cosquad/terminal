"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { getAgents, type AgentData, type ScriptedQuestion, exportAgents, importAgents, saveAgent } from "@/lib/agent-store"
import { toRuntime, type AgentConfig } from "@/lib/agent-configs"
import { SettingsModal } from "@/components/settings-modal"
import { AnimatedMetaBar } from "@/components/animated-meta-bar"
import { AskUserQuestion } from "@/components/ask-user-question"

type MessageMeta = {
  startTime: string
  endTime: string
  startTokens: string
  endTokens: string
  label: string
}

type Message = {
  type: "user" | "agent"
  text: string
  meta?: MessageMeta
  timestamp?: number
}

const DEFAULT_META: MessageMeta = {
  startTime: "0",
  endTime: "5",
  startTokens: "0",
  endTokens: "1.7K",
  label: "esc to close",
}

const SPINNER_FRAMES = ["✻", "✶", "✢"]

function SpinnerSymbol({ color }: { color: string }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % SPINNER_FRAMES.length), 120)
    return () => clearInterval(id)
  }, [])
  return <span style={{ color }}>{SPINNER_FRAMES[frame]}</span>
}

function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">{part}</a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

const CHAR_WIDTH = 8
const MASCOT_SIZE = 56
const INPUT_PADDING = 32
const bare = (cmd: string) => cmd.startsWith("/") ? cmd.slice(1) : cmd

const Mascot = ({
  agent,
  inputLength,
  isProcessing,
  containerWidth,
}: {
  agent: AgentConfig
  inputLength: number
  isProcessing: boolean
  containerWidth: number
}) => {
  if (!agent.show.mascot) return null

  const usableWidth = Math.max(containerWidth - INPUT_PADDING - MASCOT_SIZE, 100)
  const totalOffset = inputLength * CHAR_WIDTH
  const offset = totalOffset % usableWidth

  const outerAnimation = isProcessing
    ? agent.mascotProcessingAnimation
    : inputLength === 0
      ? agent.mascotIdleAnimation
      : "none"

  return (
    <div
      className="absolute -top-16 left-4 z-10 transition-transform duration-150 ease-out"
      style={{
        transform: `translateX(${isProcessing ? `${usableWidth / 2}px` : `${offset}px`})`,
        animation: outerAnimation,
      }}
    >
      <div style={{ animation: agent.mascotInnerAnimation }}>
        {agent.mascotIcon}
      </div>
    </div>
  )
}

export function TerminalBody() {
  const { setTheme } = useTheme()
  const [allAgents, setAllAgents] = useState<AgentConfig[]>([])
  const [agent, setAgent] = useState<AgentConfig | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [containerWidth, setContainerWidth] = useState(800)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [askFlow, setAskFlow] = useState<ScriptedQuestion[] | null>(null)
  const [slashIndex, setSlashIndex] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadAgents = useCallback(() => {
    const data = getAgents()
    const configs = data.map(toRuntime)
    setAllAgents(configs)
    return configs
  }, [])

  const systemCommands = [
    { cmd: "settings", label: "Open settings" },
    { cmd: "dark", label: "Dark theme" },
    { cmd: "light", label: "Light theme" },
    { cmd: "export", label: "Copy config" },
    { cmd: "import", label: "Import config" },
    { cmd: "clear", label: "Clear messages" },
    { cmd: "help", label: "Show help" },
    { cmd: "follow", label: "Follow us on X" },
    { cmd: "star", label: "Star us on GitHub" },
  ]

  const showSlashMenu = input.startsWith("/")
  const slashFilter = input.slice(1).toLowerCase()
  const filteredSlashItems = [
    ...allAgents.map((a) => ({ cmd: bare(a.command), label: a.name, type: "agent" as const })),
    ...systemCommands.map((s) => ({ ...s, type: "system" as const })),
  ].filter((item) => item.cmd.toLowerCase().startsWith(slashFilter))

  const clampedSlashIndex = Math.min(slashIndex, Math.max(filteredSlashItems.length - 1, 0))

  useEffect(() => {
    setSlashIndex(0)
  }, [input])

  useEffect(() => {
    const configs = loadAgents()
    if (!agent && configs.length > 0) {
      setAgent(configs[0])
    }
  }, [loadAgents, agent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()

    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    setContainerWidth(containerRef.current.offsetWidth)
    return () => observer.disconnect()
  }, [])

  function handleAgentsChange(updated: AgentData[]) {
    const configs = updated.map(toRuntime)
    setAllAgents(configs)
    // Update current agent if it was modified
    if (agent) {
      const refreshed = configs.find((c) => c.id === agent.id)
      if (refreshed) setAgent(refreshed)
      else if (configs.length > 0) setAgent(configs[0])
    }
  }

  function buildHelpMessages(): Message[] {
    const lines: Message[] = []
    for (const a of allAgents) {
      lines.push({ type: "agent", text: `/${bare(a.command).padEnd(10)}— Switch to ${a.name}` })
    }
    lines.push({ type: "agent", text: "/settings  — Open settings" })
    lines.push({ type: "agent", text: "/dark      — Switch to dark theme" })
    lines.push({ type: "agent", text: "/light     — Switch to light theme" })
    lines.push({ type: "agent", text: "/export    — Copy config to clipboard" })
    lines.push({ type: "agent", text: "/import    — Import config from JSON" })
    lines.push({ type: "agent", text: "/clear     — Clear all messages" })
    lines.push({ type: "agent", text: "/help      — Show this help" })
    lines.push({ type: "agent", text: "/follow    — Follow us on X" })
    lines.push({ type: "agent", text: "/star      — Star us on GitHub" })
    return lines
  }

  function executeCommand(text: string) {

    if (text === "/clear") {
      setMessages([])
      return
    }

    if (text === "/settings") {
      setSettingsOpen(true)
      return
    }

    // Check agent switch commands
    const matchedAgent = allAgents.find((a) => `/${bare(a.command)}` === text)
    if (matchedAgent) {
      setAgent(matchedAgent)
      setMessages([{ type: "agent", text: matchedAgent.welcomeMessage }])
      setTimeout(() => setMessages([]), 3000)
      return
    }

    if (text === "/dark") {
      setTheme("dark")
      setMessages([{ type: "agent", text: "Switched to dark theme" }])
      setTimeout(() => setMessages([]), 3000)
      return
    }

    if (text === "/light") {
      setTheme("light")
      setMessages([{ type: "agent", text: "Switched to light theme" }])
      setTimeout(() => setMessages([]), 3000)
      return
    }

    if (text === "/export") {
      const json = exportAgents()
      navigator.clipboard.writeText(json)
      setMessages([{ type: "agent", text: "Config copied to clipboard" }])
      toast.success("Config copied to clipboard")
      setTimeout(() => setMessages([]), 3000)
      return
    }

    if (text === "/import") {
      setMessages([{ type: "agent", text: "Usage: /import {json}\nType /import then Shift+Enter to go to a new line, paste your JSON, then press Enter to import." }])
      return
    }

    if (text.startsWith("/import ") || text.startsWith("/import\n")) {
      try {
        const json = text.slice(7).trim()
        const parsed = JSON.parse(json)
        let updated: AgentData[]
        if (Array.isArray(parsed)) {
          updated = importAgents(JSON.stringify(parsed))
        } else {
          // Single agent object — add as new custom agent
          const agent: AgentData = {
            ...parsed,
            id: `custom-${Date.now()}`,
            isBuiltIn: false,
            scriptedReplies: parsed.scriptedReplies ?? [],
            questionFlows: parsed.questionFlows ?? [],
            replies: parsed.replies ?? [],
            trafficLights: parsed.trafficLights ?? ["#ff5f57", "#febc2e", "#28c840"],
            metaTemplate: parsed.metaTemplate ?? ["1s", "\u21911.7K", "esc to close"],
            mascotEmoji: parsed.mascotEmoji ?? "",
            mascotUrl: parsed.mascotUrl ?? "",
            mascotIdleAnimation: parsed.mascotIdleAnimation ?? "none",
            mascotProcessingAnimation: parsed.mascotProcessingAnimation ?? "none",
            mascotInnerAnimation: parsed.mascotInnerAnimation ?? "none",
            show: {
              mascot: false,
              headerTitle: true,
              trafficLights: true,
              metaBar: true,
              separators: true,
              inputPrompt: true,
              ...parsed.show,
            },
          }
          updated = saveAgent(agent)
        }
        handleAgentsChange(updated)
        setMessages([{ type: "agent", text: "Config imported successfully" }])
        toast.success("Config imported")
        setTimeout(() => setMessages([]), 3000)
      } catch {
        setMessages([{ type: "agent", text: "Invalid JSON. Usage: /import {json}" }])
        toast.error("Invalid JSON")
      }
      return
    }

    if (text === "/help") {
      setMessages(buildHelpMessages())
      return
    }

    if (text === "/follow") {
      setMessages([{ type: "agent", text: "Follow us on X → https://x.com/Cosquadai" }])
      return
    }

    if (text === "/star") {
      setMessages([{ type: "agent", text: "If you like the terminal, give us a star on GitHub → https://github.com/cosquad/terminal" }])
      return
    }

    if (!agent) return

    setMessages((prev) => [...prev, { type: "user", text }])

    const lowerText = text.toLowerCase().trim()

    // 1. Check standalone question flow triggers (highest priority)
    const flowMatch = (agent.questionFlows ?? [])
      .filter((f) => f.trigger && lowerText.includes(f.trigger.toLowerCase().trim()))
      .sort((a, b) => (b.trigger?.length ?? 0) - (a.trigger?.length ?? 0))[0] ?? null

    if (flowMatch) {
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setAskFlow(flowMatch.questions)
      }, 400)
      return
    }

    // 2. Check scripted replies (fuzzy: user message contains trigger text)
    setIsProcessing(true)
    const matched = (agent.scriptedReplies ?? [])
      .filter((sr) => lowerText.includes(sr.trigger.toLowerCase().trim()))
      .sort((a, b) => b.trigger.length - a.trigger.length)[0] ?? null

    if (matched) {
      const endNum = parseFloat(matched.meta.endTime) || 1
      const delay = Math.min(endNum * 100, 3000)
      setTimeout(() => {
        if (!agent) return
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            text: matched.response,
            meta: matched.meta,
            timestamp: Date.now(),
          },
        ])
        setIsProcessing(false)

        // If this reply links to a question flow, start it
        if (matched.askFlow) {
          const flow = (agent.questionFlows ?? []).find((f) => f.id === matched.askFlow)
          if (flow) {
            setTimeout(() => setAskFlow(flow.questions), 300)
          }
        }
      }, delay)
    } else {
      setTimeout(() => {
        if (!agent) return
        const reply = agent.replies.length > 0
          ? agent.replies[Math.floor(Math.random() * agent.replies.length)]
          : "..."
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            text: reply,
            meta: DEFAULT_META,
            timestamp: Date.now(),
          },
        ])
        setIsProcessing(false)
      }, 600)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput("")
    executeCommand(text)
  }

  function selectSlashItem(cmd: string) {
    setInput("")
    executeCommand(`/${bare(cmd)}`)
    setTimeout(() => inputRef.current?.focus(), 50)
  }


  if (!agent) return null

  return (
    <>
      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onAgentsChange={handleAgentsChange}
      />

      {/* Mascot */}
      <Mascot
        agent={agent}
        inputLength={input.length}
        isProcessing={isProcessing}
        containerWidth={containerWidth}
      />

      {/* Header */}
      <div ref={containerRef} className="relative flex items-center border-b border-black/[0.08] px-4 py-3 dark:border-white/[0.06]">
        {agent.show.trafficLights && (
          <div className="flex gap-2">
            {agent.trafficLights.map((color, i) => (
              <div key={i} className="size-3 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </div>
        )}
        {agent.show.headerTitle && (
          <span className="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-black/40 dark:text-white/40">
            {agent.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 font-mono text-sm [scrollbar-width:thin]"
        onClick={() => inputRef.current?.focus()}
      >
        {messages.map((msg, i) =>
          msg.type === "user" ? (
            <div key={i} className="flex gap-2">
              {agent.show.inputPrompt && (
                <span style={{ color: agent.userPromptColor }}>&gt;</span>
              )}
              <span className="text-black/90 dark:text-white/90">{msg.text}</span>
            </div>
          ) : (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-black dark:text-white">●</span>
                <span className="whitespace-pre-wrap text-black/60 dark:text-white/60"><Linkify text={msg.text} /></span>
              </div>
              {agent.show.metaBar && msg.meta && msg.timestamp && (
                <div className="flex justify-end">
                  <AnimatedMetaBar
                    meta={msg.meta}
                    createdAt={msg.timestamp}
                    agentColor={agent.agentColor}
                  />
                </div>
              )}
              {agent.show.metaBar && !msg.meta && (
                <div className="flex justify-end">
                  <span className="flex items-center gap-1.5 text-xs text-black/30 dark:text-white/30">
                    {agent.metaTemplate.map((item, j) => (
                      <span key={j}>
                        {j > 0 && <span className="mr-1.5 text-black/15 dark:text-white/15">&middot;</span>}
                        {item}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          )
        )}
        {isProcessing && (
          <div className="flex items-center gap-2">
            <SpinnerSymbol color={agent.agentColor} />
          </div>
        )}
        <div ref={bottomRef} />
        <div className="flex-1" />
      </div>

      {/* Separator */}
      {agent.show.separators && (
        <div className="mx-4 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
      )}

      {/* Ask User Question flow or normal input */}
      {askFlow ? (
        <AskUserQuestion
          questions={askFlow}
          agentColor={agent.agentColor}
          onComplete={(flowAnswers) => {
            // Build summary message
            const lines = Object.entries(flowAnswers)
              .map(([, val]) => Array.isArray(val) ? val.join(", ") : val)
              .filter(Boolean)
            setMessages((prev) => [
              ...prev,
              {
                type: "agent",
                text: "Got it! Here are your choices:\n" + lines.map((l) => `  \u2192 ${l}`).join("\n"),
                meta: DEFAULT_META,
                timestamp: Date.now(),
              },
            ])
            setAskFlow(null)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          onCancel={() => {
            setMessages((prev) => [
              ...prev,
              { type: "agent", text: "Interview cancelled." },
            ])
            setAskFlow(null)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
        />
      ) : (
        <div className="relative">
          {/* Slash command dropdown */}
          {showSlashMenu && filteredSlashItems.length > 0 && (
            <div className="absolute bottom-full left-2 right-2 mb-1 max-h-48 overflow-y-auto rounded-md border border-black/10 bg-white/95 font-mono text-sm shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-black/90 [scrollbar-width:thin]">
              {filteredSlashItems.map((item, i) => (
                <button
                  key={item.cmd}
                  type="button"
                  ref={i === clampedSlashIndex ? (el) => el?.scrollIntoView({ block: "nearest" }) : undefined}
                  className={`flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors ${
                    i === clampedSlashIndex
                      ? "bg-black/8 dark:bg-white/10"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectSlashItem(item.cmd)
                  }}
                  onMouseEnter={() => setSlashIndex(i)}
                >
                  <span className="text-black/70 dark:text-white/70">/{item.cmd}</span>
                  <span className="text-black/35 dark:text-white/35">— {item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <form onSubmit={handleSubmit}>
            <div
              className="flex cursor-text gap-2 px-4 py-3 font-mono text-sm"
              onClick={() => inputRef.current?.focus()}
            >
              {agent.show.inputPrompt && (
                <span className="mt-0.5" style={{ color: agent.agentColor }}>&gt;</span>
              )}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Slash menu keyboard navigation
                  if (showSlashMenu && filteredSlashItems.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault()
                      setSlashIndex((prev) => (prev + 1) % filteredSlashItems.length)
                      return
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault()
                      setSlashIndex((prev) => (prev - 1 + filteredSlashItems.length) % filteredSlashItems.length)
                      return
                    }
                    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                      e.preventDefault()
                      selectSlashItem(filteredSlashItems[clampedSlashIndex].cmd)
                      return
                    }
                    if (e.key === "Escape") {
                      e.preventDefault()
                      setInput("")
                      return
                    }
                    if (e.key === "Tab") {
                      e.preventDefault()
                      setInput(`/${filteredSlashItems[clampedSlashIndex].cmd}`)
                      return
                    }
                  }

                  if (e.key === "Enter" && (e.shiftKey || e.ctrlKey)) {
                    const isImport = input.trimStart().startsWith("/import")
                    if (!isImport) {
                      const lineCount = input.split("\n").length
                      if (lineCount >= 3) {
                        e.preventDefault()
                        return
                      }
                    }
                  }
                  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="input"
                rows={1}
                className="flex-1 resize-none bg-transparent text-black/90 placeholder:text-black/30 outline-none dark:text-white/90 dark:placeholder:text-white/30"
                style={{
                  caretColor: agent.caretColor,
                  height: "auto",
                  minHeight: "1.5em",
                  maxHeight: input.trimStart().startsWith("/import") ? "20em" : "8em",
                  overflow: "auto",
                  fieldSizing: "content" as never,
                }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </form>
        </div>
      )}

      {/* Bottom separator */}
      {agent.show.separators && (
        <div className="mx-4 mb-3 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
      )}
    </>
  )
}
