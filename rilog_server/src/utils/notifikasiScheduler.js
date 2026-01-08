const cron = require("node-cron");
const { Bisnis, Item, Notifikasi, User, Gudang } = require("../models");
const { Op } = require("sequelize");


/**
 * 📧 Kirim 1 Email Summary untuk SEMUA Gudang dalam 1 Bisnis
 */
async function sendKadaluarsaEmailPerBisnis(bisnis_id, gudangDataList) {
  try {
    if (gudangDataList.length === 0) return;

    // Hitung total items
    const totalItems = gudangDataList.reduce((sum, g) => sum + g.items.length, 0);
    if (totalItems === 0) return;

    // 🔥 Ambil info bisnis
    const bisnis = await Bisnis.findOne({
      where: { id: bisnis_id },
      attributes: ["id", "name"],
    });

    if (!bisnis) {
      console.log(`⚠️ Bisnis tidak ditemukan: ${bisnis_id}`);
      return;
    }

    // 🔥 Ambil semua admin dari bisnis ini
    const admins = await User.findAll({
      where: {
        bisnis_id,
        role: "admin",
        is_active: true,
      },
      attributes: ["email"],
    });

    if (admins.length === 0) {
      console.log(`⚠️ Tidak ada admin aktif untuk bisnis_id: ${bisnis_id}`);
      return;
    }

    // 🔥 SKIP EMAIL DI DEVELOPMENT MODE
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAIL === "false") {
      console.log(`📧 [DEV MODE] Email skipped untuk bisnis: ${bisnis.name}`);
      console.log(`   - Would send to ${admins.length} admins`);
      console.log(`   - ${gudangDataList.length} gudang, ${totalItems} items`);
      return;
    }

    // Buat HTML Email
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">⚠️ Laporan Kadaluarsa Stok Harian</h2>
          <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 14px;">
            ${bisnis.name} • ${gudangDataList.length} gudang membutuhkan perhatian
          </p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 15px; margin-bottom: 20px;">
            Berikut adalah ringkasan item yang <strong>mendekati</strong> atau <strong>sudah kadaluarsa</strong>:
          </p>
    `;

    // Loop per gudang
    gudangDataList.forEach((gudangData, index) => {
      if (index > 0) {
        emailContent += `<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;">`;
      }

      emailContent += `
        <h3 style="color: #dc2626; margin: 20px 0 10px 0; font-size: 18px;">
          📦 ${gudangData.nama_gudang}
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0;">
          <thead>
            <tr style="background-color: #fee2e2;">
              <th style="padding: 10px; text-align: left; border: 1px solid #fecaca; font-size: 13px;">Produk</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #fecaca; font-size: 13px;">Stok</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #fecaca; font-size: 13px;">Status</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #fecaca; font-size: 13px;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
      `;

      gudangData.items.forEach((item) => {
        const expDate = new Date(item.expired_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let statusColor, statusText, keterangan, bgColor;
        
        if (diffDays <= 0) {
          statusColor = "#dc2626";
          statusText = "Sudah Kadaluarsa";
          keterangan = `Kadaluarsa sejak ${Math.abs(diffDays)} hari yang lalu`;
          bgColor = '#fee2e2';
        } else {
          statusColor = "#ea580c";
          statusText = "Mendekati Kadaluarsa";
          keterangan = `Akan kadaluarsa dalam ${diffDays} hari`;
          bgColor = '#fff7ed';
        }
        
        emailContent += `
          <tr style="background: ${bgColor};">
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">${item.name}</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity} ${item.unit}</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">
              <span style="color: ${statusColor}; font-weight: bold; font-size: 12px;">${statusText}</span>
            </td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">${keterangan}</td>
          </tr>
        `;
      });

      emailContent += `
          </tbody>
        </table>
      `;
    });

    emailContent += `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">
              📌 Tindakan Diperlukan
            </p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
              Segera tindak lanjuti <strong>${totalItems} item</strong> di <strong>${gudangDataList.length} gudang</strong> untuk menghindari kerugian.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Email ini dikirim otomatis oleh <strong>Sistem Rilog</strong>.<br>
            Harap tidak membalas email ini.
          </p>
        </div>
      </div>
    `;

    // 🔥 KIRIM 1 EMAIL DENGAN BCC KE SEMUA ADMIN
    const bccEmails = admins.map(a => a.email);
    
    try {
      await sendEmail(
        process.env.EMAIL_USER,
        `⚠️ Laporan Kadaluarsa - ${totalItems} Item di ${gudangDataList.length} Gudang`,
        emailContent,
        bccEmails
      );
      console.log(`📧 Email summary berhasil dikirim (BCC ${bccEmails.length} admin) | Bisnis: ${bisnis.name}`);
    } catch (emailError) {
      console.error(`❌ Gagal kirim email bisnis ${bisnis.name}:`, emailError.message);
    }

  } catch (error) {
    console.error("❌ sendKadaluarsaEmailPerBisnis ERROR:", error);
  }
}

/**
 * 📧 Fungsi Helper: Kirim Email Summary per Gudang (BACKUP - jika mau per gudang)
 */
async function sendKadaluarsaEmailPerGudang(bisnis_id, gudang_id, kadaluarsaItems) {
  try {
    if (kadaluarsaItems.length === 0) return;

    const gudang = await Gudang.findOne({
      where: { id: gudang_id, bisnis_id },
      attributes: ["id", "nama_gudang"],
    });

    if (!gudang) {
      console.log(`⚠️ Gudang tidak ditemukan: ${gudang_id}`);
      return;
    }

    const admins = await User.findAll({
      where: {
        bisnis_id,
        role: "admin",
        is_active: true,
      },
      attributes: ["email"],
    });

    if (admins.length === 0) {
      console.log(`⚠️ Tidak ada admin aktif untuk bisnis_id: ${bisnis_id}`);
      return;
    }

    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAIL === "false") {
      console.log(`📧 [DEV MODE] Email skipped untuk gudang: ${gudang.nama_gudang}`);
      console.log(`   - Would send to ${admins.length} admins`);
      console.log(`   - Items: ${kadaluarsaItems.length}`);
      return;
    }

    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">⚠️ Peringatan Kadaluarsa Stok</h2>
          <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 14px;">Gudang: ${gudang.nama_gudang}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 16px;">
            Berikut adalah daftar item yang <strong>mendekati</strong> atau <strong>sudah kadaluarsa</strong>:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #fee2e2;">
                <th style="padding: 12px; text-align: left; border: 1px solid #fecaca; font-size: 14px;">Produk</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #fecaca; font-size: 14px;">Stok</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #fecaca; font-size: 14px;">Status</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #fecaca; font-size: 14px;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
    `;

    kadaluarsaItems.forEach((item) => {
      const expDate = new Date(item.expired_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let statusColor, statusText, keterangan;
      
      if (diffDays <= 0) {
        statusColor = "#dc2626";
        statusText = "Sudah Kadaluarsa";
        keterangan = `Kadaluarsa sejak ${Math.abs(diffDays)} hari yang lalu`;
      } else {
        statusColor = "#ea580c";
        statusText = "Mendekati Kadaluarsa";
        keterangan = `Akan kadaluarsa dalam ${diffDays} hari`;
      }
      
      emailContent += `
        <tr style="background: ${diffDays <= 0 ? '#fee2e2' : '#fff7ed'};">
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">${item.name}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity} ${item.unit}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">
            <span style="color: ${statusColor}; font-weight: bold; font-size: 13px;">${statusText}</span>
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${keterangan}</td>
        </tr>
      `;
    });

    emailContent += `
            </tbody>
          </table>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">
              📌 Tindakan Diperlukan
            </p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
              Silakan segera tindak lanjuti item-item tersebut untuk menghindari kerugian.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Email ini dikirim otomatis oleh <strong>Sistem Rilog</strong>.<br>
            Harap tidak membalas email ini.
          </p>
        </div>
      </div>
    `;

    const bccEmails = admins.map(a => a.email);
    
    try {
      await sendEmail(
        process.env.EMAIL_USER,
        `⚠️ Kadaluarsa Stok - ${gudang.nama_gudang}`,
        emailContent,
        bccEmails
      );
      console.log(`📧 Email kadaluarsa berhasil dikirim (BCC ${bccEmails.length} admin) | Gudang: ${gudang.nama_gudang}`);
    } catch (emailError) {
      console.error(`❌ Gagal kirim email gudang ${gudang.nama_gudang}:`, emailError.message);
    }

  } catch (error) {
    console.error("❌ sendKadaluarsaEmailPerGudang ERROR:", error);
  }
}

/**
 * 🔔 Fungsi Generate Notifikasi untuk Satu Bisnis (KIRIM 1 EMAIL PER BISNIS)
 */
async function generateNotifikasiForBisnis(bisnis_id) {
  try {
    console.log(`🔍 Checking bisnis_id: ${bisnis_id}...`);

    const gudangList = await Gudang.findAll({
      where: { bisnis_id, is_active: true },
      attributes: ["id", "nama_gudang"],
    });

    if (gudangList.length === 0) {
      console.log(`   ℹ️  Tidak ada gudang aktif untuk bisnis_id: ${bisnis_id}`);
      return;
    }

    // 🔥 Array untuk mengumpulkan data semua gudang (untuk 1 email summary)
    const gudangDataForEmail = [];

    for (const gudang of gudangList) {
      const items = await Item.findAll({
        where: {
          gudang_id: gudang.id,
          is_active: true,
        },
      });

      if (items.length === 0) continue;

      const notifikasiList = [];
      const kadaluarsaItems = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const item of items) {
        const qty = item.quantity || 0;

        // 1️⃣ Stok Habis
        if (qty === 0) {
          const exists = await Notifikasi.findOne({
            where: {
              bisnis_id,
              gudang_id: gudang.id,
              record_id: item.id,
              table_name: "items",
              type: "stok_habis",
            },
          });

          if (!exists) {
            notifikasiList.push({
              bisnis_id,
              gudang_id: gudang.id,
              record_id: item.id,
              table_name: "items",
              type: "stok_habis",
              message: `Stok ${item.name} sudah habis (0 ${item.unit})`,
            });
          }
        }

        // 2️⃣ Stok Menipis
        if (item.min_stock && qty > 0 && qty <= item.min_stock) {
          const exists = await Notifikasi.findOne({
            where: {
              bisnis_id,
              gudang_id: gudang.id,
              record_id: item.id,
              table_name: "items",
              type: "stok_menipis",
            },
          });

          if (!exists) {
            notifikasiList.push({
              bisnis_id,
              gudang_id: gudang.id,
              record_id: item.id,
              table_name: "items",
              type: "stok_menipis",
              message: `Stok ${item.name} menipis. Saat ini: ${qty} ${item.unit}, minimum: ${item.min_stock} ${item.unit}`,
            });
          }
        }

        // 3️⃣ Stok Berlebih
        if (item.max_stock && qty > item.max_stock) {
          const exists = await Notifikasi.findOne({
            where: {
              bisnis_id,
              gudang_id: gudang.id,
              record_id: item.id,
              table_name: "items",
              type: "stok_berlebih",
            },
          });

          if (!exists) {
            notifikasiList.push({
              bisnis_id,
              gudang_id: gudang.id,
              record_id: item.id,
              table_name: "items",
              type: "stok_berlebih",
              message: `Stok ${item.name} berlebih. Saat ini: ${qty} ${item.unit}, maksimum: ${item.max_stock} ${item.unit}`,
            });
          }
        }

        // 4️⃣ Kadaluarsa
        if (item.expired_at) {
          const expDate = new Date(item.expired_at);
          expDate.setHours(0, 0, 0, 0);
          
          const diffTime = expDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Sudah Kadaluarsa
          if (diffDays <= 0) {
            const exists = await Notifikasi.findOne({
              where: {
                bisnis_id,
                gudang_id: gudang.id,
                record_id: item.id,
                table_name: "items",
                type: "sudah_kadaluarsa",
              },
            });

            if (!exists) {
              notifikasiList.push({
                bisnis_id,
                gudang_id: gudang.id,
                record_id: item.id,
                table_name: "items",
                type: "sudah_kadaluarsa",
                message: `Stok ${item.name} sudah kadaluarsa sejak ${Math.abs(diffDays)} hari yang lalu`,
              });
              kadaluarsaItems.push(item);
            }
          }
          // Mendekati Kadaluarsa (1-30 hari)
          else if (diffDays > 0 && diffDays <= 30) {
            const exists = await Notifikasi.findOne({
              where: {
                bisnis_id,
                gudang_id: gudang.id,
                record_id: item.id,
                table_name: "items",
                type: "mendekati_kadaluarsa",
              },
            });

            if (!exists) {
              notifikasiList.push({
                bisnis_id,
                gudang_id: gudang.id,
                record_id: item.id,
                table_name: "items",
                type: "mendekati_kadaluarsa",
                message: `Stok ${item.name} akan kadaluarsa dalam ${diffDays} hari`,
              });
              kadaluarsaItems.push(item);
            }
          }
        }
      }

      // Bulk create notifikasi
      if (notifikasiList.length > 0) {
        await Notifikasi.bulkCreate(notifikasiList);
        console.log(`   ✅ Gudang ${gudang.nama_gudang}: ${notifikasiList.length} notifikasi baru`);
      }

      // 🔥 Simpan data gudang untuk email summary nanti
      if (kadaluarsaItems.length > 0) {
        gudangDataForEmail.push({
          nama_gudang: gudang.nama_gudang,
          items: kadaluarsaItems,
        });
      }
    }

    // 🔥 KIRIM 1 EMAIL SUMMARY UNTUK SEMUA GUDANG DALAM BISNIS INI
    if (gudangDataForEmail.length > 0) {
      await sendKadaluarsaEmailPerBisnis(bisnis_id, gudangDataForEmail);
    }

  } catch (error) {
    console.error(`❌ Error generate untuk bisnis_id ${bisnis_id}:`, error);
  }
}

/**
 * 🕐 Scheduler: Setiap Hari Jam 08:00 WIB
 */
const startNotifikasiScheduler = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔔 [SCHEDULER] Auto Generate Notifikasi");
    console.log(`⏰ Waktu: ${new Date().toLocaleString("id-ID")}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
      const bisnisList = await Bisnis.findAll({
        where: { is_active: true },
        attributes: ["id", "name"],
      });

      console.log(`📊 Ditemukan ${bisnisList.length} bisnis aktif\n`);

      for (const bisnis of bisnisList) {
        await generateNotifikasiForBisnis(bisnis.id);
      }

      console.log("\n🎉 [SCHEDULER] Selesai\n");
    } catch (error) {
      console.error("❌ [SCHEDULER] ERROR:", error);
    }
  });

  console.log("✅ Notifikasi Scheduler AKTIF (Setiap hari jam 08:00 WIB)");
};

/**
 * 🕐 Alternative: Setiap 6 Jam
 */
const startNotifikasiSchedulerFrequent = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("\n🔔 [SCHEDULER] Checking notifikasi (6 jam)...");
    
    try {
      const bisnisList = await Bisnis.findAll({
        where: { is_active: true },
        attributes: ["id"],
      });

      for (const bisnis of bisnisList) {
        await generateNotifikasiForBisnis(bisnis.id);
      }

      console.log("🎉 [SCHEDULER] Selesai\n");
    } catch (error) {
      console.error("❌ [SCHEDULER] ERROR:", error);
    }
  });

  console.log("✅ Notifikasi Scheduler AKTIF (Setiap 6 jam)");
};

module.exports = {
  startNotifikasiScheduler,
  startNotifikasiSchedulerFrequent,
  generateNotifikasiForBisnis,
};