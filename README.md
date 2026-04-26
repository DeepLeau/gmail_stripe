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
- **Flexible Pricing Plans** — Choose between Start (10€/mois, 10 messages), Scale (29€/mois, 50 messages), or Team (59€/mois, 100 messages)
- **Usage Tracking** — See your current plan and remaining messages directly in the chat interface
- **Upgrade Prompts** — Automatically notified when you reach your message limit with an option to upgrade
- **Monthly Reset** — Message counters reset automatically each month when your subscription renews

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication & Storage
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

Copy the template from `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_START_PRICE_ID=price_your_start_plan_price_id
STRIPE_SCALE_PRICE_ID=price_your_scale_plan_price_id
STRIPE_TEAM_PRICE_ID=price_your_team_plan_price_id
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

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Your Supabase anonymous key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > publishable key | Public Stripe key for client-side |
| `NEXT_PUBLIC_BASE_URL` | Yes | Manual | Your site URL (http://localhost:3000 for local dev) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > secret key | Private Stripe key for server-side operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks > Your endpoint | Signing secret to verify webhook authenticity |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > Start plan > Price ID | Stripe Price ID for the Start plan (10€/mois, 10 messages) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > Scale plan > Price ID | Stripe Price ID for the Scale plan (29€/mois, 50 messages) |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard > Products > Team plan > Price ID | Stripe Price ID for the Team plan (59€/mois, 100 messages) |

### How to find your Supabase credentials

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to find your Stripe credentials

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Developers** in the left sidebar
3. Click **API keys** — copy the **Secret key** (`sk_test_...`) as `STRIPE_SECRET_KEY` and the **Publishable key** (`pk_test_...`) as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. To set up the webhook:
   - Go to **Developers > Webhooks**
   - Click **Add endpoint**
   - Set the endpoint URL to `https://yourdomain.com/api/webhooks/stripe`
   - Select event: `checkout.session.completed`
   - Copy the **Signing secret** (`whsec_...`) as `STRIPE_WEBHOOK_SECRET`
5. To create your Price IDs:
   - Go to **Products** in the left sidebar
   - Click **Add product** for each plan (Start, Scale, Team)
   - Set the name, price (10€, 29€, 59€), and billing interval to **Monthly**
   - After saving, copy the **Price ID** (`price_...`) for each plan

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── api/                # API routes (webhooks, auth, etc.)
│   │   ├── chat/               # Chat interface page
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # Base UI components (buttons, cards, etc.)
│   │   └── pricing/            # Pricing plan components
│   ├── lib/                    # Utility functions and configurations
│   │   ├── supabase/           # Supabase client setup
│   │   └── stripe/             # Stripe client and utilities
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets (images, fonts)
├── .env.local                  # Environment variables (create from .env.example)
└── package.json                # Dependencies and scripts
```

## 🚀 Deploy to Vercel

[![Deploy](https://vercel.com/button)](https://vercel.com/new)

1. Click the **Deploy** button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings > Environment Variables**
4. Add all the variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)
5. Click **Deploy**

> ⚠️ **Important**: After deploying, update your Stripe webhook endpoint URL to point to your production Vercel URL (`https://your-app.vercel.app/api/webhooks/stripe`).

## 📝 License

MIT