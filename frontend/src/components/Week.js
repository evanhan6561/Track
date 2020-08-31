import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Day from './Day';
import '../css/Week.css'
import { getMonth } from '../utils';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const daysInWeek = 7;

const Week = ({ setTargets, currentTarget, setCurrentTarget, workWeek, sunday, viewedMonth, weeksToDisplay, isCompleted }) => {
    const {loggedIn} = useContext(AuthContext);

    let weekStyle = {
        height: '' + (100 / weeksToDisplay) + '%'
    }
    if (isCompleted && loggedIn){
        weekStyle.borderLeft = '5px solid rgba(226, 194, 255, 1)'
        // weekStyle.borderTop = '5px solid rgba(226, 194, 255, 1)'
        // weekStyle.borderBottom = '5px solid rgba(226, 194, 255, 1)'
        // weekStyle.borderRight = '5px solid rgba(226, 194, 255, 1)'

        weekStyle.backgroundColor = '#A1F7E9'
        weekStyle.backgroundColor = 'rgba(161, 247, 233, 0.5)'
        weekStyle.zIndex = '10';
    }

    // No workWeek logic
    let dayDates = [];
    let dayOfWeek = new Date(sunday);
    for (let i = 0; i < daysInWeek; i++) {
        dayDates.push(new Date(dayOfWeek));       // JavaScript arrays store objects by reference. Must make a new Date object
        dayOfWeek.setDate(dayOfWeek.getDate() + 1);
    }

    let dayComponents = dayDates.map(date => {
        // Check if the date is within the viewedMonth or not to apply styling
        let extra = {
            inMonth: false,
            workDay: null
        }

        // Whether or not to apply grayed out styling for out of month days
        if (getMonth(date) === viewedMonth) {
            extra.inMonth = true;
        }

        // Perform O(n^2) comparisons. Should be ok, n <= 7.
        // Yes workWeek logic
        if (workWeek) {
            // Construct an array parallel to workWeek.days of just the dates.
            let workDays = workWeek.days.map(day => {
                return new Date(day.date);
            });

            for (let i = 0; i < workDays.length; i++) {
                const workDay = workDays[i];
                let sameYear = workDay.getUTCFullYear() === date.getFullYear();
                let sameMonth = workDay.getUTCMonth() === date.getMonth();
                let sameDay = workDay.getUTCDate() === date.getDate();

                if (sameYear && sameMonth && sameDay){
                    extra.workDay = workWeek.days[i];   // Pass in the API date object, not just the date.
                    break;
                }
            }
        }
        return <Day setTargets={setTargets} currentTarget={currentTarget} setCurrentTarget={setCurrentTarget} day={date} key={uuidv4()} {...extra} />;
    })

    return (

        <tr className='week' style={weekStyle}>
            {dayComponents}
        </tr>
    );
}

export default Week;