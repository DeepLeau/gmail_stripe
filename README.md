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
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

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
STRIPE_PRICE_ID_STARTER=price_...
# 3. Repeat for "Growth" and "Pro" products
STRIPE_PRICE_ID_GROWTH=price_...
STRIPE_PRICE_ID_PRO=price_...

# Base URL
# Use http://localhost:3000 for local development
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public key for Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard → Project Settings → API → service_role key | Server-side only key for admin operations |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API keys | Secret API key for Stripe server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard → Developers → API keys | Public key for Stripe client-side operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Webhooks | Signing secret for webhook verification |
| `STRIPE_PRICE_ID_STARTER` | Yes | Stripe Dashboard → Products → Starter product → Pricing | Monthly subscription price ID for Starter plan |
| `STRIPE_PRICE_ID_GROWTH` | Yes | Stripe Dashboard → Products → Growth product → Pricing | Monthly subscription price ID for Growth plan |
| `STRIPE_PRICE_ID_PRO` | Yes | Stripe Dashboard → Products → Pro product → Pricing | Monthly subscription price ID for Pro plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Your app's URL (http://localhost:3000 locally, production URL in production) |

## 📁 Project Structure

```
.env.example — Environment variables template
src/app — Next.js App Router pages and API routes
src/components/auth — Authentication components (SignupForm)
src/components/chat — Chat interface components (ChatInterface, ChatInput)
src/components/sections — Landing page sections (Pricing)
src/components/ui — Shared UI components (UserMenu)
src/lib/supabase — Supabase server client configuration
src/lib/stripe — Stripe utilities, hooks, and configuration
```

## 🚀 Deploy to Vercel

The easiest way to deploy your Emind app is with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Project" and select your GitHub repo
2. **Configure environment variables** — In the Vercel dashboard, go to Settings → Environment Variables and add all variables from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_STARTER`
   - `STRIPE_PRICE_ID_GROWTH`
   - `STRIPE_PRICE_ID_PRO`
   - `NEXT_PUBLIC_BASE_URL` (set to your production URL, e.g., https://your-app.vercel.app)

3. **Deploy** — Click "Deploy" and wait for the build to complete
4. **Set up Stripe webhook** — After deploying, add your production URL as a webhook endpoint in Stripe Dashboard → Webhooks

## 📝 License

MIT