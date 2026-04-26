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
- **Three Pricing Plans** — Start (10 messages/month), Scale (50 messages/month), Team (100 messages/month)
- **Stripe Checkout Integration** — Pay for your plan without creating an account first
- **Usage Tracking** — See your current plan and remaining messages in the chat interface
- **Automatic Upgrade Prompts** — Get notified when you hit your message limit with options to upgrade

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication
- **Payments**: Stripe Checkout

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

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Find Stripe keys at: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx

# Stripe Webhook Secret
# Set up at: https://dashboard.stripe.com/webhooks
# Endpoint URL: https://your-domain.com/api/stripe/webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Stripe Price IDs — Dashboard Stripe > Products > click product > Pricing tab
STRIPE_PRICE_START=price_xxxx
STRIPE_PRICE_SCALE=price_xxxx
STRIPE_PRICE_TEAM=price_xxxx
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to find your Stripe keys:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy the **Secret key** (starts with `sk_`) as `STRIPE_SECRET_KEY`
5. Copy the **Publishable key** (starts with `pk_`) as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**How to create your Stripe Price IDs:**

1. In Stripe Dashboard, click **Products** in the left sidebar
2. Click **Add product** to create the Start plan
3. Enter product details:
   - **Name**: Start
   - **Pricing model**: Select "Standard pricing"
   - **Amount**: Enter your price (e.g., 9.99 for $9.99/month)
   - **Currency**: USD
   - **Billing period**: Monthly
4. Click **Add product**, then click the created product
5. In the **Pricing** section, click the price to copy its ID (starts with `price_`)
6. Paste this as `STRIPE_PRICE_START`
7. Repeat steps 2-6 for Scale (50 messages/month) and Team (100 messages/month)

**How to set up Stripe Webhook:**

1. In Stripe Dashboard, click **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Under "Select events", check **checkout.session.completed**
5. Click **Add endpoint**
6. Copy the **Webhook secret** (starts with `whsec_`) and paste it as `STRIPE_WEBHOOK_SECRET`

For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret it outputs and add it as `STRIPE_WEBHOOK_SECRET`.

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

### 5. How the checkout flow works

1. Visit the pricing page and select a plan
2. Click **Subscribe** — you'll be redirected to Stripe Checkout
3. Complete your payment on Stripe
4. You'll be redirected back to the site where you can create your account
5. Your subscription is automatically linked to your new account
6. In the chat, you'll see your current plan and remaining message count
7. When you reach your limit, an upgrade prompt appears
8. Your message counter resets automatically each month when your subscription renews

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe > Developers > API keys > Secret key | Backend Stripe API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe > Developers > API keys > Publishable key | Frontend Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Developers > Webhooks > your endpoint | Verifies webhook authenticity |
| `STRIPE_PRICE_START` | Yes | Stripe > Products > Start product > Pricing | Price ID for Start plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe > Products > Scale product > Pricing | Price ID for Scale plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe > Products > Team product > Pricing | Price ID for Team plan |

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Supabase auth callbacks
│   │   │   ├── stripe/         # Stripe checkout and webhook handlers
│   │   │   └── chat/           # Chat API endpoints
│   │   ├── chat/               # Chat interface page
│   │   ├── pricing/            # Pricing plans page
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase/           # Supabase client setup
│   │   └── stripe.ts           # Stripe client setup
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables (create this)
├── .env.example                # Template for .env.local
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment:

1. **Push your code to GitHub** (if not already done)

2. **Connect to Vercel**:
   - Click the deploy button above or go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Git Repository**
   - Select your GitHub repository

3. **Configure environment variables**:
   - In the Vercel dashboard, go to **Settings** > **Environment Variables**
   - Add ALL the variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_START`
     - `STRIPE_PRICE_SCALE`
     - `STRIPE_PRICE_TEAM`

4. **Deploy**:
   - Click **Deploy**
   - Wait for the build to complete
   - Your site will be live at `https://your-project.vercel.app`

5. **Update Stripe webhook URL**:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Edit your webhook endpoint
   - Change the URL from `https://your-domain.com/api/stripe/webhook` to your Vercel domain
   - Click **Update**

> 💡 **Important**: Make sure to add ALL environment variables to Vercel. If any are missing, Stripe checkout and subscription management won't work.

## 📝 License

MIT