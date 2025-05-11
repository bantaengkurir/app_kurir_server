const Pusher = require('pusher');

// Konfigurasi Pusher
const pusher = new Pusher({
    appId: "1948721",
    key: "27dd26c02b96af0f4e50",
    secret: "231f888aa4f383cb2b18",
    cluster: "ap1",
    useTLS: true
});

module.exports = pusher;