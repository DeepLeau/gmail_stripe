# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **Contact insights** — Identify key contacts by topic or project
- **AI Chat Interface** — Clean, modern chat experience at `/chat`
- **User Authentication** — Sign up and log in to access your personal assistant
- **Subscription Plans** — Choose from Start, Scale, and Team tiers with Stripe integration

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase
- **Payments**: Stripe

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

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Payment Configuration
# STRIPE_SECRET_KEY — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET — https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
# STRIPE_PRICE_START — Price ID from Stripe Dashboard > Products > Start > Pricing
STRIPE_PRICE_START=price_...
# STRIPE_PRICE_SCALE — Price ID from Stripe Dashboard > Products > Scale > Pricing
STRIPE_PRICE_SCALE=price_...
# STRIPE_PRICE_TEAM — Price ID from Stripe Dashboard > Products > Team > Pricing
STRIPE_PRICE_TEAM=price_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# NEXT_PUBLIC_BASE_URL — Your app URL (http://localhost:3000 for local development)
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/client key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Secret API key for Stripe server-side operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Webhook signature for verifying Stripe events |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard > Products > Start > Pricing | Price ID for the Start subscription plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard > Products > Scale > Pricing | Price ID for the Scale subscription plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard > Products > Team > Pricing | Price ID for the Team subscription plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Publishable key for Stripe client-side |
| `NEXT_PUBLIC_BASE_URL` | Yes | — | Your app's base URL (use `http://localhost:3000` locally) |

### Finding Supabase variables

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Find **Project URL** — copy it to `NEXT_PUBLIC_SUPABASE_URL`
6. Find **anon/client key** under "Project API keys" — copy it to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api` — API endpoints (Stripe checkout, webhooks, subscription, auth, chat)
- `src/app/actions` — Server actions for subscription management
- `src/app/chat` — Chat page
- `src/app/signup` — Signup page
- `src/components/chat` — Chat interface components
- `src/components/auth` — Authentication form components
- `src/components/sections` — Pricing section components
- `src/components/ui` — Reusable UI components
- `src/lib/stripe` — Stripe client configuration

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings > Environment Variables**
4. Add all variables from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_START`
   - `STRIPE_PRICE_SCALE`
   - `STRIPE_PRICE_TEAM`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel URL, e.g., `https://your-app.vercel.app`)

5. Click **Deploy**

## 📝 License

MIT