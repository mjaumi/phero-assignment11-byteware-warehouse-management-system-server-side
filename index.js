const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middlewires
app.use(cors());
app.use(express.json());

// base API
app.get('/', (req, res) => {
    res.send('ByteWare server running');
});

// listening API
app.listen(port, () => {
    console.log('Listening to PORT', port);
});