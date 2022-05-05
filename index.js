const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { JsonWebTokenError } = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middlewires
app.use(cors());
app.use(express.json());

// verifying JWT here 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }

        req.decoded = decoded;
        next();
    });
}

// mongoDB connection here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqizw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('inventory').collection('items');
        const overviewCollection = client.db('inventory').collection('overview');

        console.log('DB connected');

        /**
         * -----------------------
         * AUTHENTICATION API
         * -----------------------
         */
        app.post('/getToken', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        });


        /**
         * ------------------------
         * SERVICES API
         * ------------------------
         */
        // GET API for all items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // GET API for searching with brands
        app.get('/itemsByBrand', async (req, res) => {
            const brand = req.query.brand;
            const query = { brand };
            const cursor = itemsCollection.find(query);
            const brandItems = await cursor.toArray();
            res.send(brandItems);
        });

        // GET API for fetching overview data
        app.get('/overview', async (req, res) => {
            const query = {};
            const overviewData = await overviewCollection.findOne(query);
            res.send(overviewData);
        });

        // GET API for a specific item
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            res.send(item);
        });

        // GET API for items added by supplier
        app.get('/itemsBySupplier', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const supplierEmail = req.query.email;
            if (supplierEmail === decodedEmail) {
                const query = { supplierEmail };
                const cursor = itemsCollection.find(query);
                const supplierItems = await cursor.toArray();
                res.send(supplierItems);
            }

            else {
                res.status(403).send({ message: 'Forbidden Access' });
            }
        });

        // PUT API for updating overview data
        app.put('/updateOverview/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOverviewData = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateOverview = {
                $set: {
                    totalCustomers: updatedOverviewData.totalCustomers,
                    laptopSold: updatedOverviewData.laptopSold,
                    revenue: updatedOverviewData.revenue
                }
            }
            const updateResult = await overviewCollection.updateOne(filter, updateOverview, options);
            res.send(updateResult);
        });

        // PUT API for a specific item
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

        // DELETE API for a specific item
        app.delete('/deleteItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteResult = await itemsCollection.deleteOne(query);
            res.send(deleteResult);
        });

        // POST API to add new item
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