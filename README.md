# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience to interact with your emails in natural language
- **Email Intelligence** — AI-powered email analysis and memory across conversations
- **Multi-Model AI** — Powered by OpenRouter supporting Anthropic, OpenAI, Google, and more
- **Pricing Plans** — Flexible subscription tiers (Start, Scale, Enterprise) integrated with Stripe
- **Authentication** — Secure signup and login via Supabase

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Payments**: Stripe
- **Auth & Database**: Supabase
- **Analytics**: PostHog

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/my-app.git
cd my-app
```

**Where is my terminal?**

- **VS Code**: Press `` Ctrl+` `` (Windows/Linux) or `` Cmd+` `` (Mac) — this opens the built-in terminal at the bottom of the window
- **Mac**: Open Spotlight (`` Cmd+Space ``), type "Terminal", press Enter
- **Windows**: Press `Win+R`, type "cmd", press Enter

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive configuration like API keys — it never gets committed to GitHub.

Copy the template from `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe
NEXT_PUBLIC_STRIPE_START_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `` Ctrl+` `` (or `` Cmd+` `` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public key for client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard → Project Settings → API → service_role key | Server-side admin key (never expose to client) |
| `NEXT_PUBLIC_STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products → copy Price ID | Price ID for the Start plan |
| `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products → copy Price ID | Price ID for the Scale plan |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard → Products → copy Price ID | Price ID for the Enterprise plan |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API keys → secret key | Secret key for Stripe API (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Webhooks → select endpoint → Signing Secret | Secret to verify webhook requests |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog → Project Settings → Project API Key | Analytics key (starts with `phc_`) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | PostHog → Project Settings → URL | PostHog server URL |
| `NEXT_PUBLIC_BASE_URL` | Yes | — | Your app's URL (use `http://localhost:3000` locally) |

## 📁 Project Structure

- `src/app` — Next.js App Router with API routes for Stripe checkout
- `src/components` — UI components (Navbar, Hero, Pricing, FinalCTA sections, SignupForm, PostHogProvider)
- `src/lib` — Server-side utilities (PostHog)
- `src/providers` — Client-side providers (PostHog)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js — click Deploy
4. Add all environment variables in Vercel → Settings → Environment Variables:
   - Copy every variable from your `.env.local` file
   - Don't forget `NEXT_PUBLIC_` prefix for client-side variables
5. Redeploy after adding environment variables

Your app will be live at `https://your-project.vercel.app`.

## 📝 License

MIT