import React, {useState} from 'react';
import { useEffect } from 'react';
import {numToMonth, getMonth} from '../utils'

import Weeks from './Weeks';
import Sidebar from './Sidebar';

import '../css/Layout.css';


/** Month Component: Note that Date Objects use 0-11 to describe months. This is unintuitive so 
 * 
 */
const Layout = () => {
    // Handle the date
    let today = new Date();
    today.setDate(1);
    const [date, setDate] = useState(today);

    const prevMonth = (e) => {
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    }

    const nextMonth = (e) => {
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    }

    useEffect(() => {
        console.log('Rendered')
    }) 

    return (
        <main>
            <header>
                <div className='logo'>Track.</div>

                <div className='month-view-header'>
                    <div className='month-year-header'>
                        {numToMonth(date.getMonth() + 1)} {date.getFullYear()}
                    </div>
                    <div>
                        <input type='button' value='Prev' onClick={prevMonth}/>
                        <input type='button' value='Next' onClick={nextMonth}/>
                        <input type='button' value='Today' onClick={() => setDate(today)}/>
                        <input type='button' value='Rerender' onClick={() => setDate(new Date(date))}/>
                    </div>
                </div>
            </header>
            
            <Sidebar />
            

            <Weeks date={date} viewedMonth={getMonth(date)}/>
        </main>
    );
}
 
export default Layout;

