// api/validate.js

// Import createClient alih-alih kv
import { createClient } from '@vercel/kv';

// Konfigurasi koneksi menggunakan variabel lingkungan DENGAN PREFIX 'STORAGE'
const kv = createClient({
  url: process.env.STORAGE_REST_API_URL,  // Mengambil STORAGE_REST_API_URL
  token: process.env.STORAGE_REST_API_TOKEN, // Mengambil STORAGE_REST_API_TOKEN
});

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).send({ message: 'Only POST requests allowed' });
  }
  // ... (Sisa kode tetap sama)
}