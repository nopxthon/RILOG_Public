const axios = require("axios");

module.exports = async function triggerNotifikasi(req) {
  try {
    await axios.post(
      `${process.env.BACKEND_URL}/api/notifikasi/generate`,
      {},
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
  } catch (err) {
    console.error("❌ Gagal trigger notifikasi:", err.message);
  }
};
