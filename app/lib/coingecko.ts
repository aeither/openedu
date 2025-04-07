interface CoinGeckoResponse {
  [tokenId: string]: {
    [currency: string]: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
    last_updated_at: number;
  };
}

export interface TokenPriceData {
  price: number;
  currency: string;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
}

export async function getTokenPrice(tokenId: string, currency: string = 'usd'): Promise<TokenPriceData> {
  const currencyLower = currency.toLowerCase();
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${currencyLower}&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${tokenId} price`);
  }

  const data: CoinGeckoResponse = await response.json();
  const tokenData = data[tokenId];

  if (!tokenData) {
    throw new Error(`Token ${tokenId} not found`);
  }

  return {
    price: tokenData[currencyLower],
    currency: currency.toUpperCase(),
    change24h: tokenData.usd_24h_change,
    marketCap: tokenData.usd_market_cap,
    volume24h: tokenData.usd_24h_vol,
    lastUpdated: new Date(tokenData.last_updated_at * 1000).toISOString()
  };
}
