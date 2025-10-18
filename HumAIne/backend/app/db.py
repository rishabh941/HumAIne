from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os

# You can use local MongoDB or Mongo Atlas
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://rishabh1232326_db_user:OJgxXr3w8lRJNUIf@cluster0.fmreire.mongodb.net/")
DB_NAME = "humaine_db"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def init_db():
    # create indexes for faster lookups
    await db["help_requests"].create_index([("status", ASCENDING)])
    await db["knowledge"].create_index([("question_key", ASCENDING)], unique=True)
