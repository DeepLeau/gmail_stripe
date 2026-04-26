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
- **3 Pricing Plans** — Choose between Start (10 messages/month), Scale (50 messages/month), or Team (100 messages/month)
- **Seamless Checkout** — Purchase a subscription without creating an account first; your plan is automatically linked after signup
- **Usage Tracking** — See your current plan and remaining messages directly in the chat interface
- **Smart Upgrade Prompts** — When you hit your message limit, get a gentle nudge to upgrade to a higher plan
- **Monthly Reset** — Message counters automatically reset each month when your subscription renews

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication
- **Payments**: Stripe Checkout & Webhooks

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up here](https://stripe.com/) (free for testing)
- **Supabase project** — [Create one here](https://supabase.com/) (free tier works)

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

# Stripe — configuration paiement
# https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Create products at: https://dashboard.stripe.com/products
# Each product needs a recurring monthly price
STRIPE_START_PRICE_ID=price_your_start_price_id
STRIPE_SCALE_PRICE_ID=price_your_scale_price_id
STRIPE_TEAM_PRICE_ID=price_your_team_price_id

# Base URL of your project
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set up Stripe products and prices

Before running the app, you need to create 3 products in your Stripe dashboard:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Products** in the left sidebar
3. Click **Add product** for each plan:

   | Plan | Name | Price | Interval |
   |------|------|-------|----------|
   | Start | Start | $9.00 (or your preferred amount) | Monthly |
   | Scale | Scale | $19.00 (or your preferred amount) | Monthly |
   | Team | Team | $39.00 (or your preferred amount) | Monthly |

4. For each product:
   - Enter the product name (Start, Scale, or Team)
   - Set the pricing type to **Standard pricing**
   - Choose **Recurring** billing
   - Set interval to **Monthly**
   - Enter your price amount
   - Click **Add product**
5. Copy each **Price ID** (starts with `price_`) and add it to your `.env.local`

### 5. Set up Stripe webhook

You need a webhook endpoint to sync payments with your database:

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL:
   - **Local dev**: `http://localhost:3000/api/webhooks/stripe`
   - **Production**: `https://your-domain.com/api/webhooks/stripe`
4. Click **+ Select events** and select:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Webhook secret** (starts with `whsec_`) and add it to your `.env.local`

### 6. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard > Project Settings > API > anon/public key | Your Supabase anonymous key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Secret key | Stripe secret key (sk_live_... or sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Publishable key | Stripe publishable key (pk_live_... or pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard > Webhooks > your endpoint > Signing secret | Webhook signature verification secret (whsec_...) |
| `STRIPE_START_PRICE_ID` | ✅ | Stripe Dashboard > Products > Start product > Price ID | Price ID for the Start plan (price_...) |
| `STRIPE_SCALE_PRICE_ID` | ✅ | Stripe Dashboard > Products > Scale product > Price ID | Price ID for the Scale plan (price_...) |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe Dashboard > Products > Team product > Price ID | Price ID for the Team plan (price_...) |
| `NEXT_PUBLIC_BASE_URL` | ✅ | — | Base URL: `http://localhost:3000` for dev, `https://your-domain.com` for production |

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── checkout/       # Stripe checkout session API
│   │   │   ├── webhooks/       # Stripe webhook handler
│   │   │   └── auth/           # Supabase auth callbacks
│   │   ├── chat/               # Chat interface page
│   │   ├── pricing/            # Pricing plans page
│   │   ├── signup/             # Sign up page
│   │   └── login/              # Login page
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   ├── supabase/           # Supabase client setup
│   │   ├── stripe/             # Stripe client setup
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables (gitignored)
├── .env.example                # Example environment variables
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
└── tsconfig.json               # TypeScript configuration
```

## 🔐 How the Checkout Flow Works

### For new users (no account required):

1. User visits the landing page and browses pricing plans
2. User clicks **"Choose Plan"** on any plan card
3. User is redirected to Stripe Checkout to complete payment
4. After payment, Stripe redirects user back to `/signup` with a `session_id` in the URL
5. User creates their account
6. The webhook automatically links the Stripe subscription to their new account
7. User can now access the chat with their subscribed plan

### For existing users:

1. User logs in
2. User browses pricing and selects a plan
3. If user already has a subscription, they're prompted to upgrade instead
4. Payment is processed via Stripe Checkout
5. Webhook updates their subscription in the database

### Usage limits in chat:

- The chat interface displays the user's current plan and remaining messages
- When messages reach zero, a banner appears offering an upgrade
- After upgrading, the counter updates immediately
- Monthly subscription renewal resets the counter automatically

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Git Repository**
   - Select your GitHub repo
   - Vercel will auto-detect Next.js settings

3. **Add environment variables**
   - In Vercel dashboard, go to your project > **Settings** > **Environment Variables**
   - Add all variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_START_PRICE_ID`
     - `STRIPE_SCALE_PRICE_ID`
     - `STRIPE_TEAM_PRICE_ID`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

4. **Update Stripe webhook URL**
   - Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Add a new endpoint with your Vercel URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Copy the new webhook secret to Vercel environment variables

5. **Deploy**
   - Click **Deploy** and wait for the build to complete
   - Your app will be live at `https://your-app.vercel.app`

> 💡 **Tip**: After deploying, test the checkout flow with Stripe test mode cards (e.g., `4242 4242 4242 4242`) before going live.

## 📝 License

MIT