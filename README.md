# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Natural language conversations with your email assistant powered by Groq
- **Chat History** — Your conversation context is preserved for seamless follow-up questions
- **Stripe Subscriptions** — Multiple pricing tiers (Starter, Scale, Enterprise) with secure payment processing

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI**: Groq API (fast LLM inference)
- **Auth & Database**: Supabase
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive configuration that your app needs to run — never share it or commit it to Git.

Copy the template from `.env.example` and fill in each value:

```bash
# Groq API — free tier with generous quotas
# Get your key at: https://console.groq.com/keys
GROQ_API_KEY=gsk_...

# Session secret — minimum 32 random characters, keep private
# Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your-64-char-random-hex-string

# Supabase — from your project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe — from your Stripe dashboard
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — create products in Stripe Dashboard > Products
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Your app's URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `GROQ_API_KEY` | Yes | [console.groq.com/keys](https://console.groq.com/keys) — create a key (free account) | Server-side API key for AI completions |
| `SESSION_SECRET` | Yes | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | 64-character hex string for securing user sessions |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard > Project Settings > API > service_role key | Server-side key for admin operations (keep secret) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe secret key for server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe public key for client-side Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks — after adding a webhook endpoint | Validates incoming webhook events |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Price ID | Price ID for Starter plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Price ID | Price ID for Scale plan |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > Price ID | Price ID for Enterprise plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your deployment URL (e.g., `http://localhost:3000` for dev) | Base URL for your application |

## 📁 Project Structure

- `src/lib/chat` — Chat utilities: type definitions, Groq API client, conversation history, mock API for development
- `src/app/api/chat/send` — API route that handles sending messages to the AI
- `src/components/chat` — React component for the chat interface
- `.env.example` — Template with all required environment variables

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings > Environment Variables**
4. Add all variables from your `.env.local` file:

   - `GROQ_API_KEY`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_ENTERPRISE_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

5. Click **Deploy**

> 💡 **Don't forget**: Set up your Stripe webhook in the Stripe Dashboard to point to `https://your-app.vercel.app/api/webhook` so subscription events are processed correctly.

## 📝 License

MIT