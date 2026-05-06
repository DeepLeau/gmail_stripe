# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience to interact with your emails in natural language
- **User Authentication** — Sign up and log in to access your personal email assistant
- **Subscription Plans** — Choose from Starter, Growth, and Enterprise tiers with Stripe integration

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

Copy the template from `.env.example` and fill in each value:

```bash
# Supabase — find these in your Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe — find these at https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — create these in Stripe Dashboard > Products
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Base URL — your app's URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Supabase anonymous key (safe to expose in client) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe publishable key (pk_test_... or pk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Webhook signing secret (whsec_...) |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Pricing | Price ID for Starter plan (€9.99/month) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Pricing | Price ID for Scale plan (€29.99/month) |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Pricing | Price ID for Enterprise plan (€99.99/month) |
| `NEXT_PUBLIC_BASE_URL` | Yes | — | Your app's base URL (http://localhost:3000 for dev) |

**How to find your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to create Stripe Price IDs:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Products** > **Add product**
3. Create a product for each plan (Starter, Scale, Enterprise)
4. Set the price (recurring, monthly)
5. Click on the price > copy the **Price ID** (starts with `price_`)

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/components` — React components (auth, chat, pricing, UI)
- `src/lib` — Utility libraries (Stripe client/config, chat mock API)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings** > **Environment Variables**
4. Add all variables from your `.env.local` file:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_ENTERPRISE_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL`

5. Click **Deploy**

> ⚠️ **Important**: After deploying, update `NEXT_PUBLIC_BASE_URL` to your production domain (e.g., `https://your-app.vercel.app`) and configure your Stripe webhook to point to `https://your-app.vercel.app/api/stripe/webhook`.

## 📝 License

MIT