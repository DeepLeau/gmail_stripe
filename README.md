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

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services like Stripe and Supabase.

Copy the template from `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — configuration paiement
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase Dashboard → Project Settings → API → **Project URL** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase Dashboard → Project Settings → API → **anon/public** key | Public API key for client-side auth |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe Dashboard → [API Keys](https://dashboard.stripe.com/apikeys) | Secret API key for server-side operations |
| `STRIPE_PRICE_STARTER` | ✅ Yes | Stripe Dashboard → Products → create Starter subscription → Pricing → **Price ID** | Price ID for the Starter plan |
| `STRIPE_PRICE_GROWTH` | ✅ Yes | Stripe Dashboard → Products → create Growth subscription → Pricing → **Price ID** | Price ID for the Growth plan |
| `STRIPE_PRICE_PRO` | ✅ Yes | Stripe Dashboard → Products → create Pro subscription → Pricing → **Price ID** | Price ID for the Pro plan |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | Stripe Dashboard → [Webhooks](https://dashboard.stripe.com/webhooks) → add endpoint → `/api/stripe/webhook` → select `checkout.session.completed` and `invoice.payment_succeeded` → **Signing secret** | Validates incoming webhook events |
| `NEXT_PUBLIC_BASE_URL` | ✅ Yes | `http://localhost:3000` for local dev, or your production URL | Used for Stripe success/cancel redirect URLs |

### Where to find Supabase credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Find **Project URL** → copy and paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Find **anon/public** key under "Project API keys" → copy and paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Where to find Stripe Price IDs

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Products** in the sidebar
3. Click **Add product** → name it (e.g., "Starter Plan"), set price (e.g., €9/month), save
4. Click on the product → click **Pricing** → copy the **Price ID** (starts with `price_`)
5. Repeat for Growth and Pro plans

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/components` — Reusable React components (chat, auth, pricing sections)
- `src/lib` — Utility libraries (Stripe client, config, data helpers, custom hooks)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the deploy button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings → Environment Variables**
4. Add all variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_GROWTH`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (set to your production URL, e.g., `https://yourapp.vercel.app`)
5. Click **Deploy**

> ⚠️ **Important**: After deploying, go to your Stripe Dashboard → Webhooks → add a new endpoint with your production URL (e.g., `https://yourapp.vercel.app/api/stripe/webhook`) and copy the new signing secret to Vercel's environment variables.

## 📝 License

MIT