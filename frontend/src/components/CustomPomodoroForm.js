import React, { useState } from 'react';
import '../css/CustomPomodoroForm.css'

/* https://stackoverflow.com/questions/55757761/handle-an-input-with-react-hooks
    A reusable way of handling forms

    i.e. {id: 'username-input', label: 'Username:', type: 'text'}
*/
function useIntegerInput(options) {
    const [value, setValue] = useState("");

    function isValidIntegerInput(input) {
        if (input === ''){
            return true;
        }
        return /^[1-9]\d*$/.test(input);
    }

    // Make sure only numbers are ever entered
    const handleChange = (e) => {
        if (isValidIntegerInput(e.target.value)) {
            setValue(e.target.value)
        }
    }

    const input = (
        <>
            <label htmlFor={options.id}>{options.label}</label><br />
            <input id={options.id} value={value} onChange={handleChange} type={options.type}/>
        </>
    );
    return [value, input];
}



const CustomPomodoroForm = ({ setStartingWorkCentiseconds, setStartingRestCentiseconds }) => {
    const [isHidden, setIsHidden] = useState(true);

    // I used text input b/c number input doesn't detect leading '-', '+', '.'
    const [minuteWorkValue, minuteWorkInput] = useIntegerInput({
        id: 'pomodoro-work-input',
        label: 'Work Interval (min > 0):',
        type: 'text'
    });

    const [minuteRestValue, minuteRestInput] = useIntegerInput({
        id: 'pomodoro-rest-input',
        label: 'Rest Interval (min > 0):',
        type: 'text'
    });

    const setCustomIntervals = () => {
        // Need to convert the user input from minutes -> centiseconds and handle blank input
        let workStartTime;
        let restStartTime;
        if (minuteWorkValue === '' || minuteWorkValue <= 0 || minuteWorkValue > 1440) {
            // Default to 25 minutes in case of malformed input
            workStartTime = 10 * 60 * 25;
        } else {
            workStartTime = minuteWorkValue * 60 * 10;
        }

        if (minuteRestValue === '' || minuteRestValue <= 0 || minuteRestValue > 1440) {
            // Default to 5 minutes in case of malformed input
            restStartTime = 10 * 60 * 5;
        } else {
            restStartTime = minuteRestValue * 60 * 10;
        }

        setStartingWorkCentiseconds(workStartTime);
        setStartingRestCentiseconds(restStartTime);
    }

    if (isHidden) {
        return (
            <input type='button' onClick={() => setIsHidden(isHidden => !isHidden)} value='Customize' />
        )
    } else {
        return (
            <>
                <input type='button' onClick={() => setIsHidden(isHidden => !isHidden)} value='Hide' />
                <form className='custom-pomodoro-form'>
                    {minuteWorkInput}<br />
                    {minuteRestInput}<br />
                    <input type='button' onClick={setCustomIntervals} value='Confirm' />
                </form>
            </>
        );
    }
}

export default CustomPomodoroForm;