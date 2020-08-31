import React from 'react';

import '../css/Sidebar.css'
import TimerDisplay from './TimerDisplay';
import TargetSelect from './TargetSelect';

const Sidebar = ({ currentTarget, setCurrentTarget, targets, setTargets }) => {
    return (
        <aside>
            <div className='goals-wrapper'>
                {/* Todo: delete goals-header Only meant for debugging purposes. */}
                <div>Active View: {currentTarget ? currentTarget.title : 'None'}</div>
                <TargetSelect currentTarget={currentTarget} setCurrentTarget={setCurrentTarget} targets={targets} setTargets={setTargets}/>
            </div>
            <hr></hr>
            <TimerDisplay targets={targets} setTargets={setTargets} setCurrentTarget={setCurrentTarget} currentTarget={currentTarget}/>
            {/* <footer>
                <div>Tomato Icon made by <a href="https://www.flaticon.com/authors/icongeek26" title="Icongeek26">Icongeek26</a></div>
            </footer> */}
        </aside>
    );
}

export default Sidebar;