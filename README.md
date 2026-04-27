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
- **Flexible Pricing Plans** — Choose your plan: Start (10 messages/month), Scale (50 messages/month), or Team (100 messages/month)
- **Pay-Then-Signup Flow** — Purchase your plan on Stripe, then create your account with your subscription automatically linked
- **Usage Tracking** — See your current plan and remaining messages in the chat; counter resets monthly on subscription renewal

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
- **A Stripe account** — [Sign up here](https://stripe.com/) (free, no credit card required initially)

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

# Stripe Configuration — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — Dashboard Stripe > Products > [Product Name] > Pricing
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...

# Cron Secret — generate with: openssl rand -hex 32
CRON_SECRET=your_cron_secret_here
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

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) > Secret key (sk_test_... or sk_live_...) | Backend Stripe API key — keep this secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) > Publishable key (pk_test_... or pk_live_...) | Frontend Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/webhooks) > Add endpoint `/api/webhook` > Copy signing secret | Validates incoming webhook events |
| `STRIPE_PRICE_START` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) > Start product > Pricing > Price ID (price_...) | Price ID for the Start plan (10 messages/month) |
| `STRIPE_PRICE_SCALE` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) > Scale product > Pricing > Price ID | Price ID for the Scale plan (50 messages/month) |
| `STRIPE_PRICE_TEAM` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) > Team product > Pricing > Price ID | Price ID for the Team plan (100 messages/month) |
| `CRON_SECRET` | Yes | Generate with: `openssl rand -hex 32` in your terminal | Secret token for securing cron job endpoints |

### How to find your Supabase credentials

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to find your Stripe credentials

**API Keys:**
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy the **Secret key** (starts with `sk_`) → `STRIPE_SECRET_KEY`
5. Copy the **Publishable key** (starts with `pk_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Price IDs (create these first):**
1. In Stripe Dashboard, click **Products** in the left sidebar
2. Click **Add product**
3. Create three products:
   - **Start**: Name it "Start", set price ($9.99/month or your choice), copy the Price ID (starts with `price_`)
   - **Scale**: Name it "Scale", set price ($29.99/month or your choice), copy the Price ID
   - **Team**: Name it "Team", set price ($59.99/month or your choice), copy the Price ID

**Webhook Secret:**
1. In Stripe Dashboard, click **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your site URL + `/api/webhook` (e.g., `http://localhost:3000/api/webhook` for local testing)
4. Select events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

> 💡 **For local webhook testing**: Use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events:
> ```bash
> stripe listen --forward-to localhost:3000/api/webhook
> ```

## 📁 Project Structure

- **`src/app`** — Next.js App Router pages and layouts
- **`src/components`** — Reusable React components (UI, pricing, chat)
- **`src/lib`** — Utility functions, Supabase client, Stripe helpers
- **`src/types`** — TypeScript type definitions
- **`public`** — Static assets (images, fonts)
- **`supabase`** — Database migrations and SQL schemas

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step:

1. Click the **Deploy with Vercel** button above (or go to [vercel.com/new](https://vercel.com/new))
2. Import your GitHub repository
3. In the **Environment Variables** section, add ALL the variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_START`
   - `STRIPE_PRICE_SCALE`
   - `STRIPE_PRICE_TEAM`
   - `CRON_SECRET`
4. Click **Deploy**

> ⚠️ **Important**: Make sure your Stripe webhook is configured for your production domain (e.g., `https://your-app.vercel.app/api/webhook`) and update `STRIPE_WEBHOOK_SECRET` accordingly.

## 📝 License

MIT