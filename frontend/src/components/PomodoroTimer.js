import React, { useState, useEffect, useCallback } from 'react';
import { fetchCall } from '../utils';
import { Button, ButtonGroup } from 'react-bootstrap';
import CustomizePomodoroModal from '../modals/CustomizePomodoroModal';

const PomodoroTimer = ({ setTargets, currentTarget, setCurrentTarget, timer, selectedTimerTargetId }) => {
    let timerStyle = { display: 'none' };
    if (timer === 'Pomodoro') {
        timerStyle = { display: 'block' }
    }
    const [startingWorkCentiseconds, setStartingWorkCentiseconds] = useState(10 * 5);
    const [startingRestCentiseconds, setStartingRestCentiseconds] = useState(10 * 3);

    const [centiseconds, setCentiseconds] = useState(startingWorkCentiseconds);
    const [ticking, setTicking] = useState(false);
    const [isWorkMode, setIsWorkMode] = useState(true);

    const tick = () => {
        setCentiseconds(centiseconds => centiseconds - 1);
    }

    const startStop = () => {
        setTicking(ticking => !ticking);
    }

    // On timer completion, toggle workMode, reset time, pause
    useEffect(() => {
        const addTimeToAPI = async () => {
            if (selectedTimerTargetId) {
                // Add worktime to Today through API
                let url = process.env.REACT_APP_API_HOST + '/api/days/' + selectedTimerTargetId;
                let secondsWorked = Math.floor(startingWorkCentiseconds / 10);
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

                    // Shift focus onto the Target one has just added time to
                    setCurrentTarget(updatedTarget);

                }else{
                    // Todo: Responsive Error Message to User
                    alert('The server was unable to process your request.')
                }
            }
        }

        if (centiseconds === 0) {
            if (isWorkMode) {
                addTimeToAPI();
                setCentiseconds(startingRestCentiseconds);

            } else {
                setCentiseconds(startingWorkCentiseconds);
            }

            setIsWorkMode(!isWorkMode);
            setTicking(false);
        }
    }, [centiseconds, isWorkMode, startingRestCentiseconds, startingWorkCentiseconds, setTargets, currentTarget, setCurrentTarget, selectedTimerTargetId]);

    // Tick if "ticking = true"
    useEffect(() => {
        let ticker;
        if (ticking) {
            ticker = setInterval(tick, 100);
        }
        return function cleanup() {
            clearInterval(ticker);
        }
    }, [ticking])

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

    /** Completely reset to initial state in work mode
     *      - Wrapped in useCallback() to prevent infinite rerenders according to ESLint.
     */
    const reset = useCallback(() => {
        setTicking(false);
        setIsWorkMode(true);
        setCentiseconds(startingWorkCentiseconds);
    }, [startingWorkCentiseconds])

    /** If the user inputs custom work/rest intervals, completely reset the timer to immediately reflect changes.
     * 
     */
    useEffect(() => {
        reset();
    }, [startingRestCentiseconds, startingWorkCentiseconds, reset])

    return (
        <div style={timerStyle}>
            <div>
                <div>Mode: {isWorkMode ? 'Work 🍞' : 'Rest ☕'}</div>
                <div>{displayTime()}</div>
            </div>
            <div>
                <ButtonGroup>
                    <Button onClick={startStop} value={ticking ? 'Stop' : 'Start'}>{ticking ? 'Stop' : 'Start'}</Button>
                    <Button onClick={reset}>Reset</Button>
                </ButtonGroup>
            </div>
            {/* <CustomPomodoroForm
                setStartingWorkCentiseconds={setStartingWorkCentiseconds}
                setStartingRestCentiseconds={setStartingRestCentiseconds}
            /> */}
            <CustomizePomodoroModal
                setStartingWorkCentiseconds={setStartingWorkCentiseconds}
                setStartingRestCentiseconds={setStartingRestCentiseconds}
            />
        </div>
    );
}

export default PomodoroTimer;


/**
 * Implementing this gave me quite a headache.
 * I wanted to alter state when the timer reached 0. I spend an hour or so trying to shove this logic into 'tick()', which
 * is repeatedly called by "setInterval()". The first issue is that "setInterval()" is a closure that only ever sees the very initial values
 * of the various states, which I got around by using a functional update (Passing in an arrow function).
 *
 * TLDR:
 *  - It seems I should never call a "setState()" within another "setState"
 *  - The React Docs explicitly state that timers should use "useEffect()" to keep track of time to avoid weird bugs.
 *    I altered my code to do so and it is much cleaner as well now.
 */