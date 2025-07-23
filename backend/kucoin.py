import ccxt
import pandas as pd
from datetime import datetime, timedelta

kucoin = ccxt.kucoin()

def fetch_ohlcv(symbol: str):
    since = kucoin.parse8601((datetime.utcnow() - timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%S"))
    ohlcv = kucoin.fetch_ohlcv(symbol, timeframe='1d', since=since)
    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    return df
