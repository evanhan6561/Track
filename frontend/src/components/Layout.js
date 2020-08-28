import React, { useState } from 'react';
import { useEffect, useContext } from 'react';
import { numToMonth, getMonth, fetchCall } from '../utils';
import { AuthContext } from '../contexts/AuthContext';

import Weeks from './Weeks';
import Sidebar from './Sidebar';
import '../css/Layout.css';
import '../css/Icon.css';
import AccountButtons from './AccountButtons';


/** Month Component: Note that Date Objects use 0-11 to describe months. This is unintuitive so 
 * 
 */
const Layout = () => {
    // API Handling and API State
    const { loggedIn } = useContext(AuthContext);
    const [targets, setTargets] = useState(null);
    const [currentTarget, setCurrentTarget] = useState(null);

    // Retrieve all data associated with a user when they login
    useEffect(() => {
        const retrieveTargets = async () => {
            if (loggedIn) {
                let url = process.env.REACT_APP_API_HOST + '/api/targets';
                let json = await fetchCall(url);
                console.log('Layout Component - Retrieve All Targets :>> ', json);
                setTargets(json.targets);

                // Set currentTargetId to the very first item in targets if any exist.
                if (json.targets.length > 0){
                    setCurrentTarget(json.targets[0]);
                }
            }
        }

        retrieveTargets();
    }, [loggedIn, setTargets]);

    // Non API-Dependent Logic
    // Handle the date. Default view is on the current month.
    let today = new Date();
    today.setDate(1);
    const [date, setDate] = useState(today);

    const prevMonth = (e) => {
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    }

    const nextMonth = (e) => {
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    }

    return (
        <>
            <main>
                <header>
                    <div className='logo'>Track.</div>

                    <div className='month-view-header'>
                        <div className='month-year-header'>
                            {numToMonth(date.getMonth() + 1)} {date.getFullYear()}
                        </div>
                        <div>
                            <input type='button' value='Prev' onClick={prevMonth} />
                            <input type='button' value='Next' onClick={nextMonth} />
                            <input type='button' value='Today' onClick={() => setDate(today)} />
                            <input type='button' value='Rerender' onClick={() => setDate(new Date(date))} />
                        </div>
                        <div>
                            <AccountButtons />
                        </div>
                    </div>
                </header>

                <Sidebar 
                    currentTarget={currentTarget} 
                    setCurrentTarget={setCurrentTarget} 

                    targets={targets} 
                    setTargets={setTargets}
                />
                <Weeks 
                    currentTarget={currentTarget} 
                    setCurrentTarget={setCurrentTarget}

                    date={date} 
                    viewedMonth={getMonth(date)}

                    setTargets={setTargets}
                />
            </main>
        </>

    );
}

export default Layout;

