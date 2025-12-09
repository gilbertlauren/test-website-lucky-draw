// api/seed.js

import { Client } from 'pg'; 

// DAFTAR 100 KODE UNIK LENGKAP
const codes = [
  "7X9K2M4P", "B3L8Q1W9", "N5R2J7X4", "H9C6D3F8", "K1P4M7T2", "Q8W3Y5L9", "Z2X6C9V4", "J7B3N1M5", "D4F8G2H6", "T9R5E1W3",
  "L6K2J9H4", "M3N8B5V7", "C1X4Z7Q2", "P9O3I6U8", "Y2T5R1E4", "W7Q9A3S6", "G4F2D8H1", "V5C9X3Z7", "B1N6M2K8", "J9H4G7F3",
  "R2E5W8Q1", "T6Y3U9I4", "O2P7L1K5", "A9S4D8F2", "G3H6J1K9", "L5Z2X7C4", "V8B3N9M1", "Q4W6E2R7", "T1Y5U8I3", "O9P2A6S4",
  "D7F3G1H5", "J4K8L2Z9", "X6C1V5B3", "N9M7Q2W4", "E5R8T3Y1", "U6I2O9P4", "A3S7D1F5", "G9H2J6K8", "L4Z1X5C7", "V3B8N2M9",
  "Q6W1E5R7", "T9Y3U2I8", "O5P7A1S4", "D2F9G3H6", "J8K4L1Z5", "X3C7V9B2", "N6M1Q5W8", "E2R7T4Y9", "U1I6O3P8", "A5S2D9F4",
  "G7H1J3K6", "L8Z5X2C9", "V4B1N7M3", "Q9W5E8R2", "T3Y6U1I7", "O4P8A2S9", "D1F5G7H3", "J6K2L9Z4", "X8C3V1B5", "N2M6Q9W7",
  "E4R1T5Y8", "U7I3O6P2", "A9S5D1F8", "G2H7J4K3", "L6Z9X1C5", "V3B7N4M8", "Q1W5E2R6", "T8Y4U9I2", "O3P6A1S7", "D5F2G8H4",
  "J9K3L7Z1", "X2C5V8B6", "N4M1Q7W3", "E8R2T6Y9", "U5I1O4P7", "A2S9D3F6", "G6H4J8K1", "L3Z7X2C5", "V9B1N6M4", "Q5W8E3R7",
  "T2Y6U1I9", "O8P4A7S3", "D1F9G2H5", "J5K3L8Z6", "X7C2V1B9", "N3M6Q4W8", "E9R5T1Y2", "U4I8O3P6", "A7S1D5F2", "G3H9J6K4",
  "L1Z5X8C2", "V6B4N7M3", "Q9W2E5R8", "T1Y7U3I6", "O5P9A2S4", "D8F3G1H7", "J4K6L2Z5"
];


export default async function handler(request, response) {
  
  // KONEKSI DIBUAT PER INVOCATION (PENTING UNTUK SERVERLESS)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // SSL diatur ke true untuk Neon/Vercel (default di pg jika string ada https)
    ssl: { rejectUnauthorized: false } 
  });

  try {
    await client.connect(); // Hubungkan ke Neon

    for (const code of codes) {
      // Periksa apakah kode sudah ada di tabel
      const checkRes = await client.query(
        'SELECT code FROM validation_codes WHERE code = $1', // Query SQL
        [code]
      );

      if (checkRes.rows.length === 0) {
        // Jika belum ada, masukkan (INSERT) kode dan status 'UNUSED'
        await client.query(
          'INSERT INTO validation_codes (code, status) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
          [code, 'UNUSED']
        );
      }
    }
    
    return response.status(200).json({ message: "Database Neon berhasil diisi 100 kode!" });
    
  } catch (error) {
    console.error("Database Error:", error);
    return response.status(500).json({ error: "Gagal menghubungkan atau mengoperasikan database Neon.", detail: error.message });
  } finally {
    if (client) {
      await client.end(); // Sangat penting: Tutup koneksi setelah selesai
    }
  }
}