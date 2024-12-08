module.exports = async () => {
    try {
      const topCurrencies = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }).then((res) => res.json());
      
      // Get top 5 currencies by market cap
      const top5 = Array.isArray(topCurrencies) && topCurrencies.slice(0, 5).map((coin) => coin.id);
  
      const prices = {};
      if (top5) {
        for (const coin of top5) {
          const marketData = await fetch(`${COINGECKO_API}/coins/${coin}/tickers`).then((res) => res.json());
          const tickers = marketData?.tickers?.filter((ticker) => ticker.target === 'USDT')?.slice(0, 3);
      
          if (tickers?.length) {
            const avgPrice = tickers.reduce((sum, ticker) => sum + parseFloat(ticker.last), 0) / tickers.length;
            prices[coin] = { avgPrice, exchanges: tickers.map((ticker) => ticker.market.name) };
          }
        }
      }
    
      return prices;
    } catch (err) {
      console.error("Error fetching prices:", err);
      return [];
    }
  }