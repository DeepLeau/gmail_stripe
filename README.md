# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Welcome Email Automation** — Sends personalized welcome emails to new users via Resend
- **Stripe Integration** — Handles signup and payment linking through Stripe
- **Analytics Integration** — PostHog for product analytics with GDPR-friendly EU hosting
- **Supabase Backend** — Auth and database powered by Supabase

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase
- **Payments**: Stripe
- **Email**: Resend
- **Analytics**: PostHog

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/emind.git
cd emind
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

Copy the content from `.env.example` and fill in each value.

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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for Supabase client |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog Dashboard > Project Settings > Project API Key | Your PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Leave as `https://eu.i.posthog.com` for EU hosting | PostHog server host URL |
| `RESEND_API_KEY` | Yes | Resend Dashboard > API Keys > Create API Key | Your Resend API key |
| `RESEND_FROM_EMAIL` | Yes | Must be a verified domain in Resend Dashboard > Domains | Sender email address |

**Finding your Supabase keys:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Finding your Resend API key:**

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click **Create API Key**
3. Give it a name (e.g., "Emind Development")
4. Copy the key → `RESEND_API_KEY`
5. To verify a sending domain: go to Resend Dashboard > **Domains** > add your domain and follow DNS verification steps
6. Set `RESEND_FROM_EMAIL` to an address using your verified domain (e.g., `hello@yourdomain.com`)

> 💡 **Development tip**: Without a verified domain, you can use `onboarding@resend.dev` as `RESEND_FROM_EMAIL` — emails will only go to your Resend account owner.

## 📁 Project Structure

- **src/app/api/email/welcome/** — API route that sends welcome emails to new users
- **src/components/email/** — React email components (WelcomeEmail)
- **src/lib/resend.ts** — Resend client configuration
- **src/lib/stripe/hooks/** — Stripe signup linking hooks
- **src/app/** — Next.js App Router pages and layouts
- **.env.example** — Template with all required environment variables

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Step by step:**

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In **Environment Variables**, add each variable from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
4. Click **Deploy**

> ⚠️ Don't forget to add all environment variables in Vercel — your app won't work without them!

## 📝 License

MIT