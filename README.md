# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **User Authentication** — Sign up and log in to access your personal chat experience
- **AI Chat Interface** — Clean, modern chat experience for interacting with your data
- **Subscription Plans** — Choose from Starter, Scale, and Team tiers with Stripe integration
- **Stripe Checkout** — Seamless payment processing with webhook support for subscription management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication
- **Payments**: Stripe (checkout, webhooks, subscription management)

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

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services.

**For no-code users**: A `.env.local` file is a hidden configuration file where you store API keys and passwords. Think of it like a notepad that only your app can read. Never share this file or commit it to GitHub.

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase — Auth & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe — Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with Ctrl+` (or Cmd+` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API Keys → Secret key | Server-side Stripe API key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard → Developers → API Keys → Publishable key | Client-side Stripe API key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Developers → Webhooks → Your endpoint → Signing secret | Verifies webhook requests are from Stripe (whsec_...) |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard → Products → Your "Start" product → Pricing → Price ID | Price ID for the Starter subscription tier |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard → Products → Your "Scale" product → Pricing → Price ID | Price ID for the Scale subscription tier |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard → Products → Your "Team" product → Pricing → Price ID | Price ID for the Team subscription tier |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set to `http://localhost:3000` for local dev | Base URL of your application |

**Finding Supabase credentials step by step:**

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Click **Project Settings** (gear icon) in the left sidebar
4. Click **API** under the Settings section
5. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key under "Project API keys" → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

Only folders containing files from this repository are listed below.

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/app/api` — API endpoints for Stripe webhooks, checkout, and subscription management
- `src/app/actions` — Server actions for subscription handling
- `src/app/signup` — Signup page
- `src/app/chat` — Chat page
- `src/components` — Reusable UI components
- `src/components/auth` — Authentication components (signup form, client-side signup)
- `src/components/chat` — Chat interface component
- `src/components/ui` — UI components (user menu)
- `src/components/sections` — Page sections (pricing)
- `src/lib` — Utility libraries and configurations
- `src/lib/stripe` — Stripe client, config, and custom hooks

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Connect your repository**
   - Click the "Deploy with Vercel" button above
   - Import your GitHub repository
   - Select the branch to deploy (usually `main`)

2. **Add environment variables**
   - In the Vercel dashboard, go to **Settings → Environment Variables**
   - Add each variable from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_START`
     - `STRIPE_PRICE_SCALE`
     - `STRIPE_PRICE_TEAM`
     - `NEXT_PUBLIC_BASE_URL` (set to your production URL, e.g., `https://your-app.vercel.app`)

3. **Deploy**
   - Click **Deploy** — Vercel will automatically build and deploy your app

> ⚠️ **Important**: After deploying, you must update your Stripe webhook endpoint URL to point to your production domain (e.g., `https://your-app.vercel.app/api/stripe/webhook`).

## 📝 License

MIT