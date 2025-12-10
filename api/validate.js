// api/validate.js

import { Client } from 'pg';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).send({ message: 'Only POST requests allowed' });
  }

  // --- PERBAIKAN PARSING BODY KRUSIAL ---
  let body = request.body;

  // Jika body belum diurai (berupa string JSON), urai secara manual
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return response.status(400).json({ success: false, message: 'Body request tidak valid (bukan JSON).' });
    }
  }
  // ----------------------------------------

  const { code, email } = body; // Menggunakan variabel 'body' yang sudah terurai

  if (!code || !email) {
    return response.status(400).json({ success: false, message: 'Kode dan Email diperlukan.' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect(); // Hubungkan ke Neon

    // 1. Cek keberadaan dan status kode (SELECT)
    const checkRes = await client.query(
      'SELECT status FROM validation_codes WHERE code = $1',
      [code]
    );

    if (checkRes.rows.length === 0) {
      // Kode tidak ditemukan
      return response.status(404).json({ success: false, message: 'Kode tidak valid atau tidak ditemukan.' });
    }

    const codeStatus = checkRes.rows[0].status;

    if (codeStatus !== 'UNUSED') {
      // Kode sudah digunakan
      return response.status(409).json({
        success: false,
        message: 'Kode unik sudah pernah digunakan. Setiap kode hanya dapat digunakan sekali.'
      });
    }

    // 2. Jika kode UNUSED, perbarui status menjadi email pengguna (UPDATE)
    await client.query(
      'UPDATE validation_codes SET status = $1 WHERE code = $2',
      [email, code]
    );

    // 3. Kirim respon sukses
    return response.status(200).json({
      message: 'Validasi berhasil! Kode valid dan telah digunakan.',
      success: true
    });

  } catch (error) {
    console.error("Database Error:", error);
    // Tambahkan error.message untuk debugging yang lebih baik di log Vercel
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan server saat memproses validasi.', detail: error.message });
  } finally {
    if (client) {
      await client.end(); // Tutup koneksi
    }
  }
}