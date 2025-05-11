// routes/call.router.js
const express = require('express');
const router = express.Router();

router.post('/initiate', (req, res) => {
    req.io.emit('initiate-call', req.body);
    res.json({ status: 'call initiated' });
});

module.exports = router;