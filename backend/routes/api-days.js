const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Week = require('../models/week');
const fns = require('date-fns');
const tz = require('date-fns-tz');

const {
    localToSameDayUTC,
    bisectLeft,
    haveSameMostRecentUTCSunday,
    mostRecentUTCSunday
} = require('../utils');

// C R U D operations

// Create Day - expects the ObjectId of a specified target.
/**
 * Handles the user logging time worked towards a specific Target.
 * If the user has never worked on a day before, a new one will be created. If the day already exists, we simply add the worktime
 * to that day.
 * 
 * Adding a day can also generate a Week. A Week wraps up to 7 days and has the following structure:
 *      Week = {
 *          weeklyTargetTime: Number (in seconds)
 *          days: [DaySchema]
 *      }
 * 
 * A new week document will be added if the user has never added work to that week.
 * 
 * 
 * Design Choice:
 *  - If the user inserts time on 1/1/2020, then no matter what timezone they view the data, that time should be bound to 1/1/2020.
 * 
 * Implementation Details:
 *  - Two weeks are considered equal if they have the same Sunday
 *  - Ensure that Target.weeks is maintained in sorted order. (Ascending Time)
 *  - All dates are stored as normalized UTC timestamps. (Normalized as in 0 time thru setHours(0, 0, 0, 0))
 *  - All comparisons are done through the lens of UTC time.
 *  - The day timestamps stored do not represent the exact time a User inserted workTime, 
 *    they only store the year/month/day a person inserts workTime.
 */
router.post('/days/:id', async function (req, res, next) {
    /**Returns a target document whose array of ObjectId references to Week documents have been populated.
     * 
     * @param {*} username - username of the current user
     * @param {*} targetId - ObjectId of the target to return
     */
    async function getPopulatedTarget(username, targetId) {
        // Echo the changed Target
        let updatedUser =
            await User.findOne({ username: username }).populate({
                path: 'targets',
                populate: {
                    path: 'weeks',
                    model: 'week'
                }
            });
        let updatedTarget = updatedUser.targets.id(targetId);
        return updatedTarget;
    }


    // Todo: Deleting a week and then inserting into it causes sorted order to no longer be maintained

    try {
        // Authorization Check - make sure the current session user owns this target.
        let username = req.session.username;
        let targetId = req.params.id;
        let user = await User.findOne({ username: req.session.username });
        let target = user.targets.id(targetId);    // Returns 'null' if not found
        if (target === null) {
            throw Error('Critical Error: Given ID is invalid or targeted id does not belong to current user.');
        }

        // inputDate - [Number] Time in ms since Unix Epoch. (Date Objects lose their type after being sent.)
        // workTime - [seconds] time worked
        // timezone - String of user's local IANA timezone. Retrieved through 'console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)'
        let { inputDate, workTime, timeZone } = req.body;
        let weeksIds = target.weeks;

        // Todo: filters

        // Convert the array of ObjectId's to an array of Documents
        let populatedUser =
            await User.findOne({ username: username }).populate({
                path: 'targets',
                populate: {
                    path: 'weeks',
                    model: 'week'
                }
            });
        let weeks = populatedUser.targets.id(targetId).weeks;

        // Sanity Check:
        if (weeksIds.length !== weeks.length){
            throw Error('Critical Error: The length of ObjectIds in target.weeks is not equal to the length of populated target.weeks');
        }

        // Convert the input date into a normalized UTC date. (Normalized meaning that hours, mins, secs, ms are set to 0);
        let localDate = tz.utcToZonedTime(new Date(inputDate), timeZone);
        let utcSameDay = localToSameDayUTC(localDate);

        // Get the most recent UTC Sunday to perform a bisect operation on $weeks
        let utcSunday = mostRecentUTCSunday(utcSameDay);

        // Custom comparison function that bisectLeft will utilize.
        function weekLessThan(w1, item) {
            // Get a Date object day from w1. item is already a Date object.
            let d1 = new Date(w1.days[0].date)
            let d2 = item;

            // Get the most recent Sunday
            let sunday_1 = mostRecentUTCSunday(d1);
            let sunday_2 = mostRecentUTCSunday(d2);

            return sunday_1 < sunday_2;
        }

        // Use bisectLeft to find the index we would insert a new week into such that sorted order is maintained.
        let weeksInsertionIndex = bisectLeft(weeks, utcSunday, weekLessThan);
        console.log('weeksInsertionIndex :>> ', weeksInsertionIndex);


        let pureDates = weeks.map(week => {
            return week.days[0].date;
        })
        console.log('The Dates of this target Pre-insertion:>> ', pureDates);



        // We don't want two weeks for the same date range. 
        // Check if the insertionIndex points to a week document with the same Sunday
        if (weeksInsertionIndex >= weeks.length) {
            // Don't check for duplicate week in this case or else we go out of bounds.
            // If the insertionPoint is out of bounds, we can immediately create a new week and insert into Target.
            let newDay = {
                workTime: workTime,
                date: utcSameDay
            }
            let newWeek = await Week.create({ weeklyTargetTime: target.weeklyTargetTime, days: [newDay] })
            weeksIds.splice(weeksInsertionIndex, 0, newWeek._id);
            await user.save();

            // Echo the updated Target to client, make sure to populate
            let updatedUser =
                await User.findOne({ username: req.session.username }).populate({
                    path: 'targets',
                    populate: {
                        path: 'weeks',
                        model: 'week'
                    }
                });

            let updatedTarget = updatedUser.targets.id(targetId);
            res.send({
                msg: 'A new latest week has been inserted',
                success: true,
                target: updatedTarget
            })
        } else {
            // We can safely index into the $weeks array to check for equality
            let potentialMatchDate = new Date((weeks[weeksInsertionIndex].days[0].date));
            if (haveSameMostRecentUTCSunday(potentialMatchDate, utcSameDay)) {
                // Case where we already have an existing week document that encompasses utcSameDay
                let reusedWeek = weeks[weeksInsertionIndex];

                // Iterate through all of the days within $reusedWeek to check if a Day subdoc already exists for $utcSameDay
                let notContained = true;    // Todo: delete notContained if code works
                let existingDayDocument = null;
                for (let i = 0; i < reusedWeek.days.length; i++) {
                    let dayDocument = reusedWeek.days[i];
                    let day = new Date(dayDocument.date);

                    // If some Day subdoc is the same as utcSameDay, don't create a new Day subdoc, just add their workTimes
                    if (utcSameDay.getTime() === day.getTime()) {
                        dayDocument.workTime += workTime;
                        notContained = false;
                        existingDayDocument = dayDocument;
                        break;
                    }
                }

                // If we have a Day that already exists, we may want to either delete it if its new time is <= 0
                // or merely update it otherwise
                if (existingDayDocument) {
                    // If the workTime is <= 0, then delete the day and potentially the parent week
                    if (existingDayDocument.workTime <= 0) {
                        if (reusedWeek.days.length === 1) {
                            // Parent week has length 1, delete the entire week and delete it's reference from Target.weeks

                            // Delete the Week ObjectId reference from Target.weeks. 
                            let weekId = reusedWeek._id;                        // this does not work.
                            console.log('weekId :>> ', weekId);
                            for (let i = 0; i < target.weeks.length; i++) {
                                const id = target.weeks[i];
                                console.log('id :>> ', id);
                                if (id.equals(weekId)) {
                                    target.weeks.splice(i, 1);
                                    console.log('Deleted a weekId');
                                    break;
                                }
                            }
                            await user.save();

                            // Delete the week
                            await Week.findByIdAndDelete(weekId);

                            // Echo the updated Target and informative message.
                            let updatedTarget = await getPopulatedTarget(username, targetId);
                            let msg = `Successfully deleted day and week. 
                            A Week containing only a single work day had an updated time <= 0.
                            `;
                            msg = msg.replace(/\s\s+/g, ' ');   // Convert prolonged whitespace -> single space
                            res.send({
                                msg: msg,
                                success: true,
                                target: updatedTarget
                            });
                        } else {
                            // Delete a specific day from a week
                            let dayId = existingDayDocument._id;
                            reusedWeek.days.id(dayId).remove();
                            await reusedWeek.save();
                            let updatedTarget = await getPopulatedTarget(username, targetId);
                            res.send({
                                msg: 'Successfully deleted a single Day from a Week.',
                                success: true,
                                target: updatedTarget
                            });
                        }
                    } else {
                        // Otherwise, our Day has a valid workTime > 0. Just save the changes.
                        reusedWeek.save();
                        let updatedTarget = await getPopulatedTarget(username, targetId);
                        res.send({
                            msg: 'Changed the workTime of an existing day.',
                            success: true,
                            target: updatedTarget
                        })
                    }
                } else {
                    // No Day exists with a matching date. We'll need to push a new Day.
                    let newDay = {
                        workTime: workTime,
                        date: utcSameDay
                    }
                    reusedWeek.days.push(newDay);
                    reusedWeek.save();

                    // Echo the changed Target, make sure it's populated
                    let updatedUser =
                        await User.findOne({ username: req.session.username }).populate({
                            path: 'targets',
                            populate: {
                                path: 'weeks',
                                model: 'week'
                            }
                        });
                    let updatedTarget = updatedUser.targets.id(targetId);
                    res.send({
                        msg: 'Updated a week that already exists.',
                        success: true,
                        target: updatedTarget
                    })
                }

                // Old code that worked, delete if new code works.
                // // Append a new Day subdoc if none of the days in the $reusedWeek matched $utcSameDay
                // if (notContained) {
                //     let newDay = {
                //         workTime: workTime,
                //         date: utcSameDay
                //     }
                //     reusedWeek.days.push(newDay);
                // }
                // reusedWeek.save();

                // // Echo the changed Target
                // let updatedUser =
                //     await User.findOne({ username: req.session.username }).populate({
                //         path: 'targets',
                //         populate: {
                //             path: 'weeks',
                //             model: 'week'
                //         }
                //     });
                // let updatedTarget = updatedUser.targets.id(targetId);
                // res.send({
                //     msg: 'Updated a week that already exists.',
                //     success: true,
                //     target: updatedTarget
                // })
            } else {
                // Case where $weekInsertionPoint pointed to a week with a different date. We can safely insert a new week.
                // Again, we are assuming that Target.weeks is in sorted order.
                let newDay = {
                    workTime: workTime,
                    date: utcSameDay
                }
                let newWeek = await Week.create({ weeklyTargetTime: target.weeklyTargetTime, days: [newDay] })
                weeksIds.splice(weeksInsertionIndex, 0, newWeek._id);
                await user.save();

                // Echo the changed Target
                let updatedUser =
                    await User.findOne({ username: req.session.username }).populate({
                        path: 'targets',
                        populate: {
                            path: 'weeks',
                            model: 'week'
                        }
                    });
                let updatedTarget = updatedUser.targets.id(targetId);
                res.send({
                    msg: 'Inserted a new week within the array.',
                    success: true,
                    target: updatedTarget
                })
            }
        }
    } catch (error) {
        next(error);
    }
});

// Read - Day
router.get('/days/:targetId/:weekId/:dayId', async function (req, res, next) {
    let targetId = req.params.targetId;
    let weekId = req.params.weekId;
    let dayId = req.params.dayId;

    let user = await User.findOne({ username: req.session.username });
    let target = user.targets.id(targetId);


    console.log('target.weeks :>> ', target.weeks);
    let belongsToCurrentUser = false;
    for (let i = 0; i < target.weeks.length; i++) {
        const id = target.weeks[i];
        if (weekId == id) {
            belongsToCurrentUser = true;
            break;
        }
    }

    if (belongsToCurrentUser) {
        let week = await Week.findById(weekId);
        console.log('week :>> ', week);
        console.log('dayId :>> ', dayId);
        let day = week.days.id(dayId);
        res.send({
            day: day,
            success: true
        });
    } else {
        res.status(401);    // Unauthorized
        res.send({
            msg: "Failed to find the specified Day belonging to the current user."
        })
    }
});


// Update - Day
router.put('/days/:targetId/:weekId/:dayId', async function (req, res, next) {
    try {
        let targetId = req.params.targetId;
        let weekId = req.params.weekId;
        let dayId = req.params.dayId;

        let user = await User.findOne({ username: req.session.username });
        let target = user.targets.id(targetId);


        console.log('target.weeks :>> ', target.weeks);
        let belongsToCurrentUser = false;
        for (let i = 0; i < target.weeks.length; i++) {
            const id = target.weeks[i];
            if (weekId == id) {
                belongsToCurrentUser = true;
                break;
            }
        }

        if (belongsToCurrentUser) {
            let week = await Week.findById(weekId);
            console.log('week :>> ', week);
            console.log('dayId :>> ', dayId);
            let day = week.days.id(dayId);

            const { addAmount } = req.body;
            day.workTime += addAmount;

            await week.save();
            res.send({
                msg: 'Successfully updated day',
                success: true,
                day: day
            });
        } else {
            res.status(401);    // Unauthorized
            res.send({
                msg: "Failed to find the specified Day belonging to the current user."
            })
        }
    } catch (error) {
        next(error);
    }
});

// Delete - Day
router.delete('/days/:targetId/:weekId/:dayId', async function (req, res, next) {
    try {
        let targetId = req.params.targetId;
        let weekId = req.params.weekId;
        let dayId = req.params.dayId;

        let user = await User.findOne({ username: req.session.username });
        let target = user.targets.id(targetId);


        console.log('target.weeks :>> ', target.weeks);
        let belongsToCurrentUser = false;
        for (let i = 0; i < target.weeks.length; i++) {
            const id = target.weeks[i];
            if (weekId == id) {
                belongsToCurrentUser = true;
                break;
            }
        }

        if (belongsToCurrentUser) {
            let week = await Week.findById(weekId);
            console.log('week :>> ', week);
            console.log('dayId :>> ', dayId);
            let day = week.days.id(dayId);

            if (week.days.length === 1) {
                // Parent week has length 1, delete the entire week and delete it's reference from Target.weeks

                // Delete reference from Target
                console.log('target.weeks :>> ', typeof (target.weeks[0]));
                for (let i = 0; i < target.weeks.length; i++) {
                    const id = target.weeks[i];
                    if (id.equals(weekId)) {
                        target.weeks.splice(i, 1);
                        break;
                    }
                }
                await user.save();

                // Delete the week
                await Week.findByIdAndDelete(weekId);
                res.send({
                    msg: 'Successfully deleted day and week.',
                    oldWeek: week
                });
            } else {
                // Delete a specific day from a week
                week.days.id(dayId).remove();
                await week.save();
                res.send({
                    msg: 'Successfully deleted day.',
                    oldDay: day
                });
            }
        } else {
            res.status(401);    // Unauthorized
            res.send({
                msg: "Failed to find the specified Day belonging to the current user."
            })
        }
    } catch (error) {
        next(error);
    }
});


module.exports = router;

