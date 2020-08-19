const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/register', async function (req, res, next) {
    try {
        const { username, password } = req.body;
        const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS); // .env stores everything as strings.
        let hash = await bcrypt.hash(password, saltRounds);

        // Error handling in an async call with a callback is a bit tricky. Throwing an error in the callback doesn't work.
        let user = await User.create({ username: username, password: hash }).then(() => {
            res.status(409);    // 409 - Request conflicts with current state of server.
            res.send({
                msg: 'Failed to register account. Username is already taken.',
                error: error
            })
        })

        res.send({
            user: user,
            msg: 'Successfully registered an account.'
        });
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            res.status(409);    // 409 - Request conflicts with current state of server.
            res.send({
                msg: 'Failed to register account. Username is already taken.',
                error: error
            })
        } else {
            next(error);
        }
    }
})

router.post('/login', async function (req, res, next) {
    try {
        const { username, password } = req.body;
        let user = await User.findOne({ username: username });        // No duplicate usernames
        if (user === null) {
            throw new Error('Username or password was incorrect.');
        }

        let hash = user.password
        let isMatch = await bcrypt.compare(password, hash);
        if (isMatch) {
            // Correct password, create session
            req.session.username = username;
            res.send({
                loggedIn: true,
                user: user
            })
        } else {
            // Incorrect password, send informative error
            res.status(401);    // Failed Login Status
            res.send({
                loggedIn: false,
                error: 'Username or Password was incorrect.'
            })
        };
    } catch (error) {
        next(error);
    }
});

router.post('/logout', async function (req, res, next) {
    try {
        req.session.destroy(function (err) {
            if (err) {
                throw new Error('Failed to destroy session.');
            } else {
                res.send({
                    msg: 'Successfully Logged Out.'
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

router.get('/loggedIn', async function (req, res, next) {
    try {
        if (req.session.username === undefined) {
            res.send({
                loggedIn: false
            });
        } else {
            let user = await User.find({ username: req.session.username });
            if (user === null) {
                throw Error('Critical Error: A session username was not null and no user was found for that username.')
            }

            res.send({
                loggedIn: true
            })
        }

    } catch (error) {
        next(error);
    }
})

module.exports = router;