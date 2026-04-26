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
- **3 Flexible Plans** — Choose from Start, Scale, or Team plans to fit your needs
- **Usage Tracking** — See your current plan and remaining messages directly in the chat
- **Smart Upgrade Prompts** — Get helpful suggestions when you approach your message limit

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication + PostgreSQL
- **Payments**: Stripe Checkout + Stripe Webhooks

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **A Stripe account** — [Sign up here](https://stripe.com/) (free for testing)
- **A Supabase account** — [Sign up here](https://supabase.com/) (free tier works)

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
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
# Get your API keys: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Stripe Webhook Secret (set up later after creating webhook endpoint)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard > Products)
STRIPE_PRICE_START=price_your_start_price_id
STRIPE_PRICE_SCALE=price_your_scale_price_id
STRIPE_PRICE_TEAM=price_your_team_price_id

# App URL (use localhost:3000 for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard > Project Settings > API > service_role key | Secret key for server-side operations (never expose publicly) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > Secret key | Stripe secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > Publishable key | Stripe publishable key (pk_test_... or pk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Secret for verifying webhook signatures |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard > Products > [Your Start Plan] > Price ID | Price ID for the Start plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard > Products > [Your Scale Plan] > Price ID | Price ID for the Scale plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard > Products > [Your Team Plan] > Price ID | Price ID for the Team plan |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app's URL | Use `http://localhost:3000` locally, your domain in production |

### How to find your Supabase credentials:

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Copy the **service_role secret** and paste it as `SUPABASE_SERVICE_ROLE_KEY`

### How to create your Stripe products and prices:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Products** in the left sidebar
3. Click **Add product** for each plan:

   **Start Plan:**
   - Name: "Start"
   - Price: set your desired price (e.g., $9/month)
   - Billing period: Monthly
   - Click **Save product**
   - Copy the **Price ID** (starts with `price_`) and paste it as `STRIPE_PRICE_START`

   **Scale Plan:**
   - Name: "Scale"
   - Price: set your desired price (e.g., $29/month)
   - Billing period: Monthly
   - Click **Save product**
   - Copy the **Price ID** and paste it as `STRIPE_PRICE_SCALE`

   **Team Plan:**
   - Name: "Team"
   - Price: set your desired price (e.g., $79/month)
   - Billing period: Monthly
   - Click **Save product**
   - Copy the **Price ID** and paste it as `STRIPE_PRICE_TEAM`

### How to set up Stripe Webhooks:

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. For **Endpoint URL**, enter: `https://your-domain.com/api/webhooks/stripe` (use `ngrok` for local testing)
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and paste it as `STRIPE_WEBHOOK_SECRET`

### Local webhook testing with Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret shown (starts with `whsec_`) and set it as `STRIPE_WEBHOOK_SECRET`.

## 💳 Subscription Plans

| Plan | Messages/Month | Best For |
|------|----------------|----------|
| **Start** | 10 messages | Individual users exploring the app |
| **Scale** | 50 messages | Regular users with moderate email volume |
| **Team** | 100 messages | Power users and teams |

### How the payment flow works:

1. **Browse plans** on the landing page
2. **Select a plan** — you'll be redirected to Stripe Checkout
3. **Pay on Stripe** — enter your card details
4. **Return to Emind** — you'll be prompted to create an account
5. **Create your account** — your subscription is automatically linked
6. **Start chatting** — see your plan and remaining messages in the chat interface

When you reach your message limit, a prompt will suggest upgrading to a higher plan. Your message count resets automatically each month when your subscription renews.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Supabase auth callbacks
│   │   │   ├── checkout/       # Stripe checkout session creation
│   │   │   └── webhooks/       # Stripe webhook handlers
│   │   ├── chat/               # Chat interface page
│   │   ├── pricing/            # Pricing plans page
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase/           # Supabase client configuration
│   │   └── stripe/             # Stripe configuration
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables (create this)
├── .env.example                # Template for environment variables
└── package.json                # Dependencies and scripts
```

## 🚀 Deploy to Vercel

### One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Push your code to GitHub** — if you haven't already
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Import to Vercel** — go to [vercel.com/new](https://vercel.com/new)
3. **Import your repository** — select your GitHub repo
4. **Add environment variables** — click **Environment Variables** and add each variable from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_START`
   - `STRIPE_PRICE_SCALE`
   - `STRIPE_PRICE_TEAM`
   - `NEXT_PUBLIC_APP_URL` (set to your production URL, e.g., `https://your-app.vercel.app`)

5. **Deploy** — click **Deploy**

6. **Update Stripe webhook** — after deploying, go to Stripe Dashboard > Developers > Webhooks and add your new production URL: `https://your-app.vercel.app/api/webhooks/stripe`

## 📝 License

MIT