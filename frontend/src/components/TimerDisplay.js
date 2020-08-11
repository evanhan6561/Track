import React, {useReducer} from 'react';
import { useEffect } from 'react';
import '../css/TimerDisplay.css'
import Stopwatch from './Stopwatch';
import PomodoroTimer from './PomodoroTimer';

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



const TimerDisplay = () => {
    const [timer, dispatch] = useReducer(timerReducer, 'Pomodoro');

    // Component Did Mount Equivalent
    useEffect(() => {
    }, [])

    return (
        <div className='timer-display-wrapper'>
            <div>Timers:</div>
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
                    <div>{timer}</div>
                    <PomodoroTimer timer={timer}/>
                    <Stopwatch timer={timer}/>
                </div>
            </div>            
        </div>
    );
}

 
export default TimerDisplay;