"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  type AgentData,
  type ScriptedReply,
  getAgents,
  saveAgent,
  removeAgent,
  resetAgent,
  duplicateAgent,
  createBlankAgent,
  exportAgents,
} from "@/lib/agent-store"

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-6 shrink-0 rounded-full border border-black/10 dark:border-white/10"
        style={{ backgroundColor: value }}
      />
      <div className="flex flex-1 flex-col gap-1">
        <Label className="text-xs text-black/50 dark:text-white/50">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono text-xs"
        />
      </div>
    </div>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-black/50 dark:text-white/50">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 font-mono text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="font-mono text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const animationOptions = [
  { label: "None", value: "none" },
  { label: "Bob (up-down)", value: "bob 2s ease-in-out infinite" },
  { label: "Bounce", value: "bounce 0.6s ease-in-out infinite" },
  { label: "Sway (left-right)", value: "sway 2s ease-in-out infinite" },
  { label: "Spin (7s)", value: "spin 7s linear infinite" },
  { label: "Spin (3s)", value: "spin 3s linear infinite" },
]

function ScriptedReplyRow({
  reply,
  onChange,
  onRemove,
  flowIds,
}: {
  reply: ScriptedReply
  onChange: (r: ScriptedReply) => void
  onRemove: () => void
  flowIds: string[]
}) {
  const [expanded, setExpanded] = useState(false)

  function updateMeta(key: keyof ScriptedReply["meta"], val: string) {
    onChange({ ...reply, meta: { ...reply.meta, [key]: val } })
  }

  return (
    <div className="rounded-md border border-black/10 p-2 dark:border-white/10">
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={reply.trigger}
              onChange={(e) => onChange({ ...reply, trigger: e.target.value })}
              className="h-7 font-mono text-xs"
              placeholder="Trigger text"
            />
            <textarea
              value={reply.response}
              onChange={(e) => onChange({ ...reply, response: e.target.value })}
              className="min-h-7 resize-y rounded-md border border-black/10 bg-transparent px-2 py-1 font-mono text-xs outline-none dark:border-white/10"
              placeholder="Response (supports newlines)"
              rows={1}
            />
          </div>
          {expanded && (
            <>
              <div className="grid grid-cols-5 gap-2">
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] text-black/40 dark:text-white/40">Start time</Label>
                  <Input value={reply.meta.startTime} onChange={(e) => updateMeta("startTime", e.target.value)} className="h-6 font-mono text-[10px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] text-black/40 dark:text-white/40">End time</Label>
                  <Input value={reply.meta.endTime} onChange={(e) => updateMeta("endTime", e.target.value)} className="h-6 font-mono text-[10px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] text-black/40 dark:text-white/40">Start tokens</Label>
                  <Input value={reply.meta.startTokens} onChange={(e) => updateMeta("startTokens", e.target.value)} className="h-6 font-mono text-[10px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] text-black/40 dark:text-white/40">End tokens</Label>
                  <Input value={reply.meta.endTokens} onChange={(e) => updateMeta("endTokens", e.target.value)} className="h-6 font-mono text-[10px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] text-black/40 dark:text-white/40">Label</Label>
                  <Input value={reply.meta.label} onChange={(e) => updateMeta("label", e.target.value)} className="h-6 font-mono text-[10px]" />
                </div>
              </div>
              {flowIds.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] text-black/40 dark:text-white/40">Ask flow (optional)</Label>
                  <Select value={reply.askFlow ?? "none"} onValueChange={(v) => onChange({ ...reply, askFlow: v === "none" ? undefined : v })}>
                    <SelectTrigger className="h-6 font-mono text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="font-mono text-[10px]">None</SelectItem>
                      {flowIds.map((id) => (
                        <SelectItem key={id} value={id} className="font-mono text-[10px]">{id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 font-mono text-xs"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Hide meta" : "Show meta"}
          >
            {expanded ? "−" : "⋯"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 font-mono text-xs text-red-500"
            onClick={onRemove}
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  )
}

function AgentEditor({
  agent,
  onSave,
  onDelete,
  onReset,
  onDuplicate,
}: {
  agent: AgentData
  onSave: (a: AgentData) => void
  onDelete?: () => void
  onReset?: () => void
  onDuplicate: () => void
}) {
  const [draft, setDraft] = useState<AgentData>(agent)
  const [importMessagesOpen, setImportMessagesOpen] = useState(false)

  useEffect(() => {
    setDraft(agent)
  }, [agent])

  function update(partial: Partial<AgentData>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  function updateShow(key: keyof AgentData["show"], val: boolean) {
    setDraft((prev) => ({ ...prev, show: { ...prev.show, [key]: val } }))
  }

  return (
    <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Identity */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">Identity</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-black/50 dark:text-white/50">Name</Label>
            <Input value={draft.name} onChange={(e) => update({ name: e.target.value })} className="h-8 text-xs" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-black/50 dark:text-white/50">Command</Label>
            <Input
              value={draft.command}
              onChange={(e) => update({ command: e.target.value })}
              className="h-8 font-mono text-xs"
              disabled={draft.isBuiltIn}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-black/50 dark:text-white/50">Welcome message</Label>
          <Input value={draft.welcomeMessage} onChange={(e) => update({ welcomeMessage: e.target.value })} className="h-8 text-xs" />
        </div>
      </section>

      <Separator />

      {/* Colors */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">Colors</h3>
        <div className="grid grid-cols-3 gap-3">
          <ColorField label="Agent color" value={draft.agentColor} onChange={(v) => update({ agentColor: v })} />
          <ColorField label="Caret color" value={draft.caretColor} onChange={(v) => update({ caretColor: v })} />
          <ColorField label="Prompt color" value={draft.userPromptColor} onChange={(v) => update({ userPromptColor: v })} />
        </div>
      </section>

      <Separator />

      {/* Header */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">Header</h3>
        <ToggleField label="Show title" checked={draft.show.headerTitle} onChange={(v) => updateShow("headerTitle", v)} />
        <ToggleField label="Show traffic lights" checked={draft.show.trafficLights} onChange={(v) => updateShow("trafficLights", v)} />
        {draft.show.trafficLights && (
          <div className="grid grid-cols-3 gap-3">
            {draft.trafficLights.map((c, i) => (
              <ColorField
                key={i}
                label={["Close", "Minimize", "Maximize"][i]}
                value={c}
                onChange={(v) => {
                  const tl = [...draft.trafficLights] as [string, string, string]
                  tl[i] = v
                  update({ trafficLights: tl })
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Mascot */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">Mascot</h3>
        <ToggleField label="Show mascot" checked={draft.show.mascot} onChange={(v) => updateShow("mascot", v)} />
        {draft.show.mascot && (
          <>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-black/50 dark:text-white/50">Mascot image URL</Label>
              <Input value={draft.mascotUrl} onChange={(e) => update({ mascotUrl: e.target.value })} className="h-8 text-xs" placeholder="https://example.com/mascot.png" />
            </div>
            <SelectField label="Idle animation" value={draft.mascotIdleAnimation} options={animationOptions} onChange={(v) => update({ mascotIdleAnimation: v })} />
            <SelectField label="Processing animation" value={draft.mascotProcessingAnimation} options={animationOptions} onChange={(v) => update({ mascotProcessingAnimation: v })} />
            <SelectField label="Icon animation" value={draft.mascotInnerAnimation} options={animationOptions} onChange={(v) => update({ mascotInnerAnimation: v })} />
          </>
        )}
      </section>

      <Separator />

      {/* Visibility */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">Visibility</h3>
        <ToggleField label="Meta bar (1s · ↑1.7K)" checked={draft.show.metaBar} onChange={(v) => updateShow("metaBar", v)} />
        <ToggleField label="Separators" checked={draft.show.separators} onChange={(v) => updateShow("separators", v)} />
        <ToggleField label="Input prompt (>)" checked={draft.show.inputPrompt} onChange={(v) => updateShow("inputPrompt", v)} />
      </section>

      <Separator />

      {/* Scripted Conversations */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">
            Scripted conversations ({draft.scriptedReplies?.length ?? 0})
          </h3>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="font-mono text-xs"
              onClick={() => {
                const newReply: ScriptedReply = {
                  trigger: "",
                  response: "",
                  meta: { startTime: "0", endTime: "5", startTokens: "1", endTokens: "1.7K", label: "esc to close" },
                }
                update({ scriptedReplies: [...(draft.scriptedReplies ?? []), newReply] })
              }}
            >
              + Add
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="font-mono text-xs"
              onClick={() => setImportMessagesOpen(true)}
            >
              Import
            </Button>
          </div>
        </div>
        {(draft.scriptedReplies ?? []).map((sr, idx) => (
          <ScriptedReplyRow
            key={idx}
            reply={sr}
            flowIds={(draft.questionFlows ?? []).map((f) => f.id)}
            onChange={(updated) => {
              const arr = [...(draft.scriptedReplies ?? [])]
              arr[idx] = updated
              update({ scriptedReplies: arr })
            }}
            onRemove={() => {
              const arr = (draft.scriptedReplies ?? []).filter((_, i) => i !== idx)
              update({ scriptedReplies: arr })
            }}
          />
        ))}
      </section>

      <Separator />

      {/* Fallback Replies */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">Fallback replies ({draft.replies.length})</h3>
        <p className="text-xs text-black/40 dark:text-white/40">Used when no scripted trigger matches.</p>
        <textarea
          value={draft.replies.join("\n")}
          onChange={(e) => update({ replies: e.target.value.split("\n").filter(Boolean) })}
          rows={6}
          className="resize-y rounded-md border border-black/10 bg-transparent p-2 font-mono text-xs outline-none dark:border-white/10"
          placeholder="One reply per line"
        />
      </section>

      <Separator />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={() => onSave(draft)} className="flex-1">
          Save
        </Button>
        <Button variant="secondary" onClick={onDuplicate}>
          Duplicate
        </Button>
        {draft.isBuiltIn && onReset && (
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
        )}
        {!draft.isBuiltIn && onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
      <ImportMessagesModal
        open={importMessagesOpen}
        onOpenChange={setImportMessagesOpen}
        onImport={(replies) => {
          update({ scriptedReplies: [...(draft.scriptedReplies ?? []), ...replies] })
          toast.success(`Added ${replies.length} scripted conversation${replies.length === 1 ? "" : "s"}`)
        }}
      />
    </div>
  )
}

const AI_PROMPT = `Generate a complete terminal agent configuration as a single JSON object. The JSON must match this exact schema:

{
  "name": "agent name",
  "command": "shortcut command to switch to this agent",
  "agentColor": "#hex color for the agent theme",
  "caretColor": "#hex color for the text caret",
  "userPromptColor": "#hex color for the user prompt symbol",
  "replies": ["array of fallback responses when no scripted trigger matches"],
  "scriptedReplies": [
    {
      "trigger": "user message to match (case-insensitive, fuzzy)",
      "response": "agent response text",
      "askFlow": "optional — ID of a questionFlow to start after this response",
      "meta": {
        "startTime": "0",
        "endTime": "5",
        "startTokens": "1",
        "endTokens": "1.7K",
        "label": "esc to close"
      }
    }
  ],
  "questionFlows": [
    {
      "id": "unique-flow-id",
      "trigger": "optional standalone trigger (fuzzy match, same as scriptedReplies)",
      "questions": [
        {
          "id": "step-id",
          "stepLabel": "short label for progress stepper",
          "question": "The question to ask the user?",
          "options": [
            { "label": "Option 1 (Recommended)", "description": "Description of this option" },
            { "label": "Option 2", "description": "Description of this option" }
          ],
          "allowCustom": true,
          "multiSelect": false
        }
      ]
    }
  ],
  "welcomeMessage": "message shown when switching to this agent",
  "trafficLights": ["#ff5f57", "#febc2e", "#28c840"],
  "metaTemplate": ["1s", "\\u21911.7K", "esc to close"],
  "mascotEmoji": "",
  "mascotUrl": "",
  "mascotIdleAnimation": "bob 2s ease-in-out infinite",
  "mascotProcessingAnimation": "bounce 0.6s ease-in-out infinite",
  "mascotInnerAnimation": "none",
  "show": {
    "mascot": false,
    "headerTitle": true,
    "trafficLights": true,
    "metaBar": true,
    "separators": true,
    "inputPrompt": true
  }
}

Animation options: "none", "bob 2s ease-in-out infinite", "bounce 0.6s ease-in-out infinite", "sway 2s ease-in-out infinite", "spin 7s linear infinite", "spin 3s linear infinite".

Token format: plain numbers or with K/M suffix (e.g. "1.7K", "500", "2.1M").

Responses support multiline text — use real newline characters in strings for line breaks (they render with whitespace-pre-wrap).

Question flows: A scriptedReply can link to a questionFlow via "askFlow" (the flow's id). After the response text shows, a multi-step question wizard starts. Flows can also have their own "trigger" for standalone activation. Each question step has options the user picks from, with optional "allowCustom" for free-text and "multiSelect" for checkboxes.

Be creative with the agent personality, colors, replies, and scripted conversations. Include at least 5 scripted trigger-response pairs, 10 fallback replies, and 1-2 question flows with 2-3 steps each. Return ONLY the JSON, no explanation.`

function ImportModal({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (agent: AgentData) => void
}) {
  const [json, setJson] = useState("")

  function handleCopyPrompt() {
    navigator.clipboard.writeText(AI_PROMPT)
    toast.success("Prompt copied to clipboard")
  }

  function handleSave() {
    try {
      const parsed = JSON.parse(json)
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
      onImport(agent)
      setJson("")
      onOpenChange(false)
    } catch {
      toast.error("Invalid JSON — check the format and try again")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="w-[50vw]! max-w-3xl! border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1a1a]">
        <DialogTitle className="font-mono text-sm text-black/70 dark:text-white/70">Import Agent</DialogTitle>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Section 1: AI Prompt */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">
                Generate with AI
              </h3>
              <Button variant="secondary" size="sm" onClick={handleCopyPrompt} className="font-mono text-xs">
                Copy prompt
              </Button>
            </div>
            <p className="text-xs text-black/40 dark:text-white/40">
              Copy this prompt and paste it into any AI agent (Claude, ChatGPT, etc.) to generate a terminal config.
            </p>
            <textarea
              readOnly
              value={AI_PROMPT}
              rows={8}
              className="resize-none rounded-md border border-black/10 bg-black/3 p-2 font-mono text-[11px] text-black/50 outline-none dark:border-white/10 dark:bg-white/3 dark:text-white/50"
            />
          </section>

          <Separator />

          {/* Section 2: Import */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">
              Import config
            </h3>
            <p className="text-xs text-black/40 dark:text-white/40">
              Paste the generated JSON below to create a new agent.
            </p>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={10}
              className="resize-y rounded-md border border-black/10 bg-transparent p-2 font-mono text-xs outline-none dark:border-white/10"
              placeholder='{"name": "my agent", ...}'
            />
          </section>

          <Button onClick={handleSave} disabled={!json.trim()}>
            Save as new agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const MESSAGES_AI_PROMPT = `Generate an array of scripted conversation pairs for a terminal agent. Each item matches a user message (trigger) to an agent response. Return a JSON array matching this schema:

[
  {
    "trigger": "user message to match (case-insensitive, fuzzy — matches if user input contains this text)",
    "response": "agent response text (supports multiline with real newline characters)",
    "askFlow": "optional — ID of a questionFlow to start after this response (omit if not needed)",
    "meta": {
      "startTime": "0",
      "endTime": "5",
      "startTokens": "1",
      "endTokens": "1.7K",
      "label": "esc to close"
    }
  }
]

Example:
[
  {
    "trigger": "hello",
    "response": "Hello! How can I help you today?",
    "meta": { "startTime": "0", "endTime": "2", "startTokens": "1", "endTokens": "800", "label": "esc to close" }
  },
  {
    "trigger": "setup project",
    "response": "Sure! Let me ask a few questions first.",
    "askFlow": "setup-flow",
    "meta": { "startTime": "0", "endTime": "3", "startTokens": "1", "endTokens": "1.5K", "label": "esc to close" }
  }
]

Notes:
- Triggers are matched fuzzy & case-insensitive (user input just needs to contain the trigger text)
- If two triggers overlap (e.g. "hello" and "hello world"), the longest match wins
- Responses support multiline text with real newline characters
- startTime/endTime: timer counts up in whole seconds (e.g. "0" to "5" = counts 0s, 1s, 2s... 5s)
- startTokens/endTokens: token counter interpolates (supports K/M suffix, e.g. "1.7K", "2.1M")
- askFlow: optional string referencing a questionFlow ID. When set, after the response text shows, a multi-step question wizard starts. The flow must be defined in the agent's questionFlows array.

Be creative and generate at least 8 trigger-response pairs. Return ONLY the JSON array, no explanation.`

function ImportMessagesModal({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (replies: ScriptedReply[]) => void
}) {
  const [json, setJson] = useState("")

  function handleCopyPrompt() {
    navigator.clipboard.writeText(MESSAGES_AI_PROMPT)
    toast.success("Prompt copied to clipboard")
  }

  function handleSave() {
    try {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) {
        toast.error("Expected a JSON array of scripted replies")
        return
      }
      const replies: ScriptedReply[] = parsed.map((item: Record<string, unknown>) => ({
        trigger: String(item.trigger ?? ""),
        response: String(item.response ?? ""),
        askFlow: item.askFlow ? String(item.askFlow) : undefined,
        meta: {
          startTime: String((item.meta as Record<string, unknown>)?.startTime ?? "0"),
          endTime: String((item.meta as Record<string, unknown>)?.endTime ?? "5"),
          startTokens: String((item.meta as Record<string, unknown>)?.startTokens ?? "1"),
          endTokens: String((item.meta as Record<string, unknown>)?.endTokens ?? "1.7K"),
          label: String((item.meta as Record<string, unknown>)?.label ?? "esc to close"),
        },
      }))
      onImport(replies)
      setJson("")
      onOpenChange(false)
    } catch {
      toast.error("Invalid JSON — check the format and try again")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="w-[50vw]! max-w-3xl! border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1a1a]">
        <DialogTitle className="font-mono text-sm text-black/70 dark:text-white/70">Import Messages</DialogTitle>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Section 1: AI Prompt */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">
                Generate with AI
              </h3>
              <Button variant="secondary" size="sm" onClick={handleCopyPrompt} className="font-mono text-xs">
                Copy prompt
              </Button>
            </div>
            <p className="text-xs text-black/40 dark:text-white/40">
              Copy this prompt and paste it into any AI agent to generate scripted conversation pairs.
            </p>
            <textarea
              readOnly
              value={MESSAGES_AI_PROMPT}
              rows={8}
              className="resize-none rounded-md border border-black/10 bg-black/3 p-2 font-mono text-[11px] text-black/50 outline-none dark:border-white/10 dark:bg-white/3 dark:text-white/50"
            />
          </section>

          <Separator />

          {/* Section 2: Import */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wider text-black/40 uppercase dark:text-white/40">
              Import messages
            </h3>
            <p className="text-xs text-black/40 dark:text-white/40">
              Paste the generated JSON array below to add scripted conversations.
            </p>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={10}
              className="resize-y rounded-md border border-black/10 bg-transparent p-2 font-mono text-xs outline-none dark:border-white/10"
              placeholder='[{"trigger": "hello", "response": "Hi there!", ...}]'
            />
          </section>

          <Button onClick={handleSave} disabled={!json.trim()}>
            Add messages
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SettingsModal({
  open,
  onOpenChange,
  onAgentsChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAgentsChange: (agents: AgentData[]) => void
}) {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [activeTab, setActiveTab] = useState("")
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    if (open) {
      const all = getAgents()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAgents(all)
      if (!activeTab || !all.find((a) => a.id === activeTab)) {
        setActiveTab(all[0]?.id ?? "")
      }
    }
  }, [open, activeTab])

  function handleSave(agent: AgentData) {
    const updated = saveAgent(agent)
    setAgents(updated)
    onAgentsChange(updated)
    toast.success("Settings saved")
  }

  function handleDelete(id: string) {
    const updated = removeAgent(id)
    setAgents(updated)
    setActiveTab(updated[0]?.id ?? "")
    onAgentsChange(updated)
    toast.success("Agent deleted")
  }

  function handleReset(id: string) {
    const updated = resetAgent(id)
    setAgents(updated)
    onAgentsChange(updated)
    toast.success("Reset to defaults")
  }

  function handleDuplicate(id: string) {
    const updated = duplicateAgent(id)
    setAgents(updated)
    const dup = updated[updated.length - 1]
    setActiveTab(dup.id)
    onAgentsChange(updated)
    toast.success("Agent duplicated")
  }

  function handleAdd() {
    const blank = createBlankAgent()
    const updated = saveAgent(blank)
    setAgents(updated)
    setActiveTab(blank.id)
    onAgentsChange(updated)
    toast.success("New agent created")
  }

  function handleExport() {
    const json = exportAgents()
    navigator.clipboard.writeText(json)
    toast.success("Config copied to clipboard")
  }

  function handleImportAgent(agent: AgentData) {
    const updated = saveAgent(agent)
    setAgents(updated)
    setActiveTab(agent.id)
    onAgentsChange(updated)
    toast.success("Agent imported")
  }

  const activeAgent = agents.find((a) => a.id === activeTab)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="w-[45vw]! max-w-3xl! border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1a1a]">
        <DialogTitle className="font-mono text-sm text-black/70 dark:text-white/70">Settings</DialogTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="w-max! flex-nowrap">
                {agents.map((a) => (
                  <TabsTrigger key={a.id} value={a.id} className="flex-none! font-mono text-xs">
                    {a.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="secondary" size="sm" onClick={handleAdd} className="font-mono text-xs">
                +
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport} className="font-mono text-xs">
                Export
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)} className="font-mono text-xs">
                Import
              </Button>
            </div>
          </div>
          {agents.map((a) => (
            <TabsContent key={a.id} value={a.id}>
              {activeAgent?.id === a.id && (
                <AgentEditor
                  agent={a}
                  onSave={handleSave}
                  onDelete={!a.isBuiltIn ? () => handleDelete(a.id) : undefined}
                  onReset={a.isBuiltIn ? () => handleReset(a.id) : undefined}
                  onDuplicate={() => handleDuplicate(a.id)}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
      <ImportModal open={importOpen} onOpenChange={setImportOpen} onImport={handleImportAgent} />
    </Dialog>
  )
}
