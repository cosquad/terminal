const STORAGE_KEY = "terminal-agents"

export type ScriptedReply = {
  trigger: string
  response: string
  askFlow?: string
  meta: {
    startTime: string
    endTime: string
    startTokens: string
    endTokens: string
    label: string
  }
}

export type QuestionOption = {
  label: string
  description?: string
}

export type ScriptedQuestion = {
  id: string
  stepLabel: string
  question: string
  options: QuestionOption[]
  allowCustom: boolean
  multiSelect: boolean
}

export type QuestionFlow = {
  id: string
  trigger?: string
  questions: ScriptedQuestion[]
}

export type AgentData = {
  id: string
  name: string
  command: string
  isBuiltIn: boolean

  agentColor: string
  caretColor: string
  userPromptColor: string

  replies: string[]
  scriptedReplies: ScriptedReply[]
  questionFlows: QuestionFlow[]
  welcomeMessage: string

  trafficLights: [string, string, string]
  /** @deprecated Use per-message meta from scriptedReplies instead */
  metaTemplate: string[]

  mascotEmoji: string
  mascotUrl: string
  mascotIdleAnimation: string
  mascotProcessingAnimation: string
  mascotInnerAnimation: string

  show: {
    mascot: boolean
    headerTitle: boolean
    trafficLights: boolean
    metaBar: boolean
    separators: boolean
    inputPrompt: boolean
  }
}

export const claudeDefaults: AgentData = {
  id: "cc",
  name: "claude code",
  command: "cc",
  isBuiltIn: true,

  agentColor: "#D97757",
  caretColor: "#D97757",
  userPromptColor: "#D97757",

  replies: [
    "I can help with that! Let me take a look...",
    "Interesting question. Here's what I think:",
    "Sure thing! Working on it now.",
    "Let me analyze that for you.",
    "Great point. Here's my perspective:",
    "I've processed your request. Here's the result:",
    "That's a fascinating problem. Let me break it down.",
    "On it! Give me just a moment.",
    "Here's what I found after looking into it:",
    "Absolutely. Let me walk you through this.",
    "I understand. Here's what we can do:",
    "Good question! The answer is quite simple.",
    "Let me think about that... Okay, here's my take:",
    "I've seen this before. Here's the solution:",
    "Noted. Processing your request now.",
  ],
  scriptedReplies: [
    {
      trigger: "hello",
      response: "Hello! How can I help you today?",
      meta: { startTime: "0", endTime: "2", startTokens: "1", endTokens: "800", label: "esc to close" },
    },
    {
      trigger: "what can you do",
      response: "I can help with coding, debugging, refactoring, and answering questions about your codebase.",
      meta: { startTime: "0", endTime: "5", startTokens: "1", endTokens: "2.1K", label: "esc to close" },
    },
    {
      trigger: "Im only human, human",
      response: "Maybe Im foolish",
      meta: { startTime: "0", endTime: "3", startTokens: "1", endTokens: "900", label: "esc to close" },
    },
    {
      trigger: "Im only human after all",
      response: "Dont put your blame on me",
      meta: { startTime: "0", endTime: "3", startTokens: "1", endTokens: "1.3K", label: "esc to close" },
    },
    {
      trigger: "Im only human",
      response: "Im only Im only",
      meta: { startTime: "0", endTime: "3", startTokens: "1", endTokens: "1.2K", label: "esc to close" },
    },
    {
      trigger: "so maybe Im blind",
      response: "but Im only human after all",
      meta: { startTime: "0", endTime: "4", startTokens: "1", endTokens: "1.4K", label: "esc to close" },
    },
    {
      trigger: "Maybe Im blind",
      response: "Thinking I can see through this",
      meta: { startTime: "0", endTime: "4", startTokens: "1", endTokens: "1.5K", label: "esc to close" },
    },
    {
      trigger: "And see whats behind",
      response: "Got no way to prove it",
      meta: { startTime: "0", endTime: "3", startTokens: "1", endTokens: "1.1K", label: "esc to close" },
    },
    {
      trigger: "Dont put your blame on me",
      response: "Im only human",
      meta: { startTime: "0", endTime: "3", startTokens: "1", endTokens: "1K", label: "esc to close" },
    },
    {
      trigger: "setup project",
      response: "Let me help you set up your project. I have a few questions first.",
      askFlow: "setup-flow",
      meta: { startTime: "0", endTime: "3", startTokens: "1", endTokens: "1.5K", label: "esc to close" },
    },
  ],
  questionFlows: [
    {
      id: "setup-flow",
      questions: [
        {
          id: "framework",
          stepLabel: "Framework",
          question: "Which framework would you like to use for this project?",
          options: [
            { label: "Next.js (Recommended)", description: "Full-stack React framework with SSR and file-based routing" },
            { label: "Vite + React", description: "Lightweight build tool with fast HMR for single-page apps" },
            { label: "Remix", description: "Full-stack framework focused on web standards and progressive enhancement" },
          ],
          allowCustom: true,
          multiSelect: false,
        },
        {
          id: "features",
          stepLabel: "Features",
          question: "Which features do you want to enable?",
          options: [
            { label: "TypeScript", description: "Type-safe JavaScript with compile-time checks" },
            { label: "Tailwind CSS", description: "Utility-first CSS framework for rapid styling" },
            { label: "ESLint + Prettier", description: "Code linting and formatting" },
            { label: "Testing setup", description: "Vitest or Jest with React Testing Library" },
          ],
          allowCustom: false,
          multiSelect: true,
        },
        {
          id: "package-manager",
          stepLabel: "Package mgr",
          question: "Which package manager should we use?",
          options: [
            { label: "bun (Recommended)", description: "Fast all-in-one JavaScript runtime and package manager" },
            { label: "npm", description: "Default Node.js package manager" },
            { label: "pnpm", description: "Efficient disk space usage with content-addressable storage" },
          ],
          allowCustom: false,
          multiSelect: false,
        },
      ],
    },
    {
      id: "deploy-flow",
      trigger: "deploy",
      questions: [
        {
          id: "platform",
          stepLabel: "Platform",
          question: "Where would you like to deploy?",
          options: [
            { label: "AWS (Recommended)", description: "Full control with EC2, Lambda, or ECS" },
            { label: "Docker", description: "Containerized deployment for any platform" },
          ],
          allowCustom: true,
          multiSelect: false,
        },
        {
          id: "environment",
          stepLabel: "Environment",
          question: "Which environment is this deployment for?",
          options: [
            { label: "Production", description: "Live environment serving real users" },
            { label: "Staging", description: "Pre-production testing environment" },
            { label: "Development", description: "Shared development environment" },
          ],
          allowCustom: false,
          multiSelect: false,
        },
      ],
    },
  ],
  welcomeMessage: "Switched to Claude Code",

  trafficLights: ["#ff5f57", "#febc2e", "#28c840"],
  metaTemplate: ["1s", "\u21911.7K", "esc to close"],

  mascotEmoji: "",
  mascotUrl: "",
  mascotIdleAnimation: "bob 2s ease-in-out infinite",
  mascotProcessingAnimation: "bounce 0.6s ease-in-out infinite",
  mascotInnerAnimation: "none",

  show: {
    mascot: true,
    headerTitle: true,
    trafficLights: true,
    metaBar: true,
    separators: true,
    inputPrompt: true,
  },
}

export const codexDefaults: AgentData = {
  id: "codex",
  name: "codex",
  command: "codex",
  isBuiltIn: true,

  agentColor: "#7B8BF5",
  caretColor: "#7B8BF5",
  userPromptColor: "#7B8BF5",

  replies: [
    "Running sandbox environment...",
    "Analyzing codebase structure...",
    "I've identified the relevant files. Here's my plan:",
    "Executing changes in sandbox...",
    "Let me review the code and propose a fix.",
    "Patch applied successfully. Ready for review.",
    "I'll create a pull request with these changes.",
    "Scanning repository for related patterns...",
    "Found 3 files that need updating. Starting now.",
    "Code review complete. Here are my suggestions:",
    "Building and testing the changes...",
    "All tests pass. Changes are ready.",
    "Let me trace through the execution path...",
    "I've refactored the code. Here's the diff:",
    "Deployment ready. Shall I proceed?",
  ],
  scriptedReplies: [
    {
      trigger: "hello",
      response: "Hey there! Ready to write some code?",
      meta: { startTime: "0", endTime: "3", startTokens: "1", endTokens: "1.2K", label: "esc to close" },
    },
  ],
  questionFlows: [],
  welcomeMessage: "Switched to Codex",

  trafficLights: ["#ff5f57", "#febc2e", "#28c840"],
  metaTemplate: ["1s", "\u21911.7K", "esc to close"],

  mascotEmoji: "",
  mascotUrl: "",
  mascotIdleAnimation: "none",
  mascotProcessingAnimation: "none",
  mascotInnerAnimation: "spin 7s linear infinite",

  show: {
    mascot: true,
    headerTitle: true,
    trafficLights: true,
    metaBar: true,
    separators: true,
    inputPrompt: true,
  },
}

const builtInDefaults: Record<string, AgentData> = {
  cc: claudeDefaults,
  codex: codexDefaults,
}

function loadFromStorage(): AgentData[] {
  if (typeof window === "undefined") return [claudeDefaults, codexDefaults]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [claudeDefaults, codexDefaults]
    const stored: AgentData[] = JSON.parse(raw)
    // Merge with built-in defaults to ensure new fields exist
    const result: AgentData[] = []
    for (const def of [claudeDefaults, codexDefaults]) {
      const override = stored.find((s) => s.id === def.id)
      result.push(override ? { ...def, ...override } : def)
    }
    // Add custom agents
    for (const s of stored) {
      if (!s.isBuiltIn) result.push(s)
    }
    return result
  } catch {
    return [claudeDefaults, codexDefaults]
  }
}

function saveToStorage(agents: AgentData[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
}

export function getAgents(): AgentData[] {
  return loadFromStorage()
}

export function saveAgent(agent: AgentData): AgentData[] {
  const agents = loadFromStorage()
  const idx = agents.findIndex((a) => a.id === agent.id)
  if (idx >= 0) {
    agents[idx] = agent
  } else {
    agents.push(agent)
  }
  saveToStorage(agents)
  return agents
}

export function removeAgent(id: string): AgentData[] {
  const agents = loadFromStorage().filter((a) => a.id !== id || a.isBuiltIn)
  saveToStorage(agents)
  return agents
}

export function resetAgent(id: string): AgentData[] {
  const def = builtInDefaults[id]
  if (!def) return loadFromStorage()
  return saveAgent({ ...def })
}

export function duplicateAgent(id: string): AgentData[] {
  const agents = loadFromStorage()
  const source = agents.find((a) => a.id === id)
  if (!source) return agents
  const newId = `custom-${Date.now()}`
  const dup: AgentData = {
    ...source,
    id: newId,
    name: `${source.name} (copy)`,
    command: `${source.command}-copy`,
    isBuiltIn: false,
  }
  agents.push(dup)
  saveToStorage(agents)
  return agents
}

export function createBlankAgent(): AgentData {
  return {
    id: `custom-${Date.now()}`,
    name: "new agent",
    command: `agent-${Date.now().toString(36)}`,
    isBuiltIn: false,

    agentColor: "#22c55e",
    caretColor: "#22c55e",
    userPromptColor: "#22c55e",

    replies: ["I'm a custom agent. Configure my replies in settings!"],
    scriptedReplies: [],
    questionFlows: [],
    welcomeMessage: "Switched to new agent",

    trafficLights: ["#ff5f57", "#febc2e", "#28c840"],
    metaTemplate: ["1s", "\u21911.7K", "esc to close"],

    mascotEmoji: "",
    mascotUrl: "",
    mascotIdleAnimation: "bob 2s ease-in-out infinite",
    mascotProcessingAnimation: "bounce 0.6s ease-in-out infinite",
    mascotInnerAnimation: "none",

    show: {
      mascot: false,
      headerTitle: true,
      trafficLights: true,
      metaBar: true,
      separators: true,
      inputPrompt: true,
    },
  }
}

export function exportAgents(): string {
  return JSON.stringify(loadFromStorage(), null, 2)
}

export function importAgents(json: string): AgentData[] {
  const imported: AgentData[] = JSON.parse(json)
  saveToStorage(imported)
  return imported
}
