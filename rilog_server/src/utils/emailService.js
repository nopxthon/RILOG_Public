// 1. Import file sendEmail.js yang sudah Abang buat
// Pastikan path-nya benar (misal sesama folder utils)
const sendEmail = require('./sendEmail'); 

const sendPaymentNotificationToAdmin = async (paymentData, planName, userName) => {
  try {
    // Ambil email admin dari env
    const adminEmail = process.env.SUPERADMIN_EMAIL;

    // Buat Subject
    const subject = `💰 Pengajuan Pembayaran Baru: ${userName}`;

    // Buat Isi HTML (Template Rapi)
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #EAB308;">Pengajuan Pembayaran Baru</h2>
        <p>Halo Admin, user <strong>${userName}</strong> baru saja melakukan pembayaran.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
           <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Paket</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${planName}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Total Bayar</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Rp ${new Intl.NumberFormat('id-ID').format(paymentData.total_bayar)}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Bank Pengirim</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${paymentData.bank_pengirim}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Atas Nama</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${paymentData.nama_pengirim}</td>
          </tr>
        </table>

        <div style="margin-top: 20px;">
          <p>Silakan login ke dashboard untuk memverifikasi.</p>
        </div>
      </div>
    `;

    // 2. Panggil fungsi generic dari sendEmail.js
    // Format: sendEmail(to, subject, html)
    await sendEmail(adminEmail, subject, htmlContent);

    // console.log sudah ada di dalam sendEmail.js, jadi tidak perlu double log

  } catch (err) {
    // Kita catch di sini supaya kalau email gagal, user tetap berhasil upload bukti bayar
    console.error("⚠️ Gagal kirim notifikasi admin, tapi upload sukses:", err.message);
  }
};

const sendPaymentStatusToUser = async (userEmail, userName, planName, status, notes = '-') => {
    try {
        let subject = '';
        let htmlContent = '';

        if (status === 'disetujui') {
            subject = '✅ Pembayaran Diterima - Paket RILOG Anda Aktif!';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #22c55e;">Pembayaran Berhasil!</h2>
                    <p>Halo <strong>${userName}</strong>,</p>
                    <p>Terima kasih telah melakukan pembayaran. Kami dengan senang hati menginformasikan bahwa pembayaran Anda untuk paket <strong>${planName}</strong> telah <strong>DIVERIFIKASI</strong>.</p>
                    <p>Akun bisnis Anda kini sudah aktif kembali. Silakan login untuk menikmati fitur-fiturnya.</p>
                    <a href="${process.env.FRONTEND_URL}/login" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Login Sekarang</a>
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #888;">Ini adalah pesan otomatis, mohon jangan dibalas.</p>
                </div>
            `;
        } else if (status === 'ditolak') {
            subject = '❌ Mohon Maaf - Pembayaran RILOG Ditolak';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #ef4444;">Pembayaran Ditolak</h2>
                    <p>Halo <strong>${userName}</strong>,</p>
                    <p>Mohon maaf, pengajuan pembayaran Anda untuk paket <strong>${planName}</strong> belum dapat kami setujui.</p>
                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 15px 0;">
                        <strong>Alasan Penolakan:</strong><br/>
                        ${notes}
                    </div>
                    <p>Silakan periksa kembali bukti pembayaran Anda dan lakukan pengajuan ulang.</p>
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #888;">Ini adalah pesan otomatis, mohon jangan dibalas.</p>
                </div>
            `;
        }

        await sendEmail(userEmail, subject, htmlContent);
        console.log(`📧 Notifikasi ${status} terkirim ke ${userEmail}`);

    } catch (error) {
        console.error("❌ Gagal kirim email ke user:", error);
    }
};

module.exports = { sendPaymentNotificationToAdmin, sendPaymentStatusToUser };