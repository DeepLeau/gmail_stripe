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

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication

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
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

### 5. Create an account

Visit [http://localhost:3000/signup](http://localhost:3000/signup) to create your account. After signing up, you'll be automatically redirected to the chat page.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project connection URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → Project API Keys → anon/public | Public API key for Supabase client authentication |

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router — pages and layout
│   │   ├── globals.css         # Global styles and Tailwind imports
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Home page — landing page
│   │   ├── login/
│   │   │   └── page.tsx        # Login page at /login
│   │   ├── signup/
│   │   │   └── page.tsx        # Signup page at /signup
│   │   ├── chat/
│   │   │   └── page.tsx        # AI Chat page at /chat (protected)
│   │   └── actions/
│   │       └── auth.ts         # Server-side authentication actions
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Navbar.tsx      # Top navigation bar
│   │   │   ├── Footer.tsx      # Page footer
│   │   │   └── UserMenu.tsx    # User dropdown menu with logout
│   │   ├── auth/               # Authentication components
│   │   │   ├── AuthCard.tsx    # Shared auth card wrapper
│   │   │   ├── LoginForm.tsx   # Login form component
│   │   │   └── SignupForm.tsx  # Signup form component
│   │   └── sections/           # Landing page sections
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client for browser
│   │       └── server.ts       # Supabase client for server
│   └── middleware.ts           # Next.js middleware for route protection
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.mjs             # Next.js configuration
└── package.json                # Dependencies and scripts
```

### Key Files for Authentication

| File | Purpose |
|------|---------|
| `src/app/login/page.tsx` | Login page with email/password form |
| `src/app/signup/page.tsx` | Signup page with email/password form |
| `src/components/auth/LoginForm.tsx` | Login form component |
| `src/components/auth/SignupForm.tsx` | Signup form component |
| `src/middleware.ts` | Protects `/chat` route — redirects unauthenticated users to `/login` |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/app/actions/auth.ts` | Server actions for sign up, sign in, sign out |
| `src/components/ui/UserMenu.tsx` | User dropdown with logout button |

## 🚀 Deploy to Vercel

The easiest way to deploy your Emind app:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Git Repository" and select your GitHub repo
2. **Configure environment variables** — In Vercel dashboard, go to **Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
3. **Deploy** — Click "Deploy" and wait for the build to complete
4. **Test** — Visit your deployed URL and verify the login/signup flow works

> ⚠️ **Important**: Make sure to add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in Vercel, otherwise authentication won't work on the deployed site.

## 📝 License

MIT