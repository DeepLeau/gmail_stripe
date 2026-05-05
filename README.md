# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration

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
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Find these in: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter your endpoint URL (e.g., https://yourdomain.com/api/stripe/webhook)
# 4. Select "checkout.session.completed" and "customer.subscription.updated"
# 5. Copy the webhook signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# 1. Go to https://dashboard.stripe.com/products
# 2. Create your products and pricing plans
# 3. Copy each Price ID and paste below
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `` Ctrl+` `` (or `` Cmd+` `` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Your Supabase anonymous key |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) | Your Stripe secret key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) | Your Stripe publishable key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks) | Webhook signing secret (whsec_...) |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Pricing | Price ID for the Starter plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Pricing | Price ID for the Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Pricing | Price ID for the Team plan |

**How to find Supabase credentials**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon) in the left sidebar
4. Click **API**
5. Find **Project URL** (copy this for `NEXT_PUBLIC_SUPABASE_URL`)
6. Find **anon/public** key under "Project API keys" (copy this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/components/auth` — Authentication components (signup form)
- `src/components/chat` — Chat interface components
- `src/components/ui` — Reusable UI components (user menu, etc.)
- `src/components/sections` — Page section components (pricing)
- `src/lib/stripe` — Stripe client, configuration, and React hooks
- `src/lib/api` — API client utilities for chat functionality

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Click the button above** or go to [vercel.com/new](https://vercel.com/new)
2. **Import your Git repository** — Connect your GitHub/GitLab repo
3. **Add environment variables** — In Vercel dashboard, go to **Settings > Environment Variables** and add every variable from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`

4. **Deploy** — Click "Deploy" and wait for the build to complete
5. **Update Stripe webhook** — After deployment, add your new Vercel URL as a Stripe webhook endpoint (e.g., `https://your-app.vercel.app/api/stripe/webhook`)

> ⚠️ **Important**: Make sure all environment variables are added in Vercel before deploying. Missing variables will cause the app to crash.

## 📝 License

MIT