# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience at `/chat` with typing indicators and auto-scroll
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Management** — Three pricing tiers (Start, Scale, Team) via Stripe integration
- **Stripe Checkout** — Secure payment flow with webhook support
- **Responsive UI** — Built with Tailwind CSS and Framer Motion animations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication
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

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — Payment configuration
# Find these in: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — Create in: Stripe Dashboard > Products > Add Product
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# App URL — Set to your domain (e.g. https://yourapp.com)
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

Open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Secret key for server-side Stripe (sk_live_... or sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Publishable key for client-side Stripe (pk_live_... or pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/webhooks) | Webhook signature verification secret |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products → Add Product (Start, €10/month recurring) | Price ID for Start plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products → Add Product (Scale, €39/month recurring) | Price ID for Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard → Products → Add Product (Team, €79/month recurring) | Price ID for Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set to your domain (e.g. `https://yourapp.com`) | Used for Stripe success/cancel redirect URLs |

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api/stripe` — Stripe checkout and webhook API endpoints
- `src/app/api/subscription` — Subscription management API
- `src/app/actions` — Server actions for subscription handling
- `src/app/signup` — Signup page
- `src/app/chat` — Chat page
- `src/components/auth` — Authentication components (AuthCard, SignupForm)
- `src/components/chat` — Chat UI components (ChatInterface, ChatInput)
- `src/components/ui` — Shared UI components (UserMenu)
- `src/components/sections` — Landing page sections (Pricing)
- `src/lib/stripe` — Stripe client and configuration utilities

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Step by step:**

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings → Environment Variables**
4. Add all variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g. `https://your-app.vercel.app`)
5. Click **Deploy**

> ⚠️ **Important**: After deployment, set up your Stripe webhook to point to `https://your-app.vercel.app/api/stripe/webhook`

## 📝 License

MIT