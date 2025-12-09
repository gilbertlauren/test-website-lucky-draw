// api/validate.js

import { Client } from 'pg'; 

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { code, email } = request.body;

  if (!code || !email) {
    return response.status(400).json({ error: 'Kode dan Email diperlukan.' });
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect(); // Hubungkan ke Neon

    // 1. Cek keberadaan dan status kode (SELECT)
    const checkRes = await client.query(
      'SELECT status FROM validation_codes WHERE code = $1', // Query SQL
      [code]
    );

    if (checkRes.rows.length === 0) {
      // Kode tidak ditemukan
      return response.status(404).json({ error: 'Kode tidak valid atau tidak ditemukan.' });
    }

    const codeStatus = checkRes.rows[0].status;

    if (codeStatus !== 'UNUSED') {
      // Kode sudah digunakan
      return response.status(409).json({ error: `Kode sudah digunakan oleh ${codeStatus}.` });
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
    return response.status(500).json({ error: 'Terjadi kesalahan server saat memproses validasi.', detail: error.message });
  } finally {
    if (client) {
      await client.end(); // Tutup koneksi
    }
  }
}