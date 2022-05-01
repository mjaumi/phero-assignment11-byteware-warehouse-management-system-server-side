const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middlewires
app.use(cors());
app.use(express.json());

// mongoDB connection here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqizw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('inventory').collection('items');

        console.log('DB connected');

        // GET ITEMS API
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

    } finally {

    }
}

run().catch(console.dir);


// base API
app.get('/', (req, res) => {
    res.send('ByteWare server running');
});

// listening API
app.listen(port, () => {
    console.log('Listening to PORT', port);
});