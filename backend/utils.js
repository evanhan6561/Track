const fns = require('date-fns');
const tz = require('date-fns-tz');


/*  Date Object Output formats:
Location-Independent:
 - toISOString(): "2020-08-20T16:01:41.638Z"
 - toUTCString(): "Thu, 20 Aug 2020 16:01:41 GMT"

Location-Dependent:
 - toDateString(): "Thu Aug 20 2020"
 - toLocaleDateString(): "8/20/2020"
 - toLocaleTimeString(): "11:01:41 AM"
 - toLocaleString(): "8/20/2020, 11:01:41 AM"

Browser Dependent, avoid:
 - toString(): "Thu Aug 20 2020 11:01:41 GMT-0500 (Central Daylight Time)"  
 */

function epochToLocalSunday(epochMS, timeZone) {
    let utcISOString = (new Date(epochMS)).toISOString();
    let localDate = toDate(utcISOString, { timeZone: timeZone });
    let inputLocalSunday = tz.zonedTimeToUtc(fns.startOfWeek(localDate), timeZone);
    return inputLocalSunday;
}


/**
 * Returns a Date object that is at the most recent UTC sunday with zeroed time.
 * @param {Date} d 
 * @return {Date} - Date object representing UTC Sunday with time 00:00:00
 */
function mostRecentUTCSundayDate(d) {
    let temp = new Date(d);
    temp.setUTCDate(temp.getUTCDate() - temp.getUTCDay());
    temp.setUTCHours(0, 0, 0, 0);
    return temp;
}


function haveSameMostRecentUTCSunday(d1, d2) {
    let d1Sunday = mostRecentUTCSundayDate(d1);
    let d2Sunday = mostRecentUTCSundayDate(d2);

    // Sanity Check: make sure that d1Sunday and d2Sunday are actually sunday locally
    if (d1Sunday.getDay() !== 0) {
        throw Error('Critical Error: d1Sunday is not a Sunday locally.');
    }
    if (d2Sunday.getDay() !== 0) {
        throw Error('Critical Error: d2Sunday is not a Sunday locally.');
    }

    let sameYear = d1Sunday.getFullYear() === d2Sunday.getFullYear();
    let sameMonth = d1Sunday.getMonth() === d2Sunday.getMonth();
    let sameDay = d1Sunday.getDate() === d2Sunday.getDate();
    if (sameYear && sameMonth && sameDay) {
        return true;
    }
    return false;
}

/**
 * A function meant to print the effect of custom functions on the furthest ahead and furthest ahead timezones.
 * Kiribati can be UTC+14
 * Samoa can be UTC-11
 * @param {Date} d - Some date initialized to some timezone.
 */
function test(d) {
    let kiribatiDate = tz.utcToZonedTime(d, 'Pacific/Tarawa');
    let samoaDate = tz.utcToZonedTime(d, 'Pacific/Pago_Pago');
    let dict = {
        Local: d,
        Kiribati: kiribatiDate,
        Samoa: samoaDate
    }
    for (const [key, val] of Object.entries(dict)) {
        console.log(`${key}`);
        console.log('Local:', val.toLocaleDateString());
        console.log(`UTC: ${val.toUTCString()}`);
        // console.log('My Function:', localToSameDayUTC(val));
        printLocalAndUTC(val);
        console.log()
    }
}

/** Returns the Month, Day, Year of local time as an array
 * @param {Date} d - A date initialized to some timezone through utcToZonedTime(),
 * @return {[Year, Month, Day]} 
 */
function parseLocalDateString(d) {
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}


/** Returns the Month, Day, Year of UTC time as an array
 * @param {Date} d - Some date
 * @return {[Year, Month, Day]} 
 */
function parseUTCDateString(d) {
    return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
}


function printLocalAndUTC(d) {
    console.log(`Local: ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
    console.log(`UTC: ${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`);
}


/**
 * Takes a Date object in local time and spits out a Date object that has the same date in UTC with zeroed time.
 * If the input is 1/31/2020 in local time, the output will be a Date that has 1/31/2020 in UTC.
 * @param {Date} d 
 */
function localToSameDayUTC(d) {
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


// Bisect Like Behavior taken from Python's Bisect_Left source code:
function bisectLeft(arr, item, lessThan) {
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


function testBisect() {
    function lessThan(a, b) {
        return a < b;
    }

    let a = [1, 100];
    a = [1, 10, 50, 70, 100]
    // a = [1]
    let item = 110;

    console.log('Insertion Point:', bisectLeft(a, item, lessThan))
    insert(a, item, lessThan);
    console.log('Post Insert:', a);
}


function insert(arr, item, comparator) {
    let insertionIndex = bisectLeft(arr, item, comparator);
    arr.splice(insertionIndex, 0, item);
}


module.exports = {
    epochToLocalSunday: epochToLocalSunday,
    printLocalAndUTC: printLocalAndUTC,
    parseLocalDateString: parseLocalDateString,
    parseUTCDateString: parseUTCDateString,
    localToSameDayUTC: localToSameDayUTC,
    haveSameMostRecentUTCSunday: haveSameMostRecentUTCSunday,
    bisectLeft: bisectLeft
}