# Sui DApp Demo

Aplikasi demo yang menunjukkan integrasi dengan Sui blockchain menggunakan Suiet Wallet Kit.

## Fitur

- Koneksi dengan wallet Sui (Suiet, Sui Wallet, Ethos Wallet, dll)
- Menampilkan informasi wallet yang terhubung
- Contoh eksekusi Move Call (NFT Minting)
- Contoh penandatanganan pesan

## Teknologi yang Digunakan

- React
- [Suiet Wallet Kit](https://kit.suiet.app)
- [@mysten/sui](https://www.npmjs.com/package/@mysten/sui) - SDK Sui

## Memulai

### Prasyarat

- Node.js (versi 14 atau lebih baru)
- NPM atau Yarn
- Browser web modern dengan ekstensi wallet Sui (Suiet, Sui Wallet, dll.)

### Instalasi

1. Clone repository ini:

```
git clone <repository-url>
cd project-blockchain
```

2. Install dependencies:

```
npm install
```

3. Jalankan aplikasi dalam mode development:

```
npm start
```

4. Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi di browser.

## Penggunaan

1. Klik tombol "Connect Wallet" untuk menghubungkan wallet Sui Anda.
2. Setelah terhubung, informasi wallet Anda akan ditampilkan.
3. Gunakan tombol "Execute Move Call" untuk mencoba menjalankan fungsi mint NFT.
4. Gunakan tombol "Sign Message" untuk menandatangani pesan "Hello World".

## Catatan Penting

- Contoh Move Call menggunakan package ID contoh (`0x1`). Untuk aplikasi nyata, Anda perlu mengganti ini dengan package ID yang valid.
- Aplikasi ini adalah demo dan tidak dirancang untuk digunakan dalam produksi tanpa modifikasi lebih lanjut.

## Sumber Daya

- [Dokumentasi Suiet Kit](https://kit.suiet.app/docs/QuickStart/)
- [Dokumentasi Sui](https://docs.sui.io/)

## Lisensi

MIT
