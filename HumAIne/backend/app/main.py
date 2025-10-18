from fastapi import APIRouter, FastAPI, HTTPException
from fastapi import Path
from fastapi.middleware.cors import CORSMiddleware
from .livekit_integration import router as livekit_router
import asyncio
from fastapi import Request
from pydantic import BaseModel
from .crud import create_help_request, list_pending_requests, resolve_request, find_answer, list_knowledge , mark_unresolved_if_timeout,list_unresolved_requests,reopen_request,delete_request
from .db import init_db

app = FastAPI(title="HumAIne API", description="Human-in-the-Loop AI Supervisor System")
app.include_router(livekit_router)

router = APIRouter()
# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://upgraded-lamp-v4wgw599rjgcp74x-3000.app.github.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

    async def background_cleanup():
        while True:
            await mark_unresolved_if_timeout(minutes=10)
            await asyncio.sleep(5000)  # check every 5 seconds

    asyncio.create_task(background_cleanup())

# ---------- Schemas ----------
class AskRequest(BaseModel):
    customer_id: str
    question: str

class SupervisorReply(BaseModel):
    request_id: str
    answer: str

# ---------- Routes ----------
@app.post("/ask")
async def ask_question(payload: AskRequest):
    kb_entry = await find_answer(payload.question)
    if kb_entry:
        return {"answer": kb_entry.answer, "from_kb": True}

    help_req = await create_help_request(payload.customer_id, payload.question)
    print(f"[SUPERVISOR ALERT] Need help answering: '{payload.question}' (request_id={help_req.id})")

    return {
        "message": "Let me check with my supervisor and get back to you.",
        "request_id": str(help_req.id),
        "from_kb": False,
    }

@app.get("/supervisor/pending")
async def get_pending_requests():
    return await list_pending_requests()

@app.post("/supervisor/reply")
async def reply_to_request(payload: SupervisorReply):
    hr = await resolve_request(payload.request_id, payload.answer)
    if not hr:
        raise HTTPException(status_code=404, detail="Request not found")

    print(f"[CUSTOMER UPDATE] Sent to {hr.customer_id}: {payload.answer}")
    return {"status": "ok", "resolved_request": hr}

@app.get("/knowledge")
async def get_knowledge():
    return await list_knowledge()

@app.post("/notify/customer")
async def notify_customer(customer_id: str, message: str):
    print(f"[CUSTOMER NOTIFICATION] To {customer_id}: {message}")
    return {"status": "notification sent"}

@app.get("/supervisor/unresolved")
async def get_unresolved_requests():
    unresolved = await list_unresolved_requests()
    return unresolved

# 🔄 2️⃣ Reopen an unresolved request
@app.patch("/supervisor/reopen/{request_id}")
async def reopen_unresolved_request(request_id: str = Path(..., description="The ID of the request to reopen")):
    result = await reopen_request(request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Unresolved request not found or invalid.")
    return {"status": "reopened", "updated_request": result}


# 🗑️ 3️⃣ Delete a request
@app.delete("/supervisor/{request_id}")
async def delete_help_request(request_id: str = Path(..., description="The ID of the request to delete")):
    result = await delete_request(request_id)
    if result == "cannot_delete_pending":
        raise HTTPException(status_code=400, detail="Cannot delete a pending request.")
    if not result:
        raise HTTPException(status_code=404, detail="Request not found.")
    return {"status": "deleted"}


@router.post("/livekit/webhook")
async def livekit_webhook(request: Request):
    """
    Handle LiveKit webhooks — create help request if 'REQUEST_HELP:' detected.
    """
    payload = await request.json()
    text = json.dumps(payload).lower()
    if "request_help:" in text:
        start = text.find("request_help:")
        question = text[start + len("request_help:"):].split("\\n", 1)[0].strip()
        await create_help_request("livekit-caller", question)
        print(f"[LIVEKIT WEBHOOK] Created help request from LiveKit: '{question}'")
    return {"status": "ok"}