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
# 2. Create a monthly "Starter" product at €9, click on it > Pricing > copy the Price ID
STRIPE_PRICE_STARTER=price_...
# 3. Create a monthly "Growth" product at €29, copy the Price ID
STRIPE_PRICE_GROWTH=price_...
# 4. Create a monthly "Pro" product at €79, copy the Price ID
STRIPE_PRICE_PRO=price_...

# Base URL
# Use http://localhost:3000 for local development
# Use your production URL when deploying (e.g., https://your-app.vercel.app)
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
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard > Project Settings > API > anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Secret key | Server-side Stripe API key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Publishable key | Client-side Stripe API key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard > Developers > Webhooks > Your endpoint > Signing secret | Webhook signature verification (whsec_...) |
| `STRIPE_PRICE_STARTER` | ✅ | Stripe Dashboard > Products > Starter product > Pricing > Price ID | Price ID for €9/month Starter plan |
| `STRIPE_PRICE_GROWTH` | ✅ | Stripe Dashboard > Products > Growth product > Pricing > Price ID | Price ID for €29/month Growth plan |
| `STRIPE_PRICE_PRO` | ✅ | Stripe Dashboard > Products > Pro product > Pricing > Price ID | Price ID for €79/month Pro plan |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Set manually | Your app's URL (http://localhost:3000 locally) |

### Finding Supabase credentials

1. Go to [supabase.com](https://supabase.com) and sign in to your project
2. Click **Project Settings** (gear icon) at the top
3. Click **API** in the sidebar
4. Find **Project URL** → copy this for `NEXT_PUBLIC_SUPABASE_URL`
5. Find **anon/public** key → copy this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/app/api` — API route handlers for Stripe webhooks, checkout, and subscriptions
- `src/app/chat` — Chat page
- `src/components/auth` — Authentication components (signup form)
- `src/components/chat` — Chat interface components (main chat, input)
- `src/components/sections` — UI sections (pricing page)
- `src/components/ui` — Shared UI components (user menu)
- `src/lib/stripe` — Stripe client configuration, server utilities, and hooks
- `src/lib/chat` — Chat API mock and utilities

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Push your code to GitHub** (if you haven't already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Go to Vercel** and click **"Add New..." > Project**

3. **Import your GitHub repository** — select `my-app` from the list

4. **Add environment variables** — click **Environment Variables** and add every variable from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_GROWTH`
   - `STRIPE_PRICE_PRO`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel URL, e.g., `https://my-app.vercel.app`)

5. **Click Deploy** — Vercel will build and deploy your app

> 💡 **Important**: After deploying, update `NEXT_PUBLIC_BASE_URL` in Vercel to your production URL and set up your Stripe webhook to point to `https://your-domain.com/api/stripe/webhook`

## 📝 License

MIT