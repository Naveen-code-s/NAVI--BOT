from openai import AsyncOpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL

def get_client():
    if not OPENAI_API_KEY:
        raise RuntimeError("OpenAI API key is missing. Add OPENAI_API_KEY to backend/.env and restart the server.")
    return AsyncOpenAI(api_key=OPENAI_API_KEY)
async def ask(system, prompt):
    response = await get_client().responses.create(model=OPENAI_MODEL, instructions=system, input=prompt)
    return response.output_text
