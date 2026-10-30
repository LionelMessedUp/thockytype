/* thockytype — kamus kata & kutipan bahasa indonesia */
(function (global) {
  'use strict';

  // Kata-kata sehari-hari + istilah teknologi, tanpa duplikat.
  var WORDS = [
    // kata ganti & partikel
    'saya', 'aku', 'kamu', 'dia', 'kami', 'kita', 'mereka', 'anda',
    'dan', 'atau', 'tapi', 'karena', 'kalau', 'jika', 'supaya', 'serta',
    'yang', 'ini', 'itu', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada',
    'dalam', 'atas', 'bawah', 'antara', 'tanpa', 'sambil', 'seperti',
    'tidak', 'bukan', 'belum', 'sudah', 'pernah', 'masih', 'hanya', 'juga',
    'sangat', 'paling', 'lebih', 'kurang', 'agak', 'hampir', 'cukup',

    // kerja
    'ada', 'akan', 'bisa', 'harus', 'mau', 'ingin', 'suka', 'benci',
    'pergi', 'datang', 'pulang', 'tinggal', 'duduk', 'berdiri', 'jalan',
    'lari', 'terbang', 'berenang', 'masuk', 'keluar', 'naik', 'turun',
    'kerja', 'belajar', 'membaca', 'menulis', 'mendengar', 'melihat',
    'bicara', 'makan', 'minum', 'tidur', 'bangun', 'buka', 'tutup',
    'ambil', 'beri', 'kirim', 'terima', 'cari', 'temu', 'rasa', 'pikir',
    'tahu', 'ingat', 'lupa', 'coba', 'mulai', 'selesai', 'buat', 'pakai',
    'simpan', 'hapus', 'ubah', 'pilih', 'hitung', 'ukur', 'catat', 'tulis',
    'ketik', 'sentuh', 'tekan', 'geser', 'klik', 'muat', 'unggah', 'unduh',
    'salin', 'tempel', 'jalankan', 'hentikan', 'periksa', 'perbaiki',

    // benda & tempat
    'rumah', 'kantor', 'sekolah', 'kampus', 'jalan', 'kota', 'desa',
    'air', 'api', 'tanah', 'udara', 'angin', 'hujan', 'awan', 'langit',
    'matahari', 'bulan', 'bintang', 'laut', 'pantai', 'gunung', 'hutan',
    'sungai', 'sawah', 'kebun', 'taman', 'pasar', 'toko', 'kamar',
    'dapur', 'pintu', 'jendela', 'meja', 'kursi', 'buku', 'pulpen',
    'kertas', 'papan', 'layar', 'tombol', 'suara', 'bunyi', 'warna',
    'motor', 'mobil', 'sepeda', 'kereta', 'kapal', 'pesawat', 'jembatan',

    // orang
    'orang', 'anak', 'ibu', 'ayah', 'kakak', 'adik', 'teman', 'guru',
    'murid', 'dokter', 'petani', 'nelayan', 'pedagang', 'penulis',
    'pembaca', 'pengguna', 'pemilik', 'pekerja', 'pemimpin', 'tamu',

    // sifat
    'besar', 'kecil', 'tinggi', 'rendah', 'cepat', 'lambat', 'baru',
    'lama', 'muda', 'tua', 'baik', 'buruk', 'mudah', 'sulit', 'benar',
    'salah', 'sama', 'beda', 'banyak', 'sedikit', 'semua', 'setiap',
    'panas', 'dingin', 'terang', 'gelap', 'bersih', 'kotor', 'kuat',
    'lemah', 'mahal', 'murah', 'ramai', 'sepi', 'tenang', 'sibuk',
    'jelas', 'samar', 'kasar', 'halus', 'rapi', 'acak', 'unik', 'awet',

    // waktu
    'pagi', 'siang', 'sore', 'malam', 'hari', 'minggu', 'tahun', 'jam',
    'menit', 'detik', 'waktu', 'sekarang', 'nanti', 'kemarin', 'besok',
    'sering', 'jarang', 'selalu', 'kadang', 'segera', 'lama', 'sebentar',

    // angka & ukuran
    'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan',
    'sembilan', 'sepuluh', 'ribu', 'juta', 'persen', 'bagian', 'jumlah',

    // teknologi
    'komputer', 'jaringan', 'data', 'kode', 'sistem', 'program', 'server',
    'internet', 'aplikasi', 'berkas', 'folder', 'sandi', 'kunci', 'token',
    'server', 'basis', 'fungsi', 'variabel', 'perulangan', 'kondisi',
    'algoritma', 'kompilasi', 'debug', 'render', 'cache', 'paket',
    'protokol', 'alamat', 'port', 'klien', 'basisdata', 'antarmuka',

    // seputar mengetik
    'ketukan', 'irama', 'ritme', 'kecepatan', 'akurasi', 'latihan',
    'hasil', 'target', 'catatan', 'rekor', 'skor', 'grafik', 'waktu',
    'kesalahan', 'konsisten', 'fokus', 'santai', 'nyaman', 'papan',
    'mekanik', 'tombol', 'pegas', 'stabilizer', 'switch', 'keycap'
  ];

  // Kutipan pendek — dipakai mode "kutipan".
  var QUOTES = [
    'Ilmu tanpa amal seperti pohon tanpa buah: tumbuh tinggi, tetapi tidak memberi manfaat.',
    'Belajar dari kesalahan adalah cara tercepat untuk tumbuh dan menjadi lebih baik dari kemarin.',
    'Kesabaran bukan berarti menunggu, melainkan kemampuan tetap tenang saat segalanya berjalan lambat.',
    'Tulisan yang jelas lahir dari pikiran yang tenang dan latihan yang tidak pernah berhenti.',
    'Jangan takut mencoba hal baru, karena keberanian kecil hari ini bisa menjadi langkah besar esok hari.',
    'Kebiasaan kecil yang dilakukan setiap hari mengalahkan rencana besar yang hanya tersimpan rapi.',
    'Mengetik cepat bukan soal tergesa-gesa, tetapi soal ritme yang tepat dan ketukan yang akurat.',
    'Setiap tombol yang ditekan adalah satu langkah kecil menuju hasil yang lebih baik.',
    'Kerja yang tenang dan teratur hampir selalu menang melawan kerja yang ramai tetapi tanpa arah.',
    'Orang yang mau membaca ulang pekerjaannya sendiri biasanya menemukan kesalahan sebelum orang lain.',
    'Waktu yang dipakai untuk memahami masalah tidak pernah terbuang, bahkan ketika jawabannya sederhana.'
  ];

  // Buang duplikat sambil menjaga urutan.
  var seen = Object.create(null);
  var UNIQUE = [];
  for (var i = 0; i < WORDS.length; i++) {
    var w = WORDS[i];
    if (!seen[w]) { seen[w] = 1; UNIQUE.push(w); }
  }

  global.TT_WORDS = UNIQUE;
  global.TT_QUOTES = QUOTES;
})(window);
