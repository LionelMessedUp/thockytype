# thockytype

Tes mengetik bahasa Indonesia dengan **suara keyboard mechanical** yang disintesis langsung di browser.

Tanpa file audio. Tanpa CDN. Tanpa build step. Tanpa internet.





## Fitur

**Tes**
- 3 mode: `waktu` (15/30/60/120 detik), `kata` (10/25/50/100), `kutipan` (kalimat Indonesia dengan tanda baca).
- Karakter salah ditandai merah, huruf yang terlewat saat pindah kata ditandai garis bawah.
- Kursor melompat per karakter, baris aktif otomatis scroll seperti monkeytype.
- Backspace bisa mundur lintas kata (seperti editor biasa).
- `<kbd>Tab</kbd>` ulangi tes, `<kbd>Esc</kbd>` mulai baru.
- Rekor WPM tersimpan per mode di `localStorage`.

**Statistik**
- WPM (kata benar), raw WPM (semua ketukan), akurasi per ketukan, konsistensi (standar deviasi), jumlah kesalahan, waktu, karakter benar.
- Grafik WPM/raw per detik di layar hasil.

**Suara (ini yang bikin beda)**
- 5 profil karakter bunyi: `thock` (basah & rendah), `cream` (lembut), `clack` (tajam), `clicky` (dua klik), `linear` (halus tanpa klik).
- Tiap ketukan punya randomisasi pitch, gain, dan decay → tidak pernah terdengar persis sama dua kali.
- **Panning stereo per posisi tombol**: huruf di sisi kiri papan sedikit ke kiri, sisi kanan ke kanan.
- Spacebar punya suara lebih berat + *rattle stabilizer* (dua burst noise tambahan).
- Enter punya bottom-out ganda, backspace sedikit lebih tinggi.
- Ada **suara release** saat tombol dilepas, bukan cuma saat ditekan.
- Compressor di master chain supaya tetap punchy saat mengetik cepat.
- Volume slider + tombol mute.

**Visual**
- Visualisasi papan keyboard yang menyala mengikuti tombol yang ditekan.
- Pulsa bar kecil di header yang bereaksi tiap ketukan.
- Tema gelap hangat, aksen amber.

## Bagaimana suaranya dibuat

Bunyi keyboard mechanical asli = beberapa lapisan:

1. **Body** — osilator sine/triangle 76–150 Hz dengan decay cepat: ini bunyi "thock" di case.
2. **Harmonik** — triangle di ~2× frekuensi body, gain kecil: tekstur plastik/kayu.
3. **Click** — noise bandpass 1.7–4.7 kHz, Q tinggi, decay 10–30 ms: bunyi switch bottom-out.
4. **Air** — noise highpass 4–8 kHz super pendek: "tink" di ujung bunyi.
5. **Ekstra** — double click untuk profil clicky, rattle low-frequency untuk spacebar, bottom-out ganda untuk enter.

Semua dibangun dari satu buffer white noise yang di-reuse, lewat `BiquadFilter` + envelope eksponensial. Tiap profil cuma menggeser frekuensi, Q, gain, dan decay — itu sebabnya 5 profil terasa seperti 5 switch berbeda.

Kalau mau menambah profil: buka `js/sound.js`, tambahkan entri di objek `PROFILES`. Otomatis muncul di dropdown kalau `<option>`-nya ditambahkan di `index.html`.

## Catatan

- Terbaik di desktop dengan keyboard fisik (input mobile terbatas karena keydown dari keyboard virtual tidak seragam).
- Suara butuh satu interaksi pertama (ketukan) untuk membuka `AudioContext` — itu batasan browser, bukan bug.
- Huruf besar/kecil dihitung berbeda pada mode kutipan (perlu Shift).

## Tweak cepat

| Mau ubah | Di mana |
|---|---|
| Kata-kata | `js/words.js` → array `WORDS` |
| Kutipan | `js/words.js` → array `QUOTES` |
| Warna aksen | `css/style.css` → `--accent` / `--accent-2` |
| Karakter suara | `js/sound.js` → `PROFILES` |
| Font | `css/style.css` → `--mono` / `--sans` |
