/**
 * Google Apps Script - Pengiriman Hasil TKA SMP Mumtaza
 *
 * Cara deploy:
 * 1. Buka script.google.com (pakai akun Gmail)
 * 2. Buat project baru, paste kode ini
 * 3. Deploy > Deploy sebagai web app > Execute as: Me, Access: Anyone
 * 4. Copy URL web app ke index.html (ganti APPS_SCRIPT_WEBAPP_URL)
 */

// ========== KONFIGURASI ==========
const FOLDER_ID = '1Yh6vG5KX__ZS3elXBMFk1e6p7YGGZxqV';
const LOG_SHEET_ID = ''; // opsional, biarkan kosong nanti auto-buat
// =================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { email, nisn, tanggal, tanggalFormat, tanggalCompact } = data;

    if (!email || !nisn || !tanggalCompact) {
      logToSheet(email || '-', nisn || '-', tanggalFormat || '-', '-', 'GAGAL: Data tidak lengkap');
      return respond(400, 'Data tidak lengkap.');
    }

    const fileName = `${nisn}_${tanggalCompact}.pdf`;
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFilesByName(fileName);

    if (!files.hasNext()) {
      logToSheet(email, nisn, tanggalFormat, fileName, 'GAGAL: File tidak ditemukan');
      return respond(404, `File ${fileName} tidak ditemukan.`);
    }

    const file = files.next();
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();

    const subject = `Hasil Tes Kemampuan Akademik (TKA) - SMP Mumtaza`;
    const htmlBody = buildEmail(nisn, tanggalFormat, fileName, fileUrl);

    GmailApp.sendEmail(email, subject, '', {
      htmlBody: htmlBody,
      name: 'SMP Mumtaza',
      replyTo: 'kalistaningtyas@smpmumtaza.sch.id'
    });

    logToSheet(email, nisn, tanggalFormat, fileName, 'SUKSES', fileUrl);
    return respond(200, `Email berhasil dikirim ke ${email}`);

  } catch (err) {
    logToSheet('-', '-', '-', '-', 'ERROR: ' + err.message);
    return respond(500, 'Terjadi kesalahan server: ' + err.message);
  }
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  if (action === 'getLogs') {
    const token = e.parameter.token || '';
    if (token !== 'admin123') {
      return respond(403, 'Unauthorized');
    }
    return getLogs();
  }

  return HtmlService.createHtmlOutput('Service is running.');
}

function respond(code, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ code, message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLogs() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).reverse().map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  if (LOG_SHEET_ID) {
    try {
      return SpreadsheetApp.openById(LOG_SHEET_ID).getActiveSheet();
    } catch (e) {
      // fallback ke buat baru
    }
  }
  const ss = SpreadsheetApp.create('Log Hasil TKA');
  const sheet = ss.getActiveSheet();
  sheet.appendRow(['Timestamp', 'Email', 'NISN', 'Tanggal', 'File', 'Status', 'URL']);
  return sheet;
}

function logToSheet(email, nisn, tanggal, fileName, status, fileUrl) {
  try {
    const sheet = getOrCreateSheet();
    sheet.appendRow([new Date(), email, nisn, tanggal, fileName, status, fileUrl || '']);
  } catch (e) {
    console.warn('Gagal log ke sheet:', e.message);
  }
}

function buildEmail(nisn, tanggal, fileName, fileUrl) {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 16px;">
  <tr>
    <td align="center">

      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px 28px;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;line-height:56px;text-align:center;margin-bottom:12px;">
              <span style="font-size:28px;font-weight:300;">PDF</span>
            </div>
            <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 4px;">Hasil Tes Kemampuan Akademik (TKA)</h1>
            <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">SMP Mumtaza — Tahun Ajaran ${currentYear}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px 24px;">

            <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:0 0 20px;">
              Yth. <strong>Peserta TKA,</strong>
            </p>

            <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
              Dengan ini kami sampaikan bahwa dokumen hasil <strong>Tes Kemampuan Akademik (TKA)</strong> Anda telah tersedia.
              Silakan akses melalui tautan yang tercantum di bawah.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#64748b;font-size:13px;padding:6px 0;width:100px;">NISN</td>
                      <td style="color:#0f172a;font-size:14px;font-weight:600;padding:6px 0;">${nisn}</td>
                    </tr>
                    <tr>
                      <td style="color:#64748b;font-size:13px;padding:6px 0;width:100px;">Tanggal</td>
                      <td style="color:#0f172a;font-size:14px;font-weight:600;padding:6px 0;">${tanggal}</td>
                    </tr>
                    <tr>
                      <td style="color:#64748b;font-size:13px;padding:6px 0;width:100px;">File</td>
                      <td style="color:#2563eb;font-size:13px;font-weight:500;padding:6px 0;word-break:break-all;">${fileName}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${fileUrl}" target="_blank"
                     style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;box-shadow:0 4px 14px rgba(37,99,235,0.3);">
                    Akses Dokumen TKA
                  </a>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <ul style="margin:0;padding-left:18px;color:#92400e;font-size:13px;line-height:1.8;">
                    <li>Tautan dapat diakses oleh siapa saja yang memiliki tautan ini</li>
                    <li>Simpan dokumen ini untuk keperluan administrasi</li>
                    <li>Dokumen bersifat rahasia dan hanya untuk peserta</li>
                    <li style="list-style:none;margin-left:-18px;margin-top:6px;">Kendala: <a href="mailto:kalistaningtyas@smpmumtaza.sch.id" style="color:#2563eb;text-decoration:underline;">kalistaningtyas@smpmumtaza.sch.id</a></li>
                  </ul>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:28px 40px 24px;text-align:center;">
            <div style="margin-bottom:12px;">
              <strong style="color:#1e293b;font-size:15px;">SMP Mumtaza</strong>
            </div>
            <p style="color:#64748b;font-size:12px;line-height:1.7;margin:0 0 8px;">
              Jl. Kayu Manis / Lereng RT 05/02 No.1 Pondok Cabe,<br/>
              Pamulang — Tangerang Selatan, Banten 15417
            </p>
            <p style="color:#64748b;font-size:12px;margin:0 0 4px;">
              <a href="mailto:kalistaningtyas@smpmumtaza.sch.id" style="color:#2563eb;text-decoration:none;">kalistaningtyas@smpmumtaza.sch.id</a>
              &nbsp;|&nbsp; 021-74704241
            </p>
            <p style="margin:6px 0 0;">
              <a href="https://smpmumtaza.sch.id" target="_blank" style="color:#2563eb;font-size:12px;text-decoration:none;">smpmumtaza.sch.id</a>
            </p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0 10px;" />
            <p style="color:#94a3b8;font-size:11px;margin:0;">
              Email otomatis — Harap tidak membalas email ini.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}
