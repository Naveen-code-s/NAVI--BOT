"""Small local knowledge retrieval helper; replace with embeddings/vector DB as the library grows."""
def search_memories(query, memories, limit=5):
    terms = {word.lower() for word in query.split() if len(word) > 2}
    ranked = []
    for item in memories:
        text = f"{item.get('title', '')} {item.get('content', '')}".lower()
        score = sum(term in text for term in terms)
        if score: ranked.append((score, item))
    return [item for _, item in sorted(ranked, key=lambda pair: pair[0], reverse=True)[:limit]]
