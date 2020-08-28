import React, { useState } from 'react';

/**
 * Returns a Date object that is at the most recent UTC sunday with zeroed time.
 * @param {Date} d 
 * @return {Date} - Date object representing UTC Sunday with time 00:00:00
 */
export function mostRecentUTCSunday(d) {
    let temp = new Date(d);
    temp.setUTCDate(temp.getUTCDate() - temp.getUTCDay());
    temp.setUTCHours(0, 0, 0, 0);
    return temp;
}

export function localToSameDayUTC(d) {
    let [year, month, day] = parseLocalDateString(d);

    // Copy Date
    let newUTC = new Date();
    newUTC.setUTCFullYear(year);
    newUTC.setUTCMonth(month - 1);  // Months are 0-11 for Date objects but 1-12 irl.
    newUTC.setUTCDate(day);

    // Zero Time
    newUTC.setUTCHours(0, 0, 0, 0);
    return newUTC;
}

/** Returns the Month, Day, Year of local time as an array
 * @param {Date} d - A date initialized to some timezone through utcToZonedTime(),
 * @return {[Year, Month, Day]} 
 */
function parseLocalDateString(d) {
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

export function bisectLeft(arr, item, lessThan) {
    let lo = 0;
    let hi = arr.length;

    while (lo < hi) {
        let mid = (lo + hi) >> 1;
        if (lessThan(arr[mid], item)) {
            lo = mid + 1;
        } else {
            hi = mid
        }
    }
    return lo
}

// Can't use hooks like 'useFetch' within function calls. This is a normal fetch.
export async function fetchCall(url, extraOptions = {}) {
    try {
        // Initialize Fetch Options
        let defaultOptions = {
            credentials: 'include'
        }
        let options = Object.assign(defaultOptions, extraOptions);

        // Make the fetch call
        const response = await fetch(url, options);
        const respJSON = await response.json();
        return respJSON;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export function numToMonth(n) {
    let month;
    switch (n) {
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
export function getMonth(d) {
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