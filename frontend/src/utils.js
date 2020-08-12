import React, {useState} from 'react';

export function numToMonth(n){
    let month;
    switch(n){
        case 1:
            month = 'January';
            break;
        case 2:
            month = 'February'
            break;
        case 3:
            month = 'March';
            break;
        case 4:
            month = 'April'
            break;
        case 5:
            month = 'May';
            break;
        case 6:
            month = 'June'
            break;
        case 7:
            month = 'July';
            break;
        case 8:
            month = 'August'
            break;
        case 9:
            month = 'September';
            break;
        case 10:
            month = 'October'
            break;
        case 11:
            month = 'November';
            break;
        case 12:
            month = 'December'
            break;
        default:
            month = undefined
    }
    return month;
}

/**
 * Date objects return months in the range of 0-11 which is unintuitive. This is a wrapper function that'll let me
 * get around this and instead return 1-12.
 * @param {Date} d - date whose month is to be extracted
 * @returns {Number} An integer from 1 - 12
 */
export function getMonth(d){
    return d.getMonth() + 1;
}


/* https://stackoverflow.com/questions/55757761/handle-an-input-with-react-hooks
    A reusable way of handling the state of forms

    i.e. {id: 'username-input', label: 'Username:', type: 'text'}
*/
export function useInput(options) {
    const [value, setValue] = useState("");
    const input = (
        <>
            <label htmlFor={options.id}>{options.label}</label><br />
            <input id={options.id} value={value} onChange={e => setValue(e.target.value)} type={options.type} />
        </>
    );
    return [value, input];
}