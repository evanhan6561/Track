import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

import usePositiveIntegerInput from '../hooks/usePositiveIntegerInput';
import {fetchCall} from '../utils';

// Todo: Pass down these props all the way from the component, Layout?
function DayEditModal(props) {
    const {targetId, setTargets, setCurrentTarget, inputDate} = props

    // Form Logic

    // Use the custom hook for the integer only form
    let settings = {
        label: 'Add Time (min)',
        name: 'amount'
    }
    const [addAmount, inputHTML] = usePositiveIntegerInput(settings);

    // I don't actually want to always update an existing day. I want to also be able to generate a day if I add time to an empty day.
    // I should just reuse the Day-POST portion of my API and not call the Day-PUT
    const handleDayEdit = async () => {
        let url = process.env.REACT_APP_API_HOST + `/api/days/${targetId}`;
        let data = JSON.stringify({
            inputDate: inputDate.getTime(),         // in ms since unix epoch
            workTime: addAmount * 60,               // Convert minutes -> seconds
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        let options = {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: data
        }
        let response = await fetchCall(url, options);
        if (response.success){
            // Update the local state of targets. Idk why but it's not triggering rerender
            let updatedTarget = response.target;
            console.log('updatedTarget :>> ', updatedTarget);
            setTargets(targets => {
                let id = updatedTarget._id;
                let updatedCopy = 
                targets.map(target => {
                    if (id === target._id){
                        return updatedTarget;
                    }else{
                        return target;
                    }
                });
                return updatedCopy;
            });
            setCurrentTarget(updatedTarget);    // Test this
        }else{
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
            <div style={{padding: '0', height: '100%'}} onClick={handleShow}>
                {props.children}
            </div>

            <Modal
                show={show}
                onHide={handleClose}
                keyboard={false}
                animation={false}   // Must set animation to false. Otherwise, react-bootstrap throws a deprecation warning.
            >
                <Modal.Header closeButton>
                <Modal.Title>Change Time: {inputDate.toLocaleString()}</Modal.Title>
                </Modal.Header>
                <Form>
                    <Modal.Body>
                        <h6>Missed some time? Add/Subtract Here</h6>
                        {inputHTML}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleDayEdit}>Confirm</Button>
                    </Modal.Footer>
                </Form>

            </Modal>
        </>
    );
}

export default DayEditModal;