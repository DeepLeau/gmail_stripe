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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive configuration like API keys — it never gets committed to GitHub.

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

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Supabase anonymous key (safe to expose in client) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe publishable key (pk_test_... or pk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Webhook signature verification secret |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > Start plan > Price ID | Price ID for the Start subscription (9,99€/month) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > Scale plan > Price ID | Price ID for the Scale subscription (29,99€/month) |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard > Products > Enterprise plan > Price ID | Price ID for the Enterprise subscription (99,99€/month) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter Dashboard > Keys > Create Key | OpenRouter API key for AI model access |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your choice | Base URL of your app (http://localhost:3000 for dev) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your choice | Public URL of your app (used as HTTP-Referer for OpenRouter) |
| `NEXT_PUBLIC_APP_NAME` | No | Your choice | Your app name for OpenRouter analytics (default: Emind) |

## 📁 Project Structure

src/app/api/chat/send — API route handling AI chat message processing

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the **Deploy with Vercel** button above (or go to [vercel.com/new](https://vercel.com/new))
2. Import your GitHub repository
3. Add all environment variables in **Vercel Dashboard > Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_ENTERPRISE_PRICE_ID`
   - `OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain, e.g., https://your-app.vercel.app)
   - `NEXT_PUBLIC_APP_URL` (same as above)
   - `NEXT_PUBLIC_APP_NAME`
4. Click **Deploy**

> ⚠️ **Important**: Add the same environment variables to Vercel that you used locally. Without them, your app won't work!

## 📝 License

MIT