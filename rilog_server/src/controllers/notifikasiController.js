const { Notifikasi, Item, ItemBatch, Bisnis, User, Gudang, sequelize } = require("../models");
const { Op } = require("sequelize");
//const sendEmail = require("../utils/sendEmail");// ❌ EMAIL FEATURE DISABLED

/**
 * 🔔 Generate Notifikasi Otomatis
 * Dipanggil secara periodik atau saat ada perubahan stok
 */
exports.generateNotifikasi = async (req, res) => {
  try {
    const { bisnis_id } = req.user;
    const { gudang_id } = req.query; // opsional (jika mau generate 1 gudang)

    const gudangList = gudang_id
      ? await Gudang.findAll({ where: { id: gudang_id, bisnis_id } })
      : await Gudang.findAll({ where: { bisnis_id } });

    if (gudangList.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Gudang tidak ditemukan",
      });
    }

    let totalNotifikasi = 0;

    for (const gudang of gudangList) {
      const items = await Item.findAll({
        where: { gudang_id: gudang.id },
        include: [
          {
            model: ItemBatch,
            as: "batches",
            attributes: ["id", "quantity", "expiry_date"],
            required: false,
          },
        ],
      });

      const notifikasiList = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const item of items) {
        const batches = item.batches || [];
        const totalQty = batches.reduce((s, b) => s + Number(b.quantity || 0), 0);
        const minStok = Number(item.min_stok);
        const maxStok = Number(item.max_stok);
        const namaItem = item.item_name || "Produk";

        if (totalQty === 0) {
          notifikasiList.push({
            bisnis_id,
            gudang_id: gudang.id,
            record_id: item.id,
            table_name: "items",
            type: "stok_habis",
            message: `Stok ${namaItem} sudah habis (0 ${item.satuan})`,
          });
        }

        if (!isNaN(minStok) && totalQty > 0 && totalQty <= minStok) {
          notifikasiList.push({
            bisnis_id,
            gudang_id: gudang.id,
            record_id: item.id,
            table_name: "items",
            type: "stok_menipis",
            message: `Stok ${namaItem} menipis. Saat ini ${totalQty} ${item.satuan}`,
          });
        }

        if (!isNaN(maxStok) && totalQty > maxStok) {
          notifikasiList.push({
            bisnis_id,
            gudang_id: gudang.id,
            record_id: item.id,
            table_name: "items",
            type: "stok_berlebih",
            message: `Stok ${namaItem} berlebih. Saat ini ${totalQty} ${item.satuan}`,
          });
        }

        for (const batch of batches) {
          if (!batch.expiry_date || batch.quantity <= 0) continue;

          const expDate = new Date(batch.expiry_date);
          expDate.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil(
            (expDate - today) / (1000 * 60 * 60 * 24)
          );

          if (diffDays <= 0) {
            notifikasiList.push({
              bisnis_id,
              gudang_id: gudang.id,
              record_id: batch.id,
              table_name: "item_batches",
              type: "sudah_kadaluarsa",
              message: `Batch ${namaItem} sudah kadaluarsa`,
            });
          } else if (diffDays <= 30) {
            notifikasiList.push({
              bisnis_id,
              gudang_id: gudang.id,
              record_id: batch.id,
              table_name: "item_batches",
              type: "mendekati_kadaluarsa",
              message: `Batch ${namaItem} akan kadaluarsa dalam ${diffDays} hari`,
            });
          }
        }
      }

      await Notifikasi.destroy({
        where: { bisnis_id, gudang_id: gudang.id },
      });

      if (notifikasiList.length > 0) {
        await Notifikasi.bulkCreate(notifikasiList);
        //await sendEmailToAdmin(bisnis_id, gudang.id, notifikasiList);// ❌ EMAIL DISABLED
      }

      totalNotifikasi += notifikasiList.length;
    }

    res.status(200).json({
      status: "success",
      total: totalNotifikasi,
    });
  } catch (error) {
    console.error("❌ generateNotifikasi ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal generate notifikasi",
    });
  }
};


/**
 * 📋 Get All Notifikasi - FIXED VERSION
 */
exports.getAllNotifikasi = async (req, res) => {
  try {
    const { bisnis_id } = req.user;
    const { type, limit = 50 } = req.query;

    const where = { bisnis_id };
    if (type) where.type = type;

    const notifikasi = await Notifikasi.findAll({
      where,
      order: [["createdAt", "DESC"]], // ✅ FIX
      limit: parseInt(limit),
      raw: true,
    });

    if (notifikasi.length === 0) {
      return res.status(200).json({
        status: "success",
        total: 0,
        data: [],
      });
    }

    const itemIds = notifikasi
      .filter(n => n.table_name === "items")
      .map(n => n.record_id);

    const batchIds = notifikasi
      .filter(n => n.table_name === "item_batches")
      .map(n => n.record_id);

    const items = itemIds.length
      ? await Item.findAll({
          where: { id: itemIds },
          include: [{ model: ItemBatch, as: "batches", required: false }],
        })
      : [];

    const batches = batchIds.length
      ? await ItemBatch.findAll({
          where: { id: batchIds },
          include: [{
            model: Item,
            as: "item",
            include: [{ model: ItemBatch, as: "batches", required: false }],
          }],
        })
      : [];

    const itemMap = Object.fromEntries(items.map(i => [i.id, i]));
    const batchMap = Object.fromEntries(batches.map(b => [b.id, b]));

    const formatted = notifikasi
      .map(n => {
        let itemData = null;

        if (n.table_name === "items" && itemMap[n.record_id]) {
          const item = itemMap[n.record_id];
          itemData = {
            id: item.id,
            name: item.item_name,
            unit: item.satuan,
            quantity: item.batches.reduce((s, b) => s + b.quantity, 0),
            batches: item.batches,
          };
        }

        if (n.table_name === "item_batches" && batchMap[n.record_id]) {
          const item = batchMap[n.record_id].item;
          if (item) {
            itemData = {
              id: item.id,
              name: item.item_name,
              unit: item.satuan,
              quantity: item.batches.reduce((s, b) => s + b.quantity, 0),
              batches: item.batches,
            };
          }
        }

        // 🔥 FILTER NOTIFIKASI YANG TIDAK VALID
        if (!itemData) return null;

        return {
          id: n.id,
          type: n.type,
          message: n.message,
          created_at: n.createdAt,
          item: itemData,
        };
      })
      .filter(Boolean); // 🔥 INI KUNCI UTAMA

    res.status(200).json({
      status: "success",
      total: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ getAllNotifikasi ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil notifikasi",
    });
  }
};

/**
 * 🗑 Delete Notifikasi by ID
 */
exports.deleteNotifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { bisnis_id } = req.user;

    const notif = await Notifikasi.findOne({
      where: { id, bisnis_id },
    });

    if (!notif) {
      return res.status(404).json({
        status: "error",
        message: "Notifikasi tidak ditemukan",
      });
    }

    await notif.destroy();

    res.status(200).json({
      status: "success",
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ deleteNotifikasi ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus notifikasi",
      error: error.message,
    });
  }
};

/**
 * 🗑 Delete All Notifikasi
 */
exports.deleteAllNotifikasi = async (req, res) => {
  try {
    const { bisnis_id } = req.user;
    const { gudang_id } = req.query;

    // ✅ Scope penghapusan
    const where = { bisnis_id };

    // ✅ Jika gudang_id dikirim → hapus hanya notifikasi gudang tersebut
    if (gudang_id) {
      where.gudang_id = gudang_id;
    }

    const deletedCount = await Notifikasi.destroy({ where });

    res.status(200).json({
      status: "success",
      message: gudang_id
        ? "Semua notifikasi gudang berhasil dihapus"
        : "Semua notifikasi bisnis berhasil dihapus",
      deleted: deletedCount,
    });
  } catch (error) {
    console.error("❌ deleteAllNotifikasi ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus semua notifikasi",
      error: error.message,
    });
  }
};


/**
 * 📊 Get Notifikasi Summary
 */
exports.getNotifikasiSummary = async (req, res) => {
  try {
    const { bisnis_id } = req.user;
    const { gudang_id } = req.query; // 🔥 filter opsional

    // =============================
    // WHERE CONDITION (DINAMIS)
    // =============================
    const where = { bisnis_id };
    if (gudang_id) {
      where.gudang_id = gudang_id;
    }

    // =============================
    // QUERY SUMMARY
    // =============================
    const counts = await Notifikasi.findAll({
      where,
      attributes: [
        "type",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["type"],
      raw: true,
    });

    // =============================
    // DEFAULT RESPONSE
    // =============================
    const summary = {
      stok_menipis: 0,
      stok_habis: 0,
      stok_berlebih: 0,
      mendekati_kadaluarsa: 0,
      sudah_kadaluarsa: 0,
      total: 0,
    };

    // =============================
    // MAP RESULT
    // =============================
    counts.forEach((c) => {
      const count = parseInt(c.count, 10) || 0;

      if (summary.hasOwnProperty(c.type)) {
        summary[c.type] = count;
        summary.total += count;
      }
    });

    res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    console.error("❌ getNotifikasiSummary ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil summary notifikasi",
      error: error.message,
    });
  }
};

/**
 * 📧 Kirim Email Notifikasi Kadaluarsa ke Admin (PER GUDANG)
 * ❌ FUNCTION DISABLED - Tidak akan dipanggil
 *
async function sendEmailToAdmin(bisnis_id, gudang_id, notifikasiList) {
  try {
    // ===============================
    // Filter hanya notifikasi kadaluarsa
    // ===============================
    const kadaluarsaNotif = notifikasiList.filter(
      (n) =>
        (n.type === "mendekati_kadaluarsa" ||
          n.type === "sudah_kadaluarsa") &&
        n.gudang_id === gudang_id
    );

    if (kadaluarsaNotif.length === 0) return;

    // ===============================
    // Ambil data gudang
    // ===============================
    const gudang = await Gudang.findOne({
      where: { id: gudang_id, bisnis_id },
      attributes: ["id", "nama_gudang"],
    });

    if (!gudang) {
      // ❌ EMAIL FEATURE DISABLED
      console.log("⚠️ Gudang tidak ditemukan:", gudang_id);
      return;
    }

    // ===============================
    // Ambil admin bisnis
    // ===============================
    const admins = await User.findAll({
      where: {
        bisnis_id,
        role: "admin",
      },
      attributes: ["id", "email"],
    });

    if (admins.length === 0) {
      console.log("⚠️ Tidak ada admin untuk bisnis_id:", bisnis_id);
      return;
    }

    // ===============================
    // Ambil batch + item (VALIDASI GUDANG)
    // ===============================
    const batchIds = kadaluarsaNotif.map((n) => n.record_id);

    const batches = await ItemBatch.findAll({
      where: { id: batchIds },
      include: [
        {
          model: Item,
          as: "item",
          attributes: ["item_name", "satuan", "gudang_id"],
          where: { gudang_id }, // 🔒 pastikan batch dari gudang ini
        },
      ],
    });

    if (batches.length === 0) {
      console.log("⚠️ Tidak ada batch valid untuk gudang:", gudang_id);
      return;
    }

    const batchMap = {};
    batches.forEach((batch) => {
      batchMap[batch.id] = batch;
    });

    // ===============================
    // Build Email Content
    // ===============================
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Peringatan Kadaluarsa Stok</h2>
        <p>
          Gudang: <strong>${gudang.nama_gudang}</strong>
        </p>
        <p>Berikut adalah daftar item yang mendekati atau sudah kadaluarsa:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #fee2e2;">
              <th style="padding: 10px; border: 1px solid #ddd;">Produk</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
    `;

    kadaluarsaNotif.forEach((notif) => {
      const batch = batchMap[notif.record_id];
      if (!batch || !batch.item) return;

      const statusColor =
        notif.type === "sudah_kadaluarsa" ? "#dc2626" : "#ea580c";
      const statusText =
        notif.type === "sudah_kadaluarsa"
          ? "Sudah Kadaluarsa"
          : "Mendekati Kadaluarsa";

      emailContent += `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">
            ${batch.item.item_name}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">
            ${statusText}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd;">
            ${notif.message}
          </td>
        </tr>
      `;
    });

    emailContent += `
          </tbody>
        </table>

        <p style="margin-top: 20px;">
          Mohon segera lakukan pengecekan dan penanganan pada item-item tersebut.
        </p>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Email ini dikirim otomatis oleh sistem <strong>Rilog</strong>.
          Harap tidak membalas email ini.
        </p>
      </div>
    `;

    // ===============================
    // Kirim email ke semua admin
    // ===============================
    for (const admin of admins) {
      await sendEmail(
        admin.email,
        `⚠️ Kadaluarsa Stok - ${gudang.nama_gudang}`,
        emailContent
      );
    }

    console.log(
      `📧 Email kadaluarsa dikirim ke ${admins.length} admin | Gudang: ${gudang.nama_gudang}`
    );
  } catch (error) {
    console.error("❌ sendEmailToAdmin ERROR:", error);
  }
}


/**
 * 🔔 Helper internal untuk auto-generate notifikasi
 */
exports.runGenerateNotifikasi = async (user) => {
  try {
    console.log("🔔 START runGenerateNotifikasi untuk bisnis_id:", user.bisnis_id);
    
    const { bisnis_id } = user;

    const items = await sequelize.query(`
      SELECT 
        i.id,
        i.item_name,
        i.satuan,
        i.min_stok,
        i.max_stok,
        i.gudang_id
      FROM items i
      INNER JOIN gudangs g ON g.id = i.gudang_id
      WHERE g.bisnis_id = :bisnis_id
    `, {
      replacements: { bisnis_id },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`📦 Total items ditemukan: ${items.length}`);

    const itemIds = items.map(i => i.id);

    const batches = itemIds.length > 0
      ? await ItemBatch.findAll({
          where: { item_id: itemIds },
          attributes: ["id", "item_id", "quantity", "expiry_date"],
          raw: true
        })
      : [];

    console.log(`📦 Total batches ditemukan: ${batches.length}`);

    const batchesByItem = {};
    batches.forEach(b => {
      if (!batchesByItem[b.item_id]) batchesByItem[b.item_id] = [];
      batchesByItem[b.item_id].push(b);
    });

    const notifikasiList = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      const itemBatches = batchesByItem[item.id] || [];
      const totalQty = itemBatches.reduce((s, b) => s + Number(b.quantity || 0), 0);
      const minStok = Number(item.min_stok);
      const maxStok = Number(item.max_stok);
      const namaItem = item.item_name || "Produk";

      if (!item.gudang_id) continue; // 🛡️ safety

      if (totalQty === 0) {
        notifikasiList.push({
          bisnis_id,
          gudang_id: item.gudang_id,
          record_id: item.id,
          table_name: "items",
          type: "stok_habis",
          message: `Stok ${namaItem} sudah habis (0 ${item.satuan})`,
        });
      }

      if (!isNaN(minStok) && totalQty > 0 && totalQty <= minStok) {
        notifikasiList.push({
          bisnis_id,
          gudang_id: item.gudang_id,
          record_id: item.id,
          table_name: "items",
          type: "stok_menipis",
          message: `Stok ${namaItem} menipis. Saat ini ${totalQty} ${item.satuan}`,
        });
      }

      if (!isNaN(maxStok) && totalQty > maxStok) {
        notifikasiList.push({
          bisnis_id,
          gudang_id: item.gudang_id,
          record_id: item.id,
          table_name: "items",
          type: "stok_berlebih",
          message: `Stok ${namaItem} berlebih. Saat ini ${totalQty} ${item.satuan}`,
        });
      }

      for (const batch of itemBatches) {
        if (!batch.expiry_date || batch.quantity <= 0) continue;

        const expDate = new Date(batch.expiry_date);
        expDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil(
          (expDate - today) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 0) {
          notifikasiList.push({
            bisnis_id,
            gudang_id: item.gudang_id,
            record_id: batch.id,
            table_name: "item_batches",
            type: "sudah_kadaluarsa",
            message: `Batch ${namaItem} sudah kadaluarsa`,
          });
        } else if (diffDays <= 30) {
          notifikasiList.push({
            bisnis_id,
            gudang_id: item.gudang_id,
            record_id: batch.id,
            table_name: "item_batches",
            type: "mendekati_kadaluarsa",
            message: `Batch ${namaItem} akan kadaluarsa dalam ${diffDays} hari`,
          });
        }
      }
    }

    console.log(`🔔 Total notifikasi akan dibuat: ${notifikasiList.length}`);

    await Notifikasi.destroy({ where: { bisnis_id } });

    if (notifikasiList.length > 0) {
      await Notifikasi.bulkCreate(notifikasiList);
      console.log(`✅ Berhasil insert ${notifikasiList.length} notifikasi`);
    }

    console.log(`🔔 END runGenerateNotifikasi`);
  } catch (err) {
    console.error("❌ runGenerateNotifikasi error:", err);
    throw err;
  }
};

exports.getNotifikasiByGudang = async (req, res) => {
  try {
    const { bisnis_id } = req.user;
    const gudang_id = parseInt(req.params.gudang_id, 10);

    if (!gudang_id) {
      return res.status(400).json({
        status: "error",
        message: "Gudang ID tidak valid",
      });
    }

    // =========================
    // Ambil notifikasi gudang
    // =========================
    const notifikasi = await Notifikasi.findAll({
      where: { bisnis_id, gudang_id },
      order: [["created_at", "DESC"]],
      raw: true,
    });

    if (notifikasi.length === 0) {
      return res.status(200).json({
        status: "success",
        total: 0,
        data: [],
      });
    }

    // =========================
    // Kumpulkan record_id
    // =========================
    const itemIds = notifikasi
      .filter(n => n.table_name === "items")
      .map(n => n.record_id);

    const batchIds = notifikasi
      .filter(n => n.table_name === "item_batches")
      .map(n => n.record_id);

    // =========================
    // Fetch items + batches
    // =========================
    const items = itemIds.length > 0
      ? await Item.findAll({
          where: { id: itemIds },
          attributes: ["id", "item_name", "satuan", "min_stok", "max_stok"],
          include: [
            {
              model: ItemBatch,
              as: "batches",
              attributes: ["id", "quantity", "expiry_date"],
              required: false,
            },
          ],
        })
      : [];

    const batches = batchIds.length > 0
      ? await ItemBatch.findAll({
          where: { id: batchIds },
          attributes: ["id", "quantity", "expiry_date", "item_id"],
          include: [
            {
              model: Item,
              as: "item",
              attributes: ["id", "item_name", "satuan", "min_stok", "max_stok"],
              include: [
                {
                  model: ItemBatch,
                  as: "batches",
                  attributes: ["id", "quantity", "expiry_date"],
                  required: false,
                },
              ],
            },
          ],
        })
      : [];

    // =========================
    // Map cepat
    // =========================
    const itemMap = {};
    items.forEach(i => (itemMap[i.id] = i));

    const batchMap = {};
    batches.forEach(b => (batchMap[b.id] = b));

    // =========================
    // Format response (🔥 SAMA dengan getAllNotifikasi)
    // =========================
    const formatted = notifikasi.map(n => {
      let itemData = null;

      if (n.table_name === "items" && itemMap[n.record_id]) {
        const item = itemMap[n.record_id];
        const totalQty =
          item.batches?.reduce((s, b) => s + b.quantity, 0) || 0;

        itemData = {
          id: item.id,
          name: item.item_name,
          quantity: totalQty,
          unit: item.satuan,
          min_stock: item.min_stok,
          max_stock: item.max_stok,
          batches: item.batches || [],
        };
      }

      if (n.table_name === "item_batches" && batchMap[n.record_id]) {
        const batch = batchMap[n.record_id];
        const item = batch.item;

        if (item) {
          const totalQty =
            item.batches?.reduce((s, b) => s + b.quantity, 0) || 0;

          itemData = {
            id: item.id,
            name: item.item_name,
            quantity: totalQty,
            unit: item.satuan,
            min_stock: item.min_stok,
            max_stock: item.max_stok,
            batches: item.batches || [],
          };
        }
      }

      return {
        id: n.id,
        type: n.type,
        message: n.message,
        created_at: n.created_at,
        record_id: n.record_id,
        table_name: n.table_name,
        item: itemData,
      };
    });

    return res.status(200).json({
      status: "success",
      total: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ getNotifikasiByGudang ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil notifikasi gudang",
    });
  }
};

exports.deleteNotifikasiByGudang = async (req, res) => {
  try {
    const { bisnis_id } = req.user;
    const { gudang_id } = req.params;

    const deleted = await Notifikasi.destroy({
      where: { bisnis_id, gudang_id },
    });

    res.status(200).json({
      status: "success",
      deleted,
      message: "Notifikasi gudang berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ deleteNotifikasiByGudang ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus notifikasi gudang",
    });
  }
};


exports.getGudangWithNotifikasiCount = async (req, res) => {
  try {
    const { bisnis_id } = req.user;

    const result = await Notifikasi.findAll({
      where: { bisnis_id },
      attributes: [
        "gudang_id",
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
      ],
      group: ["gudang_id"],
      raw: true,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("❌ getGudangWithNotifikasiCount ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil count notifikasi per gudang",
    });
  }
};