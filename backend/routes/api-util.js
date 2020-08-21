const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Week = require('../models/week');
const fns = require('date-fns');
const tz = require('date-fns-tz');

router.post('/test/', function(req, res, next){
    try {
        console.log('Object Type:', typeof(req.body.num))
        res.send(req.body);
    } catch (error) {
        next(error);
    }
})


module.exports = router;