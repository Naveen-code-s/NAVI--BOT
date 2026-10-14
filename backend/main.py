from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from agents.chat_agent import reply
from agents.memory_agent import list_memories, save_memory, delete_memory
from agents.task_agent import list_tasks, add_task, update_task, delete_task
from agents.research_agent import research

@asynccontextmanager
async def lifespan(app):
    yield

app = FastAPI(title="Navi Bot API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = Field(default_factory=list)
class ItemRequest(BaseModel):
    title: str
    content: str = ""
class ChatResponse(BaseModel):
    reply: str

@app.get("/api/health")
def health(): return {"status": "ok", "app": "Navi Bot"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    if not body.message.strip(): raise HTTPException(400, "Message cannot be empty")
    return {"reply": await reply(body.message.strip(), list_memories(), body.history[-12:])}

@app.get("/api/memories")
def memories(): return list_memories()
@app.post("/api/memories")
def create_memory(body: ItemRequest): return save_memory(body.title, body.content)
@app.delete("/api/memories/{item_id}")
def remove_memory(item_id: str): return delete_memory(item_id)

@app.get("/api/tasks")
def tasks(): return list_tasks()
@app.post("/api/tasks")
def create_task(body: ItemRequest): return add_task(body.title)
@app.patch("/api/tasks/{item_id}")
def patch_task(item_id: str):
    task = update_task(item_id)
    if not task: raise HTTPException(404, "Task not found")
    return task
@app.delete("/api/tasks/{item_id}")
def remove_task(item_id: str):
    if not delete_task(item_id): raise HTTPException(404, "Task not found")
    return {"ok": True}

@app.post("/api/research")
async def run_research(body: ChatRequest):
    if not body.message.strip(): raise HTTPException(400, "Research question cannot be empty")
    return {"answer": await research(body.message.strip())}
