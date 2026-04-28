# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **User Authentication** — Sign up and log in to access your personal email assistant
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **Subscription Plans** — Choose from Start, Scale, and Team tiers with Stripe integration
- **Secure Checkout** — Stripe-powered checkout flow for subscription management
- **Usage Tracking** — Monitor your subscription usage in real-time

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
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

# Stripe — configuration paiement
# STRIPE_SECRET_KEY — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET — https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
# STRIPE_START_PRICE_ID — Dashboard Stripe > Products > Start > Pricing
STRIPE_START_PRICE_ID=price_...
# STRIPE_SCALE_PRICE_ID — Dashboard Stripe > Products > Scale > Pricing
STRIPE_SCALE_PRICE_ID=price_...
# STRIPE_TEAM_PRICE_ID — Dashboard Stripe > Products > Team > Pricing
STRIPE_TEAM_PRICE_ID=price_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# NEXT_PUBLIC_BASE_URL — Your production URL (e.g. https://yoursite.com), or http://localhost:3000 for local dev
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Secret API key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Webhook signing secret (starts with `whsec_`) |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > Start plan > Pricing | Price ID for Start subscription tier |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > Scale plan > Pricing | Price ID for Scale subscription tier |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard > Products > Team plan > Pricing | Price ID for Team subscription tier |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Publishable key (starts with `pk_`) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Your app's URL (use `http://localhost:3000` for local development) |

### Finding Supabase credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Under **API**, find:
   - **Project URL** → copy into `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → copy into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Creating Stripe Price IDs

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** > **Add product**
3. Create three products: **Start**, **Scale**, and **Team**
4. For each product, add a recurring price
5. Copy each Price ID (starts with `price_`) into the corresponding variable

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages and API routes
│   ├── actions/                  # Server actions
│   ├── api/                      # API route handlers
│   │   ├── stripe/               # Stripe checkout and webhook endpoints
│   │   ├── subscription/         # Subscription management endpoints
│   ├── chat/                     # Chat page
│   └── signup/                   # Signup page
├── components/                  # React components
│   ├── auth/                     # Authentication components
│   ├── billing/                  # Billing and plan components
│   ├── chat/                     # Chat interface components
│   └── sections/                # Page section components
├── lib/
│   └── stripe/                   # Stripe client utilities and hooks
├── middleware.ts                 # Next.js middleware for auth
.env.example                      # Environment variables template
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Git Repository" and select your GitHub repo
2. **Configure project** — Vercel will auto-detect Next.js settings
3. **Add environment variables** — Go to Settings > Environment Variables and add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g. `https://your-app.vercel.app`)
4. **Deploy** — Click "Deploy"

> ⚠️ **Important**: After deploying, update your Stripe webhook URL to point to your production domain (e.g., `https://your-app.vercel.app/api/stripe/webhook`)

## 📝 License

MIT