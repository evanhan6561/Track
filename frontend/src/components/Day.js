import React from 'react';

import '../css/Day.css';
import '../css/PulsingCircle.css';
import DayEditModal from '../modals/DayEditModal';

const Day = ({ currentTarget, setCurrentTarget, setTargets, workDay, day, inMonth }) => {
    let style = {};

    // Change the color of days that are not in the month
    if (!inMonth) {
        style.color = 'silver';
    }

    // Apply styling to workdays
    let pulsingCircle = null;
    if (workDay) {
        let workTime = workDay.workTime     // Stored as seconds in API
        
        let minDiameter = 40; // 40% of height of div
        let maximumDiameter = 180;  // 180% of height of div
        let timeToMax = 8 * 60 * 60; // seconds
        // Linear scaling with workTime for how large the circle will be
        // diameter = (160 / [8 * 60 * 60]) x + 40
        //  - I decided maximum diameter should be 200px, min diameter should be 40px
        //  - Maximum possible diameter can only be achieved after 8 hrs input.
        let slope = (maximumDiameter - minDiameter) / (timeToMax);

        // results
        let diameter = slope * workTime + minDiameter;
        let offset = Math.floor(diameter / 2);      // Center the circle on the bottom left corner
        diameter += '%';
        offset = offset * -1 + '%';

        pulsingCircle = <div className="pulsing-circle" style={{height: diameter, width: diameter, bottom: offset, left: offset}}></div>

        // Scale size with workTime only, let's say max size should be @ 8hrs work, or 8 * 60 * 60 seconds.

    }

    return (
        <td className='day-cell' style={{...style, position: 'relative', overflow: 'hidden'}}>
            <DayEditModal
                setTargets={setTargets}
                targetId={currentTarget ? currentTarget._id : null}
                setCurrentTarget={setCurrentTarget}
                inputDate={day}
            >
                <div className='day' style={{height: '100%', width: '100%'}}>
                    <div className='day-date-header'>{day.getDate()}</div>
                    {workDay ? (<div>{secToDisplay(workDay.workTime)}</div>) : null}
                </div>
            </DayEditModal>
            {pulsingCircle}
        </td>
    );
}

export default Day;


function secToMin(seconds) {
    return Math.floor(seconds / 60);
}

function secToDisplay(seconds){
    let min = secToMin(seconds);

    // Display minutes if less than one hour
    if (min < 60){
        return `${min} min`;
    }

    // Numerically Calculate the number of hours including decimal
    let hours = Math.floor(min / 60);
    let remainingMin = hours % 60;
    let decimalMin = remainingMin / 60; // Format as
    let finalHours = hours + decimalMin;

    // Display the number of hours with only a single decimal
    let displayString = finalHours.toFixed(1); // Only display 1 decimal

    // Omit the decimal if the displayString ends with '.0'
    if (displayString[displayString.length - 1] === '0'){
        displayString = displayString.substr(0, displayString.length - 2);
    }
    return `${displayString} hrs`;
}