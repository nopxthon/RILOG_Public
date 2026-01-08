# RILOG - Inventory Management System

Aplikasi manajemen gudang berbasis web.

## Tech Stack
- Backend: Node.js (Express)
- Database: MySQL
- Infrastructure: Docker

## Cara Menjalankan (Local Development)

1. Clone repository ini.
2. Copy file env:
   `cp src/.env.example src/.env`
3. Isi konfigurasi database di file `.env`.
4. Jalankan dengan Docker:
   `docker-compose up --build`
5. Buka `http://localhost:3000`
