// Imports
const config = require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/api-auth');
const targetRoutes = require('./routes/api-targets');

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
app.use('/api/', authRoutes);       // Use the imported routes
app.use('/api/', targetRoutes);

/** Generic Error Handler Middleware
 *  Catches all errors that aren't accounted for in the try-catch of routes and responds with a usable error message.
 */
app.use(function(error, req, res, next){
    res.status(422);
    console.log(error)

    // Mongo Errors
    if (error.name === 'MongoError'){
        res.send({
            type: `MongoError: ${error.code}`,
            error: error
        });
    }else{  
        // Treat any other error as a JavaScript error
        res.send({
            msg: error.message,
            error: JSON.stringify(err, Object.getOwnPropertyNames(error))
        });
    }
});

app.listen(process.env.PORT, function () {    // We need to listen to a port. 
    console.log(`Listening for requests on PORT: ${process.env.PORT}`);
});