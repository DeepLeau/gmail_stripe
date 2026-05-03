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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_START=price_...
STRIPE_PRICE_ID_SCALE=price_...
STRIPE_PRICE_ID_TEAM=price_...
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
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon / public key | Supabase anonymous key for client-side auth |
| `STRIPE_SECRET_KEY` | ✅ | [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) | Secret API key (starts with `sk_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) | Publishable API key (starts with `pk_`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) | Webhook signing secret (starts with `whsec_`) |
| `STRIPE_PRICE_ID_START` | ✅ | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for the Starter plan |
| `STRIPE_PRICE_ID_SCALE` | ✅ | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for the Scale plan |
| `STRIPE_PRICE_ID_TEAM` | ✅ | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for the Team plan |

**Finding Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon / public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Finding Stripe Price IDs:**
1. Go to [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
2. Click on a product (e.g., "Starter")
3. Click on the pricing option
4. Copy the **Price ID** (starts with `price_`)

## 📁 Project Structure

```
src/app — Next.js App Router pages, API routes, and server actions
src/app/actions — Server actions for Stripe and subscription management
src/app/api — API route handlers (Stripe checkout, webhooks, subscription)
src/components — React components organized by feature
src/components/auth — Authentication components (SignupForm)
src/components/chat — Chat interface components (ChatInterface, ChatInput)
src/components/sections — Page sections (Pricing)
src/lib — Utility libraries and helpers
src/lib/stripe — Stripe client configuration, helpers, and hooks
src/lib/stripe/hooks — Custom React hooks for Stripe integration
.env.example — Environment variables template
```

## 🚀 Deploy to Vercel

The easiest way to deploy your Emind app is with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Step by step:**

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings → Environment Variables**
4. Add all the variables from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_START`
   - `STRIPE_PRICE_ID_SCALE`
   - `STRIPE_PRICE_ID_TEAM`

5. Click **Deploy**

> ⚠️ **Important**: Make sure to add all environment variables before deploying. If you forget one, you can add it later in Settings → Environment Variables and trigger a redeploy.

## 📝 License

MIT