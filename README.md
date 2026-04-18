# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **Contact insights** — Identify key contacts by topic or project
- **Question history** — Review all your past questions and answers
- **Gmail & Outlook integration** — Connect your inbox in one click
- **Secure data handling** — Encrypted storage, no data resale, revocable access
- **AI Chat Interface** — Clean, modern chat experience at `/chat` with typing indicators and auto-scroll
- **User Authentication** — Sign up and log in with email and password via Supabase Auth
- **Protected Routes** — Chat page is only accessible to logged-in users; guests are redirected to login
- **Stripe Subscription Plans** — Choose between Start (10 msgs/mo), Scale (50 msgs/mo), or Team (100 msgs/mo)
- **Usage Meter** — See your remaining messages and current plan directly in the chat interface
- **Automatic Quota Reset** — Your message counter resets every month on your billing date
- **Upgrade Prompts** — When you hit your limit, you'll be prompted to upgrade your plan

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Authentication**: Supabase Auth
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)
- **Database**: Supabase (with row-level security for subscription data)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **A Supabase account** — [Sign up free here](https://supabase.com/)
- **A Stripe account** — [Sign up free here](https://stripe.com/) (use test mode for development)

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores secrets that your app needs to connect to Supabase and Stripe.

**How to create the file:**

1. In VS Code, right-click in the file explorer area
2. Select "New File"
3. Name it `.env.local`
4. Paste the content below

**Content for `.env.local`:**

```env
# Supabase (Authentication & Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe (Payments & Subscriptions)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Price IDs (create these in your Stripe Dashboard > Products)
STRIPE_PRICE_ID_START=price_your_start_plan_price_id_here
STRIPE_PRICE_ID_SCALE=price_your_scale_plan_price_id_here
STRIPE_PRICE_ID_TEAM=price_your_team_plan_price_id_here

# App URL (for redirect URLs after checkout)
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard > Project Settings > API > anon public key | Public key for Supabase client-side authentication |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Secret key | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard > Developers > Webhooks > your endpoint > Signing secret | Verifies incoming Stripe webhook events |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Publishable key | Client-side Stripe API key |
| `STRIPE_PRICE_ID_START` | ✅ | Stripe Dashboard > Products > your Start product > Price ID | Stripe Price ID for the Start plan ($10/mo) |
| `STRIPE_PRICE_ID_SCALE` | ✅ | Stripe Dashboard > Products > your Scale product > Price ID | Stripe Price ID for the Scale plan ($25/mo) |
| `STRIPE_PRICE_ID_TEAM` | ✅ | Stripe Dashboard > Products > your Team product > Price ID | Stripe Price ID for the Team plan ($50/mo) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Local: `http://localhost:3000` / Production: your deployed URL | Used for redirect URLs after Stripe checkout |

### How to create Stripe Products and Price IDs

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Products** > **Add product**
3. For each plan, create a product:
   - **Start**: Name it "Start", Price: $10/month, Billing: Recurring
   - **Scale**: Name it "Scale", Price: $25/month, Billing: Recurring
   - **Team**: Name it "Team", Price: $50/month, Billing: Recurring
4. Copy the **Price ID** for each product (starts with `price_...`)
5. Paste each Price ID into your `.env.local` file

### How to set up the Stripe Webhook

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`) into your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## 📁 Project Structure

```
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── api/                    # API routes
│   │   │   ├── checkout/           # Stripe checkout creation & verification
│   │   │   ├── webhooks/stripe/    # Stripe webhook handler
│   │   │   ├── profile/messages/   # User message quota API
│   │   │   └── cron/reset-quota/   # Monthly quota reset endpoint
│   │   ├── checkout/success/       # Post-checkout account creation page
│   │   └── chat/                   # Protected chat page
│   ├── components/
│   │   ├── sections/Pricing.tsx    # Pricing cards with Stripe checkout
│   │   ├── ui/UsageMeter.tsx       # Shows plan & remaining messages
│   │   └── chat/                   # Chat interface components
│   ├── lib/
│   │   ├── subscription/           # Plan definitions & types
│   │   └── stripe/                 # Stripe client configuration
│   └── middleware.ts                # Route protection & auth checks
├── llm_preview_tool                # External preview tool integration
└── package.json
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `src/lib/subscription/plans.ts` | Defines the 3 plans (Start, Scale, Team) with message limits |
| `src/lib/subscription/types.ts` | TypeScript types for plans and subscription data |
| `src/lib/stripe/client.ts` | Server-side Stripe client initialization |
| `src/components/sections/Pricing.tsx` | Landing page pricing section with plan cards |
| `src/components/ui/UsageMeter.tsx` | Shows current plan name and messages remaining |
| `src/components/chat/ChatInterface.tsx` | Main chat UI that checks and displays usage |
| `src/app/api/checkout/route.ts` | Creates Stripe checkout session when user selects a plan |
| `src/app/api/checkout/verify/route.ts` | Verifies checkout session after payment |
| `src/app/api/webhooks/stripe/route.ts` | Handles Stripe events (subscription created/updated/deleted) |
| `src/app/api/profile/messages/route.ts` | Tracks message usage and decrements quota |
| `src/app/cron/reset-quota/route.ts` | Resets monthly message quotas |
| `src/middleware.ts` | Protects chat route, redirects unauthenticated users |

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment:

1. **Connect your repository**
   - Click the "Deploy with Vercel" button above (or go to vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

2. **Add environment variables**
   - In Vercel dashboard, go to your project > **Settings** > **Environment Variables**
   - Add ALL variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_PRICE_ID_START`
     - `STRIPE_PRICE_ID_SCALE`
     - `STRIPE_PRICE_ID_TEAM`
     - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)

3. **Deploy**
   - Click **Deploy** — Vercel will build and deploy your app
   - Wait for the build to complete (usually 1-2 minutes)

4. **Update Stripe webhook URL**
   - After deployment, go to your Stripe Dashboard > Webhooks
   - Update your webhook endpoint URL to use your new Vercel domain:
     - `https://your-app.vercel.app/api/webhooks/stripe`
   - Add environment variables in Stripe webhook settings if needed

5. **Update Supabase redirect URLs**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Update **Site URL** and **Redirect URLs** to your production URL

## 📝 License

MIT