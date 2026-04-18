# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **Contact insights** — Identify key contacts by topic or project
- **Question history** — Review all your past questions and answers
- **Gmail & Outlook integration** — Connect your inbox in one click
- **Secure data handling** — Encrypted storage, no data resale, revocable access
- **AI Chat Interface** — Clean, modern chat experience at `/chat` with typing indicators and auto-scroll

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

Open your terminal (more on this below) and run:

```bash
git clone https://github.com/YOUR_USERNAME/my-app.git
cd my-app
```

**Where is my terminal?**

- **VS Code**: Press `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac) — this opens the built-in terminal at the bottom of the window
- **Mac**: Open Spotlight (`Cmd+Space`), type "Terminal", press Enter
- **Windows**: Press `Win+R`, type "cmd", press Enter

### 2. Install dependencies

```bash
npm install
```

This will install all the packages listed in `package.json`.

### 3. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

### 4. Try the AI Chat

Visit [http://localhost:3000/chat](http://localhost:3000/chat) to experience the new chat interface. Type a message and press Enter or click the send button to see the mock AI response.

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router — pages and layout
│   │   ├── globals.css         # Global styles and Tailwind imports
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx           # Home page — landing page
│   │   └── chat/
│   │       └── page.tsx       # AI Chat page at /chat
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Navbar.tsx     # Top navigation bar
│   │   │   └── Footer.tsx     # Page footer
│   │   ├── sections/          # Landing page sections
│   │   │   ├── Hero.tsx       # Hero with headline and CTA
│   │   │   ├── QuestionExamples.tsx  # Example questions showcase
│   │   │   ├── HowItWorks.tsx # 3-step explanation
│   │   │   ├── Features.tsx   # Feature cards grid
│   │   │   ├── TrustSecurity.tsx  # Security & trust badges
│   │   │   ├── Pricing.tsx    # Free vs Pro pricing
│   │   │   └── FinalCTA.tsx  # Final call-to-action
│   │   └── chat/              # Chat interface components
│   │       ├── ChatInterface.tsx  # Main chat container
│   │       ├── ChatMessage.tsx    # Individual message bubble
│   │       ├── ChatInput.tsx      # Auto-expanding text input
│   │       └── TypingIndicator.tsx # Three-dot loading animation
│   └── lib/
│       ├── utils.ts           # Utility functions (cn helper)
│       ├── data.ts            # Static data (questions, features)
│       └── chat/
│           ├── types.ts       # Chat message type definitions
│           ├── responses.ts   # Mock AI response pool
│           └── mockApi.ts     # Mock API with random response delay
```

## 🤖 Chat Feature Architecture

The `/chat` page uses a mock API system designed for easy replacement with a real API later:

| File | Purpose |
|------|---------|
| `src/lib/chat/types.ts` | TypeScript interfaces for messages |
| `src/lib/chat/responses.ts` | Pool of generic AI responses |
| `src/lib/chat/mockApi.ts` | Mock API function (replace with real API call) |
| `src/components/chat/` | UI components for the chat interface |

To connect a real AI API later, simply update the `sendMessage` function in `ChatInterface.tsx` to call your API endpoint instead of `mockApi.sendMessage()`.

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Project" on Vercel, select your GitHub repo
2. **Configure project** — Vercel auto-detects Next.js settings (no changes needed)
3. **Add environment variables** — If you add any later (e.g., API keys), add them in Vercel > Settings > Environment Variables
4. **Deploy** — Click "Deploy" and wait ~1 minute

Your app will be live at `https://your-project.vercel.app` with the chat available at `/chat`.

> 💡 **Tip**: After deploying, test the `/chat` page to ensure the chat interface works correctly in production.

## 📝 License

MIT