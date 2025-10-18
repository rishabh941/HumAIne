# HumAIne Frontend - AI Supervisor Dashboard

A modern Next.js 14 dashboard for managing human-in-the-loop AI supervision.

## Features

- 🟢 **Pending Requests** - Review and respond to customer questions
- ⚠️ **Unresolved Requests** - Manage timed-out requests
- 📚 **Knowledge Base** - View learned Q&A pairs
- 💬 **Ask Simulator** - Test the AI system

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Axios
- React Hot Toast
- Lucide Icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_API_BASE_URL=https://upgraded-lamp-v4wgw599rjgcp74x-8000.app.github.dev
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Setup

Make sure your FastAPI backend has CORS enabled:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Pending requests (home)
│   ├── unresolved/        # Unresolved requests page
│   ├── knowledge/         # Knowledge base page
│   └── ask/               # Ask simulator page
├── components/            # Reusable components
│   ├── Sidebar.tsx
│   ├── RequestCard.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
└── lib/                   # Utilities
    └── axiosClient.ts     # Axios configuration
```

## API Endpoints

The frontend connects to these backend endpoints:

- `POST /ask` - Customer asks a question
- `GET /supervisor/pending` - Fetch pending requests
- `POST /supervisor/reply` - Reply to a pending request
- `GET /supervisor/unresolved` - Fetch unresolved requests
- `PATCH /supervisor/reopen/{id}` - Reopen an unresolved request
- `DELETE /supervisor/{id}` - Delete a request
- `GET /knowledge` - Fetch knowledge base entries