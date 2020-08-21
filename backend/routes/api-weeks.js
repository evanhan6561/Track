const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Week = require('../models/week');

/*  
    Weeks is more so of a wrapper Schema to contain 7 days. The client would only interact with weeks indirectly
    by adding time to a specific day. Room for augmentation.
    Doesn't need CRUD right now 8-19-2020.
*/



module.exports = router;