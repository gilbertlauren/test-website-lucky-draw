// api/seed.js

import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.STORAGE_REST_API_URL, 
  token: process.env.STORAGE_REST_API_TOKEN,
});

export default async function handler(request, response) {
  // ... (Sisa kode handler)
}