# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience powered by your email data
- **User Authentication** — Sign up and log in to access your personal chat with Supabase
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration
- **Stripe Checkout** — Secure payment flow with webhook handling for subscription events
- **Usage Tracking** — API endpoints to track and manage subscription usage limits

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

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration
# Get your keys at: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# 1. Go to https://dashboard.stripe.com/products
# 2. Create a product for each plan (Starter, Growth, Pro)
# 3. Click on each product > Pricing > copy the Price ID
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_PRO=price_...

# App URL (auto-filled for local dev)
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → **Project URL** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → **anon/public** key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API keys → **Secret key** | Private API key for Stripe server operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Developers → Webhooks → select endpoint | Signing secret to verify webhook authenticity |
| `STRIPE_PRICE_STARTER` | Yes | Stripe Dashboard → Products → Starter product → Pricing → **Price ID** | Price ID for the Starter subscription plan |
| `STRIPE_PRICE_GROWTH` | Yes | Stripe Dashboard → Products → Growth product → Pricing → **Price ID** | Price ID for the Growth subscription plan |
| `STRIPE_PRICE_PRO` | Yes | Stripe Dashboard → Products → Pro product → Pricing → **Price ID** | Price ID for the Pro subscription plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Auto-detected for local dev | Base URL for your app (http://localhost:3000 in dev) |

### How to get Supabase credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (or select an existing one)
3. Go to **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Copy the **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to get Stripe Price IDs

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** in the sidebar
3. Click **Add product** for each plan (Starter, Growth, Pro)
4. Set the name, pricing (e.g., monthly €9), and activate it
5. Click on the product → **Pricing** tab
6. Copy the **Price ID** (starts with `price_`)

## 📁 Project Structure

- **src/app** — Next.js App Router pages (`chat`, `signup`) and API routes
- **src/app/api** — API routes for Stripe webhooks, checkout, and subscription management
- **src/app/actions** — Server actions for subscription operations
- **src/components/auth** — Authentication components (SignupForm)
- **src/components/chat** — Chat interface components
- **src/components/sections** — Page sections (Pricing)
- **src/lib/stripe** — Stripe client configuration and React hooks for subscription linking

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Push your code to GitHub** — create a repo and push `my-app` to GitHub
2. **Import to Vercel** — go to [vercel.com/new](https://vercel.com/new), click "Import Project", select your GitHub repo
3. **Add environment variables** — in Vercel dashboard → Settings → Environment Variables, add each variable from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_GROWTH`
   - `STRIPE_PRICE_PRO`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)
4. **Deploy** — click "Deploy" and wait for the build to complete

> ⚠️ **Important for webhooks**: After deploying, you need to add a new webhook endpoint in Stripe Dashboard pointing to `https://your-app.vercel.app/api/stripe/webhook`.

## 📝 License

MIT