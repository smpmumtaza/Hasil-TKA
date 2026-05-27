# Hasil-TKA

Aplikasi web untuk mengirim tautan Google Drive dokumen hasil Tes Kemampuan Akademik (TKA) ke email peserta.

## Arsitektur

- **Frontend**: HTML + Tailwind CSS (static, deploy ke GitHub Pages)
- **Backend**: Google Apps Script (free, tanpa server)

## Cara Deploy

### 1. Deploy Backend (Google Apps Script)

1. Buka [script.google.com](https://script.google.com) dan buat project baru
2. Salin isi `Code.gs` ke editor script
3. Pastikan `FOLDER_ID` sudah sesuai (folder Google Drive hasil TKA)
4. **Deploy** → **Deploy sebagai web app**:
   - `Execute as`: **Me**
   - `Who has access`: **Anyone** (karena dipanggil dari frontend)
5. Klik **Deploy** dan copy URL web app (misal: `https://script.google.com/macros/s/.../exec`)

### 2. Hubungkan Frontend ke Backend

1. Buka `index.html`
2. Cari baris: `const webAppUrl = 'APPS_SCRIPT_WEBAPP_URL';`
3. Ganti dengan URL web app dari langkah sebelumnya

### 3. Deploy Frontend ke GitHub

```bash
echo "# Hasil-TKA" >> README.md
git init
git add README.md
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/kalistaningtyas-a11y/Hasil-TKA.git
git push -u origin main
```

Lalu aktifkan **GitHub Pages** di repo Settings → Pages → pilih branch `main` → folder `/`.

## Struktur File

```
├── index.html      # Halaman form utama
├── Code.gs         # Google Apps Script backend
└── README.md       # Dokumentasi ini
```

## Catatan

- Folder Google Drive harus di-*share* dengan akses publik (siapa saja dengan tautan bisa melihat)
- Google Apps Script gratis dengan kuota: 100 email/hari untuk akun gratis, lebih untuk Google Workspace
- Formulir sudah responsive dan siap mobile

## Kontak

- Email: kalistaningtyas@smpmumtaza.sch.id
- Telepon: 021-74704241
- Web: https://smpmumtaza.sch.id
