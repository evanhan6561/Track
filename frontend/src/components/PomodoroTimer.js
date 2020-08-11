import React, { useState, useEffect } from 'react';

const startingWorkCentiseconds = 10 * 5;
const startingRestCentiseconds = 10 * 3;


const PomodoroTimer = ({ timer }) => {
    let timerStyle = { display: 'none' };
    if (timer === 'Pomodoro') {
        timerStyle = { display: 'block' }
    }

    const [centiseconds, setCentiseconds] = useState(startingWorkCentiseconds);
    const [ticking, setTicking] = useState(false);
    const [ticker, setTicker] = useState(null);

    const [isWorkMode, setIsWorkMode] = useState(true);

    const tick = () => {
        setCentiseconds(centiseconds => centiseconds - 1);
    }


    const startStop = () => {
        if (ticking){
            // Shutdown the ticker
            setTicker(clearInterval(ticker));
        }else{
            // Start ticker

            /* Passing an arrow function breaks this code. I'm unsure why.*/
            setTicker(window.setInterval(tick, 100));
        }
        setTicking(ticking => !ticking);
    }

    useEffect(() => {
        if (centiseconds === 0){
            setTicker(ticker => clearInterval(ticker));

            if (isWorkMode){
                setCentiseconds(startingRestCentiseconds);
            }else{
                setCentiseconds(startingWorkCentiseconds);
            }

            setIsWorkMode(!isWorkMode);
            setTicking(ticking => !ticking);
        }
    }, [centiseconds, isWorkMode]);

    const displayTime = () => {
        let remainingSeconds = Math.floor(centiseconds / 10);

        let seconds = Math.floor(remainingSeconds % 60);
        let remainingMinutes = remainingSeconds / 60;

        let minutes = Math.floor(remainingMinutes % 60);
        let hours = Math.floor(remainingMinutes / 60);

        if (hours === 0) {
            // Don't display hours when < 1 hr
            if (seconds < 10) {
                seconds = '0' + seconds
            }
            return `${minutes}:${seconds}`;
        } else {
            // Only display hours if needed
            if (seconds < 10) {
                seconds = '0' + seconds
            }

            if (minutes < 10) {
                minutes = '0' + minutes
            }

            return `${hours}:${minutes}:${seconds}`;
        }
    }

    const reset = () => {
        startStop();
        setCentiseconds(startingWorkCentiseconds);
    }


    return (
        <div style={timerStyle}>
            <div>
                <div>Current Mode: {isWorkMode ? 'Work' : 'Rest'}</div>
                <div>Time: {displayTime()}</div>
            </div>
            <div>
                <input type='button' onClick={startStop} value={ticking ? 'Stop' : 'Start'} />
                <input type='button' onClick={reset} value='Reset' />
                <input type='button' value='Submit' />
            </div>
        </div>
    );
}

export default PomodoroTimer;


/**
 * Implementing this gave me quite a bit of trouble.
 * I wanted to alter state when the timer reached 0. I spend an hour or so trying to shove this logic into 'tick()', which
 * is repeatedly called by "setInterval()". The first issue is that "setInterval()" is a closure that only ever sees the very initial values
 * of the various states, which I got around by using a functional update (Passing in an arrow function).
 * 
 * I initally tried calling "setState()" functions within this arrow function, namely cle
 */