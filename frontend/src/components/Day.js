import React from 'react';

import '../css/Day.css';
import DayEditModal from '../modals/DayEditModal';

const Day = ({ currentTarget, setCurrentTarget, setTargets, workDay, day, inMonth }) => {
    let style = {};

    // Change the color of days that are not in the month
    if (!inMonth) {
        style.color = 'silver';
    }

    // Apply styling to workdays
    // Todo: add styling such that it scales with how much time is put in
    if (workDay) {
        let workTime = workDay.workTime     // Stored as seconds in API
        style.border = '2px solid blue';
    }

    return (
        <td className='day-cell' style={style}>
            <DayEditModal
                setTargets={setTargets}
                targetId={currentTarget ? currentTarget._id : null}
                setCurrentTarget={setCurrentTarget}
                inputDate={day}
            >
                <div className='day'>

                    <div className='day-date-header'>{day.getDate()}</div>
                    {workDay ? (<div>{secToMin(workDay.workTime)} min</div>) : null}

                </div>
            </DayEditModal>
        </td>
    );
}

export default Day;


function secToMin(seconds) {
    return Math.floor(seconds / 60);
}