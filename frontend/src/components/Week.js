import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Day from './Day';
import '../css/Week.css'
import {getMonth} from '../utils';

const daysInWeek = 7;

const Week = ({ sunday, viewedMonth, weeksToDisplay }) => {
    let weekStyle = {
        height: '' + (100 / weeksToDisplay) + '%'
    }


    let dayDates = [];
    let dayOfWeek = new Date(sunday);
    for (let i = 0; i < daysInWeek; i++) {
        dayDates.push(new Date(dayOfWeek));       // JavaScript arrays store objects by reference. Must make a new Date object
        dayOfWeek.setDate(dayOfWeek.getDate() + 1);
    }

    let dayComponents = dayDates.map(date => {
        // Check if the date is within the viewedMonth or not to apply styling
        if (getMonth(date) === viewedMonth) {
            return (
                <Day day={date} key={uuidv4()} inMonth={true} />
            )
        }else{
            return (
                <Day day={date} key={uuidv4()} inMonth={false}/>
            )
        }
    })

    return (
        
        <tr className='week' style={weekStyle}>
            {dayComponents}
        </tr>
    );
}

export default Week;