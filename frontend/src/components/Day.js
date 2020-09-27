import React from 'react';

import '../css/Day.css';
import '../css/PulsingCircle.css';
import DayEditModal from '../modals/DayEditModal';
import { useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Day = ({ currentTarget, setCurrentTarget, setTargets, workDay, day, inMonth }) => {
    const {loggedIn} = useContext(AuthContext);

    let dayRef = useRef(null);
    let pulseRef = useRef(null);

    let style = {};

    // Change the color of days that are not in the month
    if (!inMonth) {
        style.color = 'silver';
    }

    // Apply styling to workdays
    let pulsingStyle = {
        height: 0,
        width: 0,
        bottom: 0,
        left: 0
    }

    // I want the circle to be aware of how large it is rendered and scale the css to its display height.
    useEffect(() => {
        if (workDay && loggedIn) {
            // Make Circle Diameter scale linearly with clientHeight
            // diameter = ([maxDiameter - minDiameter] / [timeToMax]) x + minDiameter
            const clientHeight = dayRef.current.clientHeight;
            const workTime = workDay.workTime           // Stored as seconds in API

            const minDiameter = .4;                     // Minimum diameter of the circle is 40% of clientHeight
            const maxDiameter = 1.8;                    // Maximum diameter of the circle is 180% of clientHeight
            const timeToMax = 8 * 60 * 60;              // Time to reach maxDiameter in seconds
            const slope = (maxDiameter - minDiameter) / (timeToMax);

            // Resultant dimensions. Currently styled such that the circle is centered in bottom left corner.
            let diameterPercent = slope * workTime + minDiameter;
            let diameter = diameterPercent * clientHeight;
            let offset = Math.floor(diameter / 2);

            diameter += 'px';
            offset = offset * -1 + 'px';

            // Set the attributes. 
            pulseRef.current.style.height = diameter;
            pulseRef.current.style.width = diameter;
            pulseRef.current.style.bottom = offset;
            pulseRef.current.style.left = offset;
        }
    })

    return (
        <td className='day-cell' ref={dayRef} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
            <DayEditModal
                setTargets={setTargets}
                targetId={currentTarget ? currentTarget._id : null}
                setCurrentTarget={setCurrentTarget}
                inputDate={day}
            >
                <div className='day' style={{ height: '100%', width: '100%' }}>
                    <div className='day-date-header'>{day.getDate()}</div>
                    {workDay && loggedIn ? (<div>{secToDisplay(workDay.workTime)}</div>) : null}
                </div>
            </DayEditModal>
            {workDay && loggedIn ? <div className="pulsing-circle" ref={pulseRef} style={pulsingStyle}></div> : null}
        </td>
    );
}

export default Day;


function secToMin(seconds) {
    return Math.floor(seconds / 60);
}

function secToDisplay(seconds) {
    let min = secToMin(seconds);

    // Display minutes if less than one hour
    if (min < 60) {
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
    if (displayString[displayString.length - 1] === '0') {
        displayString = displayString.substr(0, displayString.length - 2);
    }

    return `${displayString} hr ${remainingMin} min`;
}