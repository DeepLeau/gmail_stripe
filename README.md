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
- **User Authentication** — Sign up and log in with email and password via Supabase Auth
- **Protected Routes** — Chat page is only accessible to logged-in users; guests are redirected to login

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Authentication**: Supabase Auth

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **A Supabase account** — [Sign up free here](https://supabase.com/)

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores secrets that your app needs to connect to Supabase.

**How to create the file:**

1. In VS Code, right-click in the file explorer area
2. Select "New File"
3. Name it `.env.local`
4. Paste the content below

**Content for `.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find these values:**

1. Go to [supabase.com](https://supabase.com/) and log in
2. Click on your project
3. In the left sidebar, click **Project Settings** (the gear icon)
4. Click **API** in the top tabs
5. Find **Project URL** — copy that value and paste it after `NEXT_PUBLIC_SUPABASE_URL=`
6. Find **anon public** key under "Project API keys" — copy that value and paste it after `NEXT_PUBLIC_SUPABASE_ANON_KEY=`

> 💡 **Important**: Your `.env.local` file should never be committed to git. It's already in `.gitignore` to protect your secrets.

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

### 5. Try the AI Chat

The chat page at `/chat` is protected — only logged-in users can access it.

1. Visit [http://localhost:3000/login](http://localhost:3000/login) to log in
2. Or visit [http://localhost:3000/signup](http://localhost:3000/signup) to create a new account
3. After authenticating, you'll be redirected to [http://localhost:3000/chat](http://localhost:3000/chat)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public key for Supabase client authentication |

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router — pages and layout
│   │   ├── globals.css         # Global styles and Tailwind imports
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx           # Home page — landing page
│   │   ├── login/
│   │   │   └── page.tsx       # Login page at /login
│   │   ├── signup/
│   │   │   └── page.tsx       # Sign up page at /signup
│   │   └── chat/
│   │       └── page.tsx       # AI Chat page at /chat (protected)
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Navbar.tsx     # Top navigation bar
│   │   │   └── Footer.tsx     # Page footer
│   │   ├── auth/              # Authentication UI components
│   │   │   ├── AuthCard.tsx   # Card wrapper for auth forms
│   │   │   ├── AuthInput.tsx  # Styled input field
│   │   │   └── AuthButton.tsx # Primary action button
│   │   └── sections/          # Landing page sections
│   │       ├── Hero.tsx       # Hero with headline and CTA
│   │       ├── QuestionExamples.tsx  # Example questions showcase
│   │       └── HowItWorks.tsx # 3-step process explanation
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts      # Browser-side Supabase client
│   │       └── server.ts      # Server-side Supabase client
│   └── middleware.ts          # Route protection for /chat
├── public/                    # Static assets (images, icons)
├── .env.local                 # Environment variables (create this)
├── .gitignore                 # Git ignore rules
├── tailwind.config.ts         # Tailwind CSS configuration
└── next.config.mjs            # Next.js configuration
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Push your code to GitHub** — if you haven't already, create a repo and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Connect to Vercel** — Go to [vercel.com/new](https://vercel.com/new) and click "Import Git Repository"

3. **Select your repo** — Choose `my-app` from the list

4. **Add environment variables** — Click "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste your Supabase anon key

5. **Deploy** — Click "Deploy" and wait ~1 minute

6. **Done!** — Your app will be live at a URL like `my-app.vercel.app`

> 💡 **Don't forget**: Make sure to enable Email auth in your Supabase dashboard under Authentication → Providers → Email.

## 📝 License

MIT