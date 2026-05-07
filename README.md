# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **User Authentication** — Sign up and log in to access your account
- **Pricing Plans** — View subscription tiers (Start, Scale, Enterprise)
- **Analytics Integration** — Track page views and user events with PostHog
- **Responsive Landing Page** — Modern UI with animated sections

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Payments**: Stripe (subscriptions)
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

- **VS Code**: Press `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac) — this opens the built-in terminal at the bottom of the window
- **Mac**: Open Spotlight (`Cmd+Space`), type "Terminal", press Enter
- **Windows**: Press `Win+R`, type "cmd", press Enter

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive configuration like API keys — it never gets committed to GitHub.

Copy the template from `.env.example`:

```bash
# Supabase — authentication and database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe — subscription pricing (get these from your Stripe Dashboard)
NEXT_PUBLIC_STRIPE_START_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# PostHog — product analytics
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → **Project URL** | Your Supabase project URL (looks like `https://xyzxyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → **anon/public key** | Public key for Supabase client (safe to expose in browser) |
| `NEXT_PUBLIC_STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products → select product → copy **Price ID** | Price ID for the "Start" plan |
| `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products → select product → copy **Price ID** | Price ID for the "Scale" plan |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard → Products → select product → copy **Price ID** | Price ID for the "Enterprise" plan |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog Dashboard → Project Settings → Project API Key | Your PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | PostHog Dashboard → Project Settings | Usually `https://eu.i.posthog.com` for EU servers |

## 📁 Project Structure

- `src/app` — Next.js App Router layout and root configuration
- `src/components/auth` — Login and signup forms
- `src/components/sections` — Landing page sections (Hero, Pricing, FinalCTA)
- `src/components/ui` — Reusable UI components (Navbar)
- `src/lib/analytics` — PostHog analytics provider and event tracking
- `src/providers` — React context providers for PostHog

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables in Vercel → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_STRIPE_START_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
4. Click **Deploy**

> ⚠️ Make sure all `NEXT_PUBLIC_*` variables are added — these are required at build time for Next.js.

## 📝 License

MIT