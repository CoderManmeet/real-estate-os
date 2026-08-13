from contextlib import contextmanager

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.config import settings

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool(conninfo=settings.database_url, min_size=1, max_size=5)
    return _pool


@contextmanager
def get_cursor():
    """
    Usage:
        with get_cursor() as cur:
            cur.execute('SELECT * FROM "Property" WHERE id = %s', (property_id,))
            row = cur.fetchone()

    Rows come back as dicts (row_factory=dict_row) so columns are accessed
    by name, matching Prisma's camelCase column naming used on the Node side.
    """
    with get_pool().connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            yield cur