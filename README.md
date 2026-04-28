# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience at `/chat` with typing indicators and auto-scroll
- **User Authentication** — Sign up and log in to access your personal chat
- **Usage Tracking** — Track your API usage as you interact with the AI
- **Subscription Management** — Manage your subscription via Stripe integration

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Database & Auth**: Supabase
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

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — Payment Configuration
# Find your keys at: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Stripe — Price IDs
# Find these at: https://dashboard.stripe.com/products
STRIPE_PRICE_START=price_xxxxx
STRIPE_PRICE_SCALE=price_xxxxx
STRIPE_PRICE_TEAM=price_xxxxx

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

> 💡 **VS Code tip**: open the integrated terminal with Ctrl+` (or Cmd+` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard > API keys](https://dashboard.stripe.com/apikeys) | Secret API key for Stripe server-side operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks) | Webhook signature verification secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard > API keys](https://dashboard.stripe.com/apikeys) | Publishable API key for Stripe client-side |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard > Products > Start plan > Price ID | Price ID for the Start subscription tier |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard > Products > Scale plan > Price ID | Price ID for the Scale subscription tier |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard > Products > Team plan > Price ID | Price ID for the Team subscription tier |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your deployment URL or `http://localhost:3000` for local dev | Base URL of your application |

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to create Stripe Price IDs:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Products** in the left sidebar
3. Create or select a product for each plan (Start, Scale, Team)
4. Click **Add pricing** and configure the price
5. Copy the **Price ID** (starts with `price_`) and paste it as the corresponding variable

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api` — API endpoints for subscriptions, Stripe webhooks, and usage tracking
- `src/app/actions` — Server actions for subscription management
- `src/app/chat` — Chat page for AI interactions
- `src/app/signup` — User registration page
- `src/components/chat` — Chat UI components (interface, input)
- `src/components/sections` — Landing page sections (pricing)
- `src/components/ui` — Reusable UI components (user menu)
- `src/lib/auth` — Authentication utilities
- `src/lib/stripe` — Stripe client configuration

## 🚀 Deploy to Vercel

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/new).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. Click **Add New Project** on Vercel
2. Import your GitHub repository
3. In the **Environment Variables** section, add all variables from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_START`
   - `STRIPE_PRICE_SCALE`
   - `STRIPE_PRICE_TEAM`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

4. Click **Deploy**

> ⚠️ **Important**: After deploying, update `NEXT_PUBLIC_BASE_URL` to your actual Vercel URL and add your Vercel deployment URL to the Stripe dashboard as an allowed webhook URL.

## 📝 License

MIT