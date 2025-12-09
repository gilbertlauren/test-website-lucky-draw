// api/seed.js dan api/validate.js

import { createClient } from '@vercel/kv';

const kv = createClient({
  // Gunakan variabel URL penuh yang kamu temukan sebelumnya
  url: process.env.STORAGE_REDIS_URL, 
  // Hapus baris 'token' sepenuhnya
});

export default async function handler(request, response) {
  // Pastikan request adalah POST (Karena ini fungsi validasi)
  if (request.method !== 'POST') {
    return response.status(405).send({ message: 'Only POST requests allowed' });
  }

  // Ambil data kode dan email dari body request
  const { code, email } = request.body;

  if (!code || !email) {
    return response.status(400).json({ error: 'Kode dan Email diperlukan.' });
  }

  try {
    // 1. Cek keberadaan dan status kode di database
    const codeKey = `code:${code}`;
    const codeStatus = await kv.get(codeKey); // Harusnya mengembalikan 'UNUSED' atau null/email

    if (!codeStatus) {
      // Kode tidak ditemukan
      return response.status(404).json({ error: 'Kode tidak valid atau tidak ditemukan.' });
    }

    if (codeStatus !== 'UNUSED') {
      // Kode sudah digunakan
      return response.status(409).json({ error: `Kode sudah digunakan oleh ${codeStatus}.` });
    }

    // 2. Jika kode UNUSED, gunakan kode tersebut (mengubah status)
    // Simpan email pengguna sebagai penanda penggunaan
    await kv.set(codeKey, email);

    // 3. Kirim respon sukses
    return response.status(200).json({ 
        message: 'Validasi berhasil! Kode valid dan telah digunakan.', 
        success: true 
    });

  } catch (error) {
    // Respon jika terjadi kegagalan koneksi/operasional
    return response.status(500).json({ error: 'Terjadi kesalahan server saat memproses validasi.', detail: error.message });
  }
}