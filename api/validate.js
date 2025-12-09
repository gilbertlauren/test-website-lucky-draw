import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { code, email } = request.body;
  
  if (!code || !email) {
    return response.status(400).json({ success: false, message: 'Data tidak lengkap.' });
  }

  const upperCode = code.toUpperCase();

  try {
    // 1. Ambil status kode dari database
    const status = await kv.get(`code:${upperCode}`);

    // 2. Jika status null, berarti kode tidak ada di daftar
    if (status === null) {
      return response.status(200).json({ success: false, message: '⛔ Kode tidak valid / tidak ditemukan!' });
    }

    // 3. Jika status bukan 'UNUSED', berarti sudah dipakai
    if (status !== 'UNUSED') {
      // Kita bisa simpan siapa yang pakai sebelumnya di value, misal: email si pemakai
      return response.status(200).json({ success: false, message: '⛔ Kode ini SUDAH digunakan sebelumnya!' });
    }

    // 4. Jika lolos, update status menjadi USED (disimpan dengan email penukar)
    await kv.set(`code:${upperCode}`, `USED_BY_${email}`);

    return response.status(200).json({ success: true, message: 'Kode valid!' });

  } catch (error) {
    return response.status(500).json({ success: false, message: 'Database Error' });
  }
}