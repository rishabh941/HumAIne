from datetime import datetime, timedelta
from bson import ObjectId
from .db import db
from .models import HelpRequest, Knowledge, RequestStatus


# 🧠 Create new help request
async def create_help_request(customer_id: str, question: str):
    """
    Create a new help request when the AI doesn't know an answer.
    Ensures the MongoDB _id is a valid ObjectId.
    """
    help_request = HelpRequest(customer_id=customer_id, question=question)
    doc = help_request.dict(by_alias=True)

    # Ensure the _id is a proper ObjectId (not a string)
    if isinstance(doc["_id"], str):
        doc["_id"] = ObjectId(doc["_id"])

    await db["help_requests"].insert_one(doc)
    print(f"✅ Created new help request for customer {customer_id}: '{question}'")
    return help_request


# 📋 List all pending help requests
async def list_pending_requests():
    """
    Retrieve all pending help requests for supervisor review.
    """
    cursor = db["help_requests"].find({"status": RequestStatus.PENDING})
    results = [HelpRequest(**doc) async for doc in cursor]
    print(f"📋 Found {len(results)} pending requests.")
    return results


# 🧩 Resolve a help request and update the knowledge base
async def resolve_request(request_id: str, answer: str):
    """
    Marks a help request as resolved, stores the supervisor's answer,
    and updates (or inserts) that answer into the knowledge base.
    """
    try:
        _id = ObjectId(request_id)
    except Exception as e:
        print(f"❌ Invalid ObjectId format: {e}")
        return None

    print(f"🔍 Looking for request with _id: {_id}")

    hr_doc = await db["help_requests"].find_one({"_id": _id})
    if not hr_doc:
        print(f"❌ No document found for _id: {_id}")
        return None

    # Update help request
    await db["help_requests"].update_one(
        {"_id": _id},
        {
            "$set": {
                "status": RequestStatus.RESOLVED,
                "supervisor_answer": answer,
                "resolved_at": datetime.utcnow(),
            }
        },
    )

    # Upsert into knowledge base
    qkey = hr_doc["question"].strip().lower()
    await db["knowledge"].update_one(
        {"question_key": qkey},
        {"$set": {"answer": answer, "created_at": datetime.utcnow()}},
        upsert=True,
    )

    # Fetch updated help request
    updated_hr = await db["help_requests"].find_one({"_id": _id})
    print(f"✅ Resolved request {_id} and updated knowledge base.")
    return HelpRequest(**updated_hr)


# 🔍 Find an answer in knowledge base
async def find_answer(question: str):
    """
    Looks up a question in the knowledge base.
    If found, returns the known answer.
    """
    qkey = question.strip().lower()
    kb_doc = await db["knowledge"].find_one({"question_key": qkey})

    if kb_doc:
        print(f"🤖 Found answer in knowledge base for '{qkey}'")
        return Knowledge(**kb_doc)

    print(f"🧠 No entry found in knowledge base for '{qkey}'")
    return None


# 🧾 List all learned Q&A
async def list_knowledge():
    """
    Returns all learned questions and answers from the knowledge base.
    """
    cursor = db["knowledge"].find({})
    results = [Knowledge(**doc) async for doc in cursor]
    print(f"📚 Knowledge base contains {len(results)} entries.")
    return results


# ⚠️ Optional: Mark unresolved requests (for timeout automation)
async def mark_unresolved_if_timeout(minutes: int = 10):
    """
    Marks help requests as 'unresolved' if they remain pending for too long.
    Default timeout: 0.1 minutes (~6 seconds) for testing.
    """
    cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)

    result = await db["help_requests"].update_many(
        {
            "status": RequestStatus.PENDING,
            "created_at": {"$lt": cutoff_time}
        },
        {"$set": {"status": RequestStatus.UNRESOLVED}}
    )

    if result.modified_count > 0:
        print(f"⚠️ Auto-marked {result.modified_count} help request(s) as UNRESOLVED due to timeout.")
    else:
        print("⏳ No pending requests exceeded timeout yet.")

# Get all unresolved help Requests

async def list_unresolved_requests():
    """
    Fetch all help requests that have been auto-marked as 'unresolved'.
    """
    cursor = db["help_requests"].find({"status": RequestStatus.UNRESOLVED})
    unresolved = [HelpRequest(**doc) async for doc in cursor]
    print(f"📋 Found {len(unresolved)} unresolved requests.")
    return unresolved

# 🔄 2️⃣ Reopen an unresolved request
async def reopen_request(request_id: str):
    """
    Allows a supervisor to reopen an 'unresolved' help request.
    Changes its status back to 'pending'.
    """
    try:
        _id = ObjectId(request_id)
    except Exception as e:
        print(f"❌ Invalid ObjectId format: {e}")
        return None

    hr_doc = await db["help_requests"].find_one({"_id": _id})
    if not hr_doc:
        print(f"❌ Request {request_id} not found.")
        return None

    if hr_doc["status"] != RequestStatus.UNRESOLVED:
        print(f"⚠️ Request {request_id} is not unresolved. Current status: {hr_doc['status']}")
        return None

    await db["help_requests"].update_one(
        {"_id": _id},
        {"$set": {"status": RequestStatus.PENDING, "resolved_at": None, "supervisor_answer": None}}
    )
    print(f"🔄 Reopened help request {_id}. Now pending again.")
    updated = await db["help_requests"].find_one({"_id": _id})
    return HelpRequest(**updated)


# 🗑️ 3️⃣ Delete an old or resolved request
async def delete_request(request_id: str):
    """
    Permanently deletes a help request (for cleanup purposes).
    Only allowed if request is resolved or unresolved.
    """
    try:
        _id = ObjectId(request_id)
    except Exception as e:
        print(f"❌ Invalid ObjectId format: {e}")
        return None

    hr_doc = await db["help_requests"].find_one({"_id": _id})
    if not hr_doc:
        print(f"❌ No document found for _id: {request_id}")
        return None

    if hr_doc["status"] == RequestStatus.PENDING:
        print(f"⚠️ Cannot delete pending request {_id}.")
        return "cannot_delete_pending"

    await db["help_requests"].delete_one({"_id": _id})
    print(f"🗑️ Deleted help request {_id} ({hr_doc['status']}).")
    return "deleted"