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
# 2. Create a monthly "Starter" product, click on it > Pricing > copy the Price ID
STRIPE_PRICE_START=price_...
# 3. Create a monthly "Scale" product, copy the Price ID
STRIPE_PRICE_SCALE=price_...
# 4. Create a monthly "Team" product, copy the Price ID
STRIPE_PRICE_TEAM=price_...

# Application URL
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Secret API key for Stripe server operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Public API key for Stripe client |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks | Signing secret for webhook verification |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard > Products | Price ID for the Starter plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard > Products | Price ID for the Scale plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard > Products | Price ID for the Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your choice | Base URL for the application (http://localhost:3000 for development) |

### Finding Supabase credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon) in the left sidebar
4. Scroll down to **API**
5. Copy the **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

Only the folders and files that actually exist in this project are listed below.

- **src/app** — Next.js App Router pages, API routes, and server actions
- **src/components** — React components for UI (auth forms, chat interface, pricing section)
- **src/lib** — Shared libraries (Stripe client/config, auth session helpers, custom hooks)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables from your `.env.local` file:
   - Go to **Settings > Environment Variables**
   - Add each variable from the table above
4. Click **Deploy**

> ⚠️ **Important**: Make sure all environment variables are added in Vercel, especially `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, or your Stripe integration won't work.

## 📝 License

MIT