// api/seed.js

// Import createClient alih-alih kv
import { createClient } from '@vercel/kv';

// Konfigurasi koneksi menggunakan variabel lingkungan DENGAN PREFIX 'STORAGE'
const kv = createClient({
  url: process.env.STORAGE_REST_API_URL,  // Mengambil STORAGE_REST_API_URL
  token: process.env.STORAGE_REST_API_TOKEN, // Mengambil STORAGE_REST_API_TOKEN
});


export default async function handler(request, response) {
  // Daftar 100 Kode Kamu
  // ... (Sisa kode tetap sama)
  // ...
  try {
    // ... (Sisa kode tetap sama)
    for (const code of codes) {
      // Cek dulu biar gak reset kalau sudah ada
      const exists = await kv.get(`code:${code}`);
      if (!exists) {
        // PERHATIKAN: Pastikan ini menggunakan 'kv' yang baru diinisialisasi
        await kv.set(`code:${code}`, 'UNUSED'); 
      }
    }
    return response.status(200).json({ message: "Database berhasil diisi 100 kode!" });
  } catch (error) {
    // Ini akan membantu jika masih ada error koneksi
    return response.status(500).json({ error: error.message, detail: "Pastikan variabel lingkungan STORAGE sudah benar." });
  }
}