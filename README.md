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
- **Simple pricing with 3 plans** — Choose between Start (10 messages/month), Scale (50 messages/month), or Team (100 messages/month)
- **No account required to subscribe** — Pay for your plan first, create your account after
- **Automatic subscription linking** — Your Stripe subscription is automatically connected to your account
- **Usage tracking in chat** — See your current plan and remaining messages at a glance
- **Smart upgrade prompts** — When you hit your limit, get a gentle nudge to upgrade
- **Monthly reset** — Your message counter resets automatically when your subscription renews

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication & Database
- **Payments**: Stripe Checkout

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **A Stripe account** — [Sign up here](https://stripe.com/) (free for testing)

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
# Find these in: Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Find this in: Stripe Dashboard > Developers > Webhooks
# For local development, use: stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — Find these in: Stripe Dashboard > Products
# Create products with recurring pricing, then copy the Price ID for each
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# Your app's base URL (change for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### How to find your Supabase credentials:

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to find/create your Stripe credentials:

**API Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy the **Secret key** (starts with `sk_`) → `STRIPE_SECRET_KEY`
5. Copy the **Publishable key** (starts with `pk_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   > ⚠️ Use test mode keys (they start with `sk_test_` and `pk_test_`) for development

**Webhook Secret:**
1. In Stripe Dashboard, click **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks/stripe` (or `http://localhost:3000/api/webhooks/stripe` for local testing)
4. Select event: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

**For local webhook testing:**
```bash
# Install Stripe CLI if you haven't
brew install stripe/stripe-cli/stripe  # Mac
# or download from https://github.com/stripe/stripe-cli/releases

# Login and forward webhooks
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret it gives you
# (starts with "whsec_")
```

**Creating your 3 pricing plans:**

1. In Stripe Dashboard, go to **Products** > **Add product**
2. Create "Start" plan:
   - Name: "Start"
   - Pricing model: "Standard pricing"
   - Price: your choice (e.g., $9/month)
   - Billing period: "Monthly"
   - Click **Save product**
   - Copy the **Price ID** (starts with `price_`) → `STRIPE_START_PRICE_ID`
3. Repeat for "Scale" and "Team" plans
4. Use the respective Price IDs for `STRIPE_SCALE_PRICE_ID` and `STRIPE_TEAM_PRICE_ID`

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

### 5. How the subscription flow works

1. Visit the landing page and browse the pricing plans
2. Click **Subscribe** on your chosen plan (Start, Scale, or Team)
3. You'll be redirected to Stripe Checkout — no account needed yet!
4. Complete your payment on Stripe
5. After payment, you'll be redirected back to create your account
6. Your subscription is automatically linked to your new account
7. In the chat, you'll see your current plan and remaining message count
8. When you reach your limit, a prompt appears suggesting you upgrade
9. Your message counter resets automatically each month

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac) to run all the commands above.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Project Settings > API > Project URL | Your Supabase project connection URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe > Developers > API keys > Secret key | Backend Stripe API key (keep secret!) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe > Developers > API keys > Publishable key | Frontend Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Developers > Webhooks > your endpoint | Validates incoming webhook events |
| `STRIPE_START_PRICE_ID` | Yes | Stripe > Products > Start product > Price ID | Price ID for the Start plan ($10/month, 10 messages) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe > Products > Scale product > Price ID | Price ID for the Scale plan ($25/month, 50 messages) |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe > Products > Team product > Price ID | Price ID for the Team plan ($49/month, 100 messages) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Your app's URL (http://localhost:3000 for dev) |

## 📁 Project Structure

```
├── src/
│   ├── app/                  # Next.js App Router — pages and layouts
│   │   ├── api/              # API routes (webhooks, auth callbacks)
│   │   ├── chat/             # Chat interface page
│   │   ├── pricing/          # Pricing plans page
│   │   ├── auth/             # Authentication pages (login, signup, callback)
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Base UI components (buttons, inputs, cards)
│   │   ├── chat/             # Chat-specific components
│   │   └── pricing/          # Pricing plan components
│   ├── lib/                  # Utility functions and clients
│   │   ├── supabase/         # Supabase client setup and helpers
│   │   ├── stripe.ts         # Stripe client and utilities
│   │   └── utils.ts          # General utility functions
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets (images, fonts)
├── .env.local                # Environment variables (create this from .env.example)
└── package.json              # Dependencies and scripts
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Push your code to GitHub** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Git Repository**
   - Select your GitHub repo
   - Click **Import**

3. **Add your environment variables**:
   - In the Vercel dashboard, go to **Settings** > **Environment Variables**
   - Add each variable from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_START_PRICE_ID`
     - `STRIPE_SCALE_PRICE_ID`
     - `STRIPE_TEAM_PRICE_ID`
     - `NEXT_PUBLIC_BASE_URL` (set this to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

4. **Update your Stripe webhook URL**:
   - In Stripe Dashboard > Developers > Webhooks
   - Add a new endpoint with your Vercel URL: `https://your-app.vercel.app/api/webhooks/stripe`

5. **Deploy**:
   - Click **Deploy** — Vercel will automatically build and deploy your app

> 💡 **Important**: Always use production Stripe keys in Vercel (not test keys), and make sure your `NEXT_PUBLIC_BASE_URL` matches your Vercel deployment URL.

## 📝 License

MIT