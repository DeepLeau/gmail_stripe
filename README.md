# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience to ask questions about your emails
- **Smart Pricing** — Subscription plans (Start, Scale, Team) with Stripe integration
- **User Authentication** — Sign up and log in to access your personal email assistant
- **Stripe Webhook Integration** — Handles checkout sessions and subscription updates

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

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`).

Copy the template from `.env.example` and fill in each value. Here's what you need:

```bash
# Supabase — find these in your Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Stripe — find your API keys at https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter your endpoint URL (e.g., https://yourdomain.com/api/stripe/webhook)
# 4. Select "checkout.session.completed" and "customer.subscription.updated"
# 5. Copy the webhook signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — create products in Stripe Dashboard > Products, then copy their Price IDs
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...

# Your app URL (http://localhost:3000 for local development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `` Ctrl+` `` (or `` Cmd+` `` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) | Secret API key for Stripe server operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) | Publishable key for Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks) | Signs webhook payloads from Stripe |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard > Products > Start plan > Pricing | Price ID for the Starter plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard > Products > Scale plan > Pricing | Price ID for the Scale plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard > Products > Team plan > Pricing | Price ID for the Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Your app's URL (use `http://localhost:3000` locally) |

## 📁 Project Structure

Only folders containing actual project files are listed below:

- **src/app** — Next.js App Router pages (`chat`, `signup`) and API routes (`api/subscription`, `api/stripe`)
- **src/app/actions** — Server actions for subscription management
- **src/components** — React components organized by feature (chat, auth, ui, sections)
- **src/lib/stripe** — Stripe client configuration, hooks, and utilities

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings > Environment Variables**
4. Add all variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_START`
   - `STRIPE_PRICE_SCALE`
   - `STRIPE_PRICE_TEAM`
   - `NEXT_PUBLIC_BASE_URL`
5. Click **Deploy**

> ⚠️ **Important**: After deploying, update `NEXT_PUBLIC_BASE_URL` to your production URL (e.g., `https://your-app.vercel.app`) and set up your Stripe webhook to point to `https://your-app.vercel.app/api/stripe/webhook`.

## 📝 License

MIT