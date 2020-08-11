import React from 'react';
import '../css/Day.css'

const Day = ({day, inMonth}) => {
    let style = {};
    if (!inMonth){
        style = {color: 'silver'};
    }

    return (
        <td className='day-cell' style={style}>
            <div className='day'>
                <div className='day-date-header'>{day.getDate()}</div>
            </div>
        </td>
    );
}
 
export default Day;