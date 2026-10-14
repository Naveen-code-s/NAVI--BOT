from services.openai_service import ask
from services.vector_service import search_memories

async def reply(message, memories, history=None):
    relevant = search_memories(message, memories)
    context = "\n".join(f"- {m['title']}: {m.get('content', '')}" for m in relevant) or "No relevant saved memories."
    try:
        transcript = "\n".join(f"{item.get('role', 'user')}: {item.get('content', '')}" for item in (history or []) if item.get('role') in {"user", "assistant"})
        prompt = f"Relevant saved memories:\n{context}\n\nRecent conversation:\n{transcript or 'This is the start of the conversation.'}\n\nUser: {message}"
        return await ask("You are Navi, a thoughtful personal AI assistant. Use relevant saved memories and conversation context when helpful. Be clear and honest; never claim you searched the web unless you did.", prompt)
    except RuntimeError as error:
        return f"{error}\n\nYou can still save memories and manage tasks while the AI connection is being set up."
