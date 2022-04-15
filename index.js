const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());

//pacificTourism
//aJDo0lvTXHdrivO2

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhtwe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db('tourismPlans');
        const bookingsCollection = database.collection('bookings');

        await client.connect();
        const ordersDb = client.db('tourismPlans');
        const ordersCollection = ordersDb.collection('orders');

        //POST API 
        app.post("/addNewBooking", async (req, res) => {
            const newBooking = req.body;
            const result = await bookingsCollection.insertOne(newBooking);
            res.send(result);
            console.log(req.body);
            console.log(result);
        });

        //GET API 
        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // Booking Details
        app.get('/singlebooking/:id', async (req, res) => {
            console.log(req.params.id);
            bookingsCollection
                .find({ _id: ObjectId(req.params.id) })
                .toArray((err, results) => {
                    res.send(results[0]);
                });
        });

        // Confirm Booking
        app.post("/confirmBooking", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
            console.log(result);
        });

        // My Bookings
        app.get("/myBookings/:email", async (req, res) => {
            const result = await ordersCollection
                .find({ email: req.params.email })
                .toArray();
            res.send(result);
        });

        // Cancel Booking from My Bookings
        app.delete("/cancelBooking/:id", async (req, res) => {
            const result = await ordersCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // All My Bookings 
        app.get("/allBookings", async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        });

        // Update Status in Manage All Bookings
        app.put("/updateStatus/:id", (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            console.log(updatedStatus);
            ordersCollection
                .updateOne(filter, {
                    $set: { status: updatedStatus },
                })
                .then(result => {
                    res.send(result);
                });
        });

        // Final Delete from Manage All Bookings
        app.delete("/deleteFinal/:id", async (req, res) => {
            const result = await ordersCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello from Pacific Tourism Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})