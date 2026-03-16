# Cosquad Terminal

A fully customizable, agent-powered terminal built for skill, CLI tool builders, and squads to share their tools with the community.

**[Live Demo](https://terminal.cosquad.ai)** | **[Follow us on X](https://x.com/Cosquadai)**

---

## What is this?

Create custom AI agents with their own personality, commands, and interactive flows. The best way for developers and squads to showcase CLI tools and skills in a shareable format.

- Custom agents with colors, mascots, and animations
- Scripted conversations with animated metadata
- Multi-step interactive wizards (question flows)
- Share agent configs as JSON
- AI-powered agent generation

---

## Features

### Slash Commands

Type `/` to see the command menu with keyboard navigation (arrow keys, Tab, Enter, Esc).

| Command | Description |
|---------|-------------|
| `/settings` | Open settings & agent editor |
| `/dark` | Switch to dark theme |
| `/light` | Switch to light theme |
| `/export` | Copy all agent configs to clipboard |
| `/import {json}` | Import agent config from JSON |
| `/clear` | Clear all messages |
| `/help` | Show all available commands |
| `/follow` | Follow Cosquad on X |
| `/star` | Star the project on GitHub |
| `/{agent}` | Switch to any agent (e.g. `/cc`, `/codex`) |

### Agent Customization

Every agent is fully customizable through the settings modal:

- **Identity** — Name, slash command, welcome message
- **Colors** — Agent color, caret color, prompt color
- **Mascot** — Custom image URL with idle, processing, and inner animations
- **Header** — Traffic lights (macOS-style dots) with custom colors, title toggle
- **Visibility** — Toggle meta bar, separators, input prompt, mascot, header

**Built-in animations:** Bob, Bounce, Sway, Spin (3s/7s)

### Scripted Conversations

Create trigger-response pairs that match user input (fuzzy, case-insensitive). The longest matching trigger wins.

Each response includes an animated meta bar showing:
- Elapsed time counter (e.g. `3s`)
- Token count with interpolation (e.g. `↑1.7K`)
- Custom status label

### Question Flows

Build multi-step interactive wizards that guide users through choices:

- Single-select or multi-select options
- Optional custom text input
- Progress stepper with step labels
- Review screen before submission
- Full keyboard navigation
- Can be triggered standalone or linked from a scripted reply via `askFlow`

### Import / Export

Share agents as JSON — paste into any terminal to create an identical agent:

- **Export** — `/export` copies all agents to clipboard
- **Import** — Paste JSON via `/import {json}` or the settings modal
- **AI Generation** — Copy a built-in prompt into Claude, ChatGPT, or any AI to generate a complete agent config with personality, replies, and question flows

### Theme Support

- Light and dark mode with smooth transitions
- Toggle via `/dark`, `/light`, or press `D`
- Follows system preference by default

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/cosquad/terminal.git
cd terminal

# Install dependencies
bun install

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the Cosquad intro animation, then the terminal.

---

## Creating Your Own Agent

### Option 1: Settings Modal

1. Type `/settings` to open the editor
2. Click **+** to create a new agent
3. Customize identity, colors, mascot, and visibility
4. Add scripted conversations and fallback replies
5. Click **Save**

### Option 2: AI Generation

1. Open `/settings` → click **Import**
2. Click **Copy prompt** to get the AI generation prompt
3. Paste into Claude, ChatGPT, or any AI
4. Copy the generated JSON back into the import textarea
5. Click **Save as new agent**

### Option 3: JSON Import

```bash
# In the terminal, paste your agent JSON:
/import {"name":"my-agent","command":"mybot","agentColor":"#22c55e",...}
```

---

## Agent JSON Schema

```json
{
  "name": "agent name",
  "command": "slash-command",
  "agentColor": "#hex",
  "caretColor": "#hex",
  "userPromptColor": "#hex",
  "replies": ["fallback reply 1", "fallback reply 2"],
  "scriptedReplies": [
    {
      "trigger": "hello",
      "response": "Hey there!",
      "askFlow": "optional-flow-id",
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
      "id": "setup-flow",
      "trigger": "optional standalone trigger",
      "questions": [
        {
          "id": "step-1",
          "stepLabel": "Step",
          "question": "What do you prefer?",
          "options": [
            { "label": "Option A", "description": "Description" }
          ],
          "allowCustom": true,
          "multiSelect": false
        }
      ]
    }
  ],
  "welcomeMessage": "Switched to my agent",
  "mascotUrl": "",
  "show": {
    "mascot": false,
    "headerTitle": true,
    "trafficLights": true,
    "metaBar": true,
    "separators": true,
    "inputPrompt": true
  }
}
```

---

## Links

- **Live Demo** — [terminal.cosquad.ai](https://terminal.cosquad.ai)
- **Follow us on X** — [@Cosquadai](https://x.com/Cosquadai)

---

## License

MIT
