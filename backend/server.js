// Imports
const config = require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes/api');

// Initialization
const app = express();
let store = new MongoDBStore({
    uri: `${process.env.MONGODB_HOST}/track`,     // Connect to the database called 'track'
    collection: 'sessions'
})
store.on('error', function (error) {
    console.log(error);
});
mongoose.connect(`${process.env.MONGODB_HOST}/track`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });


// Declare Middleware
app.use(cors({
    origin: process.env.FRONT_END_ORIGIN,
    allowedHeaders: ['Content-Type'],
    credentials: true
}))

app.use(express.json())             // A middleware that ONLY handles input with Content-Type: JSON

isSecure = false;
if (process.env.MODE == 'production') { isSecure = true; }
app.use(session({
    secret: process.env.COOKIE_SECRET,
    name: 'TRACK_APP_SESSION',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 600,    // In milliseconds
        sameSite: 'lax',
        secure: isSecure
    }
}))

// Routes
app.use('/api/', routes);       // Use the imported routes

// Error Handler Middleware
app.use(function(err, req, res, next){
    //  Todo: More cases to provide accurate error messages
    res.status(422);
    console.log(err);
    res.send({error: err});
});

app.listen(process.env.PORT, function () {    // We need to listen to a port. 
    console.log(`Listening for requests on PORT: ${process.env.PORT}`);
});