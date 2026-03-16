"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { ScriptedQuestion } from "@/lib/agent-store"

export function AskUserQuestion({
  questions,
  agentColor,
  onComplete,
  onCancel,
}: {
  questions: ScriptedQuestion[]
  agentColor: string
  onComplete: (answers: Record<string, string | string[]>) => void
  onCancel: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [customText, setCustomText] = useState("")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [reviewing, setReviewing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)

  const q = questions[currentStep]

  // Total options count for current question
  const optionCount = q
    ? q.options.length + (q.allowCustom ? 1 : 0) + 2 // +2 for "Chat about this" and "Skip"
    : 2 // review screen: Submit / Cancel

  const totalOptions = reviewing ? 2 : optionCount

  // Focus the custom input when "Type something" is focused
  useEffect(() => {
    if (!reviewing && q?.allowCustom && focusedIndex === q.options.length) {
      customInputRef.current?.focus()
    }
  }, [focusedIndex, reviewing, q])

  const advanceStep = useCallback(
    (answer: string | string[]) => {
      const stepId = q.id
      const next = { ...answers, [stepId]: answer }
      setAnswers(next)
      setSelected(new Set())
      setCustomText("")
      setFocusedIndex(0)

      if (currentStep + 1 >= questions.length) {
        setReviewing(true)
      } else {
        setCurrentStep(currentStep + 1)
      }
    },
    [answers, currentStep, q, questions.length]
  )

  const handleSelect = useCallback(() => {
    if (reviewing) {
      if (focusedIndex === 0) {
        onComplete(answers)
      } else {
        onCancel()
      }
      return
    }

    if (!q) return

    const mainOptions = q.options.length + (q.allowCustom ? 1 : 0)

    // "Chat about this" or "Skip" — just cancel
    if (focusedIndex >= mainOptions) {
      onCancel()
      return
    }

    if (q.multiSelect) {
      // Toggle selection
      if (q.allowCustom && focusedIndex === q.options.length) {
        // Custom text in multi-select — add as answer
        if (customText.trim()) {
          const labels = Array.from(selected)
            .map((i) => q.options[i]?.label)
            .filter(Boolean)
          labels.push(customText.trim())
          advanceStep(labels)
        }
        return
      }

      const newSel = new Set(selected)
      if (newSel.has(focusedIndex)) {
        newSel.delete(focusedIndex)
      } else {
        newSel.add(focusedIndex)
      }
      setSelected(newSel)
    } else {
      // Single select
      if (q.allowCustom && focusedIndex === q.options.length) {
        if (customText.trim()) {
          advanceStep(customText.trim())
        }
        return
      }
      advanceStep(q.options[focusedIndex].label)
    }
  }, [reviewing, focusedIndex, q, selected, customText, advanceStep, answers, onComplete, onCancel])

  const handleMultiSelectNext = useCallback(() => {
    if (!q?.multiSelect) return
    const labels = Array.from(selected)
      .map((i) => q.options[i]?.label)
      .filter(Boolean)
    if (labels.length > 0) {
      advanceStep(labels)
    }
  }, [q, selected, advanceStep])

  const goBack = useCallback(() => {
    if (reviewing) {
      setReviewing(false)
      setFocusedIndex(0)
      return
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setFocusedIndex(0)
      setSelected(new Set())
      setCustomText("")
    }
  }, [reviewing, currentStep])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture keys when typing in custom input
      const isCustomFocused = !reviewing && q?.allowCustom && focusedIndex === q.options.length
      if (isCustomFocused && e.key !== "Escape" && e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Tab") {
        if (e.key === "Enter") {
          e.preventDefault()
          handleSelect()
        }
        return
      }

      switch (e.key) {
        case "ArrowDown":
        case "Tab":
          if (!e.shiftKey) {
            e.preventDefault()
            setFocusedIndex((prev) => (prev + 1) % totalOptions)
          } else {
            e.preventDefault()
            setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions)
          }
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions)
          break
        case "Enter":
          e.preventDefault()
          if (q?.multiSelect && selected.size > 0 && focusedIndex < q.options.length) {
            // If items are selected and we're on a regular option, check if we should advance
            handleSelect()
          } else {
            handleSelect()
          }
          break
        case "Escape":
          e.preventDefault()
          onCancel()
          break
        case "ArrowLeft":
          e.preventDefault()
          goBack()
          break
        case "n":
        case "N":
          // "Next" shortcut for multi-select
          if (q?.multiSelect && selected.size > 0) {
            e.preventDefault()
            handleMultiSelectNext()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [totalOptions, focusedIndex, handleSelect, handleMultiSelectNext, onCancel, goBack, reviewing, q, selected])

  // Auto-scroll
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [currentStep, reviewing])

  if (reviewing) {
    return (
      <div ref={containerRef} className="flex flex-col gap-2 px-4 py-3 font-mono text-sm">
        {/* Progress stepper */}
        <ProgressStepper
          questions={questions}
          currentStep={questions.length}
          reviewing={true}
          agentColor={agentColor}
          onStepClick={(i) => {
            setReviewing(false)
            setCurrentStep(i)
            setFocusedIndex(0)
          }}
        />

        {/* Review content */}
        <div className="mt-2 text-base font-bold text-black/80 dark:text-white/80">Review your answers</div>
        <div className="flex flex-col gap-2">
          {questions.map((sq) => (
            <div key={sq.id} className="flex flex-col gap-0.5">
              <div className="flex items-start gap-1.5">
                <span className="text-black/50 dark:text-white/50">&bull;</span>
                <span className="text-black/70 dark:text-white/70">{sq.question}</span>
              </div>
              <div className="ml-3.5" style={{ color: agentColor }}>
                &rarr;{" "}
                {Array.isArray(answers[sq.id])
                  ? (answers[sq.id] as string[]).join(", ")
                  : (answers[sq.id] as string) ?? "—"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-black/60 dark:text-white/60">Ready to submit your answers?</div>

        {/* Submit / Cancel */}
        <div className="flex flex-col gap-1 mt-1">
          <OptionRow
            index={0}
            focused={focusedIndex === 0}
            label="Submit answers"
            agentColor={agentColor}
            onClick={() => { setFocusedIndex(0); onComplete(answers) }}
          />
          <OptionRow
            index={1}
            focused={focusedIndex === 1}
            label="Cancel"
            agentColor={agentColor}
            onClick={() => { setFocusedIndex(1); onCancel() }}
          />
        </div>

        {/* Footer hint */}
        <div className="mt-2 text-xs text-black/30 dark:text-white/30">
          Enter to select &middot; Tab/Arrow keys to navigate &middot; Esc to cancel
        </div>
      </div>
    )
  }

  if (!q) return null

  const mainOptionCount = q.options.length + (q.allowCustom ? 1 : 0)
  const separatorAfter = mainOptionCount

  return (
    <div ref={containerRef} className="flex flex-col gap-2 px-4 py-3 font-mono text-sm">
      {/* Progress stepper */}
      <ProgressStepper
        questions={questions}
        currentStep={currentStep}
        reviewing={false}
        agentColor={agentColor}
        onStepClick={(i) => {
          if (i < currentStep) {
            setCurrentStep(i)
            setFocusedIndex(0)
            setSelected(new Set())
            setCustomText("")
          }
        }}
      />

      {/* Question */}
      <div className="mt-2 text-base font-bold text-black/80 dark:text-white/80">{q.question}</div>

      {/* Options */}
      <div className="flex flex-col gap-1 mt-1">
        {q.options.map((opt, i) => (
          <OptionRow
            key={i}
            index={i}
            focused={focusedIndex === i}
            label={opt.label}
            description={opt.description}
            agentColor={agentColor}
            multiSelect={q.multiSelect}
            checked={q.multiSelect ? selected.has(i) : undefined}
            onClick={() => {
              setFocusedIndex(i)
              if (q.multiSelect) {
                const newSel = new Set(selected)
                if (newSel.has(i)) newSel.delete(i)
                else newSel.add(i)
                setSelected(newSel)
              } else {
                advanceStep(opt.label)
              }
            }}
          />
        ))}

        {/* Type something option */}
        {q.allowCustom && (
          <div
            className="flex flex-col gap-0.5 cursor-pointer"
            onClick={() => {
              setFocusedIndex(q.options.length)
              customInputRef.current?.focus()
            }}
          >
            <div className="flex items-start gap-2">
              <span className="w-4 shrink-0 text-right" style={{ color: focusedIndex === q.options.length ? agentColor : undefined }}>
                {focusedIndex === q.options.length ? ">" : ""}
              </span>
              <span className="text-black/50 dark:text-white/50">{q.options.length + 1}.</span>
              {q.multiSelect && (
                <span className="text-black/40 dark:text-white/40">[ ]</span>
              )}
              <span className="text-black/70 dark:text-white/70">Type something</span>
            </div>
            {focusedIndex === q.options.length && (
              <div className="ml-10">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-transparent text-black/80 outline-none dark:text-white/80"
                  style={{ caretColor: agentColor }}
                  placeholder="Type your answer..."
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* Multi-select "Next" hint */}
        {q.multiSelect && selected.size > 0 && (
          <div className="ml-6 mt-1 text-xs" style={{ color: agentColor }}>
            {selected.size} selected — press N or Enter on &quot;Next&quot; to continue
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="my-1 h-px bg-black/8 dark:bg-white/8" />

      {/* Bottom actions */}
      <div className="flex flex-col gap-1">
        <OptionRow
          index={separatorAfter}
          focused={focusedIndex === separatorAfter}
          label="Chat about this"
          agentColor={agentColor}
          onClick={onCancel}
        />
        <OptionRow
          index={separatorAfter + 1}
          focused={focusedIndex === separatorAfter + 1}
          label="Skip interview and plan immediately"
          agentColor={agentColor}
          onClick={onCancel}
        />
      </div>

      {/* Multi-select Next button */}
      {q.multiSelect && selected.size > 0 && (
        <button
          className="mt-1 self-start rounded border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          style={{ color: agentColor }}
          onClick={handleMultiSelectNext}
        >
          Next
        </button>
      )}

      {/* Footer hint */}
      <div className="mt-2 text-xs text-black/30 dark:text-white/30">
        Enter to select &middot; Tab/Arrow keys to navigate &middot; Esc to cancel
      </div>
    </div>
  )
}

// --- Sub-components ---

function ProgressStepper({
  questions,
  currentStep,
  reviewing,
  agentColor,
  onStepClick,
}: {
  questions: ScriptedQuestion[]
  currentStep: number
  reviewing: boolean
  agentColor: string
  onStepClick: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto text-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <span
        className="shrink-0 cursor-pointer text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60"
        onClick={() => {
          if (reviewing) onStepClick(questions.length - 1)
          else if (currentStep > 0) onStepClick(currentStep - 1)
        }}
      >
        &larr;
      </span>
      {questions.map((sq, i) => {
        const completed = i < currentStep
        const active = !reviewing && i === currentStep
        return (
          <span
            key={sq.id}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 py-0.5"
            style={{
              backgroundColor: active ? agentColor + "20" : undefined,
              color: active ? agentColor : completed ? agentColor : undefined,
              borderWidth: active ? 1 : 0,
              borderColor: active ? agentColor + "40" : undefined,
            }}
            onClick={() => onStepClick(i)}
          >
            <span className="text-[10px]">
              {completed ? "\u2611" : "\u2610"}
            </span>
            {sq.stepLabel}
          </span>
        )
      })}
      {/* Submit step */}
      <span
        className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5"
        style={{
          backgroundColor: reviewing ? agentColor + "20" : undefined,
          color: reviewing ? agentColor : undefined,
          borderWidth: reviewing ? 1 : 0,
          borderColor: reviewing ? agentColor + "40" : undefined,
        }}
      >
        <span className="text-[10px]">{reviewing ? "\u2714" : ""}</span>
        Submit
      </span>
      <span className="shrink-0 text-black/30 dark:text-white/30">&rarr;</span>
    </div>
  )
}

function OptionRow({
  index,
  focused,
  label,
  description,
  agentColor,
  multiSelect,
  checked,
  onClick,
}: {
  index: number
  focused: boolean
  label: string
  description?: string
  agentColor: string
  multiSelect?: boolean
  checked?: boolean
  onClick: () => void
}) {
  return (
    <div className="flex flex-col gap-0.5 cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-2">
        <span
          className="w-4 shrink-0 text-right"
          style={{ color: focused ? agentColor : "transparent" }}
        >
          {focused ? ">" : ""}
        </span>
        <span className="text-black/50 dark:text-white/50">{index + 1}.</span>
        {multiSelect && (
          <span className="text-black/50 dark:text-white/50">
            [{checked ? "\u2713" : " "}]
          </span>
        )}
        <span
          className="text-black/80 dark:text-white/80"
          style={{ color: focused ? agentColor : undefined }}
        >
          {label}
        </span>
      </div>
      {description && (
        <div className="ml-10 text-black/40 dark:text-white/40 text-xs">{description}</div>
      )}
    </div>
  )
}
