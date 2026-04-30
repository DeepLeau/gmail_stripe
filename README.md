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
- **Git** — [Install here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### 1. Clone the repository

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

Create a file named `.env.local` in the project root (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services like Supabase and Stripe.

Copy the contents of `.env.example` and fill in all values:

```bash
# ── Supabase ─────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ── Stripe ──────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon/public key | Public key safe for client-side |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard → Project Settings → API → service_role key | Server-side only — never expose |
| `STRIPE_SECRET_KEY` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key | Server-side Stripe operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Publishable key | Safe for client-side |
| `STRIPE_WEBHOOK_SECRET` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → Your endpoint → Signing secret | Verifies incoming webhook requests |
| `STRIPE_PRICE_STARTER` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/products) → Starter product → Pricing → Price ID | Starter plan price ID |
| `STRIPE_PRICE_GROWTH` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/products) → Growth product → Pricing → Price ID | Growth plan price ID |
| `STRIPE_PRICE_PRO` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/products) → Pro product → Pricing → Price ID | Pro plan price ID |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Your deployment URL (e.g., `https://yourapp.vercel.app`) | Used for Stripe redirect URLs |

## 📁 Project Structure

- `src/lib` — Stripe client configuration and utilities
- `src/app/api/checkout` — Stripe checkout session API endpoint
- `src/app/api/webhooks/stripe` — Stripe webhook handler
- `src/components/auth` — Authentication forms and components
- `src/components/chat` — AI chat interface components
- `src/components/ui` — Reusable UI components (menus, buttons, etc.)
- `src/components/sections` — Page sections like pricing

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment

1. **Push your code to GitHub** — if you haven't already
2. **Import to Vercel** — Click the button above, then select your repository
3. **Add environment variables** — In Vercel dashboard, go to your project → Settings → Environment Variables and add all variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_GROWTH`
   - `STRIPE_PRICE_PRO`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)
4. **Deploy** — Vercel will automatically build and deploy your app

> ⚠️ **Important**: For Stripe webhooks to work in production, you must add your Vercel deployment URL (e.g., `https://your-app.vercel.app`) as a webhook endpoint in your Stripe Dashboard under Developers → Webhooks.

## 📝 License

MIT