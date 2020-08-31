import React, {useState, useEffect} from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import {fetchCall} from '../utils';

const initialCentiseconds = 0;

const Stopwatch = ({ setTargets, currentTarget, setCurrentTarget, timer, selectedTimerTargetId }) => {
    // Only display this timer if it's selected. Else run in background.
    let timerStyle = { display: 'none' };
    if (timer === 'Stopwatch') {
        timerStyle = { display: 'block' }
    }

    const [centiseconds, setCentiseconds] = useState(initialCentiseconds);
    const [ticking, setTicking] = useState(false);

    /* 
    https://stackoverflow.com/questions/53024496/state-not-updating-when-using-react-state-hook-within-setinterval
    Issue:
        Just using 
            "setCentiseconds(centiseconds + 1)"
        along with "setInterval()" does not work. 

    Why?
        "setInterval()'s" closure only ever sees the initial state of "centiseconds = 0". Thus, it would repeatedly set
        "centiseconds = 1" instead of properly incrementing. 
        We can get around this by passing in a function into "setCentiseconds()". React has made it so that the function
        is automatically passed the previous state, allowing us to accurately see the most recent value of "centiseconds".
    */
    const tick = () => {
        setCentiseconds(centiseconds => centiseconds + 1);
    }

    const startStop = () => {
        setTicking(!ticking);
    }

    // Tick if "ticking = true"
    useEffect(() => {
        let ticker;
        if (ticking){
            ticker = setInterval(tick, 100);
        }
        return function cleanup(){
            clearInterval(ticker);
        }
    }, [ticking])

    const displayTime = () => {
        let remainingSeconds = Math.floor(centiseconds / 10);
        
        let seconds = Math.floor(remainingSeconds % 60);
        let remainingMinutes = remainingSeconds / 60;

        let minutes = Math.floor(remainingMinutes % 60);
        let hours = Math.floor(remainingMinutes / 60);

        if (hours === 0){
            // Don't display hours when < 1 hr
            if (seconds < 10){
                seconds = '0' + seconds
            }
            return `${minutes}:${seconds}`;
        }else{
            // Only display hours if needed
            if (seconds < 10){
                seconds = '0' + seconds
            }
    
            if (minutes < 10){
                minutes = '0' + minutes
            }

            return `${hours}:${minutes}:${seconds}`;
        }
    }

    const reset = () => {
        setTicking(false);
        setCentiseconds(initialCentiseconds);
    }

    //
    const logTime = async () => {
        if (currentTarget) {
            // Add worktime to Today through API
            let url = process.env.REACT_APP_API_HOST + '/api/days/' + currentTarget._id;
            let secondsWorked = Math.floor(centiseconds / 10);
            let data = JSON.stringify({
                inputDate: Date.now(),
                workTime: secondsWorked,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            let options = {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body:  data
            };
            let response = await fetchCall(url, options);
            if (response.success){
                // Update local state: target and currentTarget.
                let updatedTarget = response.target;
                setTargets( targets => {
                    let copy = targets.map( target => {
                        if (target._id === updatedTarget._id){
                            return updatedTarget;
                        }else{
                            return target;
                        }
                    });
                    return copy;
                });
                setCurrentTarget(updatedTarget);

            }else{
                // Todo: Responsive Error Message to User
                alert('The server was unable to process your request.')
            }
        }else{
            // Tell user a target must be selected in order to add time.
            alert('A Target must be selected from the dropdown.')
        }
    }

    return (
        <div style={timerStyle}>
            <div>
                Time: {displayTime()}
            </div>
            <div>
                <ButtonGroup>
                    <Button variant='secondary' onClick={startStop}>{ticking ? 'Stop': 'Start'}</Button>
                    <Button variant='secondary' onClick={reset}>Reset</Button>
                    <Button variant='primary' onClick={logTime}>Log</Button>
                </ButtonGroup>
            </div>
        </div>
    );
}

export default Stopwatch;