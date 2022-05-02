const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // GET API for all items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // GET API for a specific item
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            res.send(item);
        });

        //PUT API for a specific item
        app.put('/updateItem/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateItem = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            };
            const updateResult = await itemsCollection.updateOne(filter, updateItem, options);
            res.send(updateResult);
        });

        //DELETE API for a specific item
        app.delete('/deleteItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteResult = await itemsCollection.deleteOne(query);
            res.send(deleteResult);
        });

        //POST API to add new item
        app.post('/addNewItem', async (req, res) => {
            const newItem = req.body;
            const addResult = await itemsCollection.insertOne(newItem);
            res.send(addResult);
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