# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience for interacting with your email assistant
- **User Authentication** — Sign up and log in to access your personal email assistant
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration
- **Stripe Checkout & Webhooks** — Secure payment processing with automatic subscription management

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

Copy the template from `.env.example`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Get your keys at: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter your endpoint URL (e.g., https://yourdomain.com/api/stripe/webhook)
# 4. Select the events you want to listen for
# 5. Copy the webhook signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# 1. Go to https://dashboard.stripe.com/products
# 2. Create your products and pricing tiers
# 3. Click on each product > Pricing > copy the Price ID
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → **anon/public key** | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API Keys → **Secret key** | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Developers → Webhooks → select endpoint → **Signing secret** | Verifies incoming webhook requests |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard → Products → select product → Pricing → **Price ID** | Price ID for the Starter plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard → Products → select product → Pricing → **Price ID** | Price ID for the Scale plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard → Products → select product → Pricing → **Price ID** | Price ID for the Team plan |

**How to find Supabase variables:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon) in the left sidebar
4. Click **API**
5. Find **Project URL** — copy it into `NEXT_PUBLIC_SUPABASE_URL`
6. Find **anon/public** key under "API Keys" — copy it into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/actions` — Server actions for checkout and subscription logic
- `src/app/api` — API routes for Stripe webhook and subscription endpoints
- `src/app/chat` — Chat page for the AI email assistant
- `src/app/signup` — User registration page
- `src/components/auth` — Authentication UI components
- `src/components/chat` — Chat interface and input components
- `src/components/sections` — Landing page sections including pricing
- `src/lib/stripe` — Stripe client configuration, hooks, and utilities

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment:

1. **Connect your repository**
   - Click the "Deploy with Vercel" button above
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Add environment variables**
   - In the Vercel dashboard, go to **Settings → Environment Variables**
   - Add all the variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_START`
     - `STRIPE_PRICE_SCALE`
     - `STRIPE_PRICE_TEAM`

3. **Configure Stripe webhook for production**
   - Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
   - Add a new endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Copy the signing secret to Vercel's environment variables

4. **Deploy**
   - Vercel will build and deploy automatically
   - Your app will be live at `https://your-app.vercel.app`

## 📝 License

MIT