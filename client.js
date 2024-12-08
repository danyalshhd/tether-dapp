'use strict';

const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');
const fs = require('fs');

const main = async () => {
  const dht = new DHT({ bootstrap: [{ host: '127.0.0.1', port: 30001 }] });
  await dht.ready();

  const rpc = new RPC({ dht });
  const rpcPublicKey = fs.readFileSync('rpcPublicKey.txt', 'utf-8');
  const serverPubKey = Buffer.from(rpcPublicKey, 'hex');

  const payload = { pairs: ['bitcoin', 'ethereum'] };
  const rawResponse = await rpc.request(serverPubKey, 'getLatestPrices', Buffer.from(JSON.stringify(payload), 'utf-8'));
  const response = JSON.parse(rawResponse.toString('utf-8'));

  console.log('Latest Prices:', response);

  await rpc.destroy();
  await dht.destroy();
};

main().catch(console.error);
