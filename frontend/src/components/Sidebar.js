import React from 'react';
import '../css/Sidebar.css'
import TimerDisplay from './TimerDisplay';
const Sidebar = () => {
    return (
        <aside>
            <div className='goals-wrapper'>
                <div className='goals-header'>
                    Goals:
                </div>
                <ul className='goals-list'>
                    <li>Run</li>
                </ul>
            </div>
            
            <TimerDisplay />
        </aside>
    );
}
 
export default Sidebar;