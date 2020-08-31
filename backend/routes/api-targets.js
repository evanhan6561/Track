const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Week = require('../models/week');
const mongoose = require('mongoose');

// C R U D Operations

// Create
router.post('/targets', async function (req, res, next) {
    try {
        let { title, notes, weeklyTargetTime } = req.body;
        // Todo: Filter Input


        // Generate the _id manually so we know what it is
        let newTarget = {
            _id: mongoose.Types.ObjectId(),
            title: title,
            notes: notes,
            weeklyTargetTime: weeklyTargetTime, // Presumed to be seconds. The client should handle the unit conversions.
            weeks: []
        }

        let user = await User.findOne({ username: req.session.username });
        let targets = user.targets;
        targets.push(newTarget);
        await user.save();

        let updatedUser = await User.findOne({ username: req.session.username });
        let updatedTarget = updatedUser.targets.id(newTarget._id);
        res.send({
            msg: 'Target successfully uploaded',
            success: true,
            target: updatedTarget
        });
    } catch (error) {
        next(error);
    }
})

// Read
router.get('/targets', async function (req, res, next) {
    try {
        // Make sure to first populate the references and then send off the data.
        let populatedUser =
            await User.findOne({ username: req.session.username }).populate({
                path: 'targets',
                populate: {
                    path: 'weeks',
                    model: 'week'
                }
            });

        let user = await User.findOne({username: req.session.username})


        res.send({
            targets: populatedUser.targets,
            success: true
        });
    } catch (error) {
        next(error);
    }
});


// Update
router.put('/targets/:id', async function (req, res, next) {
    try {
        let { title, notes, weeklyTargetTime } = req.body;    // Users can't directly alter the 'weeks' attribute for now.
        // Todo: Filter Input


        let user = await User.findOne({ username: req.session.username });

        let targetId = req.params.id;
        let target = await user.targets.id(targetId);
        target.title = title;
        target.notes = notes;
        target.weeklyTargetTime = weeklyTargetTime;
        await user.save();

        user = await User.findOne({ username: req.session.username });
        let updatedTarget = await user.targets.id(targetId);

        res.send({
            msg: 'Successfully updated the target.',
            success: true,
            target: updatedTarget
        })
    } catch (error) {
        next(error);
    }
});

// Delete
// Todo: After after implementing CRUD for Week, test if this works 
router.delete('/targets/:id', async function (req, res, next) {
    // To delete a target, I should first delete everything as far down as possible.
    /*
        Every 'Target' can have multiple 'Weeks'. Every 'Week' can have up to 7 'Days'.
        Important to note that 'Target' stores a list of ObjectId pointers to 'Weeks', not the 'Weeks' themselves.
        - Target
            - [Week]
                - [Day] (Deleting a week automatically deletes days.)
    */

    try {
        // Authorization Check - make sure the current session user owns this target.
        let targetId = req.params.id;
        let user = await User.findOne({ username: req.session.username });
        let target = user.targets.id(targetId);    // Returns 'null' if not found
        if (target === null) {
            throw Error('Critical Error: Given ID is invalid or targeted id does not belong to current user.');
        }

        // Delete every week referenced to by the current target.
        target.weeks.forEach(async (id) => {
            await Week.findByIdAndDelete(id);
        });

        // Delete the target itself now.
        await user.targets.id(targetId).remove();
        await user.save();

        // Send the updated targets list
        let updatedTargets = await User.findOne({ username: req.session.username }).targets;
        res.send({
            msg: 'Successfully deleted target.',
            success: true,
            targets: updatedTargets
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;