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
- **Subscription Plans** — Choose from Start (10 msgs/mo), Scale (50 msgs/mo), or Team (100 msgs/mo)
- **Usage Tracking** — See your remaining messages and current plan directly in your interface
- **Automatic Quota Reset** — Message counter resets monthly on your billing cycle

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
- **Stripe account** — [Sign up free](https://stripe.com/)
- **Supabase account** — [Create a project](https://supabase.com/)

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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure Supabase

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Set up your database schema:**

Create a `profiles` table in Supabase SQL Editor:

```sql
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  messages_used integer default 0,
  messages_limit integer default 0,
  subscription_status text default 'inactive',
  current_period_end timestamp,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Users can only see/edit their own profile
create policy "Users can manage own profile" on profiles
  for all using auth.uid() = id;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5. Configure Stripe

**How to find your Stripe keys:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy the **Publishable key** → paste as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Copy the **Secret key** → paste as `STRIPE_SECRET_KEY`

**Create your subscription products and prices:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Products** in the left sidebar
3. Click **Add product** for each plan:

| Plan | Name | Price | Interval | Features |
|------|------|-------|----------|----------|
| Start | Start | $9.99 | Monthly | 10 messages/month |
| Scale | Scale | $24.99 | Monthly | 50 messages/month |
| Team | Team | $49.99 | Monthly | 100 messages/month |

4. For each product, copy the **Price ID** (starts with `price_`) — you'll use these in `src/lib/stripe/config.ts`

**Set up Webhook endpoint:**

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your URL: `https://your-domain.com/api/stripe/webhook` (for local testing, use Stripe CLI)
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET`

**For local development, use Stripe CLI:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret shown and add it to .env.local as STRIPE_WEBHOOK_SECRET
```

### 6. Update Stripe configuration

In `src/lib/stripe/config.ts`, add your Price IDs:

```typescript
export const STRIPE_PRICE_IDS = {
  start: 'price_xxxx',    // Your Start plan Price ID
  scale: 'price_xxxx',    // Your Scale plan Price ID
  team: 'price_xxxx',     // Your Team plan Price ID
};
```

### 7. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page with the pricing section.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for client-side Supabase access |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > Publishable key | Used for Stripe.js on client (starts with `pk_`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > Secret key | Server-side only Stripe key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks > your endpoint > Signing secret | Validates incoming webhook requests (starts with `whsec_`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployment URL or `http://localhost:3000` for local | Used for Stripe redirect URLs |

## 📝 How the Subscription Flow Works

1. **Choose Plan** — User clicks a plan on the landing page pricing section
2. **Checkout** — Redirected to Stripe Checkout (secure payment page)
3. **Payment** — User enters card details and confirms
4. **Redirect** — Success redirects to `/signup?session_id=xxx`
5. **Create Account** — User signs up with email/password
6. **Link Subscription** — Supabase profile is linked with Stripe subscription
7. **Access Chat** — User is redirected to `/chat` with their plan active
8. **Send Messages** — Each message decrements the monthly counter
9. **Quota Reached** — When limit is hit, banner prompts upgrade
10. **Monthly Reset** — Counter resets automatically when billing cycle renews

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── actions/
│   │   └── auth.ts              # Server actions for authentication
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts  # Creates Stripe checkout sessions
│   │   │   └── webhook/route.ts   # Handles Stripe webhook events
│   │   ├── subscription/route.ts  # Manages subscription data
│   │   └── messages/
│   │       └── decrement/route.ts # Decrements message counter
│   ├── chat/
│   │   └── page.tsx             # Main chat interface page
│   └── page.tsx                 # Landing page
├── components/
│   ├── sections/
│   │   └── Pricing.tsx          # Pricing cards with plan selection
│   ├── auth/
│   │   └── SignupForm.tsx       # Signup form with Stripe session
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Main chat component
│   │   └── ChatInput.tsx        # Message input field
│   └── ui/
│       ├── UserMenu.tsx         # User dropdown with plan info
│       ├── UsageBanner.tsx       # Shows when quota is low/used
│       └── PlanBadge.tsx        # Displays current plan
├── lib/
│   ├── stripe/
│   │   ├── client.ts            # Stripe client initialization
│   │   └── config.ts            # Price IDs and plan config
│   └── chat/
│       └── types.ts             # TypeScript types for chat
└── middleware.ts                 # Auth protection and redirects
```

## 🧪 Running Tests

No test files exist yet in this project. When you add tests, here's how to run them:

Unit tests verify that specific functions work correctly — for example, that message counting decreases properly or that pricing calculations are accurate.

**Run all tests:**
```bash
npx jest
```

**Run a specific test file:**
```bash
npx jest src/lib/stripe/client.test.ts
```

**Watch mode (re-runs automatically when you save changes):**
```bash
npx jest --watch
```

**Reading Jest output:**
- `PASS` — All tests in that file passed ✅
- `FAIL` — Something broke ❌ — check the error message below for what went wrong

**What tests would cover:**
- Message decrement API (decrements counter, blocks at zero)
- Stripe webhook handler (creates/updates profiles correctly)
- Subscription status checks (active vs inactive vs past_due)
- Authentication flow (signup, login, session validation)

## 🚀 Deploy to Vercel

### One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual steps:

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and sign up/login
3. Click **Import Project**
4. Select your GitHub repository
5. Under **Environment Variables**, add all variables from `.env.example`:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your_supabase_url |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your_supabase_anon_key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_live_xxxx |
| `STRIPE_SECRET_KEY` | sk_live_xxxx |
| `STRIPE_WEBHOOK_SECRET` | whsec_xxxx |
| `NEXT_PUBLIC_APP_URL` | https://your-app.vercel.app |

6. Click **Deploy**

**Important:** After deploying, go to your Stripe Dashboard > Webhooks and add a new endpoint for your Vercel URL:
`https://your-app.vercel.app/api/stripe/webhook`

## 📝 License

MIT