let express = require('express');
let app = express();
let port = process.env.PORT || 9120;
let Mongo = require('mongodb');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
let { dbConnect, getData, postData, updateOrder, deleteOrder } = require('./controller/dbcontroller');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hi from Express');
});

// Get all users
app.get('/users', async (req, res) => {
    let query = {};
    let collection = "users";
    let output = await getData(collection, query);
    res.send(output);
});


// Get all locations
app.get('/location', async (req, res) => {
    let query = {};
    let collection = "location";
    let output = await getData(collection, query);
    res.send(output);
});

// Quick search
app.get('/quicksearch', async (req, res) => {
    let query = {};
    let collection = "quicksearch";
    let output = await getData(collection, query);
    res.send(output);
});

// Get all meal types
app.get('/mealtype', async (req, res) => {
    let query = {};
    let collection = "mealType";
    let output = await getData(collection, query);
    res.send(output);
});

// Get all restaurants
app.get('/restaurants', async (req, res) => {
    let query = {};
    if (req.query.stateId && req.query.mealId) {
        query = { state_id: Number(req.query.stateId), "mealTypes.mealtype_id": Number(req.query.mealId) };
    } else if (req.query.stateId) {
        query = { state_id: Number(req.query.stateId) };
    } else if (req.query.mealId) {
        query = { "mealTypes.mealtype_id": Number(req.query.mealId) };
    } else {
        query = {};
    }
    let collection = "restaurants";
    let output = await getData(collection, query);
    res.send(output);
});

// Filter restaurants
app.get('/filter/:mealId', async (req, res) => {
    let mealId = Number(req.params.mealId);
    let cuisineId = Number(req.query.cuisineId);
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);
    let query = {};

    if (cuisineId) {
        query = {
            "mealTypes.mealtype_id": mealId,
            "cuisines.cuisine_id": cuisineId
        };
    } else if (lcost && hcost) {
        query = {
            "mealTypes.mealtype_id": mealId,
            $and: [{ cost: { $gt: lcost, $lt: hcost } }]
        };
    }
    
    let collection = "restaurants";
    let output = await getData(collection, query);
    res.send(output);
});

// Get restaurant details
app.get('/details/:id', async (req, res) => {
    let id = Number(req.params.id);
    let query = { restaurant_id: id };
    let collection = "restaurants";
    let output = await getData(collection, query);
    res.send(output);
});

// Get menu for a restaurant
app.get('/menu/:id', async (req, res) => {
    let id = Number(req.params.id);
    let query = { restaurant_id: id };
    let collection = "menu";
    let output = await getData(collection, query);
    res.send(output);
});

// Get orders
app.get('/orders', async (req, res) => {
    let query = {};
    if (req.query.email) {
        query = { email: req.query.email };
    } else {
        query = {};
    }
    let collection = "orders";
    let output = await getData(collection, query);
    res.send(output);
});

// Place an order
app.post('/placeOrder', async (req, res) => {
    let data = req.body;
    let collection = "orders";
    console.log(">>>", data);
    let response = await postData(collection, data);
    res.send(response);
});

// Get menu details
app.post('/menuDetails', async (req, res) => {
    if (Array.isArray(req.body.id)) {
        let query = { menu_id: { $in: req.body.id } };
        let collection = 'menu';
        let output = await getData(collection, query);
        res.send(output);
    } else {
        res.send('Please pass data in form of array');
    }
});

// Update an order
app.put('/updateOrder', async (req, res) => {
    let collection = 'orders';
    let condition = { "_id": new Mongo.ObjectId(req.body._id) };
    let data = {
        $set: {
            "status": req.body.status
        }
    };
    let output = await updateOrder(collection, condition, data);
    res.send(output);
});

// Delete an order
app.delete('/deleteOrder', async (req, res) => {
    let collection = 'orders';
    let condition = { "_id": new Mongo.ObjectId(req.body._id) };
    let output = await deleteOrder(collection, condition);
    res.send(output);
});

// Start the server
app.listen(port, (err) => {
    dbConnect();
    if (err) throw err;
    console.log(`Server is running on port ${port}`);
});
