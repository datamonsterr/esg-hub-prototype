---
description: when write new api fetch
applyTo: src/api/*.ts
---
Use axios and useSWR for handling fetch.
api endpoints must be defined in endpoints object in src/api/axios.ts.
For each api, there is a raw api handler function using axios as fetcher. Then wrap this fetcher with useSWR.
Naming convention:
- Api handler: getSomething, createSomething, updateSomething, deleteSomething
- useSWR: use{Api handler} such as useGetSomething

