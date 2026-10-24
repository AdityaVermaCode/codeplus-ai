# CodePulse AI 🛡️

**Real-Time Visual Architecture & API Security Auditor**

Upload any architecture diagram, system design screenshot, or cloud infrastructure image — and get a full AI-powered security audit in seconds. Runs locally on your laptop. No paid subscriptions. No data sent to the cloud (unless you choose to).

---

## How It Works

You upload an image → the AI reads it like a security expert → you get:

- A **Risk Score** out of 100 (Critical / High / Medium / Low)
- A list of every **vulnerability found**, with severity labels
- A **ready-to-use YAML/code fix** for each issue
- An **OWASP Top 10 compliance** check

The tool uses a **3-tier AI fallback** so it never fails:

```
1. Local LM Studio (Gemma 4) — private, on-device, no internet needed
        ↓ if not running
2. Google Gemini 2.5 Flash — cloud fallback (requires API key)
        ↓ if unavailable
3. Anti-Gravity Built-in Engine — always works, offline, no setup
```

---

## Prerequisites

Before you start, make sure you have these installed:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18 or higher | https://nodejs.org |
| **Python** | 3.10 or higher | https://python.org |
| **Git** | Any | https://git-scm.com |

> **Optional (for best results):** LM Studio for running the AI model locally → https://lmstudio.ai

---

## Setup & Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/AdityaVermaCode/codeplus-ai.git
cd codeplus-ai
```

---

### Step 2 — Set up the Backend

Open a terminal and run these commands one by one:

```bash
cd backend
```

**Create a Python virtual environment:**

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On Mac / Linux
python3 -m venv venv
source venv/bin/activate
```

**Install Python dependencies:**

```bash
pip install -r requirements.txt
```

**Create the environment file:**

Create a file called `.env` inside the `backend/` folder with this content:

```env
LM_STUDIO_URL=http://localhost:1234/v1/chat/completions
GEMINI_API_KEY=your_gemini_api_key_here
```

> - `LM_STUDIO_URL` — leave this as-is if you're using LM Studio on its default port.
> - `GEMINI_API_KEY` — only needed if LM Studio is not running. Get a free key at https://aistudio.google.com/apikey. If you don't have one, leave it blank — the built-in engine will still work.

**Start the backend server:**

```bash
uvicorn main:app --reload
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

✅ Backend is running. Keep this terminal open.

---

### Step 3 — Set up the Frontend

Open a **new terminal** (keep the backend terminal running):

```bash
cd frontend
npm install
npm run dev
```

You should see:

```
▲ Next.js 16.4.3
- Local: http://localhost:3000
```

✅ Frontend is running.

---

### Step 4 — Open the App

Go to **http://localhost:3000** in your browser.

---

## Setting Up LM Studio (Optional — for Local AI)

LM Studio lets the AI run entirely on your laptop with no internet or API key needed.

1. Download LM Studio from https://lmstudio.ai and install it
2. Open LM Studio → go to the **Search** tab
3. Search for `gemma-4` and download any `4B` or `12B` variant (4B is faster)
4. Once downloaded, click **Load Model**
5. Go to the **Local Server** tab (icon looks like `<->`)
6. Click **Start Server** — it will start on port `1234`

That's it. Now when you run an audit, CodePulse AI will use your local Gemma 4 model first.

---

## Using the App

Once both servers are running and you open http://localhost:3000:

**Option A — Upload your own image:**
1. Click the upload zone on the left panel or drag and drop an image
2. Supported formats: PNG, JPG, WEBP
3. Click **"Run Visual Security Audit"**
4. Wait a few seconds — the report will appear on the right panel

**Option B — Try a demo without uploading anything:**

Click any of the quick sample buttons at the top of the page:
- ☁️ **AWS Cloud Arch** — shows a HIGH risk audit (72/100)
- 🔗 **Microservice Gateway** — shows a MEDIUM risk audit (58/100)
- ⚙️ **K8s Cluster** — shows a CRITICAL risk audit (91/100)

These work instantly with no backend or internet needed — great for exploring the UI.

---

## Project Structure

```
codeplus-ai/
│
├── backend/
│   ├── main.py           # FastAPI server — handles uploads and AI calls
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Your API keys (you create this)
│
└── frontend/
    ├── src/
    │   └── app/
    │       ├── page.tsx      # Main dashboard UI
    │       ├── layout.tsx    # App shell and metadata
    │       └── globals.css   # Base styles
    ├── package.json          # Node dependencies
    └── next.config.ts        # Next.js config
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Markdown rendering | react-markdown |
| Icons | Lucide React |
| Backend | Python, FastAPI, Uvicorn |
| Local AI | LM Studio + Gemma 4 (Google) |
| Cloud AI fallback | Google Gemini 2.5 Flash |

---

## Troubleshooting

**The audit button does nothing / I get a connection error**
→ Make sure the backend is running (`uvicorn main:app --reload` in the `backend/` folder with the virtual environment activated).

**The report says "Anti-Gravity Autonomous Agent Engine"**
→ This means both LM Studio and Gemini are unavailable. The built-in engine responded instead. To get real AI results: start LM Studio or add a `GEMINI_API_KEY` to your `.env` file.

**LM Studio is running but not being used**
→ Make sure the model is loaded and the local server is started inside LM Studio (the `<->` tab). The server must be on port `1234`.

**`uvicorn` command not found**
→ Your virtual environment is not activated. Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux) inside the `backend/` folder first.

**`npm install` fails**
→ Make sure you are running it inside the `frontend/` folder and that Node.js v18+ is installed (`node --version` to check).

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

Built for **Hacktoberfest × OSW Ahmedabad** by [Aditya Verma](https://github.com/AdityaVermaCode)
