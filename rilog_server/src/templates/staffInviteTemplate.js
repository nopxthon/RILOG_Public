const staffInviteTemplate = (name, role, inviteLink, businessName) => `
  <div style="font-family: Arial, sans-serif; background: #eef2f7; padding: 30px;">
    <div style="max-width: 550px; margin:auto; background:#ffffff; padding: 30px; border-radius: 12px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      
      <h2 style="text-align:center; color:#34495e;">📩 Undangan Staff Baru</h2>

      <p style="font-size:15px; color:#555;">
        Halo <b>${name}</b>,<br><br>
        Anda telah diundang untuk bergabung sebagai <b>${role}</b> pada bisnis <b>${businessName}</b>.
      </p>

      <p style="font-size:15px; color:#555;">
        Silakan klik tombol berikut untuk menerima undangan dan membuat akun:
      </p>

      <div style="text-align:center; margin: 30px 0;">
        <a href="${inviteLink}" style="
          background:#3498db;
          color:white;
          padding:14px 30px;
          border-radius:8px;
          font-size:16px;
          text-decoration:none;
          font-weight:bold;
          display:inline-block;
        ">
          Terima Undangan
        </a>
      </div>

      <p style="font-size:14px; color:#777;">
        Jika tombol tidak bisa diklik, salin dan buka link berikut:
        <br>
        <span style="color:#3498db; word-break:break-all;">
          ${inviteLink}
        </span>
      </p>

      <hr style="margin:25px 0; border:none; border-top:1px solid #eee;">
      <p style="font-size:13px; color:#aaa; text-align:center;">
        Rilog System — Platform Manajemen Staff
      </p>
    </div>
  </div>
`;

module.exports = staffInviteTemplate;
