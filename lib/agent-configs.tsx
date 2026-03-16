import type { ReactNode } from "react"
import type { AgentData, ScriptedReply, QuestionFlow } from "./agent-store"

export type AgentConfig = {
  id: string
  name: string
  command: string
  isBuiltIn: boolean

  agentColor: string
  caretColor: string
  userPromptColor: string

  mascotIcon: ReactNode

  mascotIdleAnimation: string
  mascotProcessingAnimation: string
  mascotInnerAnimation: string

  replies: string[]
  scriptedReplies: ScriptedReply[]
  questionFlows: QuestionFlow[]
  welcomeMessage: string

  trafficLights: [string, string, string]
  /** @deprecated Use per-message meta from scriptedReplies instead */
  metaTemplate: string[]

  show: {
    mascot: boolean
    headerTitle: boolean
    trafficLights: boolean
    metaBar: boolean
    separators: boolean
    inputPrompt: boolean
  }
}

// --- Built-in Icons ---

const claudeMascotIcon = (
  <svg
    className="size-14"
    style={{ color: "#D97757" }}
    fill="currentColor"
    fillRule="evenodd"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z"
    />
  </svg>
)

const codexMascotIcon = (
  <img src="/codex-icon.png" alt="Codex" className="size-14" />
)

// --- Converter ---

export function toRuntime(data: AgentData): AgentConfig {
  let mascotIcon: ReactNode

  // Resolve mascot icon: URL > built-in > null
  if (data.mascotUrl) {
    mascotIcon = <img src={data.mascotUrl} alt={data.name} className="size-14 object-contain" />
  } else if (data.id === "cc") {
    mascotIcon = claudeMascotIcon
  } else if (data.id === "codex") {
    mascotIcon = codexMascotIcon
  } else {
    mascotIcon = null
  }

  return {
    id: data.id,
    name: data.name,
    command: data.command,
    isBuiltIn: data.isBuiltIn,

    agentColor: data.agentColor,
    caretColor: data.caretColor,
    userPromptColor: data.userPromptColor,

    mascotIcon,

    mascotIdleAnimation: data.mascotIdleAnimation,
    mascotProcessingAnimation: data.mascotProcessingAnimation,
    mascotInnerAnimation: data.mascotInnerAnimation,

    replies: data.replies,
    scriptedReplies: data.scriptedReplies ?? [],
    questionFlows: data.questionFlows ?? [],
    welcomeMessage: data.welcomeMessage,

    trafficLights: data.trafficLights,
    metaTemplate: data.metaTemplate,

    show: { ...data.show },
  }
}
