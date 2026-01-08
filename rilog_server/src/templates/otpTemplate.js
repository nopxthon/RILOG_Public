// src/templates/otpTemplate.js

const otpTemplate = (otp, name) => `
  <div style="
    font-family: Arial, sans-serif;
    background: #fefce8;
    padding: 20px;
  ">
    <div style="
      width: 100%;
      max-width: 480px;
      margin: auto;
      background: #ffffff;
      padding: 32px 26px;
      border-radius: 18px;
      border: 1px solid #fef3c7;
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    ">

      <!-- HEADER -->
      <div style="text-align:center; margin-bottom: 22px;">
        <h2 style="
          color:#1f2937;
          font-size: 22px;
          margin: 0;
          font-weight: 700;
        ">
          🔐 Verifikasi Email Anda
        </h2>
        <p style="
          margin-top: 8px;
          color:#6b7280;
          font-size:14px;
        ">
          Lindungi akun Anda dengan verifikasi aman.
        </p>
      </div>

      <!-- GREETING -->
      <p style="
        font-size:15px;
        color:#374151;
        line-height:1.6;
        margin-bottom: 18px;
      ">
        Halo <b style="color:#1f2937;">${name}</b>,<br>
        Berikut kode OTP untuk memverifikasi akun Anda di
        <b style="color:#1f2937;">Rilog System</b>.
      </p>

      <!-- OTP BOX -->
      <div style="
        background: #fef9c3;
        border: 1px solid #fde047;
        padding: 26px 16px;
        border-radius: 14px;
        text-align:center;
        margin: 26px 0;
      ">
        <div style="
          font-size: 40px;
          font-weight: 800;
          color:#facc15;
          letter-spacing: 10px;
          font-family: 'Courier New', monospace;
        ">
          ${otp}
        </div>
      </div>

      <!-- INFO -->
      <p style="
        font-size:14px;
        color:#6b7280;
        line-height:1.6;
      ">
        Kode OTP ini berlaku selama <b>5 menit</b>.  
        Demi keamanan, jangan berikan kode ini kepada siapa pun.
      </p>

      <hr style="
        margin: 26px 0;
        border:none;
        border-top:1px solid #f4f4f5;
      ">

      <!-- FOOTER -->
      <p style="
        font-size:12px;
        color:#9ca3af;
        text-align:center;
      ">
        Rilog System — Keamanan adalah prioritas kami.
      </p>

    </div>
  </div>
`;

module.exports = otpTemplate;
