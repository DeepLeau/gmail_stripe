# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration
- **User Authentication** — Sign up and log in to access your personal chat

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

Create a new file named `.env.local` in the root folder of your project (same folder as `package.json`). Then open both files side by side and copy each line from `.env.example` into `.env.local`. Fill in the values for each variable as described below.

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) — click "Reveal test key" | Secret API key for Stripe server-side operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/webhooks) — click on your endpoint | Signing secret to verify webhook requests |
| `STRIPE_PRICE_ID_START` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) — create a product, click on it > Pricing, copy Price ID | Price ID for the "Starter" plan |
| `STRIPE_PRICE_ID_SCALE` | Yes | Same as above | Price ID for the "Scale" plan |
| `STRIPE_PRICE_ID_TEAM` | Yes | Same as above | Price ID for the "Team" plan |

### Supabase variables

Go to [Supabase Dashboard](https://supabase.com/dashboard) > select your project > **Project Settings** (gear icon) > **API**.

| Variable | Where to find it in Supabase |
|----------|------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API > **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API > **anon/public** key |

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api` — API endpoints for subscriptions and Stripe webhooks
- `src/app/chat` — Chat page and interface
- `src/components` — Reusable UI components
- `src/components/auth` — Authentication components (signup form)
- `src/components/chat` — Chat interface components
- `src/components/sections` — Page sections (pricing)
- `src/components/ui` — Reusable UI elements (user menu)
- `src/lib/stripe` — Stripe client configuration and helpers
- `src/lib/stripe/hooks` — Custom hooks for Stripe integration

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables in Vercel dashboard:

   - Go to your project > **Settings** > **Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add all `STRIPE_*` variables

4. Click **Deploy**

> ⚠️ **Important**: After deploying, you must update your Stripe webhook URL to point to your production domain (e.g., `https://your-app.vercel.app/api/stripe/webhook`).

## 📝 License

MIT