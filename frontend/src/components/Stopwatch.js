import React, {useState} from 'react';

const initialCentiseconds = 0;

const Stopwatch = ({ timer }) => {
    // Only display this timer if it's selected. Else run in background.
    let timerStyle = { display: 'none' };
    if (timer === 'Stopwatch') {
        timerStyle = { display: 'block' }
    }

    const [centiseconds, setCentiseconds] = useState(initialCentiseconds);
    const [ticking, setTicking] = useState(false);
    const [ticker, setTicker] = useState(null);

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
        if (ticking){
            // Shutdown the ticker
            clearInterval(ticker);
        }else{
            // Start ticker
            setTicker(window.setInterval(tick, 100));
        }
        setTicking(!ticking);
    }

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
        startStop();
        setCentiseconds(initialCentiseconds);
    }

    return (
        <div style={timerStyle}>
            <div>
                Time: {displayTime()}
            </div>
            <div>
                <input type='button' onClick={startStop} value={ticking ? 'Stop': 'Start'}/>
                <input type='button' onClick={reset} value='Reset'/>
                <input type='button' value='Submit'/>
            </div>
        </div>
    );
}

export default Stopwatch;