# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Clean, modern chat experience to interact with your emails in natural language
- **Email Intelligence** — AI-powered email analysis and memory across conversations
- **Multi-Model AI** — Powered by OpenRouter supporting Anthropic, OpenAI, Google, and more

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **AI Integration**: OpenRouter API
- **Payments**: Stripe (subscriptions)
- **Auth & Database**: Supabase

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

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

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`).

Copy the template from `.env.example` and fill in each value:

```bash
# Supabase — authentication and database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe — payments and subscriptions
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# OpenRouter — AI model provider
OPENROUTER_API_KEY=sk-or-...

# App configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Emind
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Supabase anonymous key (safe to expose in client) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe publishable key (pk_test_... or pk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks | Webhook signing secret (whsec_...) |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products | Price ID for Start plan (9,99€/month) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products | Price ID for Scale plan (29,99€/month) |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard > Products | Price ID for Enterprise plan (99,99€/month) |
| `OPENROUTER_API_KEY` | Yes | [openrouter.ai/keys](https://openrouter.ai/keys) | OpenRouter API key for AI models |
| `NEXT_PUBLIC_BASE_URL` | Yes | — | Your app's base URL (http://localhost:3000 in dev) |
| `NEXT_PUBLIC_APP_URL` | Yes | — | Public URL for OpenRouter referer header |
| `NEXT_PUBLIC_APP_NAME` | Yes | — | Your app name (sent to OpenRouter for analytics) |

### Finding Supabase Variables

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Click **Project Settings** (gear icon) in the sidebar
4. Click **API** in the top navigation
5. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Finding Stripe Variables

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign in
2. **Publishable/Secret keys**: Developers > API keys
3. **Webhook secret**: Developers > Webhooks > select endpoint > reveal signing secret
4. **Price IDs**: Products > select product > Pricing tab > copy Price ID

### Getting OpenRouter API Key

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Click **Create Key**
3. Give it a name (e.g., "Emind Dev")
4. Copy the generated key → paste as `OPENROUTER_API_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api/chat/send` — API route for sending chat messages
- `src/components/chat` — Chat interface components
- `src/lib/chat` — Chat-related utilities and API client
- `src/lib/openrouter` — OpenRouter AI client integration

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the **Deploy** button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all your environment variables in Vercel dashboard:
   - Go to **Settings** > **Environment Variables**
   - Add each variable from your `.env.local` file
4. Click **Deploy**

Your app will be live at a URL like `your-app.vercel.app`.

> ⚠️ Don't forget to set `NEXT_PUBLIC_BASE_URL` to your production domain in Vercel!

## 📝 License

MIT