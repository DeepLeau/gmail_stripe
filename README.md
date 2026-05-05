# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience to interact with your email assistant
- **User Authentication** — Sign up and log in to access your personal chat via Supabase
- **Subscription Plans** — Choose from Start, Scale, and Team tiers with Stripe checkout integration
- **Usage Meters** — Track your usage with built-in meters and upgrade prompts
- **Webhook Integration** — Real-time Stripe webhook handling for subscription events

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
# 2. Create a monthly "Start" product at your desired price, click on it > Pricing > copy the Price ID
STRIPE_START_PRICE_ID=price_...
# 3. Create a monthly "Scale" product, copy the Price ID
STRIPE_SCALE_PRICE_ID=price_...
# 4. Create a monthly "Team" product, copy the Price ID
STRIPE_TEAM_PRICE_ID=price_...

# Application Base URL
# Used for Stripe billing portal and redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Supabase anonymous key for client-side auth |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > Secret key | Stripe secret key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > Publishable key | Stripe publishable key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks > your endpoint | Webhook signing secret (whsec_...) |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > your Start product > Pricing | Price ID for the Start plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > your Scale product > Pricing | Price ID for the Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard > Products > your Team product > Pricing | Price ID for the Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Your app's base URL for Stripe redirects |

## 📁 Project Structure

- `src/app` — Next.js App Router pages (`chat`, `signup`) and API routes (`api/stripe/*`, `api/subscription`)
- `src/app/actions` — Server actions for subscription management
- `src/components/auth` — Authentication components (`SignupForm`)
- `src/components/chat` — Chat interface components (`ChatInput`, `ChatInterface`)
- `src/components/sections` — Page sections (`Pricing`)
- `src/components/ui` — Reusable UI components (`UserMenu`)
- `src/lib/stripe` — Stripe utilities, hooks, and plan configuration

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Git Repository" and select your GitHub repo
2. **Configure project** — Vercel will auto-detect Next.js settings
3. **Add environment variables** — Go to Settings > Environment Variables and add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL` (set to your production URL, e.g., `https://your-app.vercel.app`)
4. **Deploy** — Click "Deploy" and wait for the build to complete

> ⚠️ **Important**: After deploying, update your Stripe webhook endpoint URL to point to your production domain (e.g., `https://your-app.vercel.app/api/stripe/webhook`)

## 📝 License

MIT