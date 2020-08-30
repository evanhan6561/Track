import React from 'react';
import Week from './Week';
import { v4 as uuidv4 } from 'uuid';

import '../css/Weeks.css'
import { bisectLeft, mostRecentUTCSunday, localToSameDayUTC } from '../utils';
import { useEffect, useState } from 'react';

// Display 6 weeks
const WEEKS_TO_DISPLAY = 6

const Weeks = ({ setTargets, currentTarget, setCurrentTarget, date, viewedMonth }) => {
    const [workWeeks, setWorkWeeks] = useState([]);

    // Inject the work days of currentTarget if they occur within the current view.
    // Rerender weeks component if the currentTarget/date changes.
    useEffect(() => {
        // Todo: Bug within this function. Does not include the last week.

        if (currentTarget) {
            // Use bisectLeft to perform binary search to find the starting position.
            function lessThan(week, firstSunday) {
                // Use some day w/in the week to calculate that week's sunday
                const someDayOfWeek = week.days[0].date;
                let sundayOfWeek = mostRecentUTCSunday(someDayOfWeek);

                return sundayOfWeek < firstSunday;
            }

            
            let pureDates = currentTarget.weeks.map(week => {
                return week.days[0].date;
            })
            console.log('currentTarget.weeks Dates :>> ', pureDates);

            // Assumption: if 1/31/2020 in UTC is a Sunday, 1/31/2020 is a Sunday in all local timezones
            let weeks = currentTarget.weeks;
            let firstSunday = previousSunday(date);
            firstSunday = localToSameDayUTC(firstSunday);               // Normalize the local Sunday to a UTC date.
            let startIndex = bisectLeft(weeks, firstSunday, lessThan);  // Use 'binary search' to find start in O(log n)

            // Immediately exit if bisectLeft tells us out of bounds
            if (startIndex >= weeks.length) {
                setWorkWeeks([]);   // No work weeks fall in the current view. 
                return;
            }

            // Otherwise check if weeks[i] contains day(s) that fall into the current view
            let workWeeksInView = [];
            let currentIndex = startIndex;
            let lastSunday = new Date(firstSunday.getFullYear(), firstSunday.getMonth(), firstSunday.getDate());
            lastSunday.setDate(lastSunday.getDate() + ((WEEKS_TO_DISPLAY) * 7));
            lastSunday = mostRecentUTCSunday(localToSameDayUTC(lastSunday));     // Normalize local -> UTC

            // Sanity Check: Is lastSundayNormalized actually a UTC Sunday?
            if (lastSunday.getUTCDay() !== 0) {
                throw Error('Critical Error: lastSundayNormalized is not a Sunday');
            }

            while (currentIndex < weeks.length) {
                let workWeekDay = weeks[currentIndex].days[0].date;
                // If the sunday of a current week is ahead of a local date, break.

                // Check if the current week's normalized sunday date is within the range of our view.
                let workWeekSunday = mostRecentUTCSunday(workWeekDay);
                let afterStartOfView = workWeekSunday >= firstSunday;
                let beforeEndOfView = workWeekSunday <= lastSunday;

                if (afterStartOfView && beforeEndOfView) {
                    workWeeksInView.push(weeks[currentIndex]);
                    currentIndex++;
                } else {
                    break;
                }
            }

            // Sanity Check: There are no more weeksInView than are possible 
            if (workWeeksInView.length > WEEKS_TO_DISPLAY) {
                throw Error('Critical Error: More work weeks are considered are view than is allowed.');
            }

            setWorkWeeks(workWeeksInView);
        }
    }, [currentTarget, date]);

    // Calendar Skeleton Logic -------------------------------
    // The passed date is always on the first day of the month
    // Get the dates of the Sundays of 6 contiguous weeks
    let sundayDates = [];
    let sunday = previousSunday(date);

    for (let i = 0; i < WEEKS_TO_DISPLAY; i++) {
        sundayDates.push(sunday);

        let copy = new Date(sunday);
        copy.setDate(copy.getDate() + 7);
        sunday = copy;
    }

    // Work Week injection. Iterating over two arrays: workWeeks and sundayDates.
    let weekComponents = [];
    let j = 0;      // Pointer for indexing workWeeks
    for (let i = 0; i < sundayDates.length; i++) {
        const calendarSunday = sundayDates[i];
        let defaultProps = {
            key : uuidv4(),
            sunday : calendarSunday,
            viewedMonth : viewedMonth,
            weeksToDisplay : WEEKS_TO_DISPLAY,
            setTargets: setTargets,
            currentTarget: currentTarget,
            setCurrentTarget: setCurrentTarget
        }

        if (j < workWeeks.length) {
            let workWeek = workWeeks[j];
            let workWeekUTCSunday = mostRecentUTCSunday(new Date(workWeek.days[0].date));
            let calendarSundayUTC = localToSameDayUTC(calendarSunday);

            if (workWeekUTCSunday.getTime() === calendarSundayUTC.getTime()) {
                // Accumulate all the workTime in a workWeek to see if we should apply completion styling
                let completionCutoff = workWeek.weeklyTargetTime * 60 * 60; // hr -> seconds
                let totalWorkTime = workWeek.days.reduce((sum, currentDayDoc) => {
                    let currentWorkTime = currentDayDoc.workTime;
                    return sum + currentWorkTime;
                }, 0);


                // custom styling on week completion
                let isCompleted = false;
                if (totalWorkTime > completionCutoff){
                    console.log('Cutoff met');
                    isCompleted = true;
                }

                console.log('In workWeek injection', completionCutoff, totalWorkTime);
                weekComponents.push(
                    <Week workWeek={workWeek} {...defaultProps} isCompleted={isCompleted}/>
                )
                j++;
            }else{
                weekComponents.push(
                    <Week {...defaultProps} />
                )
            }
        }else{
            weekComponents.push(
                <Week {...defaultProps} />
            )
        }
    }

    return (
        <table className='calendar'>
            <thead className='calendar-header'>
                <tr className='day-names'>
                    <th className='day-name'>Sun</th>
                    <th className='day-name'>Mon</th>
                    <th className='day-name'>Tue</th>
                    <th className='day-name'>Wed</th>
                    <th className='day-name'>Thu</th>
                    <th className='day-name'>Fri</th>
                    <th className='day-name'>Sat</th>
                </tr>
            </thead>

            <tbody className='weeks'>
                {weekComponents}
            </tbody>
        </table>
    );
}

export default Weeks;

/**
 * From: https://stackoverflow.com/questions/12791378/get-the-most-recently-occurring-sunday
 * Input a Date object and get the Date object of the most recent Sunday
 * @param {Date} d - Date object you would like to find the previous Sunday of
 * @return {Date} Returns a new date object corresponding to last Sunday
 */
function previousSunday(d) {
    let copy = new Date(d);
    copy.setDate(copy.getDate() - copy.getDay());
    copy.setHours(0, 0, 0, 0);  // Normalize time by setting all of it to 0
    return copy;
}