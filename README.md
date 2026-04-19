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
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Start (10 messages/month), Scale (50 messages/month), or Team (100 messages/month)
- **Stripe Checkout** — Secure payment flow directly from the pricing section
- **Automatic Account Provisioning** — Account created automatically after successful payment
- **Usage Tracking** — Real-time message quota display with monthly counter
- **Quota Management** — Automatic monthly reset of message limits
- **Billing Portal** — Manage your subscription, view invoices, and update payment method

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up here](https://stripe.com/) (free to start)
- **Supabase account** — [Sign up here](https://supabase.com/) (free tier works)

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

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Find STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in: Stripe Dashboard > Developers > API keys
# Find price IDs in: Stripe Dashboard > Product Catalog > [each product] > Pricing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PRICE_ID_START=price_your_start_plan_id
NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE=price_your_scale_plan_id
NEXT_PUBLIC_STRIPE_PRICE_ID_TEAM=price_your_team_plan_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to find your Stripe credentials:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. For **STRIPE_SECRET_KEY** and **STRIPE_PUBLISHABLE_KEY**:
   - Click **Developers** in the left sidebar
   - Click **API keys**
   - Copy the secret key (starts with `sk_`) and publishable key (starts with `pk_`)
3. For **Webhook secret**:
   - Click **Developers** > **Webhooks**
   - Click **Add endpoint**
   - Enter URL: `https://your-domain.com/api/webhooks/stripe` (or localhost for testing)
   - Add event: `checkout.session.completed`
   - Click **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`)
4. For **Price IDs** — create 3 products in Stripe Dashboard:
   - Click **Products** in the left sidebar
   - Click **Add product** for each plan:
     - **Start**: Name "Start", Price $9.99/month, copy the Price ID (starts with `price_`)
     - **Scale**: Name "Scale", Price $29.99/month, copy the Price ID
     - **Team**: Name "Team", Price $59.99/month, copy the Price ID

### 4. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

### 5. Create an account

Visit [http://localhost:3000](http://localhost:3000) and click on the pricing section to choose your plan. You will be redirected to Stripe's secure checkout. After payment, you'll be directed to create your account, and then you'll be ready to chat!

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > Secret key | Backend-only Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks > [your endpoint] > Signing secret | Verifies incoming webhook requests |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > Publishable key | Public Stripe key for frontend |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_START` | Yes | Stripe Dashboard > Products > Start plan > Pricing > Price ID | Stripe price ID for Start plan |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE` | Yes | Stripe Dashboard > Products > Scale plan > Pricing > Price ID | Stripe price ID for Scale plan |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_TEAM` | Yes | Stripe Dashboard > Products > Team plan > Pricing > Price ID | Stripe price ID for Team plan |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployed app URL or `http://localhost:3000` for local | Base URL for redirect URLs |

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── checkout.ts          # Server action for creating Stripe checkout sessions
│   │   ├── api/
│   │   │   ├── webhooks/stripe/
│   │   │   │   └── route.ts         # Handles Stripe webhook events
│   │   │   ├── billing/portal/
│   │   │   │   └── route.ts         # Creates Stripe customer portal sessions
│   │   │   └── cron/reset-quota/
│   │   │       └── route.ts         # Cron job to reset monthly quotas
│   │   ├── signup/
│   │   │   └── page.tsx             # Account creation page after Stripe checkout
│   │   ├── chat/
│   │   │   └── page.tsx             # Main chat interface with usage tracking
│   │   ├── billing/
│   │   │   └── page.tsx             # Subscription management page
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Landing page with pricing section
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── sections/
│   │   │   └── Pricing.tsx          # Pricing cards with Stripe checkout integration
│   │   ├── auth/
│   │   │   └── SignupForm.tsx       # Account creation form
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx    # Chat UI with message sending
│   │   │   └── UsageMeter.tsx       # Displays current plan and messages remaining
│   │   ├── ui/
│   │   │   └── UserMenu.tsx         # User dropdown with plan info and billing link
│   │   └── ...                      # Other UI components
│   └── lib/
│       ├── stripe/
│       │   ├── config.ts            # Stripe client initialization
│       │   └── webhook.ts          # Webhook event handling utilities
│       └── supabase/
│           └── client.ts           # Supabase client setup
├── public/                          # Static assets
├── .env.local                      # Environment variables (create this)
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
└── next.config.js                  # Next.js configuration
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Stripe subscription system"
   git push origin main
   ```

2. **Import to Vercel**
   - Click the deploy button above or go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add environment variables**
   - In Vercel dashboard, go to your project > **Settings** > **Environment Variables**
   - Add all the variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `NEXT_PUBLIC_STRIPE_PRICE_ID_START`
     - `NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE`
     - `NEXT_PUBLIC_STRIPE_PRICE_ID_TEAM`
     - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

4. **Update Stripe webhook URL**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/) > **Developers** > **Webhooks**
   - Add a new endpoint with URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Add event: `checkout.session.completed`
   - Copy the new signing secret and add it to Vercel environment variables

5. **Deploy**
   - Vercel will automatically build and deploy

> 💡 **Tip**: After deployment, test the full flow: select a plan → complete Stripe checkout → create account → access chat

## 📝 License

MIT