# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Starter, Scale, and Team tiers with Stripe integration

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

Open your terminal and run:

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services.

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase — find these in Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs — https://dashboard.stripe.com/products
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# Stripe Webhook Secret — https://dashboard.stripe.com/webhooks
# After creating an endpoint for /api/stripe/webhook, copy the signing secret
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|-------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API keys | Secret API key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard → Developers → API keys | Publishable API key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Developers → Webhooks | Signing secret for webhook verification |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products → your Starter product → Pricing | Price ID for Starter plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products → your Scale product → Pricing | Price ID for Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard → Products → your Team product → Pricing | Price ID for Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set to `http://localhost:3000` for local dev | Your app's base URL |

**Finding Supabase credentials:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public key** (under "Project API keys") → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Creating Stripe price IDs:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click **Add product**
3. Create your Starter plan (e.g., €9/month) — name it "Starter"
4. Click into the product → **Pricing** → copy the **Price ID** (starts with `price_`)
5. Repeat for Scale and Team plans

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api/chat` — Chat API endpoints
- `src/app/api/stripe` — Stripe checkout and webhook handlers
- `src/app/api/subscription` — Subscription management endpoints
- `src/app/actions` — Server actions for subscriptions
- `src/app/chat` — Chat page
- `src/components/auth` — Authentication components (signup forms)
- `src/components/chat` — Chat interface components
- `src/components/sections` — Page sections (pricing)
- `src/components/ui` — Reusable UI components (user menu)
- `src/lib/stripe` — Stripe client configuration and utilities
- `src/lib/stripe/hooks` — React hooks for Stripe integration

## 🚀 Deploy to Vercel

The easiest way to deploy is with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Steps:**

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. In **Environment Variables**, add all variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL` (set to your production domain, e.g., `https://your-app.vercel.app`)
4. Click **Deploy**

> ⚠️ **Important**: For Stripe webhooks to work in production, add your production URL (e.g., `https://your-app.vercel.app/api/stripe/webhook`) in the Stripe Dashboard → Webhooks.

## 📝 License

MIT