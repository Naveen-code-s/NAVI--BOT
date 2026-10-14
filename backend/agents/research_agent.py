from services.openai_service import ask

async def research(question):
    try:
        return await ask("You are Navi's research assistant. Explain what you know, separate established facts from uncertainty, and never invent sources or pretend you browsed the web. If live sources are needed, say that web search is not connected yet.", question)
    except RuntimeError as error: return str(error)
