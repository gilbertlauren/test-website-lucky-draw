// api/seed.js

import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.STORAGE_REST_API_URL, 
  token: process.env.STORAGE_REST_API_TOKEN,
});

export default async function handler(request, response) {
  // Daftar 100 Kode Kamu (Pindahkan Daftar ini ke luar fungsi handler jika memungkinkan, atau biarkan dulu)
  const codes = [ /* ... 100 kode ... */ ]; // Pastikan daftar kode lengkap di sini.

  try {
    for (const code of codes) {
      const exists = await kv.get(`code:${code}`);
      if (!exists) {
        await kv.set(`code:${code}`, 'UNUSED'); 
      }
    }
    return response.status(200).json({ message: "Database berhasil diisi 100 kode!" });
  } catch (error) {
    // Sederhanakan error response
    return response.status(500).json({ error: error.message, detail: "Koneksi KV gagal. Periksa log Vercel." });
  }
}