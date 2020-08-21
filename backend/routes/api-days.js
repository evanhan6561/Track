const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Week = require('../models/week');
const fns = require('date-fns');
const tz = require('date-fns-tz');

const { epochToLocalSunday, printLocalAndUTC, printStartAndEndOfDay, localToSameDayUTC, bisectLeft, haveSameMostRecentUTCSunday } = require('../utils');
// C R U D operations

// Create Day - expects the ObjectId of a specified target.
router.post('/days/:id', async function (req, res, next) {
    try {
        // Authorization Check - make sure the current session user owns this target.
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

        /*
        1. Check if a new 'Week' document should be constructed:
             - If there exists a Week whose Sunday is the same as the input day, do not create a new Week.

        Implementation:
            -   Make sure that the 'weeks' array of ObjectId's of the specified 'target' is maintained in sorted order for binary search.
            -   Find the Sunday of the input 'date' 
            -   Use a function similar to Python's bisect module to find the index where that Sunday would be inserted.
            -   If that index contains a Week with the same date, then we will be working with that Week.
            -   Else we will insert create a new Week and append its ObjectId such that sorted order is maintained.

        Design Choice:
            - If a user deposits time on 1/31/2020, then no matter what timezone you view it from, it should always be in 1/31
                - How?
                    1. Take the Unix Timestamp and Timezone inputs to reconstruct local time w/ utcToZonedTime()
                    2. Use this local time to construct a UTC Date object with matching year, month, day
                    3. Store and send this UTC date object that is timezone independent.

                - Downsides
                    1. The year, month, date will be preserved, but everything else is kind of scrambled.
        */
        
        // We have an array of ObjectId's. We can pull the desired documents by calling 'populate(collectionName)'
        let weeksIDs = target.weeks;
        let weeks = target.weeks.populate('week');

        let localDate = tz.utcToZonedTime(inputDate, timeZone);

        let utcSameDay = localToSameDayUTC(localDate);
        let utcSunday = mostRecentUTCSunday(utcSameDay);
        // Check if any of the weeks have the same Sunday as utcSameDay
        function weekLessThan(w1, w2){
            // Get a Date object day from both weeks. The Date objects represents a single day.
            let d1 = w1[0]
            let d2 = w2[0]  

            // Get the most recent Sunday
            let sunday_1 = mostRecentUTCSunday(d1);
            let sunday_2 = mostRecentUTCSunday(d2);

            return sunday_1 < sunday_2;
        }

        let weeksInsertionIndex = bisectLeft(weeks, utcSunday, weekLessThan);
        if (weeksInsertionIndex >= weeks.length){
            // Automatically insert a new week if the insertion point is out of bounds
            let newDay = {
                workTime: workTime,
                date: utcSameDay
            }
            await Week.create({weeklyTargetTime: target.weeklyTargetTime, days: [newDay]})
            arr.splice(weekInsertionIndex, 0, item);

        }else{
            // We can safely compare for equality now
            if (haveSameMostRecentUTCSunday(weeks[weeksInsertionIndex][0], utcSameDay)){
                let reusedWeek = weeks[weeksInsertionIndex];
                
                // Check if the reusedWeek has any days with the same day.
                // If so, then add workTime to that day.
                // Else, push a new Day object into the reused week.
                let notContained = true;
                for (let i = 0; i < reusedWeek.length; i++) {
                    const day = reusedWeek[i];
                    if (utcSameDay.getTime() === day.getTime()){
                        day.workTime += workTime;
                        notContained = false;
                        break;
                    }
                }

                if (notContained){
                    let newDay = {
                        workTime: workTime,
                        date: utcSameDay
                    }
                    reusedWeek.push(newDay);
                    reusedWeek.save();
                }
            }else{
                let newDay = {
                    workTime: workTime,
                    date: utcSameDay
                }
                await Week.create({weeklyTargetTime: target.weeklyTargetTime, days: [newDay]})
                arr.splice(weekInsertionIndex, 0, item);
            }
        }

    } catch (error) {
        next(error);
    }
});

module.exports = router;