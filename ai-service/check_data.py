from app.db import get_cursor

with get_cursor() as cur:
    cur.execute('SELECT status, COUNT(*) FROM "properties" GROUP BY status')
    rows = cur.fetchall()
    print(rows)