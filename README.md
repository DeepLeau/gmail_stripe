# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Email Intelligence** — AI-powered email analysis and memory across conversations
- **Multi-Model AI** — Powered by OpenRouter supporting Anthropic, OpenAI, Google, and more
- **Analytics Integration** — PostHog for product analytics with GDPR-friendly EU hosting
- **Stripe Integration** — Seamless signup and subscription management via Stripe
- **Transactional Email** — Welcome emails and notifications via Resend

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase
- **Payments**: Stripe (subscriptions)
- **AI Integration**: OpenRouter API
- **Analytics**: PostHog
- **Email**: Resend

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME
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

# ─────────────────────────────────────────
# RESEND — Transactional Email
# ─────────────────────────────────────────
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=hello@yourdomain.com
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
| `RESEND_API_KEY` | Yes | [Resend API Keys](https://resend.com/api-keys) > Create key with "Sending access" permissions | API key for sending transactional emails |
| `RESEND_FROM_EMAIL` | Yes | Must be a [verified domain](https://resend.com/domains) in Resend (or `onboarding@resend.dev` for dev testing) | Sender email address for outgoing emails |

### Finding your Supabase credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Setting up Resend

1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys) and create a new key with "Sending access" permissions
3. To send emails from your own domain (recommended for production):
   - Go to [Domains](https://resend.com/domains) > Add Domain
   - Add the DNS records shown (SPF, DKIM, DMARC)
   - Wait for verification (usually a few minutes)
4. Copy your API key → paste as `RESEND_API_KEY`
5. Set `RESEND_FROM_EMAIL` to your verified domain address (e.g., `hello@yourdomain.com`)

> ⚠️ **Dev mode**: Without domain verification, emails only go to the Resend account owner and only from `onboarding@resend.dev`. For testing, use `RESEND_FROM_EMAIL=onboarding@resend.dev`.

## 📁 Project Structure

- `src/components/auth` — Authentication UI components including the signup form
- `src/lib/email` — Email utilities and templates (Resend integration)
- `src/lib/stripe/hooks` — Stripe signup linking and subscription management

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings** > **Environment Variables**
4. Add all variables from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

5. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`.

## 📝 License

MIT