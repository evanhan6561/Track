import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import SettingsIcon from '@material-ui/icons/Settings';

import usePositiveIntegerInput from '../hooks/usePositiveIntegerInput';
import ReactTooltip from 'react-tooltip';

function CustomizePomodoroModal({ setStartingWorkCentiseconds, setStartingRestCentiseconds }) {
    // State logic
    let minuteWorkSettings = {
        placeholder: 'i.e. 25'
    }
    let minuteRestSettings = {
        placeholder: 'i.e. 5'
    }
    const [minuteWorkValue, minuteWorkInput] = usePositiveIntegerInput(minuteWorkSettings);
    const [minuteRestValue, minuteRestInput] = usePositiveIntegerInput(minuteRestSettings);

    const setCustomIntervals = () => {
        // Need to convert the user input from minutes -> centiseconds and handle blank input
        let workStartTime;
        let restStartTime;
        if (minuteWorkValue === '' || minuteWorkValue <= 0 || minuteWorkValue > 1440) {
            // Default to 25 minutes work in case of malformed input
            workStartTime = 10 * 60 * 25;
        } else {
            workStartTime = minuteWorkValue * 60 * 10;
        }

        if (minuteRestValue === '' || minuteRestValue <= 0 || minuteRestValue > 1440) {
            // Default to 5 minutes rest in case of malformed input
            restStartTime = 10 * 60 * 5;
        } else {
            restStartTime = minuteRestValue * 60 * 10;
        }

        setStartingWorkCentiseconds(workStartTime);
        setStartingRestCentiseconds(restStartTime);
    }



    // Modal Logic
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => {
        setShow(true);
    };

    return (
        <>  
            <ReactTooltip />
            <SettingsIcon data-tip='Customize Intervals' data-place='right' className='icon' onClick={handleShow} />


            <Modal
                show={show}
                onHide={handleClose}
                keyboard={false}
                animation={false}   // Must set animation to false. Otherwise, react-bootstrap throws a deprecation warning.
            >
                <Modal.Header closeButton>
                    <Modal.Title>Customize Pomodoro Intervals</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='custom-pomodoro-form'>
                        <Form.Group>
                            <Form.Label>Work Time (minutes)</Form.Label>
                            {minuteWorkInput}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Rest Time (minutes)</Form.Label>
                            {minuteRestInput}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={setCustomIntervals}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CustomizePomodoroModal;