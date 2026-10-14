import json
from uuid import uuid4
from datetime import datetime, timezone
from config import DATA_DIR

FILE = DATA_DIR / "memory.json"
def _read():
    try: return json.loads(FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError): return []
def _write(items):
    FILE.parent.mkdir(parents=True, exist_ok=True)
    FILE.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
def list_memories(): return _read()
def save_memory(title, content):
    item = {"id": str(uuid4()), "title": title.strip(), "content": content.strip(), "created_at": datetime.now(timezone.utc).isoformat()}
    items = _read(); items.insert(0, item); _write(items); return item
def delete_memory(item_id):
    items = _read(); updated = [x for x in items if x["id"] != item_id]
    if len(items) == len(updated): return False
    _write(updated); return True
