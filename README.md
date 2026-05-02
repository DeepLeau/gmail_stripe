# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **AI Chat Interface** — Chat with your email history using a modern conversational UI
- **User Authentication** — Sign up and log in to access your personal email assistant
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration
- **Usage Tracking** — Track remaining queries and upgrade prompts based on your plan

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
# 4. Create a monthly "Pro" product at €49, copy the Price ID
STRIPE_PRICE_PRO=price_...
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Secret key for Stripe server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Publishable key for Stripe client-side |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks > your endpoint > Signing secret | Validates webhook requests from Stripe |
| `STRIPE_PRICE_STARTER` | Yes | Stripe Dashboard > Products > Starter > Pricing > Price ID | Price ID for Starter plan |
| `STRIPE_PRICE_GROWTH` | Yes | Stripe Dashboard > Products > Growth > Pricing > Price ID | Price ID for Growth plan |
| `STRIPE_PRICE_PRO` | Yes | Stripe Dashboard > Products > Pro > Pricing > Price ID | Price ID for Pro plan |

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/app/actions` — Server actions for subscription and checkout operations
- `src/app/api` — API routes for Stripe webhooks, checkout, chat, and subscription
- `src/app/chat` — Chat interface page
- `src/app/signup` — Signup page
- `src/components/auth` — Authentication UI components (SignupForm)
- `src/components/chat` — Chat UI components (ChatInterface, ChatInput)
- `src/components/sections` — Section components (Pricing)
- `src/components/ui` — Reusable UI components (UserMenu)
- `src/lib/chat` — Chat API utilities
- `src/lib/stripe` — Stripe client configuration, hooks, and utilities
- `src/lib/supabase` — Supabase server client setup

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Step by step:**

1. Click the button above or go to https://vercel.com/new
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings > Environment Variables**
4. Add all the environment variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_GROWTH`
   - `STRIPE_PRICE_PRO`
5. Click **Deploy**

> ⚠️ **Important**: For Stripe webhooks to work in production, you must add your production URL (e.g., `https://your-app.vercel.app`) as a webhook endpoint in your Stripe Dashboard.

## 📝 License

MIT