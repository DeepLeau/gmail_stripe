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
- **Flexible Pricing Plans** — Choose from Start (10 messages/mo), Scale (50 messages/mo), or Team (100 messages/mo)
- **Usage Tracking** — See your current plan and remaining messages in the chat interface
- **Automatic Upgrades** — When you hit your limit, easily upgrade to a higher plan
- **Monthly Reset** — Message counter resets automatically each month on subscription renewal

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication & Database
- **Payments**: Stripe Checkout & Subscription Management

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe Account** — [Sign up here](https://stripe.com/) (free, no credit card required to start)

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

# Stripe — Payment Configuration
# Find these in: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Stripe Webhook Secret
# Set up webhook endpoint first, then find secret at: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs
# Create products and prices in Stripe Dashboard > Products > Add Product
# Then copy the Price ID (starts with price_)
STRIPE_START_PRICE_ID=price_your_start_price_id
STRIPE_SCALE_PRICE_ID=price_your_scale_price_id
STRIPE_TEAM_PRICE_ID=price_your_team_price_id
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
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Secret key for Stripe server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Publishable key for Stripe client-side operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Secret to verify webhook signatures |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > [Your Product] > Prices | Price ID for the Start plan ($10/mo) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > [Your Product] > Prices | Price ID for the Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard > Products > [Your Product] > Prices | Price ID for the Team plan |

### How to create Stripe Price IDs

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Products** in the left sidebar
3. Click **Add product**
4. Enter a name (e.g., "Start Plan") and price ($10)
5. Select **Recurring** and choose **Monthly**
6. Click **Add product**
7. On the product page, scroll to **Pricing** and copy the **Price ID** (starts with `price_`)
8. Repeat for Scale and Team plans

### How to set up the Stripe webhook

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your local URL: `https://your-domain/api/webhook` (for production) or use the Stripe CLI for local testing
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and paste it as `STRIPE_WEBHOOK_SECRET`

## 📁 Project Structure

| Folder | Description |
|--------|-------------|
| `src/app` | Next.js App Router pages and API routes |
| `src/components` | Reusable UI components (buttons, cards, pricing, etc.) |
| `src/lib` | Utilities, Supabase client setup, and helpers |
| `src/app/api/webhook` | Stripe webhook endpoint for processing payments |
| `src/app/api/checkout` | API route to create Stripe checkout sessions |

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual deploy steps

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and sign in with GitHub
3. Click **Import Project**
4. Select your repository
5. Add all environment variables in **Environment Variables** section:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
6. Click **Deploy**

### Important: Update your Stripe webhook URL

After deploying to Vercel, update your Stripe webhook endpoint URL to point to your production domain (e.g., `https://your-app.vercel.app/api/webhook`).

## 📝 License

MIT