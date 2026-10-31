/* thockytype — kamus kata & kutipan bahasa indonesia */
(function (global) {
  'use strict';

  // Kata-kata sehari-hari dengan sedikit istilah teknologi, tanpa duplikat.
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

    // kegiatan sehari-hari
    'memasak', 'masak', 'mencuci', 'mandi', 'bermain', 'menonton',
    'menunggu', 'membantu', 'menjaga', 'mengajak', 'membawa', 'membeli',
    'menjual', 'memilih', 'mencari', 'menemukan', 'bertemu', 'berjalan',
    'berlari', 'beristirahat', 'berkunjung', 'berkumpul', 'tersenyum',
    'tertawa', 'menangis', 'bernyanyi', 'menari', 'berdoa', 'berharap',
    'berusaha', 'berhasil', 'gagal', 'meminta', 'menjawab', 'bertanya',
    'menjelaskan', 'bercerita', 'berbagi', 'menyimpan', 'membuka',
    'menutup', 'menyiapkan', 'merapikan', 'membersihkan', 'menyapu',
    'menyiram', 'membereskan', 'memasukkan', 'mengeluarkan',

    // makanan dan minuman
    'nasi', 'roti', 'lauk', 'sayur', 'buah', 'ikan', 'ayam', 'telur',
    'daging', 'susu', 'kopi', 'teh', 'air', 'gula', 'garam', 'minyak',
    'sup', 'mi', 'kue', 'pisang', 'apel', 'jeruk', 'mangga', 'kelapa',
    'jagung', 'kentang', 'cabai', 'bawang', 'tomat', 'wortel', 'sambal',
    'sarapan', 'camilan', 'makanan', 'lapar', 'haus', 'kenyang',
    'manis', 'asin', 'pahit', 'pedas', 'gurih', 'lezat', 'segar',

    // keluarga, hewan, dan benda rumah
    'keluarga', 'saudara', 'kakek', 'nenek', 'paman', 'bibi', 'sepupu',
    'suami', 'istri', 'bayi', 'kucing', 'anjing', 'burung', 'sapi',
    'kambing', 'ayam', 'bebek', 'kuda', 'kelinci', 'semut', 'lebah',
    'piring', 'gelas', 'sendok', 'garpu', 'pisau', 'panci', 'kompor',
    'baju', 'celana', 'sepatu', 'sandal', 'tas', 'dompet', 'uang',
    'sabun', 'handuk', 'selimut', 'kasur', 'lemari', 'cermin', 'lampu',
    'hadiah', 'foto', 'televisi',

    // sifat dan suasana
    'senang', 'sedih', 'marah', 'takut', 'gembira', 'kecewa', 'malu',
    'bangga', 'lelah', 'sehat', 'sakit', 'lapang', 'sempit', 'dekat',
    'jauh', 'kanan', 'kiri', 'depan', 'belakang', 'luar', 'dalam',
    'ramah', 'jujur', 'sabar', 'peduli', 'sopan', 'hemat', 'boros',
    'sibuk', 'lega', 'damai', 'hangat', 'lembut', 'lucu', 'indah',

    // tubuh, warna, dan bentuk
    'kepala', 'rambut', 'wajah', 'mata', 'hidung', 'mulut', 'gigi',
    'lidah', 'telinga', 'leher', 'bahu', 'tangan', 'jari', 'lengan',
    'perut', 'punggung', 'lutut', 'kaki', 'kulit', 'darah', 'tulang',
    'merah', 'biru', 'kuning', 'hijau', 'hitam', 'putih', 'cokelat',
    'ungu', 'jingga', 'abu', 'emas', 'perak', 'bulat', 'kotak',
    'lingkaran', 'garis', 'segitiga', 'permukaan', 'sudut', 'tepi',

    // alam dan lingkungan
    'pohon', 'daun', 'akar', 'ranting', 'bunga', 'rumput', 'batu',
    'pasir', 'debu', 'ombak', 'danau', 'rawa', 'lembah', 'bukit',
    'tebing', 'gua', 'pulau', 'teluk', 'selat', 'samudra', 'pesisir',
    'kabut', 'petir', 'guntur', 'pelangi', 'embun', 'salju',
    'badai', 'iklim', 'cuaca', 'musim', 'gempa', 'lava', 'bumi',
    'planet', 'angkasa', 'galaksi', 'komet', 'orbit', 'serangga',
    'kupu-kupu', 'nyamuk', 'lalat', 'kecoa', 'rusa', 'rubah',
    'harimau', 'gajah', 'monyet', 'ular', 'kura-kura', 'katak',
    'udang', 'kepiting', 'paus', 'lumba-lumba', 'elang', 'merpati',
    'gagak',

    // tempat dan perjalanan
    'restoran', 'warung', 'perpustakaan', 'museum', 'apotek', 'terminal',
    'stasiun', 'bandara', 'pelabuhan', 'halte', 'hotel', 'penginapan',
    'terowongan', 'gedung', 'apartemen', 'pabrik', 'bengkel', 'lapangan',
    'stadion', 'kolam', 'masjid', 'gereja', 'vihara', 'candi', 'kantin',
    'toilet', 'alamat', 'tujuan', 'rute', 'arah', 'peta', 'perjalanan',
    'liburan', 'tiket', 'koper', 'paspor', 'kendaraan', 'bus', 'angkot',
    'taksi', 'truk', 'becak', 'perahu', 'kemudi', 'roda', 'mesin',
    'bensin', 'macet', 'parkir', 'berangkat', 'tiba', 'singgah',
    'menyeberang',

    // benda sehari-hari
    'rak', 'laci', 'atap', 'lantai', 'dinding', 'karpet', 'bantal',
    'guling', 'ember', 'sapu', 'pel', 'spons', 'keran', 'kunci',
    'gembok', 'gunting', 'jarum', 'benang', 'paku', 'palu', 'obeng',
    'tang', 'tali', 'kardus', 'botol', 'kaleng', 'kotak', 'kantong',
    'keranjang', 'koran', 'majalah', 'amplop', 'spidol', 'pensil',
    'penghapus', 'penggaris', 'stiker', 'kacamata', 'topi', 'jaket',
    'kaus', 'rok', 'kemeja', 'jas', 'sarung', 'payung', 'ponsel',
    'laptop', 'tablet', 'kamera', 'mikrofon', 'kabel', 'baterai',
    'charger', 'headset', 'tetikus',

    // makanan dan masakan
    'bubur', 'soto', 'rawon', 'rendang', 'gado-gado', 'ketoprak',
    'pecel', 'sate', 'bakso', 'sosis', 'tempe', 'tahu', 'oncom',
    'terasi', 'kecap', 'saus', 'merica', 'ketumbar', 'kunyit', 'jahe',
    'lengkuas', 'serai', 'kemiri', 'seledri', 'bayam', 'kangkung', 'kol',
    'sawi', 'mentimun', 'terung', 'labu', 'pepaya', 'nanas', 'semangka',
    'melon', 'anggur', 'stroberi', 'durian', 'rambutan', 'salak', 'jambu',
    'alpukat', 'lemon', 'madu', 'cokelat', 'biskuit', 'donat', 'puding',
    'tepung', 'beras', 'keju', 'mentega', 'selai', 'rebus', 'goreng',
    'panggang', 'kukus', 'potong', 'aduk', 'tuang', 'cicipi',

    // kegiatan dan kata kerja
    'berpikir', 'memahami', 'mengenal', 'mengerti', 'menyadari',
    'memutuskan', 'merencanakan', 'mengatur', 'menggambar', 'melukis',
    'memotret', 'merekam', 'mencetak', 'menyalakan', 'mematikan',
    'mengisi', 'mengosongkan', 'memindahkan', 'mengangkat', 'menarik',
    'mendorong', 'melempar', 'menangkap', 'memukul', 'menendang',
    'melompat', 'berguling', 'menghindar', 'memegang', 'menggenggam',
    'meletakkan', 'menaruh', 'mengantar', 'menjemput', 'meminjam',
    'meminjamkan', 'membayar', 'menabung', 'membelanjakan', 'menyewa',
    'memesan', 'menawarkan', 'menukar', 'mengumpulkan', 'membagikan',
    'mengundang', 'mengunjungi', 'menemani', 'menolong', 'melindungi',
    'merawat', 'mengobati', 'menyembuhkan', 'bernapas', 'bersepeda',
    'mendaki', 'berkemah', 'berlatih', 'bertanding', 'menang', 'kalah',
    'merayakan', 'tumbuh', 'berkembang', 'muncul', 'menghilang',
    'terjadi',

    // sifat dan suasana tambahan
    'cerdas', 'pintar', 'bodoh', 'berani', 'gugup', 'gelisah', 'nyaman',
    'aman', 'berbahaya', 'tajam', 'tumpul', 'licin', 'lengket', 'basah',
    'kering', 'penuh', 'kosong', 'sempurna', 'sederhana', 'rumit',
    'penting', 'berguna', 'sia-sia', 'mungkin', 'mustahil', 'terbuka',
    'tertutup', 'longgar', 'ketat', 'dangkal', 'luas', 'tipis', 'tebal',
    'ringan', 'berat', 'lunak', 'keras', 'manja', 'aktif', 'pasif',
    'kreatif', 'teliti', 'ceroboh', 'santun', 'akrab', 'asing',
    'berisik', 'hening', 'sunyi', 'nyaring', 'merdu', 'pudar', 'silau',
    'sejuk', 'lembap', 'gerah', 'subur', 'gersang', 'mewah', 'kuno',
    'modern', 'lokal', 'terkenal', 'rahasia', 'pribadi',

    // waktu, bilangan, dan gagasan
    'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'ahad',
    'januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli',
    'agustus', 'september', 'oktober', 'november', 'desember',
    'sebelum', 'sesudah', 'selama', 'ketika', 'sementara', 'akhirnya',
    'pertama', 'kedua', 'ketiga', 'belas', 'puluh', 'ratus', 'miliar',
    'setengah', 'separuh', 'sepasang', 'total', 'selisih', 'cerita',
    'berita', 'bahasa', 'kalimat', 'kata', 'huruf', 'makna', 'ide',
    'gagasan', 'rencana', 'alasan', 'jawaban', 'pertanyaan', 'pilihan',
    'kesempatan', 'pengalaman', 'kenangan', 'kebiasaan', 'perubahan',
    'kegiatan', 'pekerjaan', 'kehidupan', 'kesehatan', 'pendidikan',
    'pengetahuan', 'keterampilan', 'aturan', 'masalah', 'solusi', 'hasil',
    'proses', 'usaha', 'keberhasilan', 'kegagalan', 'harapan', 'impian',
    'semangat', 'perhatian', 'pikiran',

    // profesi, seni, dan olahraga
    'perawat', 'koki', 'sopir', 'montir', 'polisi', 'tentara', 'hakim',
    'pengacara', 'arsitek', 'insinyur', 'programmer', 'desainer',
    'pelukis', 'musisi', 'penyanyi', 'aktor', 'aktris', 'fotografer',
    'wartawan', 'ilmuwan', 'peneliti', 'penerjemah', 'kasir', 'satpam',
    'karyawan', 'atasan', 'rekan', 'pelanggan', 'pasien', 'penumpang',
    'olahraga', 'badminton', 'basket', 'voli', 'bulutangkis', 'tenis',
    'catur', 'senam', 'bola', 'raket', 'gawang', 'pemain', 'pelatih',
    'wasit', 'gol', 'latihan', 'musik', 'lagu', 'nada', 'irama', 'gitar',
    'piano', 'drum', 'seruling', 'biola', 'panggung', 'tarian', 'lukisan',
    'karya',

    // beberapa istilah teknologi yang umum
    'komputer', 'internet', 'telepon', 'pesan', 'foto', 'video',
    'aplikasi', 'perangkat', 'program', 'sistem', 'jaringan', 'situs',
    'laman', 'peramban', 'data', 'berkas', 'folder', 'dokumen', 'sandi',
    'akun', 'layanan', 'server', 'kode', 'tampilan', 'fitur', 'menu',
    'ikon', 'tautan', 'unduhan', 'unggahan', 'memori', 'prosesor',
    'digital', 'otomatis', 'online', 'luring', 'robot', 'satelit'
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
