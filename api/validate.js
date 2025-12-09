// api/seed.js dan api/validate.js

import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.STORAGE_REDIS_URL, // Gunakan URL penuh yang kamu temukan
  // Hapus baris 'token' sepenuhnya
}); 

export default async function handler(request, response) {
  // ... (Sisa kode handler)
}