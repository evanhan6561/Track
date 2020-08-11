import React, { useState} from 'react';
import '../css/CustomPomodoroForm.css'

/* https://stackoverflow.com/questions/55757761/handle-an-input-with-react-hooks
    A reusable way of handling forms

    i.e. {id: 'username-input', label: 'Username:', type: 'text'}
*/
function useInput(options) {
    const [value, setValue] = useState("");
    const input = (
        <>
            <label htmlFor={options.id}>{options.label}</label><br />
            <input id={options.id} value={value} onChange={e => setValue(e.target.value)} type={options.type} />
        </>
    );
    return [value, input];
}

const CustomPomodoroForm = ({ setStartingWorkCentiseconds, setStartingRestCentiseconds}) => {
    const [isHidden, setIsHidden] = useState(true);

    const [minuteWorkValue, minuteWorkInput] = useInput({
        id: 'pomodoro-work-input',
        label: 'Work Interval (min):',
        type: 'number'
    });

    const [minuteRestValue, minuteRestInput] = useInput({
        id: 'pomodoro-rest-input',
        label: 'Rest Interval (min):',
        type: 'number'
    });

    const setCustomIntervals = () => {
        // Need to convert the user input from minutes -> centiseconds and handle blank input
        let workStartTime;
        let restStartTime;

        if (minuteWorkValue === '') {
            workStartTime = 0;
        } else {
            workStartTime = minuteWorkValue * 60 * 10;
        }

        if (minuteRestValue === '') {
            restStartTime = 0;
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