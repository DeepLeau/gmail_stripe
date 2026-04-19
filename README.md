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
- **Subscription Plans** — Choose from Start, Scale, or Team plans with monthly message quotas
- **Automatic Quota Tracking** — Your message count decrements with each sent message
- **Usage Visibility** — See your current plan and remaining messages in your dashboard
- **Auto-Renewal** — Monthly quotas reset automatically when your subscription renews

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
# Find your API keys at: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — Create products at: https://dashboard.stripe.com/products
# Go to Products > Add Product > Set price > Copy the Price ID
STRIPE_PRICE_ID_START=price_...
STRIPE_PRICE_ID_SCALE=price_...
STRIPE_PRICE_ID_TEAM=price_...

# Base URL for Stripe redirect URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Secret for authenticating cron job requests
CRON_SECRET=your_random_secret_string
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

### 5. Choose a plan

On the landing page, select your subscription plan in the **Pricing** section:

- **Start** — 10 messages/month
- **Scale** — 50 messages/month
- **Team** — 100 messages/month

Click "Subscribe" on your chosen plan to proceed to Stripe Checkout.

### 6. Complete payment

You'll be redirected to Stripe's secure checkout page. Enter your card details and click "Subscribe". After successful payment, you'll be redirected to account creation.

### 7. Create your account

Fill in your email and password to create your Supabase account. Once created, you'll automatically be redirected to the chat interface with your subscription active.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for client-side Supabase access |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > Secret key | Secret API key for server-side Stripe operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > Publishable key | Public key for client-side Stripe |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Signature secret for verifying webhook events |
| `STRIPE_PRICE_ID_START` | Yes | Stripe Dashboard > Products > [Your Start product] > Price ID | Price ID for the Start plan ($10/month) |
| `STRIPE_PRICE_ID_SCALE` | Yes | Stripe Dashboard > Products > [Your Scale product] > Price ID | Price ID for the Scale plan |
| `STRIPE_PRICE_ID_TEAM` | Yes | Stripe Dashboard > Products > [Your Team product] > Price ID | Price ID for the Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your deployment URL | Base URL for Stripe redirect URLs |
| `CRON_SECRET` | Yes | Any random string you generate | Secret token to authenticate cron job requests |

### How to set up Stripe Products and Price IDs

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Navigate to **Products** > **Add Product**
3. Create three products: "Start", "Scale", "Team"
4. For each product:
   - Set the name and description
   - Set pricing mode to **Recurring** > **Monthly**
   - Set the price amount (e.g., 1000 for $10.00)
   - Click **Add product**
5. Copy the **Price ID** for each product (starts with `price_`)
6. Paste these into your `.env.local` file

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── actions/            # Server actions for auth
│   │   ├── api/
│   │   │   ├── stripe/         # Stripe endpoints (checkout, webhook, register)
│   │   │   ├── chat/           # Chat message endpoint
│   │   │   ├── user/           # User billing info endpoint
│   │   │   └── cron/           # Monthly quota reset cron job
│   │   ├── chat/               # Chat page and interface
│   │   ├── signup/             # Account creation page
│   │   ├── page.tsx            # Landing page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── chat/               # Chat interface components
│   │   ├── sections/           # Landing page sections (Pricing, etc.)
│   │   └── ui/                 # Reusable UI components
│   └── lib/
│       ├── stripe/             # Stripe server and client utilities
│       └── hooks/              # Custom React hooks (useUserBilling)
├── .env.local                  # Environment variables (create from .env.example)
├── .env.example                # Template for environment variables
└── package.json                # Dependencies and scripts
```

## 💳 Subscription Flow

1. **Choose Plan** — User selects a plan on the landing page Pricing section
2. **Stripe Checkout** — User is redirected to Stripe's secure checkout
3. **Payment** — User enters card details and confirms
4. **Webhook** — Stripe sends a webhook confirming the subscription
5. **Account Creation** — User creates their account
6. **Activation** — Subscription details and quotas are linked to the account
7. **Chat Access** — User can now chat, with messages deducted from their quota

## 📊 Usage Tracking

- Each message sent decrements the user's monthly quota
- When the quota reaches zero, an upgrade prompt appears
- Users see their current plan and remaining messages in the UI
- Monthly quotas reset automatically on subscription renewal

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. **Import your repository** — Click the button above and select your GitHub repo
2. **Configure environment variables** — Go to Vercel Dashboard > Your Project > Settings > Environment Variables and add all variables from `.env.example`:
   - All Supabase variables
   - All Stripe variables (Secret Key, Publishable Key, Webhook Secret, Price IDs)
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)
   - `CRON_SECRET`
3. **Deploy** — Click Deploy and wait for the build to complete
4. **Configure Stripe webhook** — In Stripe Dashboard > Developers > Webhooks, add your endpoint:
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## ⚠️ Important Notes

### Stripe Webhook for Local Development

To test webhooks locally, use the Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret shown and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Cron Job for Monthly Quota Reset

The `/api/cron/reset-quotas` endpoint resets monthly quotas. Set up a Vercel Cron Job:

1. Create `vercel.json` in the root directory:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-quotas",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

2. The cron job runs on the first day of each month at midnight.

## 📝 License

MIT