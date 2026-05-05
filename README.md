# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience to ask questions about your emails in plain English
- **User Authentication** — Sign up and log in to access your personal chat with Supabase
- **Subscription Plans** — Choose from Starter, Growth, and Team tiers with Stripe checkout and webhooks

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
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

Copy the template below and fill in each value:

```bash
# Supabase — find these in your Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe — find your API keys at https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs — Dashboard Stripe → Products → create each product → click it → Pricing → copy Price ID
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# Stripe Webhook Secret
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter URL: https://yourdomain.com/api/stripe/webhook (use http://localhost:3000/api/stripe/webhook for local dev)
# 4. Select events: "checkout.session.completed" and "customer.subscription.updated"
# 5. Click "Add endpoint" and copy the signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your app URL — use http://localhost:3000 for local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `` Ctrl+` `` (or `` Cmd+` `` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Secret key | Backend-only Stripe key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Publishable key | Public Stripe key (pk_test_...) |
| `STRIPE_START_PRICE_ID` | ✅ | Stripe Dashboard → Products → Starter product → Pricing → Price ID | Price ID for the Starter plan |
| `STRIPE_SCALE_PRICE_ID` | ✅ | Stripe Dashboard → Products → Scale product → Pricing → Price ID | Price ID for the Scale plan |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe Dashboard → Products → Team product → Pricing → Price ID | Price ID for the Team plan |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret | Validates incoming webhook events |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Set manually | Your app's URL (http://localhost:3000 for dev) |

**How to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Find **Project URL** and **anon/public** key under "Project API keys"

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api` — API routes for Stripe checkout, webhooks, and subscription management
- `src/app/actions` — Server actions for subscription handling
- `src/app/chat` — Chat page
- `src/app/signup` — Signup page
- `src/components/auth` — Authentication components (SignupForm)
- `src/components/chat` — Chat UI components (ChatInput, ChatInterface)
- `src/components/sections` — Page sections (Pricing)
- `src/lib` — Utility functions and data (Stripe config, mock API)
- `src/lib/stripe` — Stripe client configuration and subscription hooks

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings → Environment Variables**
4. Add all variables from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

5. Click **Deploy**

> ⚠️ **Important**: After deployment, update your Stripe webhook URL to point to your Vercel URL (e.g., `https://your-app.vercel.app/api/stripe/webhook`) and add it in Stripe Dashboard → Developers → Webhooks.

## 📝 License

MIT