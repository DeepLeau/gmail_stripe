# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Email Intelligence** — AI-powered email analysis and memory across conversations
- **Multi-Model AI** — Powered by OpenRouter supporting Anthropic, OpenAI, Google, and more
- **Analytics Integration** — PostHog for product analytics with GDPR-friendly EU hosting

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase
- **Payments**: Stripe (subscriptions)
- **AI Integration**: OpenRouter API
- **Analytics**: PostHog

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/gmail_stripe.git
cd gmail_stripe
```

**Where is my terminal?**

- **VS Code**: Press `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac) — this opens the built-in terminal at the bottom of the window
- **Mac**: Open Spotlight (`Cmd+Space`), type "Terminal", press Enter
- **Windows**: Press `Win+R`, type "cmd", press Enter

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive configuration like API keys — it never gets committed to GitHub.

Copy the template from `.env.example` and fill in each value:

```bash
# ─────────────────────────────────────────
# SUPABASE
# ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ─────────────────────────────────────────
# POSTHOG ANALYTICS
# ─────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for Supabase client |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog Dashboard > Project Settings > Project API Key | Your PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Leave as `https://eu.i.posthog.com` for EU hosting (GDPR-friendly) | PostHog server host URL |

**Finding Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Navigate to **API**
5. Copy **Project URL** for `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Finding PostHog credentials:**
1. Go to [eu.posthog.com](https://eu.posthog.com) (or us.posthog.com for US)
2. Select your project
3. Click **Project Settings**
4. Find **Project API Key** and copy it for `NEXT_PUBLIC_POSTHOG_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router layout and page structure
- `src/components/providers` — PostHog analytics provider components

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables in Vercel dashboard:
   - Go to **Settings** > **Environment Variables**
   - Add each variable from `.env.example`
4. Click **Deploy**

> ⚠️ Important: Make sure to add all environment variables before deploying, especially `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 📝 License

MIT