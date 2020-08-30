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
    // Todo: add styling such that it scales with how much time is put in
    let pulsingCircle = null;
    if (workDay) {
        let workTime = workDay.workTime     // Stored as seconds in API
        
        let minDiameter = 40; // in px
        let maximumDiameter = 180;
        let timeToMax = 8 * 60 * 60; // seconds
        // Linear scaling with workTime for how large the circle will be
        // diameter = (160 / [8 * 60 * 60]) x + 40
        //  - I decided maximum diameter should be 200px, min diameter should be 40px
        //  - Maximum possible diameter can only be achieved after 8 hrs input.
        let slope = (maximumDiameter - minDiameter) / (timeToMax);

        // results
        let diameter = slope * workTime + minDiameter;
        let offset = Math.floor(diameter / 2);      // Center the circle on the bottom left corner
        diameter += 'px';
        offset = offset * -1 + 'px';

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
                    {workDay ? (<div>{secToMin(workDay.workTime)} min</div>) : null}
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