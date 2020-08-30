import React, { useState } from 'react';
import { Button, Modal, Form, InputGroup } from 'react-bootstrap';

import usePositiveIntegerInput from '../hooks/usePositiveIntegerInput';
import { fetchCall } from '../utils';

// Todo: Pass down these props all the way from the component, Layout?
function DayEditModal(props) {
    const { targetId, setTargets, setCurrentTarget, inputDate } = props

    // Form Logic

    // Use the custom hook for the integer only form
    let addSettings = {
        label: 'Add Time (min)',
        name: 'add-amount',
        placeholder: 'Add/Subtract Time (min)'
    }
    const [addAmount, intInputHTML] = usePositiveIntegerInput(addSettings);

    // I don't actually want to always update an existing day. I want to also be able to generate a day if I add time to an empty day.
    // I should just reuse the Day-POST portion of my API and not call the Day-PUT
    const handleDayEdit = async (e) => {
        let url = process.env.REACT_APP_API_HOST + `/api/days/${targetId}`;

        let processedTime = addAmount * 60;         // Convert minutes -> seconds

        // Add and subtract are the same, just multiply by -1 in case of subtract
        if (e.target.id === 'sub-day-btn') {
            processedTime *= -1;
            console.log('Subtract');
        }

        let data = JSON.stringify({
            inputDate: inputDate.getTime(),         // in ms since unix epoch
            workTime: processedTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        let options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        }
        let response = await fetchCall(url, options);
        console.log('DayEditModal response :>> ', response);
        if (response.success) {
            // Update the local state of targets. Idk why but it's not triggering rerender
            let updatedTarget = response.target;
            setTargets(targets => {
                let id = updatedTarget._id;
                let updatedCopy =
                    targets.map(target => {
                        if (id === target._id) {
                            return updatedTarget;
                        } else {
                            return target;
                        }
                    });
                return updatedCopy;
            });
            setCurrentTarget(updatedTarget);    // Test this
        } else {
            // Todo: Error Message if failed to add time
        }
    }

    // Modal Logic
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => {
        setShow(true);
    }

    // Must be able to both edit an existing day and create a day.
    return (
        <>
            <div style={{ padding: '0', height: '100%' }} onClick={handleShow}>
                {props.children}
            </div>

            <Modal
                show={show}
                onHide={handleClose}
                keyboard={false}
                animation={false}   // Must set animation to false. Otherwise, react-bootstrap throws a deprecation warning.
            >
                <Modal.Header closeButton>
                    <Modal.Title>Change Time: {inputDate.toLocaleDateString()}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <h6>Missed some time? Edit Your Time Here</h6>
                    <Form>
                        <InputGroup>
                            {intInputHTML}
                            <InputGroup.Append>
                                <Button style={{width: '50%'}} id='add-day-btn' variant="outline-secondary" onClick={handleDayEdit}>
                                    +
                                </Button>
                                <Button style={{width: '50%'}} id='sub-day-btn' variant="outline-secondary" onClick={handleDayEdit}>
                                    -
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleDayEdit}>Confirm</Button>
                </Modal.Footer>


            </Modal>
        </>
    );
}

export default DayEditModal;