import React, { useState } from 'react';
import { useEffect, useContext } from 'react';
import { numToMonth, getMonth, fetchCall } from '../utils';
import { AuthContext } from '../contexts/AuthContext';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import ReactTooltip from 'react-tooltip';


import Weeks from './Weeks';
import Sidebar from './Sidebar';
import '../css/Layout.css';
import '../css/Icon.css';
import AccountButtons from './AccountButtons';
import { Button } from 'react-bootstrap';


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
                let response = await fetchCall(url);
                if (response.success) {
                    setTargets(response.targets);
                    // Set currentTargetId to the very first item in targets if any exist.
                    if (response.targets.length > 0) {
                        setCurrentTarget(response.targets[0]);
                    }
                }else{
                    alert('Unable to retrieve Targets of the User.')
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
            <ReactTooltip />
            <main>
                <header>
                    <div className='logo'>Track.</div>

                    <div className='month-view-header'>
                        <div className='month-year-header'>
                            {numToMonth(date.getMonth() + 1)} {date.getFullYear()}
                        </div>
                        <div>
                            <KeyboardArrowLeftIcon data-tip='Previous Month' data-place='bottom' className='icon' onClick={prevMonth} />
                            <KeyboardArrowRightIcon data-tip='Next Month' data-place='bottom' className='icon' onClick={nextMonth} />
                        </div>
                        <div>
                            <Button variant="outline-dark" onClick={() => setDate(today)}>Today</Button>
                        </div>
                        <div>
                            <AccountButtons setCurrentTarget={setCurrentTarget} setTargets={setTargets}/>
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

