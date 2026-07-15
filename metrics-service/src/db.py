import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

CLOSED_SIGNALS_QUERY = text(
    """
    SELECT id, symbol, side, pnl, "updatedAt" AS updated_at
    FROM signals
    WHERE status = 'CLOSED' AND pnl IS NOT NULL
    ORDER BY "updatedAt" ASC
    """
)


def make_engine(database_url: str) -> Engine:
    # Metrics service only ever reads; it never writes to this database.
    return create_engine(database_url, pool_pre_ping=True)


def fetch_closed_signals(engine: Engine) -> pd.DataFrame:
    with engine.connect() as conn:
        return pd.read_sql(CLOSED_SIGNALS_QUERY, conn)
