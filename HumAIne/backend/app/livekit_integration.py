# backend/app/livekit_integration.py
import os
from fastapi import APIRouter
from pydantic import BaseModel
from livekit import api  # livekit-api package
from datetime import timedelta
import os
router = APIRouter()

os.environ["LIVEKIT_API_KEY"] = "APINhKBmASf7Qot"
os.environ["LIVEKIT_API_SECRET"] = "ZuFEVaULwlroe7juEMTcIAws7ndF5spw7p6QPyqj3QP"
os.environ["LIVEKIT_URL"] = "wss://humaine-n1bbzzzf.livekit.cloud"
# Expect these env vars to be set
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://humaine-n1bbzzzf.livekit.cloud")

class TokenRequest(BaseModel):
    room: str
    identity: str
    name: str | None = None

@router.post("/livekit/token")
def create_token(payload: TokenRequest):
    """
    Generates a LiveKit join token for a participant.
    Frontend will fetch this to connect to a LiveKit room.
    """
    # Build grants (room join)
    video_grants = api.VideoGrants(room_join=True, room=payload.room)
    token = api.AccessToken(api_key=LIVEKIT_API_KEY, api_secret=LIVEKIT_API_SECRET) \
        .with_identity(payload.identity) \
        .with_name(payload.name or payload.identity) \
        .with_grants(video_grants) \
        .with_ttl(timedelta(minutes=30)) \
        .to_jwt()

    return {"token": token, "url": LIVEKIT_URL}
