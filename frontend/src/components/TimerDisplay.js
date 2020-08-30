import React, {useReducer, useState} from 'react';
import '../css/TimerDisplay.css'
import Stopwatch from './Stopwatch';
import PomodoroTimer from './PomodoroTimer';
import TimerTargetSelect from './TimerTargetSelect';

const timerReducer = (state, action) => {
    switch(action.type){
        case 'Pomodoro':
            return 'Pomodoro';
        case 'Stopwatch':
            return 'Stopwatch';
        default:
            throw new Error('Unrecognized Timer Type');
    }
}

const TimerDisplay = ({targets, setTargets, currentTarget, setCurrentTarget}) => {
    const [timer, dispatch] = useReducer(timerReducer, 'Pomodoro');
    const [selectedTimerTargetId, setSelectedTimerTargetId] = useState(null);

    if (selectedTimerTargetId === null){
        if (targets && targets.length > 0){
            setSelectedTimerTargetId(targets[0]._id);
        }
    }

    return (
        <div className='timer-display-wrapper'>
            <h5>Timers:</h5>
            <div className='timer-content-wrapper'>
                <ul className='timer-list'>
                    <li>
                        <img onClick={() => dispatch({type: 'Pomodoro'})} src={require('../static/pomodoro-icon.png')} title='Pomodoro' alt='Pomodoro Icon'></img>
                    </li>
                    <li>
                        <img onClick={() => dispatch({type: 'Stopwatch'})} src={require('../static/stopwatch-icon.png')} title='Stopwatch' alt='Stopwatch Icon'></img>
                    </li>
                </ul>
                <div className='timer-display'>
                    <TimerTargetSelect targets={targets} selectedTimerTargetId={selectedTimerTargetId} setSelectedTimerTargetId={setSelectedTimerTargetId}/>
                    <div className='timer-current'>{timer}</div>
                    <PomodoroTimer selectedTimerTargetId={selectedTimerTargetId} selectedTar setTargets={setTargets} currentTarget={currentTarget} setCurrentTarget={setCurrentTarget} timer={timer}/>
                    <Stopwatch selectedTimerTargetId={selectedTimerTargetId} setTargets={setTargets} currentTarget={currentTarget} setCurrentTarget={setCurrentTarget} timer={timer}/>
                </div>
            </div>            
        </div>
    );
}

 
export default TimerDisplay;