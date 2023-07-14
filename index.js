const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uj4yqjv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db('carDoctor').collection('services');
        const checkingCollection = client.db('carDoctor').collection('checkings')

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: { title: 1, service_id: 1, price: 1, img: 1 },
            };

            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })

        //checkings
        app.post('/checkings', async (req, res) => {
            const checking = req.body;
            console.log(checking);
            const result = await checkingCollection.insertOne(checking);
            res.send(result)
        })

        app.get('/checkings', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await checkingCollection.find(query).toArray();
            res.send(result);
        })

        app.patch('/checkings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedChecking = req.body;
            console.log(updatedChecking);
            const updateDoc = {
                $set: {
                    status: updatedChecking.status
                },
            }
            const result = await checkingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/checkings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await checkingCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('car doctor is running')
});

app.listen(port, () => {
    console.log(`car doctor server is running on port: ${port}`);
})