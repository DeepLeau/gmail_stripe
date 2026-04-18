# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **Contact insights** — Identify key contacts by topic or project
- **Question history** — Review all your past questions and answers
- **Gmail & Outlook integration** — Connect your inbox in one click
- **Secure data handling** — Encrypted storage, no data resale, revocable access

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

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router — pages and layout
│   │   ├── globals.css         # Global styles and Tailwind imports
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   └── page.tsx           # Home page — assembles all sections
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Navbar.tsx     # Top navigation bar
│   │   │   └── Footer.tsx     # Page footer
│   │   └── sections/          # Landing page sections
│   │       ├── Hero.tsx       # Hero with headline and CTA
│   │       ├── QuestionExamples.tsx  # Example questions showcase
│   │       ├── HowItWorks.tsx # 3-step explanation
│   │       ├── Features.tsx   # Feature cards grid
│   │       ├── TrustSecurity.tsx  # Security & trust badges
│   │       ├── Pricing.tsx    # Free vs Pro pricing
│   │       └── FinalCTA.tsx  # Final call-to-action
│   └── lib/
│       ├── utils.ts           # Utility functions (cn helper)
│       └── data.ts            # Static data (questions, features)
├── public/                    # Static assets (images, fonts)
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🚀 Deploy to Vercel

Vercel is the easiest way to deploy a Next.js application.

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Import your repository**
   - Click "Import Project" on Vercel
   - Select your GitHub repository
   - Vercel will auto-detect it's a Next.js project

2. **Configure your project**
   - Framework Preset: Next.js (auto-selected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for the build
   - Your site is live at `https://your-project.vercel.app`

No environment variables are required for this landing page.

## 📝 License

MIT

---

Built with care for people who deserve better than searching through 10,000 emails.