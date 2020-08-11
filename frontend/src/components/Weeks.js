import React from 'react';
import Week from './Week';
import { v4 as uuidv4 } from 'uuid';

import '../css/Weeks.css'

const weeksToDisplay = 6

const Weeks = ({ date, viewedMonth }) => {
    // The passed date is always on the first day of the month
    // Get the dates of the Sundays of 6 contiguous weeks
    let sundayDates = [];
    let sunday = previousSunday(date);

    for (let i = 0; i < weeksToDisplay; i++) {
        sundayDates.push(sunday);
        sunday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 7);
    }

    let sundayComponents = sundayDates.map(date => {
        return (
            <Week key={uuidv4()} sunday={date} viewedMonth={viewedMonth} weeksToDisplay={weeksToDisplay}/>
        )
    })

    return (
        <table className='calendar'>
            <thead className='calendar-header'>
                <tr className='day-names'>
                    <th className='day-name'>Sunday</th>
                    <th className='day-name'>Monday</th>
                    <th className='day-name'>Tuesday</th>
                    <th className='day-name'>Wednesday</th>
                    <th className='day-name'>Thursday</th>
                    <th className='day-name'>Friday</th>
                    <th className='day-name'>Saturday</th>
                </tr>
            </thead>

            <tbody className='weeks'>
                {sundayComponents}
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
    return copy;
}