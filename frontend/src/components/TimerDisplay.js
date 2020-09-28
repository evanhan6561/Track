import React, { useReducer, useState } from 'react';
import TimerIcon from '@material-ui/icons/Timer';
import ReactTooltip from 'react-tooltip';

import '../css/TimerDisplay.css'
import Stopwatch from './Stopwatch';
import PomodoroTimer from './PomodoroTimer';
import TimerTargetSelect from './TimerTargetSelect';

const timerReducer = (state, action) => {
    switch (action.type) {
        case 'Pomodoro':
            return 'Pomodoro';
        case 'Stopwatch':
            return 'Stopwatch';
        default:
            throw new Error('Unrecognized Timer Type');
    }
}

const TimerDisplay = ({ targets, setTargets, currentTarget, setCurrentTarget }) => {
    const [timer, dispatch] = useReducer(timerReducer, 'Pomodoro');
    const [selectedTimerTargetId, setSelectedTimerTargetId] = useState('');

    if (selectedTimerTargetId === '') {
        if (targets && targets.length > 0) {
            setSelectedTimerTargetId(targets[0]._id);
        }
    }

    return (
        <div className='timer-display-wrapper'>
            <ReactTooltip />
            <h4>Timers:</h4>
            <div className='timer-content-wrapper'>
                <div>
                    <img data-tip='Pomodoro' data-place='right' className='icon' onClick={() => dispatch({ type: 'Pomodoro' })} style={{ height: '20px', width: '20px' }} src={require('../static/tomato.svg')} alt='Tomato icon. On click leads to Pomodoro Timer.' />
                    <TimerIcon data-tip='Stopwatch' data-place='right' className='icon' onClick={() => dispatch({ type: 'Stopwatch' })} />
                </div>
                <div className='timer-display'>
                    <TimerTargetSelect targets={targets} selectedTimerTargetId={selectedTimerTargetId} setSelectedTimerTargetId={setSelectedTimerTargetId} />
                    <div className='timer-current'>{timer}</div>
                    <PomodoroTimer selectedTimerTargetId={selectedTimerTargetId} selectedTar setTargets={setTargets} currentTarget={currentTarget} setCurrentTarget={setCurrentTarget} timer={timer} />
                    <Stopwatch selectedTimerTargetId={selectedTimerTargetId} setTargets={setTargets} currentTarget={currentTarget} setCurrentTarget={setCurrentTarget} timer={timer} />
                </div>
            </div>
        </div>
    );
}


export default TimerDisplay;