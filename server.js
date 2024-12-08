'use strict';

const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');
const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');
const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const fetchCryptoData = require('./fetchCryptoData');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const main = async () => {
  const core = new Hypercore('./data');
  const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' });
  await db.ready();

  const dht = new DHT({ bootstrap: [{ host: '127.0.0.1', port: 30001 }] });
  await dht.ready();

  const rpc = new RPC({ dht });
  const server = rpc.createServer();

  await server.listen();

  const rpcPublicKey = server.publicKey.toString('hex');
  fs.writeFileSync('rpcPublicKey.txt', rpcPublicKey);

  console.log('RPC server running at:', rpcPublicKey);

  // RPC Handlers
  server.respond('getLatestPrices', async (rawReq) => {
    const pairs = JSON.parse(rawReq.toString('utf-8'));
    const results = {};

    for (const pair of pairs.pairs) {
      const latest = await db.get(pair);
      if (latest) results[pair] = latest.value;
    }

    return Buffer.from(JSON.stringify(results), 'utf-8');
  });

  server.respond('getHistoricalPrices', async (rawReq) => {
    const { pairs, from, to } = JSON.parse(rawReq.toString('utf-8'));
    
    const results = {};

    for (const pair of pairs) {
      const range = db.createReadStream({ gte: `${pair}:${from}`, lte: `${pair}:${to}` });
      results[pair] = [];
      for await (const entry of range) {
        results[pair].push(entry.value);
      }
    }

    return Buffer.from(JSON.stringify(results), 'utf-8'); 
  });

  // Scheduler
  setInterval(async () => {
    const data = await fetchCryptoData();
    const timestamp = Date.now();

    for (const [currency, details] of Object.entries(data)) {
      await db.put(`${currency}:${timestamp}`, details);
      await db.put(currency, details); // Store the latest price.
    }
  }, 30000);
};

main().catch(console.error);
