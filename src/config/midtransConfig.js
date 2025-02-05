const midtransClient = require('midtrans-client');

const midtrans = new midtransClient.CoreApi({
    isProduction: false, // Set ke true jika sudah live
    serverKey: process.env.MIDTRANS_SERVER_KEY, // Ganti dengan server key dari Midtrans
    clientKey: process.env.MIDTRANS_CLIENT_KEY, // Ganti dengan client key dari Midtrans
});

module.exports = midtrans;