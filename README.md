To run the backend

- npm i
- node server.js


To run the client

- node client.js


Improvements to be made
- Caching can be done for immutable things like coins, saving API call
-  Retry mechanism be used if the API fails
-  Rate limiting to be applied to API calls considering the server has limitation
-  Logging needs to be added
-  Environment variables to be used for API URL and DHT settings
-  NestJS to be utilized containing modules for RPC, Scheduler and Coingecko
-  Unit tests/Integration tests to be written to test the logic
